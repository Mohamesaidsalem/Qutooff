import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Coffee,
  UserX,
  Pause,
  RotateCcw,
  Eye,
  Edit,
  Filter,
  Download,
  RefreshCw,
  BookOpen,
  TimerIcon,
  UserCheck,
  UserMinus
} from 'lucide-react';
import { ref, onValue, off, update } from 'firebase/database';
import { database } from '../../firebase/config';
import { convertFromUTC, getUserTimezone, getTimezoneDisplayName } from '../../utils/timezone';

interface DailyClass {
  id: string;
  teacherId: string;
  studentId: string;
  appointmentTime: string; // A-Time
  appointmentDate: string; // A-Date
  teacherTime?: string; // T-Time
  studentTime?: string; // S-Time
  onlineTime?: string; // Online Time (actual join time)
  completedAt?: string; // Completion time
  status: 'scheduled' | 'taken' | 'absent' | 'leave' | 'declined' | 'suspended' | 'trial' | 'advance' | 'rescheduled' | 'running' | 'refused';
  history: string[];
  createdAt: string;
  updatedAt?: string;
  notes?: string;
  duration: number;
  zoomLink?: string;
}

interface DailyClassesManagementProps {
  teachers: any[];
  children: any[];
  classes: any[];
  onUpdateClass: (classId: string, updates: any) => void;
}

