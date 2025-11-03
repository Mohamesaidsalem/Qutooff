import React, { useState, useEffect } from 'react';
import {
  Clock, Users, Calendar, CheckCircle, XCircle, AlertCircle, Coffee, UserX, Pause,
  RotateCcw, Eye, Edit, Download, RefreshCw, BookOpen, Grid3x3, Table,
  History, Trash2, Video, FileText, Star, TrendingUp, UserCog, X
} from 'lucide-react';
import { ref, onValue, off, update } from 'firebase/database';
import { database } from '../../firebase/config';
import { convertFromUTC, getUserTimezone, getTimezoneDisplayName } from '../../utils/timezone';

interface DailyClass {
  id: string;
  teacherId: string;
  studentId: string;
  courseId?: string;
  courseName?: string;
  appointmentTime: string;
  appointmentDate: string;

  adminTime?: string;
  teacherTime?: string;
  studentTime?: string;
  onlineTime?: string;
  completedAt?: string;

  status: 'scheduled' | 'taken' | 'absent' | 'leave' | 'declined' | 'suspended' | 'trial' | 'advance' | 'rescheduled' | 'running' | 'refused';
  history: string[];
  createdAt: string;
  updatedAt?: string;
  notes?: string;
  duration: number;
  zoomLink?: string;
  rating?: number;
  feedback?: string;

  originalTeacherId?: string;
  shiftHistory?: Array<{
    from: string;
    to: string;
    fromName: string;
    toName: string;
    reason: string;
    shiftedAt: string;
    shiftedBy: string;
  }>;
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  price: number;
  duration: number;
  teacherId: string;
  maxStudents: number;
  currentStudents: number;
  status: 'active' | 'inactive' | 'completed';
  startDate: string;
  endDate: string;
  schedule: string;
}

interface DailyClassesManagementProps {
  teachers: any[];
  children: any[];
  classes: any[];
  onUpdateClass: (classId: string, updates: any) => void;
}

