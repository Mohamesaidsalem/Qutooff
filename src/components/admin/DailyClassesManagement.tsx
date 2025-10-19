import React, { useState, useEffect } from 'react';
import { 
  Clock, Users, Calendar, CheckCircle, XCircle, AlertCircle, Coffee, UserX, Pause,
  RotateCcw, Eye, Edit, Download, RefreshCw, BookOpen, TimerIcon, Grid3x3, Table, 
  History, Plus, Trash2, Video, FileText, Star, Award, TrendingUp, Filter
} from 'lucide-react';
import { ref, onValue, off, update, push, set } from 'firebase/database';
import { database } from '../../firebase/config';
import { convertFromUTC, getUserTimezone, getTimezoneDisplayName, convertToUTC } from '../../utils/timezone';

interface DailyClass {
  id: string;
  teacherId: string;
  studentId: string;
  courseId?: string;
  courseName?: string;
  appointmentTime: string;
  appointmentDate: string;
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
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [formData, setFormData] = useState({
    studentId: '',
    teacherId: '',
    courseId: '',
    date: '',
    time: '',
    duration: '60',
    zoomLink: '',
    notes: ''
  });

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

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { utcDate, utcTime } = convertToUTC(formData.date, formData.time, userTimezone);
      const course = courses.find(c => c.id === formData.courseId);
      
      const classData = {
        studentId: formData.studentId,
        teacherId: formData.teacherId,
        courseId: formData.courseId || null,
        courseName: course?.title || null,
        appointmentDate: utcDate,
        appointmentTime: utcTime,
        duration: Number(formData.duration),
        status: 'scheduled' as const,
        zoomLink: formData.zoomLink,
        notes: formData.notes,
        history: [`Class created at ${new Date().toLocaleString()}`],
        createdAt: new Date().toISOString()
      };

      const classesRef = ref(database, 'daily_classes');
      const newClassRef = push(classesRef);
      await set(newClassRef, classData);