export default function DailyClassesManagement({ 
  teachers, 
  children, 
  classes, 
  onUpdateClass 
}: DailyClassesManagementProps) {
  const [dailyClasses, setDailyClasses] = useState<DailyClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('today');
  const [userTimezone] = useState(getUserTimezone());
  const [showStudentDetails, setShowStudentDetails] = useState<string | null>(null);

  // Load daily classes from Firebase
  useEffect(() => {
    // 🎯 تم تغيير 'classes' إلى 'daily_classes' لمطابقة API الجديدة
    const classesRef = ref(database, 'daily_classes'); 
    
    const unsubscribe = onValue(classesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const classesArray: DailyClass[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setDailyClasses(classesArray);
      } else {
        setDailyClasses([]);
      }
      setLoading(false); // ✅ إيقاف حالة التحميل عند النجاح
    });

    return () => off(classesRef, 'value', unsubscribe);
  }, []);
  // Filter classes based on date and status
  const getFilteredClasses = () => {
    let filtered = dailyClasses;

    // Date filter
    if (filterDate === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(cls => {
        const { localDate } = convertFromUTC(
          cls.appointmentDate,
          cls.appointmentTime,
          userTimezone
        );
        return localDate === today;
      });
    } else if (filterDate === 'week') {
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      
      filtered = filtered.filter(cls => {
        const { localDateTime } = convertFromUTC(
          cls.appointmentDate,
          cls.appointmentTime,
          userTimezone
        );
        return localDateTime >= weekStart && localDateTime <= weekEnd;
      });
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(cls => cls.status === filterStatus);
    }

    return filtered.sort((a, b) => {
      const aTime = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
      const bTime = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
      return aTime.getTime() - bTime.getTime();
    });
  };

  // Calculate statistics
  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayClasses = dailyClasses.filter(cls => {
      const { localDate } = convertFromUTC(
        cls.appointmentDate,
        cls.appointmentTime,
        userTimezone
      );
      return localDate === today;
    });

    return {
      total: dailyClasses.length,
      todayTotal: todayClasses.length,
      taken: dailyClasses.filter(cls => cls.status === 'taken').length,
      remaining: dailyClasses.filter(cls => cls.status === 'scheduled').length,
      running: dailyClasses.filter(cls => cls.status === 'running').length,
      absent: dailyClasses.filter(cls => cls.status === 'absent').length,
      leave: dailyClasses.filter(cls => cls.status === 'leave').length,
      declined: dailyClasses.filter(cls => cls.status === 'declined').length,
      suspended: dailyClasses.filter(cls => cls.status === 'suspended').length,
      trial: dailyClasses.filter(cls => cls.status === 'trial').length,
      advance: dailyClasses.filter(cls => cls.status === 'advance').length,
      rescheduled: dailyClasses.filter(cls => cls.status === 'rescheduled').length,
      students: new Set(dailyClasses.map(cls => cls.studentId)).size,
      created: dailyClasses.filter(cls => {
        if (!cls.createdAt) return false;
        try {
          const createdDate = new Date(cls.createdAt);
          if (isNaN(createdDate.getTime())) return false;
          return createdDate.toISOString().split('T')[0] === today;
        } catch (error) {
          return false;
        }
      }).length,
      refused: dailyClasses.filter(cls => cls.status === 'refused').length
    };
  };

  const stats = calculateStats();

  const handleUpdateStatus = async (classId: string, newStatus: string) => {
    const classItem = dailyClasses.find(cls => cls.id === classId);
    if (!classItem) return;

    const currentTime = new Date().toISOString();
    const updates: Partial<DailyClass> = {
      status: newStatus as DailyClass['status'],
      updatedAt: currentTime,
      history: [
        ...classItem.history,
        `Status changed to ${newStatus} at ${new Date().toLocaleString()}`
      ]
    };

    // Add specific time tracking based on status
    if (newStatus === 'running') {
      updates.onlineTime = currentTime;
    } else if (newStatus === 'taken') {
      updates.completedAt = currentTime;
    }

    try {
      await onUpdateClass(classId, updates);
      alert(`Class status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating class status:', error);
      alert('Error updating class status');
    }
  };

  const getStatusIcon = (status: string) => {
    const iconProps = { className: "h-4 w-4" };
    
    switch (status) {
      case 'taken': return <CheckCircle {...iconProps} className="h-4 w-4 text-green-600" />;
      case 'running': return <TimerIcon {...iconProps} className="h-4 w-4 text-blue-600" />;
      case 'scheduled': return <Clock {...iconProps} className="h-4 w-4 text-yellow-600" />;
      case 'absent': return <UserX {...iconProps} className="h-4 w-4 text-red-600" />;
      case 'leave': return <Coffee {...iconProps} className="h-4 w-4 text-orange-600" />;
      case 'declined': return <XCircle {...iconProps} className="h-4 w-4 text-red-600" />;
      case 'suspended': return <Pause {...iconProps} className="h-4 w-4 text-gray-600" />;
      case 'trial': return <BookOpen {...iconProps} className="h-4 w-4 text-purple-600" />;
      case 'advance': return <RefreshCw {...iconProps} className="h-4 w-4 text-teal-600" />;
      case 'rescheduled': return <RotateCcw {...iconProps} className="h-4 w-4 text-indigo-600" />;
      case 'refused': return <XCircle {...iconProps} className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle {...iconProps} className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'leave': return 'bg-orange-100 text-orange-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-gray-100 text-gray-800';
      case 'trial': return 'bg-purple-100 text-purple-800';
      case 'advance': return 'bg-teal-100 text-teal-800';
      case 'rescheduled': return 'bg-indigo-100 text-indigo-800';
      case 'refused': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredClasses = getFilteredClasses();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daily Classes Management</h2>
          <p className="mt-2 text-sm text-gray-600">
            Comprehensive view and management of all daily classes and schedules
          </p>
          <div className="mt-1 flex items-center text-xs text-blue-600">
            <Clock className="h-3 w-3 mr-1" />
            <span>Your timezone: {getTimezoneDisplayName(userTimezone)}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center shadow-sm">
            <Eye className="h-4 w-4 mr-2" />
            See Current Classes
          </button>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center shadow-sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Update Daily Classes
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <BookOpen className="h-6 w-6 text-gray-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Taken</p>
              <p className="text-xl font-bold text-green-600">{stats.taken}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Remaining</p>
              <p className="text-xl font-bold text-yellow-600">{stats.remaining}</p>
            </div>
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Running</p>
              <p className="text-xl font-bold text-blue-600">{stats.running}</p>
            </div>
            <TimerIcon className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Absent</p>
              <p className="text-xl font-bold text-red-600">{stats.absent}</p>
            </div>
            <UserX className="h-6 w-6 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Leave</p>
              <p className="text-xl font-bold text-orange-600">{stats.leave}</p>
            </div>
            <Coffee className="h-6 w-6 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Declined</p>
              <p className="text-xl font-bold text-red-500">{stats.declined}</p>
            </div>
            <XCircle className="h-6 w-6 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Suspended</p>
              <p className="text-xl font-bold text-gray-600">{stats.suspended}</p>
            </div>
            <Pause className="h-6 w-6 text-gray-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Trial</p>
              <p className="text-xl font-bold text-purple-600">{stats.trial}</p>
            </div>
            <BookOpen className="h-6 w-6 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Advance</p>
              <p className="text-xl font-bold text-teal-600">{stats.advance}</p>
            </div>
            <RefreshCw className="h-6 w-6 text-teal-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Re-Scheduled</p>
              <p className="text-xl font-bold text-indigo-600">{stats.rescheduled}</p>
            </div>
            <RotateCcw className="h-6 w-6 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Students</p>
              <p className="text-xl font-bold text-blue-700">{stats.students}</p>
            </div>
            <Users className="h-6 w-6 text-blue-700" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Created</p>
              <p className="text-xl font-bold text-blue-600">{stats.created}</p>
            </div>
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Refused</p>
              <p className="text-xl font-bold text-red-500">{stats.refused}</p>
            </div>
            <XCircle className="h-6 w-6 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Date
            </label>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="running">Running</option>
              <option value="taken">Taken</option>
              <option value="absent">Absent</option>
              <option value="leave">Leave</option>
              <option value="declined">Declined</option>
              <option value="suspended">Suspended</option>
              <option value="trial">Trial</option>
              <option value="advance">Advance</option>
              <option value="rescheduled">Re-Scheduled</option>
              <option value="refused">Refused</option>
            </select>
          </div>
        </div>
      </div>

      {/* Classes Table */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">
            Daily Classes ({filteredClasses.length})
          </h3>
          <p className="text-sm text-gray-600">Complete management of all class sessions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">A-Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">A-Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">T-Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S-Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Online Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">History</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClasses.map((classItem) => {
                const teacher = teachers.find(t => t.id === classItem.teacherId);
                const student = children.find(c => c.id === classItem.studentId);
                const { localDate, localTime } = convertFromUTC(
                  classItem.appointmentDate,
                  classItem.appointmentTime,
                  userTimezone
                );

                return (
                  <tr key={classItem.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 font-mono">
                        {classItem.id.slice(-8)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{localTime}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{localDate}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {classItem.teacherTime ? 
                          new Date(classItem.teacherTime).toLocaleTimeString() : 
                          <span className="text-gray-400">-</span>
                        }
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {classItem.studentTime ? 
                          new Date(classItem.studentTime).toLocaleTimeString() : 
                          <span className="text-gray-400">-</span>
                        }
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {classItem.onlineTime ? 
                          new Date(classItem.onlineTime).toLocaleTimeString() : 
                          <span className="text-gray-400">-</span>
                        }
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student?.name || 'Unknown Student'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student?.level || 'No level'}
                          </div>
                        </div>
                        <button
                          onClick={() => setShowStudentDetails(
                            showStudentDetails === classItem.studentId ? null : classItem.studentId
                          )}
                          className="ml-2 text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                          title="View student details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {teacher?.name || 'Unknown Teacher'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {teacher?.subject || 'No subject'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(classItem.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(classItem.status)}`}>
                          {classItem.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="max-w-xs">
                        {classItem.history.length > 0 ? (
                          <details className="cursor-pointer">
                            <summary className="text-sm text-blue-600 hover:text-blue-800">
                              {classItem.history.length} entries
                            </summary>
                            <div className="mt-2 space-y-1 text-xs text-gray-600">
                              {classItem.history.slice(-3).map((entry, index) => (
                                <div key={index} className="p-2 bg-gray-50 rounded">
                                  {entry}
                                </div>
                              ))}
                            </div>
                          </details>
                        ) : (
                          <span className="text-sm text-gray-400">No history</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex space-x-1">
                        {/* Status Update Buttons */}
                        {classItem.status === 'scheduled' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(classItem.id, 'running')}
                              className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded text-xs transition-colors"
                              title="Start class"
                            >
                              Start
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(classItem.id, 'absent')}
                              className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-xs transition-colors"
                              title="Mark as absent"
                            >
                              Absent
                            </button>
                          </>
                        )}
                        
                        {classItem.status === 'running' && (
                          <button
                            onClick={() => handleUpdateStatus(classItem.id, 'taken')}
                            className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-2 py-1 rounded text-xs transition-colors"
                            title="Complete class"
                          >
                            Complete
                          </button>
                        )}

                        <div className="relative group">
                          <button className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded">
                            <Edit className="h-4 w-4" />
                          </button>
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[120px]">
                            <button
                              onClick={() => handleUpdateStatus(classItem.id, 'leave')}
                              className="w-full text-left px-3 py-1 text-sm hover:bg-gray-50 text-orange-600"
                            >
                              Mark Leave
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(classItem.id, 'declined')}
                              className="w-full text-left px-3 py-1 text-sm hover:bg-gray-50 text-red-600"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(classItem.id, 'suspended')}
                              className="w-full text-left px-3 py-1 text-sm hover:bg-gray-50 text-gray-600"
                            >
                              Suspend
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(classItem.id, 'rescheduled')}
                              className="w-full text-left px-3 py-1 text-sm hover:bg-gray-50 text-indigo-600"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(classItem.id, 'refused')}
                              className="w-full text-left px-3 py-1 text-sm hover:bg-gray-50 text-red-500"
                            >
                              Refuse
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium">No classes found</p>
          <p className="text-sm">Classes will appear here based on your selected filters</p>
        </div>
      )}

      {/* Student Details Modal */}
      {showStudentDetails && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-auto">
            <div className="p-6">
              {(() => {
                const student = children.find(c => c.id === showStudentDetails);
                const studentClasses = dailyClasses.filter(cls => cls.studentId === showStudentDetails);
                
                return (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Student Details</h2>
                      <button
                        onClick={() => setShowStudentDetails(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <XCircle className="h-6 w-6" />
                      </button>
                    </div>

                    {student ? (
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-blue-900">{student.name}</h3>
                          <p className="text-sm text-blue-700">{student.email}</p>
                          <p className="text-sm text-blue-600">Level: {student.level}</p>
                          {student.age && <p className="text-sm text-blue-600">Age: {student.age}</p>}
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Class Statistics:</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-green-50 p-2 rounded">
                              <span className="text-green-700">Completed: </span>
                              <span className="font-medium">{studentClasses.filter(cls => cls.status === 'taken').length}</span>
                            </div>
                            <div className="bg-red-50 p-2 rounded">
                              <span className="text-red-700">Absent: </span>
                              <span className="font-medium">{studentClasses.filter(cls => cls.status === 'absent').length}</span>
                            </div>
                            <div className="bg-yellow-50 p-2 rounded">
                              <span className="text-yellow-700">Scheduled: </span>
                              <span className="font-medium">{studentClasses.filter(cls => cls.status === 'scheduled').length}</span>
                            </div>
                            <div className="bg-blue-50 p-2 rounded">
                              <span className="text-blue-700">Total: </span>
                              <span className="font-medium">{studentClasses.length}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Recent Classes:</h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {studentClasses.slice(-5).reverse().map((cls) => {
                              const { localDate, localTime } = convertFromUTC(
                                cls.appointmentDate,
                                cls.appointmentTime,
                                userTimezone
                              );
                              return (
                                <div key={cls.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                                  <span>{localDate} at {localTime}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(cls.status)}`}>
                                    {cls.status}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p>Student not found</p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}