export default function DailyClassesManagement({ teachers, children, classes, onUpdateClass }: DailyClassesManagementProps) {
  const [dailyClasses, setDailyClasses] = useState<DailyClass[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('today');
  const [filterCourse, setFilterCourse] = useState('all');
  const [userTimezone] = useState(getUserTimezone());
  const [showStudentDetails, setShowStudentDetails] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  const [showShiftModal, setShowShiftModal] = useState(false);
  const [selectedClassForShift, setSelectedClassForShift] = useState<DailyClass | null>(null);
  const [shiftData, setShiftData] = useState({
    newTeacherId: '',
    reason: ''
  });

  // ✅ NEW: State للـ Card Details Modal
  const [selectedCardFilter, setSelectedCardFilter] = useState<{
    type: string;
    title: string;
    status?: string;
  } | null>(null);

  // ✅ Real-time Courses Listener
  useEffect(() => {
    const coursesRef = ref(database, 'courses');
    const unsubscribe = onValue(coursesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const coursesArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setCourses(coursesArray.filter(c => c.status === 'active'));
      } else {
        setCourses([]);
      }
    });
    return () => off(coursesRef, 'value', unsubscribe);
  }, []);

  // ✅ Real-time Daily Classes Listener (Auto-sync with Teacher Schedule)
  useEffect(() => {
    const classesRef = ref(database, 'daily_classes');
    const unsubscribe = onValue(classesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const classesArray: DailyClass[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          history: Array.isArray(data[key].history) ? data[key].history : []
        }));
        setDailyClasses(classesArray);
      } else {
        setDailyClasses([]);
      }
      setLoading(false);
    });
    return () => off(classesRef, 'value', unsubscribe);
  }, []);

  const getFilteredClasses = () => {
    let filtered = dailyClasses;

    if (filterDate === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(cls => cls.appointmentDate === today);
    } else if (filterDate === 'week') {
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      filtered = filtered.filter(cls => {
        const classDate = new Date(cls.appointmentDate);
        return classDate >= weekStart && classDate <= weekEnd;
      });
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(cls => cls.status === filterStatus);
    }

    if (filterCourse !== 'all') {
      filtered = filtered.filter(cls => cls.courseId === filterCourse);
    }

    return filtered.sort((a, b) => {
      const aTime = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
      const bTime = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
      return aTime.getTime() - bTime.getTime();
    });
  };

  // ✅ NEW: Get Classes by Card Filter
  const getClassesByCardFilter = () => {
    if (!selectedCardFilter) return [];
    
    const today = new Date().toISOString().split('T')[0];
    let filtered = dailyClasses;

    switch (selectedCardFilter.type) {
      case 'total':
        return filtered;
      
      case 'students':
        return filtered;
      
      case 'created':
        return filtered.filter(cls => {
          if (!cls.createdAt) return false;
          try {
            return new Date(cls.createdAt).toISOString().split('T')[0] === today;
          } catch {
            return false;
          }
        });
      
      default:
        if (selectedCardFilter.status) {
          return filtered.filter(cls => cls.status === selectedCardFilter.status);
        }
        return filtered;
    }
  };

  // ✅ NEW: Handle Card Click
  const handleCardClick = (type: string, title: string, status?: string) => {
    setSelectedCardFilter({ type, title, status });
  };

  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: dailyClasses.length,
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
      refused: dailyClasses.filter(cls => cls.status === 'refused').length,
      students: new Set(dailyClasses.map(cls => cls.studentId)).size,
      created: dailyClasses.filter(cls => {
        if (!cls.createdAt) return false;
        try {
          return new Date(cls.createdAt).toISOString().split('T')[0] === today;
        } catch {
          return false;
        }
      }).length
    };
  };

  const stats = calculateStats();

  const handleUpdateStatus = async (classId: string, newStatus: string) => {
    const classItem = dailyClasses.find(cls => cls.id === classId);
    if (!classItem) return;

    const currentTime = new Date().toISOString();
    const currentHistory = Array.isArray(classItem.history) ? classItem.history : [];
    const updates: Partial<DailyClass> = {
      status: newStatus as DailyClass['status'],
      updatedAt: currentTime,
      history: [...currentHistory, `Status changed to ${newStatus} at ${new Date().toLocaleString()}`]
    };

    if (newStatus === 'running') {
      updates.onlineTime = currentTime;
    } else if (newStatus === 'taken') {
      updates.completedAt = currentTime;
    }

    try {
      const classRef = ref(database, `daily_classes/${classId}`);
      await update(classRef, updates);
      alert(`✅ Class status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating class status:', error);
      alert('❌ Error updating class status');
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (confirm('Are you sure you want to delete this class?')) {
      try {
        const classRef = ref(database, `daily_classes/${classId}`);
        await update(classRef, { isActive: false });
        alert('✅ Class deleted successfully!');
      } catch (error) {
        console.error('Error deleting class:', error);
        alert('❌ Error deleting class');
      }
    }
  };

  const handleOpenShiftModal = (classItem: DailyClass) => {
    setSelectedClassForShift(classItem);
    setShiftData({ newTeacherId: '', reason: '' });
    setShowShiftModal(true);
  };

  const handleConfirmShift = async () => {
    if (!selectedClassForShift || !shiftData.newTeacherId || !shiftData.reason) {
      alert('Please select a teacher and provide a reason');
      return;
    }

    try {
      const oldTeacher = teachers.find(t => t.id === selectedClassForShift.teacherId);
      const newTeacher = teachers.find(t => t.id === shiftData.newTeacherId);

      const shiftRecord = {
        from: selectedClassForShift.teacherId,
        to: shiftData.newTeacherId,
        fromName: oldTeacher?.name || 'Unknown',
        toName: newTeacher?.name || 'Unknown',
        reason: shiftData.reason,
        shiftedAt: new Date().toISOString(),
        shiftedBy: 'Admin'
      };

      const updates = {
        originalTeacherId: selectedClassForShift.originalTeacherId || selectedClassForShift.teacherId,
        teacherId: shiftData.newTeacherId,
        shiftHistory: [...(selectedClassForShift.shiftHistory || []), shiftRecord],
        history: [
          ...(selectedClassForShift.history || []),
          `Teacher changed from ${shiftRecord.fromName} to ${shiftRecord.toName} - Reason: ${shiftData.reason}`
        ],
        updatedAt: new Date().toISOString()
      };

      const classRef = ref(database, `daily_classes/${selectedClassForShift.id}`);
      await update(classRef, updates);

      alert('✅ Teacher shifted successfully!');
      setShowShiftModal(false);
      setSelectedClassForShift(null);
      setShiftData({ newTeacherId: '', reason: '' });
    } catch (error) {
      console.error('Error shifting teacher:', error);
      alert('❌ Error shifting teacher. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    const iconProps = { className: "h-4 w-4" };
    switch (status) {
      case 'taken': return <CheckCircle {...iconProps} className="h-4 w-4 text-green-600" />;
      case 'running': return <Clock {...iconProps} className="h-4 w-4 text-blue-600" />;
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

  const formatTimeWithTimezone = (isoString?: string, timezone?: string) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      const utcDate = date.toISOString().split('T')[0];
      const utcTime = date.toISOString().split('T')[1].substring(0, 5);

      if (timezone) {
        const { localTime } = convertFromUTC(utcDate, utcTime, timezone);
        return localTime;
      }
      
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid';
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Invalid';
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
    <div className="space-y-2">
      {/* Header - تصغير المسافات فقط */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Daily Classes Management</h2>
          <p className="mt-1 text-xs text-gray-600">View and manage all daily classes (Add new classes from Teacher Schedule)</p>
          <div className="mt-0.5 flex items-center text-xs text-blue-600">
            <Clock className="h-3 w-3 mr-1" />
            <span>Your timezone: {getTimezoneDisplayName(userTimezone)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm text-sm">
            <Download className="h-4 w-4 mr-1.5" />
            Export
          </button>
        </div>
      </div>

      {/* Statistics - ✅ الكروت الكبيرة CLICKABLE */}
      <div className="space-y-2">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <button
            onClick={() => handleCardClick('total', 'All Classes')}
            className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg shadow text-white hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
          >
            <BookOpen className="h-5 w-5 mb-0.5" />
            <p className="text-xs opacity-90">Total</p>
            <p className="text-xl font-bold">{stats.total}</p>
          </button>
          
          <button
            onClick={() => handleCardClick('taken', 'Completed Classes', 'taken')}
            className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg shadow text-white hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
          >
            <CheckCircle className="h-5 w-5 mb-0.5" />
            <p className="text-xs opacity-90">Taken</p>
            <p className="text-xl font-bold">{stats.taken}</p>
          </button>
          
          <button
            onClick={() => handleCardClick('scheduled', 'Scheduled Classes', 'scheduled')}
            className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-2 rounded-lg shadow text-white hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
          >
            <Clock className="h-5 w-5 mb-0.5" />
            <p className="text-xs opacity-90">Scheduled</p>
            <p className="text-xl font-bold">{stats.remaining}</p>
          </button>

          <button
            onClick={() => handleCardClick('running', 'Running Classes', 'running')}
            className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-2 rounded-lg shadow text-white hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
          >
            <Clock className="h-5 w-5 mb-0.5" />
            <p className="text-xs opacity-90">Running</p>
            <p className="text-xl font-bold">{stats.running}</p>
          </button>

          <button
            onClick={() => handleCardClick('absent', 'Absent Classes', 'absent')}
            className="bg-gradient-to-br from-red-500 to-red-600 p-2 rounded-lg shadow text-white hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
          >
            <UserX className="h-5 w-5 mb-0.5" />
            <p className="text-xs opacity-90">Absent</p>
            <p className="text-xl font-bold">{stats.absent}</p>
          </button>

          <button
            onClick={() => handleCardClick('students', 'All Students Classes')}
            className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 rounded-lg shadow text-white hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
          >
            <Users className="h-5 w-5 mb-0.5" />
            <p className="text-xs opacity-90">Students</p>
            <p className="text-xl font-bold">{stats.students}</p>
          </button>
        </div>

        {/* ✅ الكروت الصغيرة CLICKABLE */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {[
            { icon: Coffee, label: 'Leave', value: stats.leave, color: 'text-orange-600', status: 'leave' },
            { icon: XCircle, label: 'Declined', value: stats.declined, color: 'text-red-500', status: 'declined' },
            { icon: Pause, label: 'Suspended', value: stats.suspended, color: 'text-gray-600', status: 'suspended' },
            { icon: BookOpen, label: 'Trial', value: stats.trial, color: 'text-purple-600', status: 'trial' },
            { icon: RefreshCw, label: 'Advance', value: stats.advance, color: 'text-teal-600', status: 'advance' },
            { icon: RotateCcw, label: 'Rescheduled', value: stats.rescheduled, color: 'text-indigo-600', status: 'rescheduled' },
            { icon: Calendar, label: 'Created', value: stats.created, color: 'text-blue-600', status: 'created' },
            { icon: XCircle, label: 'Refused', value: stats.refused, color: 'text-red-500', status: 'refused' }
          ].map((stat, idx) => (
            <button
              key={idx}
              onClick={() => handleCardClick(stat.status, `${stat.label} Classes`, stat.status !== 'created' ? stat.status : undefined)}
              className="bg-white p-1.5 rounded border text-center hover:shadow-xl hover:scale-105 transition-all cursor-pointer hover:border-blue-300"
            >
              <stat.icon className={`h-3.5 w-3.5 ${stat.color} mx-auto mb-0.5`} />
              <p className="text-xs text-gray-600">{stat.label}</p>
              <p className={`text-base font-bold ${stat.color}`}>{stat.value}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Filters - تصغير padding */}
      <div className="bg-white p-2.5 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date Filter</label>
            <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status Filter</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="running">Running</option>
              <option value="taken">Taken</option>
              <option value="absent">Absent</option>
              <option value="leave">Leave</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Course Filter</label>
            <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">View Mode</label>
            <div className="flex gap-1.5">
              <button onClick={() => setViewMode('grid')} className={`flex-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                <Grid3x3 className="h-4 w-4 mx-auto" />
              </button>
              <button onClick={() => setViewMode('table')} className={`flex-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                <Table className="h-4 w-4 mx-auto" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && filteredClasses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredClasses.map((classItem) => {
            const teacher = teachers.find(t => t.id === classItem.teacherId);
            const student = children.find(c => c.id === classItem.studentId);
            const course = courses.find(c => c.id === classItem.courseId);
            
            return (
              <div key={classItem.id} className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-4 hover:shadow-2xl transition-all hover:border-blue-200">
                <div className="flex items-start justify-between mb-3 pb-2 border-b">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(classItem.status)}
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${getStatusColor(classItem.status)}`}>
                      {classItem.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                    #{classItem.id.slice(-6)}
                  </span>
                </div>

                <div className="mb-3 p-2.5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Clock className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-xs font-bold text-blue-900">CLASS TIMES</span>
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Admin Time:</span>
                      <span className="font-semibold text-gray-900">{formatTime(classItem.adminTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">T-Time ({teacher?.timezone || 'UTC'}):</span>
                      <span className="font-semibold text-gray-900">
                        {formatTimeWithTimezone(classItem.teacherTime, teacher?.timezone)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">S-Time ({student?.timezone || 'UTC'}):</span>
                      <span className="font-semibold text-gray-900">
                        {formatTimeWithTimezone(classItem.studentTime, student?.timezone)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Online ({teacher?.timezone || 'UTC'}):</span>
                      <span className="font-semibold text-green-600">
                        {formatTimeWithTimezone(classItem.onlineTime, teacher?.timezone)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-0.5 mt-0.5">
                      <span className="text-gray-600 font-bold">Appointment:</span>
                      <span className="font-bold text-blue-600">{classItem.appointmentTime}</span>
                    </div>
                  </div>
                </div>

                {course && (
                  <div className="mb-3 p-2.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-0.5">
                      <BookOpen className="h-3.5 w-3.5 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-900">COURSE</span>
                    </div>
                    <p className="text-sm font-bold text-purple-900">{course.title}</p>
                    <p className="text-xs text-purple-700">{course.level}</p>
                  </div>
                )}

                <div className="mb-3 p-2.5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-blue-600" />
                      <span className="font-bold text-blue-900 text-sm">{classItem.appointmentDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-blue-600" />
                      <span className="font-bold text-blue-900 text-sm">{classItem.appointmentTime}</span>
                    </div>
                  </div>
                  <p className="text-xs text-blue-700 mt-0.5">Duration: {classItem.duration} min</p>
                </div>

                <div className="mb-2.5 p-2.5 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-0.5 font-semibold">STUDENT</p>
                  <p className="text-sm font-bold text-gray-900">{student?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-600">{student?.level || 'No level'}</p>
                </div>

                <div className="mb-3 p-2.5 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-0.5 font-semibold">TEACHER</p>
                  <p className="text-sm font-bold text-gray-900">{teacher?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-600">{teacher?.subject || teacher?.specialization || 'No subject'}</p>
                  
                  {classItem.shiftHistory && classItem.shiftHistory.length > 0 && (
                    <div className="mt-1.5 p-1.5 bg-orange-100 rounded border border-orange-300">
                      <p className="text-xs text-orange-700 font-semibold flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Teacher Shifted
                      </p>
                      <p className="text-xs text-orange-600">
                        From: {classItem.shiftHistory[classItem.shiftHistory.length - 1].fromName}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5 mt-3 pt-3 border-t">
                  {classItem.status === 'scheduled' && (
                    <>
                      <button 
                        onClick={() => handleUpdateStatus(classItem.id, 'running')}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                      >
                        <Clock className="h-3 w-3" />
                        Start
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(classItem.id, 'absent')}
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                      >
                        <UserX className="h-3 w-3" />
                        Absent
                      </button>
                    </>
                  )}
                  {classItem.status === 'running' && (
                    <button 
                      onClick={() => handleUpdateStatus(classItem.id, 'taken')}
                      className="col-span-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Complete
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleOpenShiftModal(classItem)}
                    className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                  >
                    <UserCog className="h-3 w-3" />
                    Shift
                  </button>
                  
                  <button 
                    onClick={() => setShowStudentDetails(classItem.studentId)}
                    className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    View
                  </button>
                  <button 
                    onClick={() => setShowHistoryModal(classItem.id)}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                  >
                    <History className="h-3 w-3" />
                    History
                  </button>
                  {classItem.zoomLink && (
                    <a 
                      href={classItem.zoomLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="col-span-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                    >
                      <Video className="h-3 w-3" />
                      Join Zoom
                    </a>
                  )}
                  <button 
                    onClick={() => handleDeleteClass(classItem.id)}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                  
                  <div className="relative group">
                    <button className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1">
                      <Edit className="h-3 w-3" />
                      More
                    </button>
                    <div className="absolute right-0 bottom-full mb-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 min-w-[160px]">
                      <div className="px-3 py-2 text-xs font-bold text-gray-500 border-b mb-1">CHANGE STATUS</div>
                      <button onClick={() => handleUpdateStatus(classItem.id, 'leave')} className="w-full text-left px-4 py-2 text-xs hover:bg-orange-50 text-orange-600 font-semibold flex items-center gap-2">
                        <Coffee className="h-3 w-3" /> Mark Leave
                      </button>
                      <button onClick={() => handleUpdateStatus(classItem.id, 'declined')} className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 text-red-600 font-semibold flex items-center gap-2">
                        <XCircle className="h-3 w-3" /> Decline
                      </button>
                      <button onClick={() => handleUpdateStatus(classItem.id, 'suspended')} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-gray-600 font-semibold flex items-center gap-2">
                        <Pause className="h-3 w-3" /> Suspend
                      </button>
                      <button onClick={() => handleUpdateStatus(classItem.id, 'rescheduled')} className="w-full text-left px-4 py-2 text-xs hover:bg-indigo-50 text-indigo-600 font-semibold flex items-center gap-2">
                        <RotateCcw className="h-3 w-3" /> Reschedule
                      </button>
                      <button onClick={() => handleUpdateStatus(classItem.id, 'refused')} className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 text-red-500 font-semibold flex items-center gap-2">
                        <XCircle className="h-3 w-3" /> Refuse
                      </button>
                      <div className="border-t my-1"></div>
                      <button onClick={() => handleUpdateStatus(classItem.id, 'trial')} className="w-full text-left px-4 py-2 text-xs hover:bg-purple-50 text-purple-600 font-semibold flex items-center gap-2">
                        <BookOpen className="h-3 w-3" /> Mark Trial
                      </button>
                      <button onClick={() => handleUpdateStatus(classItem.id, 'advance')} className="w-full text-left px-4 py-2 text-xs hover:bg-teal-50 text-teal-600 font-semibold flex items-center gap-2">
                        <RefreshCw className="h-3 w-3" /> Mark Advance
                      </button>
                    </div>
                  </div>
                </div>

                {classItem.notes && (
                  <div className="mt-2.5 p-2.5 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-0.5">
                      <FileText className="h-3 w-3 text-yellow-700" />
                      <span className="text-xs font-semibold text-yellow-900">NOTES</span>
                    </div>
                    <p className="text-xs text-yellow-800">{classItem.notes}</p>
                  </div>
                )}

                {classItem.rating && (
                  <div className="mt-2.5 flex items-center gap-2 p-1.5 bg-amber-50 rounded-lg">
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-bold text-amber-900">{classItem.rating}/5</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && filteredClasses.length > 0 && (
        <div className="bg-white shadow-lg rounded-xl border-2 border-gray-100 overflow-hidden">
          <div className="px-4 py-2.5 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-base font-bold text-gray-900">Daily Classes Table ({filteredClasses.length})</h3>
            <p className="text-xs text-gray-600">Comprehensive view of all class sessions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">ID</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">A-Time</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">T-Time</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">S-Time</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Online</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Student</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Course</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">History</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Teacher</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Shift</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClasses.map((classItem) => {
                  const teacher = teachers.find(t => t.id === classItem.teacherId);
                  const student = children.find(c => c.id === classItem.studentId);
                  const course = courses.find(c => c.id === classItem.courseId);
                  
                  return (
                    <tr key={classItem.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="text-xs font-mono font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">
                          {classItem.id.slice(-7)}
                        </span>
                      </td>
                      
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-purple-600" />
                          <span className="text-xs font-semibold text-gray-900">{formatTime(classItem.adminTime)}</span>
                        </div>
                      </td>
                      
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-blue-600" />
                          <span className="text-xs font-bold text-gray-900">{classItem.appointmentDate}</span>
                        </div>
                        <div className="text-xs text-gray-600">{classItem.appointmentTime}</div>
                      </td>
                      
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-indigo-600" />
                          <span className="text-xs font-semibold text-gray-900">
                            {formatTimeWithTimezone(classItem.teacherTime, teacher?.timezone)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">{teacher?.timezone || 'UTC'}</div>
                      </td>
                      
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-cyan-600" />
                          <span className="text-xs font-semibold text-gray-900">
                            {formatTimeWithTimezone(classItem.studentTime, student?.timezone)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">{student?.timezone || 'UTC'}</div>
                      </td>
                      
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-green-600" />
                          <span className="text-xs font-bold text-green-600">
                            {formatTimeWithTimezone(classItem.onlineTime, teacher?.timezone)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">{teacher?.timezone || 'UTC'}</div>
                      </td>
                      
                      <td className="px-3 py-2">
                        <div className="text-sm font-semibold text-gray-900">{student?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{student?.level || 'No level'}</div>
                      </td>
                      
                      <td className="px-3 py-2">
                        {course ? (
                          <div>
                            <div className="text-sm font-semibold text-purple-900">{course.title}</div>
                            <div className="text-xs text-purple-600">{course.level}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No course</span>
                        )}
                      </td>
                      
                      <td className="px-3 py-2 text-center">
                        <button 
                          onClick={() => setShowHistoryModal(classItem.id)}
                          className="p-1.5 hover:bg-purple-50 rounded-lg border border-purple-200 transition-colors inline-flex"
                          title="View History"
                        >
                          <History className="h-3.5 w-3.5 text-purple-600" />
                        </button>
                      </td>
                      
                      <td className="px-3 py-2">
                        <div className="text-sm font-semibold text-gray-900">{teacher?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{teacher?.subject || teacher?.specialization || 'No subject'}</div>
                        {classItem.shiftHistory && classItem.shiftHistory.length > 0 && (
                          <div className="text-xs text-orange-600 font-semibold mt-0.5 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Shifted
                          </div>
                        )}
                      </td>
                      
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(classItem.status)}
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getStatusColor(classItem.status)}`}>
                            {classItem.status}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-3 py-2 text-center">
                        <button 
                          onClick={() => handleOpenShiftModal(classItem)}
                          className="p-1.5 hover:bg-orange-50 rounded-lg border border-orange-300 transition-colors inline-flex items-center justify-center bg-orange-50"
                          title="Shift Teacher"
                        >
                          <UserCog className="h-3.5 w-3.5 text-orange-600" />
                        </button>
                      </td>
                      
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {classItem.status === 'scheduled' && (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(classItem.id, 'running')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-bold transition-all"
                                title="Start Class"
                              >
                                Start
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(classItem.id, 'absent')}
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-bold transition-all"
                                title="Mark Absent"
                              >
                                Absent
                              </button>
                            </>
                          )}
                          
                          {classItem.status === 'running' && (
                            <button 
                              onClick={() => handleUpdateStatus(classItem.id, 'taken')}
                              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-bold transition-all"
                              title="Mark as Taken/Complete"
                            >
                              Complete
                            </button>
                          )}
                          
                          {classItem.status === 'taken' && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                              ✓ Completed
                            </span>
                          )}
                          
                          {classItem.status === 'absent' && (
                            <button 
                              onClick={() => handleUpdateStatus(classItem.id, 'rescheduled')}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-xs font-bold transition-all"
                              title="Reschedule"
                            >
                              Reschedule
                            </button>
                          )}
                          
                          {(classItem.status === 'leave' || classItem.status === 'declined' || classItem.status === 'suspended') && (
                            <button 
                              onClick={() => handleUpdateStatus(classItem.id, 'scheduled')}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-xs font-bold transition-all"
                              title="Restore to Scheduled"
                            >
                              Restore
                            </button>
                          )}
                          
                          <button 
                            onClick={() => setShowStudentDetails(classItem.studentId)}
                            className="p-1 hover:bg-indigo-50 rounded border border-indigo-200 transition-colors"
                            title="View Student Details"
                          >
                            <Eye className="h-3.5 w-3.5 text-indigo-600" />
                          </button>
                          
                          <div className="relative group">
                            <button className="p-1 hover:bg-gray-100 rounded border border-gray-200 transition-colors">
                              <Edit className="h-3.5 w-3.5 text-gray-600" />
                            </button>
                            <div className="absolute right-0 top-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 min-w-[160px]">
                              <div className="px-3 py-2 text-xs font-bold text-gray-500 border-b mb-1">CHANGE STATUS</div>
                              <button onClick={() => handleUpdateStatus(classItem.id, 'scheduled')} className="w-full text-left px-4 py-2 text-xs hover:bg-blue-50 text-blue-600 font-semibold flex items-center gap-2">
                                <Clock className="h-3 w-3" /> Schedule
                              </button>
                              <button onClick={() => handleUpdateStatus(classItem.id, 'running')} className="w-full text-left px-4 py-2 text-xs hover:bg-cyan-50 text-cyan-600 font-semibold flex items-center gap-2">
                                <Clock className="h-3 w-3" /> Start Running
                              </button>
                              <button onClick={() => handleUpdateStatus(classItem.id, 'taken')} className="w-full text-left px-4 py-2 text-xs hover:bg-green-50 text-green-600 font-semibold flex items-center gap-2">
                                <CheckCircle className="h-3 w-3" /> Mark Taken
                              </button>
                              <button onClick={() => handleUpdateStatus(classItem.id, 'absent')} className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 text-red-600 font-semibold flex items-center gap-2">
                                <UserX className="h-3 w-3" /> Mark Absent
                              </button>
                              <button onClick={() => handleUpdateStatus(classItem.id, 'leave')} className="w-full text-left px-4 py-2 text-xs hover:bg-orange-50 text-orange-600 font-semibold flex items-center gap-2">
                                <Coffee className="h-3 w-3" /> Mark Leave
                              </button>
                              <button onClick={() => handleUpdateStatus(classItem.id, 'declined')} className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 text-red-600 font-semibold flex items-center gap-2">
                                <XCircle className="h-3 w-3" /> Decline
                              </button>
                              <button onClick={() => handleUpdateStatus(classItem.id, 'suspended')} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-gray-600 font-semibold flex items-center gap-2">
                                <Pause className="h-3 w-3" /> Suspend
                              </button>
                              <button onClick={() => handleUpdateStatus(classItem.id, 'rescheduled')} className="w-full text-left px-4 py-2 text-xs hover:bg-indigo-50 text-indigo-600 font-semibold flex items-center gap-2">
                                <RotateCcw className="h-3 w-3" /> Reschedule
                              </button>
                              <button onClick={() => handleUpdateStatus(classItem.id, 'refused')} className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 text-red-500 font-semibold flex items-center gap-2">
                                <XCircle className="h-3 w-3" /> Refuse
                              </button>
                              <div className="border-t my-1"></div>
                              <button onClick={() => handleUpdateStatus(classItem.id, 'trial')} className="w-full text-left px-4 py-2 text-xs hover:bg-purple-50 text-purple-600 font-semibold flex items-center gap-2">
                                <BookOpen className="h-3 w-3" /> Mark Trial
                              </button>
                              <button onClick={() => handleUpdateStatus(classItem.id, 'advance')} className="w-full text-left px-4 py-2 text-xs hover:bg-teal-50 text-teal-600 font-semibold flex items-center gap-2">
                                <RefreshCw className="h-3 w-3" /> Mark Advance
                              </button>
                              <div className="border-t my-1"></div>
                              {classItem.zoomLink && (
                                <a 
                                  href={classItem.zoomLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full text-left px-4 py-2 text-xs hover:bg-green-50 text-green-600 font-semibold flex items-center gap-2"
                                >
                                  <Video className="h-3 w-3" /> Join Zoom
                                </a>
                              )}
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
      )}

      {/* Empty State */}
      {filteredClasses.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-100">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-lg font-bold text-gray-900 mb-1">No classes found</p>
          <p className="text-sm text-gray-600">Classes will appear here based on your selected filters</p>
        </div>
      )}

      {/* ✅ NEW: Card Details Modal */}
      {selectedCardFilter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-7xl w-full mx-auto max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{selectedCardFilter.title}</h2>
                  <p className="text-blue-100 text-sm">
                    Total: {getClassesByCardFilter().length} {getClassesByCardFilter().length === 1 ? 'class' : 'classes'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCardFilter(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {getClassesByCardFilter().length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Date & Time</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Teacher</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Course</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Duration</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getClassesByCardFilter().map((classItem) => {
                        const teacher = teachers.find(t => t.id === classItem.teacherId);
                        const student = children.find(c => c.id === classItem.studentId);
                        const course = courses.find(c => c.id === classItem.courseId);
                        
                        return (
                          <tr key={classItem.id} className="hover:bg-blue-50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-xs font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                #{classItem.id.slice(-6)}
                              </span>
                            </td>
                            
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span className="font-bold text-gray-900">{classItem.appointmentDate}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                                <Clock className="h-3 w-3" />
                                <span>{classItem.appointmentTime}</span>
                              </div>
                            </td>
                            
                            <td className="px-4 py-3">
                              <div className="text-sm font-semibold text-gray-900">{student?.name || 'Unknown'}</div>
                              <div className="text-xs text-gray-500">{student?.level || 'No level'}</div>
                            </td>
                            
                            <td className="px-4 py-3">
                              <div className="text-sm font-semibold text-gray-900">{teacher?.name || 'Unknown'}</div>
                              <div className="text-xs text-gray-500">{teacher?.subject || 'No subject'}</div>
                            </td>
                            
                            <td className="px-4 py-3">
                              {course ? (
                                <>
                                  <div className="text-sm font-semibold text-purple-900">{course.title}</div>
                                  <div className="text-xs text-purple-600">{course.level}</div>
                                </>
                              ) : (
                                <span className="text-xs text-gray-400">No course</span>
                              )}
                            </td>
                            
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                {getStatusIcon(classItem.status)}
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(classItem.status)}`}>
                                  {classItem.status}
                                </span>
                              </div>
                            </td>
                            
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm font-semibold text-gray-900">{classItem.duration} min</span>
                            </td>
                            
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setShowStudentDetails(classItem.studentId);
                                    setSelectedCardFilter(null);
                                  }}
                                  className="p-2 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition-colors"
                                  title="View Student Details"
                                >
                                  <Eye className="h-4 w-4 text-indigo-600" />
                                </button>
                                
                                <button
                                  onClick={() => {
                                    setShowHistoryModal(classItem.id);
                                    setSelectedCardFilter(null);
                                  }}
                                  className="p-2 hover:bg-purple-50 rounded-lg border border-purple-200 transition-colors"
                                  title="View History"
                                >
                                  <History className="h-4 w-4 text-purple-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <Calendar className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl font-bold text-gray-900 mb-2">No Classes Found</p>
                  <p className="text-gray-600">There are no classes matching this criteria.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {getClassesByCardFilter().length} {getClassesByCardFilter().length === 1 ? 'class' : 'classes'}
              </p>
              <button
                onClick={() => setSelectedCardFilter(null)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-bold shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shift Teacher Modal */}
      {showShiftModal && selectedClassForShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl shadow-lg">
                    <UserCog className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Shift Teacher</h2>
                </div>
                <button onClick={() => setShowShiftModal(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                <p className="text-sm font-bold text-yellow-900 mb-2">Current Class Information:</p>
                <div className="space-y-1 text-sm text-yellow-800">
                  <p><strong>Date:</strong> {selectedClassForShift.appointmentDate}</p>
                  <p><strong>Time:</strong> {selectedClassForShift.appointmentTime}</p>
                  <p><strong>Current Teacher:</strong> {teachers.find(t => t.id === selectedClassForShift.teacherId)?.name}</p>
                  <p><strong>Student:</strong> {children.find(c => c.id === selectedClassForShift.studentId)?.name}</p>
                </div>
              </div>

              {selectedClassForShift.shiftHistory && selectedClassForShift.shiftHistory.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Shift History:
                  </p>
                  <div className="space-y-2">
                    {selectedClassForShift.shiftHistory.map((shift, idx) => (
                      <div key={idx} className="text-xs bg-white p-3 rounded-lg border">
                        <p className="font-semibold text-gray-900">
                          {shift.fromName} → {shift.toName}
                        </p>
                        <p className="text-gray-600">Reason: {shift.reason}</p>
                        <p className="text-gray-500">
                          {new Date(shift.shiftedAt).toLocaleString()} by {shift.shiftedBy}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    New Teacher *
                  </label>
                  <select
                    value={shiftData.newTeacherId}
                    onChange={(e) => setShiftData({...shiftData, newTeacherId: e.target.value})}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a teacher...</option>
                    {teachers
                      .filter(t => t.id !== selectedClassForShift.teacherId)
                      .map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name} - {teacher.email}
                        </option>
                      ))
                    }
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Reason for Shift *
                  </label>
                  <textarea
                    value={shiftData.reason}
                    onChange={(e) => setShiftData({...shiftData, reason: e.target.value})}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={4}
                    placeholder="Please provide a reason (e.g., teacher sick, emergency, unavailable, etc.)"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowShiftModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmShift}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 px-4 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all font-bold shadow-lg flex items-center justify-center gap-2"
                  >
                    <UserCog className="h-5 w-5" />
                    Confirm Shift
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto">
            <div className="p-6">
              {(() => {
                const classItem = dailyClasses.find(c => c.id === showHistoryModal);
                const classHistory = classItem ? (Array.isArray(classItem.history) ? classItem.history : []) : [];
                return (
                  <>
                    <div className="flex items-center justify-between mb-6 pb-4 border-b">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                          <History className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Class History</h2>
                      </div>
                      <button onClick={() => setShowHistoryModal(null)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <XCircle className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {classHistory.length > 0 ? (
                        classHistory.slice().reverse().map((entry: string, index: number) => (
                          <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:shadow-md transition-all">
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                              </div>
                              <p className="text-sm text-gray-800 font-medium">{entry}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-lg font-semibold">No history recorded yet</p>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end pt-4 border-t mt-6">
                      <button onClick={() => setShowHistoryModal(null)} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-bold shadow-lg">
                        Close
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {showStudentDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-auto max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {(() => {
                const student = children.find((c: any) => c.id === showStudentDetails);
                const studentClasses = dailyClasses.filter(cls => cls.studentId === showStudentDetails);
                return (
                  <>
                    <div className="flex items-center justify-between mb-6 pb-4 border-b">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Student Details</h2>
                      </div>
                      <button onClick={() => setShowStudentDetails(null)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <XCircle className="h-6 w-6" />
                      </button>
                    </div>
                    {student ? (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 p-6 rounded-2xl border-2 border-purple-200 shadow-lg">
                          <h3 className="text-2xl font-bold text-purple-900 mb-3">{student.name}</h3>
                          <div className="space-y-2 text-sm">
                            <p className="text-purple-700 font-semibold">📧 {student.email}</p>
                            <p className="text-purple-600 font-semibold">📚 Level: {student.level}</p>
                            {student.age && <p className="text-purple-600 font-semibold">🎂 Age: {student.age}</p>}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4 text-xl flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            Class Statistics
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { icon: CheckCircle, label: 'Completed', value: studentClasses.filter(cls => cls.status === 'taken').length, color: 'green' },
                              { icon: UserX, label: 'Absent', value: studentClasses.filter(cls => cls.status === 'absent').length, color: 'red' },
                              { icon: Clock, label: 'Scheduled', value: studentClasses.filter(cls => cls.status === 'scheduled').length, color: 'yellow' },
                              { icon: BookOpen, label: 'Total', value: studentClasses.length, color: 'blue' }
                            ].map((stat, idx) => (
                              <div key={idx} className={`bg-${stat.color}-50 p-5 rounded-2xl border-2 border-${stat.color}-200 shadow-md hover:shadow-lg transition-all`}>
                                <div className="flex items-center gap-2 mb-2">
                                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                                  <span className={`text-sm text-${stat.color}-700 font-bold`}>{stat.label}</span>
                                </div>
                                <p className={`text-4xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4 text-xl flex items-center gap-2">
                            <History className="h-5 w-5 text-purple-600" />
                            Recent Classes
                          </h4>
                          <div className="space-y-3 max-h-80 overflow-y-auto">
                            {studentClasses.slice(-10).reverse().map((cls: DailyClass) => {
                              const teacher = teachers.find((t: any) => t.id === cls.teacherId);
                              const course = courses.find(c => c.id === cls.courseId);
                              return (
                                <div key={cls.id} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all border-2 border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                      <Calendar className="h-4 w-4 text-blue-600" />
                                      <span className="font-bold text-gray-900">{cls.appointmentDate}</span>
                                      <Clock className="h-4 w-4 text-blue-600" />
                                      <span className="text-gray-700 font-semibold">{cls.appointmentTime}</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(cls.status)}`}>
                                      {cls.status}
                                    </span>
                                  </div>
                                  {course && (
                                    <div className="flex items-center gap-2 mt-2 text-xs">
                                      <BookOpen className="h-3 w-3 text-purple-600" />
                                      <span className="text-purple-900 font-semibold">{course.title}</span>
                                    </div>
                                  )}
                                  {teacher && (
                                    <div className="flex items-center gap-2 mt-1 text-xs">
                                      <Users className="h-3 w-3 text-indigo-600" />
                                      <span className="text-indigo-900 font-semibold">{teacher.name}</span>
                                    </div>
                                  )}
                                  {cls.rating && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                      <span className="text-sm font-bold text-amber-900">{cls.rating}/5</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {studentClasses.length === 0 && (
                              <div className="text-center py-12 text-gray-500">
                                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-lg font-semibold">No classes recorded yet</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-end pt-4 border-t">
                          <button onClick={() => setShowStudentDetails(null)} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-bold shadow-lg">
                            Close
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-16 text-gray-500">
                        <Users className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                        <p className="text-xl font-bold">Student not found</p>
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