      alert('Class added successfully!');
      setShowAddClassModal(false);
      resetForm();
    } catch (error) {
      console.error('Error adding class:', error);
      alert('Error adding class. Please try again.');
    }
  };

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
      alert(`Class status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating class status:', error);
      alert('Error updating class status');
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (confirm('Are you sure you want to delete this class?')) {
      try {
        const classRef = ref(database, `daily_classes/${classId}`);
        await update(classRef, { isActive: false });
        alert('Class deleted successfully!');
      } catch (error) {
        console.error('Error deleting class:', error);
        alert('Error deleting class');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      teacherId: '',
      courseId: '',
      date: '',
      time: '',
      duration: '60',
      zoomLink: '',
      notes: ''
    });
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
          <p className="mt-2 text-sm text-gray-600">Manage all daily classes with course integration</p>
          <div className="mt-1 flex items-center text-xs text-blue-600">
            <Clock className="h-3 w-3 mr-1" />
            <span>Your timezone: {getTimezoneDisplayName(userTimezone)}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddClassModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Class
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="space-y-3">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow text-white">
            <BookOpen className="h-6 w-6 mb-1" />
            <p className="text-xs opacity-90">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-lg shadow text-white">
            <CheckCircle className="h-6 w-6 mb-1" />
            <p className="text-xs opacity-90">Completed</p>
            <p className="text-2xl font-bold">{stats.taken}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-3 rounded-lg shadow text-white">
            <Clock className="h-6 w-6 mb-1" />
            <p className="text-xs opacity-90">Scheduled</p>
            <p className="text-2xl font-bold">{stats.remaining}</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-3 rounded-lg shadow text-white">
            <TimerIcon className="h-6 w-6 mb-1" />
            <p className="text-xs opacity-90">Running</p>
            <p className="text-2xl font-bold">{stats.running}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-lg shadow text-white">
            <UserX className="h-6 w-6 mb-1" />
            <p className="text-xs opacity-90">Absent</p>
            <p className="text-2xl font-bold">{stats.absent}</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-lg shadow text-white">
            <Users className="h-6 w-6 mb-1" />
            <p className="text-xs opacity-90">Students</p>
            <p className="text-2xl font-bold">{stats.students}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {[
            { icon: Coffee, label: 'Leave', value: stats.leave, color: 'text-orange-600' },
            { icon: XCircle, label: 'Declined', value: stats.declined, color: 'text-red-500' },
            { icon: Pause, label: 'Suspended', value: stats.suspended, color: 'text-gray-600' },
            { icon: BookOpen, label: 'Trial', value: stats.trial, color: 'text-purple-600' },
            { icon: RefreshCw, label: 'Advance', value: stats.advance, color: 'text-teal-600' },
            { icon: RotateCcw, label: 'Rescheduled', value: stats.rescheduled, color: 'text-indigo-600' },
            { icon: Calendar, label: 'Created', value: stats.created, color: 'text-blue-600' },
            { icon: XCircle, label: 'Refused', value: stats.refused, color: 'text-red-500' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-2 rounded border text-center">
              <stat.icon className={`h-4 w-4 ${stat.color} mx-auto mb-1`} />
              <p className="text-xs text-gray-600">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Filter</label>
            <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="running">Running</option>
              <option value="taken">Taken</option>
              <option value="absent">Absent</option>
              <option value="leave">Leave</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Filter</label>
            <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
            <div className="flex gap-2">
              <button onClick={() => setViewMode('grid')} className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                <Grid3x3 className="h-4 w-4 mx-auto" />
              </button>
              <button onClick={() => setViewMode('table')} className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                <Table className="h-4 w-4 mx-auto" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Classes Display - Grid View */}
      {viewMode === 'grid' && filteredClasses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map((classItem) => {
            const teacher = teachers.find(t => t.id === classItem.teacherId);
            const student = children.find(c => c.id === classItem.studentId);
            const course = courses.find(c => c.id === classItem.courseId);
            
            return (
              <div key={classItem.id} className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-5 hover:shadow-2xl transition-all hover:border-blue-200">
                <div className="flex items-start justify-between mb-4 pb-3 border-b">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(classItem.status)}
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(classItem.status)}`}>
                      {classItem.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    #{classItem.id.slice(-6)}
                  </span>
                </div>

                {course && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="h-4 w-4 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-900">COURSE</span>
                    </div>
                    <p className="text-sm font-bold text-purple-900">{course.title}</p>
                    <p className="text-xs text-purple-700">{course.level}</p>
                  </div>
                )}

                <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="font-bold text-blue-900">{classItem.appointmentDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="font-bold text-blue-900">{classItem.appointmentTime}</span>
                    </div>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">Duration: {classItem.duration} min</p>
                </div>

                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 font-semibold">STUDENT</p>
                  <p className="text-sm font-bold text-gray-900">{student?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-600">{student?.level || 'No level'}</p>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1 font-semibold">TEACHER</p>
                  <p className="text-sm font-bold text-gray-900">{teacher?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-600">{teacher?.subject || teacher?.specialization || 'No subject'}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
                  {classItem.status === 'scheduled' && (
                    <>
                      <button 
                        onClick={() => handleUpdateStatus(classItem.id, 'running')}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                      >
                        <TimerIcon className="h-3 w-3" />
                        Start
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(classItem.id, 'absent')}
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                      >
                        <UserX className="h-3 w-3" />
                        Absent
                      </button>
                    </>
                  )}
                  {classItem.status === 'running' && (
                    <button 
                      onClick={() => handleUpdateStatus(classItem.id, 'taken')}
                      className="col-span-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Complete
                    </button>
                  )}
                  <button 
                    onClick={() => setShowStudentDetails(classItem.studentId)}
                    className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    View
                  </button>
                  <button 
                    onClick={() => setShowHistoryModal(classItem.id)}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                  >
                    <History className="h-3 w-3" />
                    History
                  </button>
                  {classItem.zoomLink && (
                    <a 
                      href={classItem.zoomLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="col-span-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                    >
                      <Video className="h-3 w-3" />
                      Join Zoom
                    </a>
                  )}
                  <button 
                    onClick={() => handleDeleteClass(classItem.id)}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                  <div className="relative group">
                    <button className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1">
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
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-3 w-3 text-yellow-700" />
                      <span className="text-xs font-semibold text-yellow-900">NOTES</span>
                    </div>
                    <p className="text-xs text-yellow-800">{classItem.notes}</p>
                  </div>
                )}

                {classItem.rating && (
                  <div className="mt-3 flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
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
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-lg font-bold text-gray-900">Daily Classes Table ({filteredClasses.length})</h3>
            <p className="text-sm text-gray-600">Comprehensive view of all class sessions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Teacher</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClasses.map((classItem) => {
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
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-semibold text-gray-900">{classItem.appointmentDate}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-semibold text-gray-900">{classItem.appointmentTime}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {course ? (
                          <div>
                            <div className="text-sm font-bold text-purple-900">{course.title}</div>
                            <div className="text-xs text-purple-600">{course.level}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No course</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{student?.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">{student?.level || 'No level'}</div>
                          </div>
                          <button 
                            onClick={() => setShowStudentDetails(classItem.studentId)}
                            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-gray-900">{teacher?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{teacher?.subject || teacher?.specialization || 'No subject'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(classItem.status)}
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(classItem.status)}`}>
                            {classItem.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {classItem.status === 'scheduled' && (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(classItem.id, 'running')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition-all"
                              >
                                Start
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(classItem.id, 'absent')}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition-all"
                              >
                                Absent
                              </button>
                            </>
                          )}
                          {classItem.status === 'running' && (
                            <button 
                              onClick={() => handleUpdateStatus(classItem.id, 'taken')}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition-all"
                            >
                              Complete
                            </button>
                          )}
                          <button 
                            onClick={() => setShowHistoryModal(classItem.id)}
                            className="p-2 hover:bg-purple-50 rounded-lg border border-purple-200 transition-colors"
                            title="View History"
                          >
                            <History className="h-4 w-4 text-purple-600" />
                          </button>
                          <div className="relative group">
                            <button className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                              <Edit className="h-4 w-4 text-gray-600" />
                            </button>
                            <div className="absolute right-0 top-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 min-w-[160px]">
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
        <div className="text-center py-16 bg-white rounded-xl border-2 border-gray-100">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl font-bold text-gray-900 mb-2">No classes found</p>
          <p className="text-sm text-gray-600">Classes will appear here based on your selected filters</p>
        </div>
      )}

      {/* Add Class Modal */}
      {showAddClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <h2 className="text-2xl font-bold text-gray-900">Add New Class</h2>
                <button onClick={() => { setShowAddClassModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleAddClass} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Student *</label>
                    <select value={formData.studentId} onChange={(e) => setFormData({...formData, studentId: e.target.value})} className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="">Select Student</option>
                      {children.map((child: any) => (
                        <option key={child.id} value={child.id}>{child.name} - {child.level}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Teacher *</label>
                    <select value={formData.teacherId} onChange={(e) => setFormData({...formData, teacherId: e.target.value})} className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                      <option value="">Select Teacher</option>
                      {teachers.map((teacher: any) => (
                        <option key={teacher.id} value={teacher.id}>{teacher.name} - {teacher.subject || teacher.specialization}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Course (Optional)</label>
                    <select value={formData.courseId} onChange={(e) => setFormData({...formData, courseId: e.target.value})} className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">No Course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>{course.title} - {course.level}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Date *</label>
                    <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Time *</label>
                    <input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Duration (min) *</label>
                    <input type="number" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" min="15" step="15" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Zoom Link</label>
                    <input type="url" value={formData.zoomLink} onChange={(e) => setFormData({...formData, zoomLink: e.target.value})} className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://zoom.us/j/..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Notes</label>
                    <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Add any notes..." />
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t">
                  <button type="button" onClick={() => { setShowAddClassModal(false); resetForm(); }} className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors font-bold">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-bold shadow-lg">
                    Add Class
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