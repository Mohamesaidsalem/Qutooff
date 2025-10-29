import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Calendar, Award, Video, Clock, Eye, X, Loader,
  Star, XCircle, RotateCcw, CheckCircle, Filter, Search,
  FileText, TrendingUp, Target, BookmarkCheck, Send, Coffee,
  AlertCircle, ChevronDown, ChevronUp, Download, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { ref, update, onValue, off } from 'firebase/database';
import { database } from '../../firebase/config';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { children, teachers, loading: dataLoading } = useData();

  const [currentStudent, setCurrentStudent] = useState<any>(null);
  const [studentClasses, setStudentClasses] = useState<any[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<any[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [studentCourses, setStudentCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [filterPeriod, setFilterPeriod] = useState('today');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  
  // Modal states
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [actionReason, setActionReason] = useState('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  // ✅ Find student - Enhanced logic with debugging
  useEffect(() => {
    if (user && children.length > 0) {
      console.log('🔍 Searching for student...', { 
        userId: user.id, 
        userEmail: user.email, 
        userName: user.name,
        userStudentId: user.studentId,
        childrenCount: children.length 
      });
      
      let student = null;
      
      // Method 1: By studentId in user object
      if (user.studentId) {
        student = children.find(child => child.id === user.studentId);
        if (student) console.log('✅ Found by studentId:', student.name);
      }
      
      // Method 2: By user.id
      if (!student && user.id) {
        student = children.find(child => child.id === user.id);
        if (student) console.log('✅ Found by user.id:', student.name);
      }
      
      // Method 3: By email (check both main email and studentAccount email)
      if (!student && user.email) {
        const userEmailLower = user.email.toLowerCase();
        student = children.find(child => {
          const childEmail = child.email?.toLowerCase();
          const accountEmail = child.studentAccount?.email?.toLowerCase();
          return childEmail === userEmailLower || accountEmail === userEmailLower;
        });
        if (student) console.log('✅ Found by email:', student.name);
      }
      
      // Method 4: By name (exact match)
      if (!student && user.name) {
        const userNameLower = user.name.toLowerCase().trim();
        student = children.find(child => 
          child.name?.toLowerCase().trim() === userNameLower
        );
        if (student) console.log('✅ Found by name:', student.name);
      }
      
      // Method 5: Check if user has studentAccount with matching userId
      if (!student) {
        student = children.find(child => 
          child.studentAccount?.userId === user.id
        );
        if (student) console.log('✅ Found by studentAccount.userId:', student.name);
      }
      
      if (student) {
        setCurrentStudent(student);
        console.log('✅ Student profile loaded successfully:', {
          id: student.id,
          name: student.name,
          email: student.email
        });
      } else {
        console.error('❌ Student not found with any method', { 
          user, 
          availableChildren: children.map(c => ({ id: c.id, name: c.name, email: c.email }))
        });
        // Don't set loading to false yet, give it more time
        setTimeout(() => {
          if (!currentStudent) {
            console.error('❌ Still no student found after timeout');
          }
        }, 2000);
      }
    }
  }, [user, children]);

  // ✅ Load classes from daily_classes (Real-time listener)
  useEffect(() => {
    if (!currentStudent) return;

    const classesRef = ref(database, 'daily_classes');
    
    const unsubscribe = onValue(classesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const allClasses = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        
        // Filter classes for this student
        const myClasses = allClasses.filter(cls => 
          cls.studentId === currentStudent.id && cls.isActive !== false
        );
        
        console.log('📚 Loaded classes:', myClasses.length);
        setStudentClasses(myClasses);
        
        // Calculate courses
        const uniqueCourses = Array.from(
          new Set(myClasses.filter(cls => cls.courseId).map(cls => cls.courseId))
        ).map(courseId => {
          const classesForCourse = myClasses.filter(cls => cls.courseId === courseId);
          const firstClass = classesForCourse[0];
          
          return {
            id: courseId,
            title: firstClass?.courseName || 'Unknown Course',
            totalClasses: classesForCourse.length,
            completedClasses: classesForCourse.filter(cls => 
              cls.status === 'taken' || cls.status === 'completed'
            ).length,
            scheduledClasses: classesForCourse.filter(cls => cls.status === 'scheduled').length,
            runningClasses: classesForCourse.filter(cls => cls.status === 'running').length,
            teacher: teachers.find(t => t.id === firstClass?.teacherId),
            progress: classesForCourse.length > 0 
              ? Math.round(
                  (classesForCourse.filter(cls => 
                    cls.status === 'taken' || cls.status === 'completed'
                  ).length / classesForCourse.length) * 100
                )
              : 0
          };
        });
        
        setStudentCourses(uniqueCourses);
        
        // Get upcoming classes
        const now = new Date();
        const upcoming = myClasses
          .filter(cls => {
            const dateStr = cls.appointmentDate || cls.date || '';
            const timeStr = cls.appointmentTime || cls.time || '';
            
            if (!dateStr || !timeStr) return false;
            
            try {
              const classDateTime = new Date(`${dateStr}T${timeStr}`);
              return classDateTime >= now && (
                cls.status === 'scheduled' || 
                cls.status === 'running'
              );
            } catch {
              return false;
            }
          })
          .sort((a, b) => {
            const dateA = new Date(`${a.appointmentDate || a.date}T${a.appointmentTime || a.time}`);
            const dateB = new Date(`${b.appointmentDate || b.date}T${b.appointmentTime || b.time}`);
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 5);
        
        setUpcomingClasses(upcoming);
      } else {
        setStudentClasses([]);
        setStudentCourses([]);
        setUpcomingClasses([]);
      }
    });

    return () => off(classesRef, 'value', unsubscribe);
  }, [currentStudent, teachers]);

  // ✅ Apply filters
  useEffect(() => {
    let filtered = [...studentClasses];
    
    // Period filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (filterPeriod === 'today') {
      filtered = filtered.filter(cls => {
        const classDate = new Date(cls.appointmentDate || cls.date);
        return classDate.toDateString() === today.toDateString();
      });
    } else if (filterPeriod === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      filtered = filtered.filter(cls => {
        const classDate = new Date(cls.appointmentDate || cls.date);
        return classDate >= weekStart && classDate <= weekEnd;
      });
    } else if (filterPeriod === 'month') {
      filtered = filtered.filter(cls => {
        const classDate = new Date(cls.appointmentDate || cls.date);
        return classDate.getMonth() === now.getMonth() && 
               classDate.getFullYear() === now.getFullYear();
      });
    } else if (filterPeriod === 'year') {
      filtered = filtered.filter(cls => {
        const classDate = new Date(cls.appointmentDate || cls.date);
        return classDate.getFullYear() === now.getFullYear();
      });
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(cls => cls.status === filterStatus);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(cls => {
        const teacher = teachers.find(t => t.id === cls.teacherId);
        return (
          cls.courseName?.toLowerCase().includes(query) ||
          teacher?.name?.toLowerCase().includes(query) ||
          cls.notes?.toLowerCase().includes(query) ||
          cls.status?.toLowerCase().includes(query)
        );
      });
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.appointmentDate || a.date}T${a.appointmentTime || a.time}`);
      const dateB = new Date(`${b.appointmentDate || b.date}T${b.appointmentTime || b.time}`);
      return dateB.getTime() - dateA.getTime();
    });
    
    setFilteredClasses(filtered);
  }, [studentClasses, filterPeriod, filterStatus, searchQuery, teachers]);

  const handleJoinClass = async (classItem: any) => {
    try {
      setLoading(true);
      
      const currentTime = new Date().toISOString();
      const classRef = ref(database, `daily_classes/${classItem.id}`);
      
      await update(classRef, {
        studentTime: currentTime,
        status: 'running',
        updatedAt: currentTime,
        history: [
          ...(classItem.history || []),
          `Student ${currentStudent.name} joined at ${new Date().toLocaleString()}`
        ]
      });
      
      if (classItem.zoomLink) {
        window.open(classItem.zoomLink, '_blank');
      } else {
        alert('⚠️ No Zoom link available for this class');
      }
      
      alert('✅ Successfully joined the class!');
    } catch (error) {
      console.error('Error joining class:', error);
      alert('❌ Failed to join class');
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedClass || !actionReason.trim()) {
      alert('Please provide a reason');
      return;
    }

    try {
      setLoading(true);
      
      const classRef = ref(database, `daily_classes/${selectedClass.id}`);
      await update(classRef, {
        status: 'rescheduled',
        rescheduleReason: actionReason,
        rescheduledBy: 'student',
        updatedAt: new Date().toISOString(),
        history: [
          ...(selectedClass.history || []),
          `Rescheduled by student: ${actionReason} at ${new Date().toLocaleString()}`
        ]
      });
      
      alert('✅ Class rescheduled successfully!');
      setShowRescheduleModal(false);
      setActionReason('');
      setSelectedClass(null);
    } catch (error) {
      console.error('Error rescheduling:', error);
      alert('❌ Failed to reschedule');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedClass || !actionReason.trim()) {
      alert('Please provide a reason');
      return;
    }

    try {
      setLoading(true);
      
      const classRef = ref(database, `daily_classes/${selectedClass.id}`);
      await update(classRef, {
        status: 'declined',
        cancelReason: actionReason,
        cancelledBy: 'student',
        updatedAt: new Date().toISOString(),
        history: [
          ...(selectedClass.history || []),
          `Cancelled by student: ${actionReason} at ${new Date().toLocaleString()}`
        ]
      });
      
      alert('✅ Class cancelled successfully!');
      setShowCancelModal(false);
      setActionReason('');
      setSelectedClass(null);
    } catch (error) {
      console.error('Error cancelling:', error);
      alert('❌ Failed to cancel');
    } finally {
      setLoading(false);
    }
  };

  const handleRateTeacher = async () => {
    if (!selectedClass || rating === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      setLoading(true);
      
      const classRef = ref(database, `daily_classes/${selectedClass.id}`);
      await update(classRef, {
        rating,
        feedback,
        ratedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [
          ...(selectedClass.history || []),
          `Rated ${rating}/5 by student at ${new Date().toLocaleString()}`
        ]
      });
      
      alert('✅ Thank you for your feedback!');
      setShowRatingModal(false);
      setRating(0);
      setFeedback('');
      setSelectedClass(null);
    } catch (error) {
      console.error('Error rating:', error);
      alert('❌ Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown Date';
    
    try {
      const date = new Date(dateString);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (date.toDateString() === today.toDateString()) return 'Today';
      if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'running': return <Video className="h-4 w-4 text-green-600" />;
      case 'taken':
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'absent': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'cancelled':
      case 'declined': return <XCircle className="h-4 w-4 text-gray-600" />;
      case 'rescheduled': return <RotateCcw className="h-4 w-4 text-orange-600" />;
      case 'leave': return <Coffee className="h-4 w-4 text-orange-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'running': return 'bg-green-100 text-green-800';
      case 'taken':
      case 'completed': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'cancelled':
      case 'declined': return 'bg-gray-100 text-gray-800';
      case 'rescheduled': return 'bg-orange-100 text-orange-800';
      case 'leave': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (dataLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentStudent) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Student Profile Not Found</h1>
          <p className="text-gray-600 mb-4">We couldn't find your student profile. Please contact support.</p>
          {user && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Logged in as:</p>
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
              <p className="text-sm text-gray-600">{user.name}</p>
              <p className="text-xs text-gray-500 mt-2">User ID: {user.id || 'N/A'}</p>
              <p className="text-xs text-gray-500">Student ID: {user.studentId || 'N/A'}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const completedClasses = studentClasses.filter(
    cls => cls.status === 'taken' || cls.status === 'completed'
  ).length;

  const stats = [
    { name: 'Current Progress', value: `${currentStudent.progress || 0}%`, icon: BookOpen, color: 'bg-blue-500' },
    { name: 'Total Classes', value: studentClasses.length.toString(), icon: Calendar, color: 'bg-green-500' },
    { name: 'Completed', value: completedClasses.toString(), icon: CheckCircle, color: 'bg-purple-500' },
    { name: 'My Courses', value: studentCourses.length.toString(), icon: BookmarkCheck, color: 'bg-orange-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Learning Journey</h1>
        <p className="mt-1 text-sm text-gray-500">Track your progress and manage your classes</p>
        <p className="mt-2 text-lg text-blue-600 font-medium">Welcome back, {currentStudent.name}! 🌟</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className={`${item.color} p-3 rounded-xl`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <dt className="text-sm font-medium text-gray-500 mb-1">{item.name}</dt>
              <dd className="text-2xl font-bold text-gray-900">{item.value}</dd>
            </div>
          </div>
        ))}
      </div>

      {/* My Courses Section */}
      {studentCourses.length > 0 && (
        <div className="mb-8 bg-white shadow-lg rounded-xl border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BookmarkCheck className="h-5 w-5 text-purple-600" />
              My Courses ({studentCourses.length})
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentCourses.map((course) => (
                <div key={course.id} className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-purple-600 p-3 rounded-xl">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-purple-900 line-clamp-1">{course.title}</h3>
                      <p className="text-xs text-purple-600">
                        Teacher: {course.teacher?.name || 'Not assigned'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-700">Total Classes:</span>
                      <span className="font-bold text-purple-900">{course.totalClasses}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Completed:</span>
                      <span className="font-bold text-green-600">{course.completedClasses}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Scheduled:</span>
                      <span className="font-bold text-blue-600">{course.scheduledClasses}</span>
                    </div>
                    {course.runningClasses > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-orange-700">Running Now:</span>
                        <span className="font-bold text-orange-600">{course.runningClasses}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="w-full bg-purple-200 rounded-full h-2.5">
                      <div
                        className="bg-purple-600 h-2.5 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-purple-600 text-center mt-1 font-semibold">
                      {course.progress}% Complete
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Classes */}
      {upcomingClasses.length > 0 && (
        <div className="mb-8 bg-white shadow-lg rounded-xl border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Upcoming Classes ({upcomingClasses.length})
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingClasses.map((classItem) => {
                const classTeacher = teachers.find(t => t.id === classItem.teacherId);
                const displayDate = classItem.appointmentDate || classItem.date || '';
                const displayTime = classItem.appointmentTime || classItem.time || '';
                
                return (
                  <div key={classItem.id} className="p-5 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all bg-gradient-to-r from-white to-blue-50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {classItem.status === 'running' && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold animate-pulse">
                              • LIVE NOW
                            </span>
                          )}
                          <h3 className="font-bold text-gray-900 text-lg">
                            {classItem.courseName || 'Regular Class'}
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold">{formatDate(displayDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold">{displayTime}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Award className="h-4 w-4 text-purple-600" />
                            <span>{classTeacher?.name || 'Teacher'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4 text-orange-600" />
                            <span>{classItem.duration} minutes</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 min-w-[160px]">
                        <button
                          onClick={() => handleJoinClass(classItem)}
                          disabled={loading}
                          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                        >
                          <Video className="h-4 w-4" />
                          {classItem.status === 'running' ? 'Join Now' : 'Join Class'}
                        </button>
                        
                        {classItem.status === 'scheduled' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedClass(classItem);
                                setShowRescheduleModal(true);
                              }}
                              className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-200 transition-all flex items-center justify-center gap-2"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Reschedule
                            </button>
                            <button
                              onClick={() => {
                                setSelectedClass(classItem);
                                setShowCancelModal(true);
                              }}
                              className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-200 transition-all flex items-center justify-center gap-2"
                            >
                              <XCircle className="h-4 w-4" />
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ✅ NEW: Classes Table with Filters */}
      <div className="bg-white shadow-lg rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                All My Classes ({filteredClasses.length})
              </h2>
              <p className="text-sm text-gray-600 mt-1">Complete history and management</p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Period Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                <select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="running">Running</option>
                  <option value="taken">Completed</option>
                  <option value="absent">Absent</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="declined">Cancelled</option>
                </select>
              </div>

              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by course, teacher, or notes..."
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Scheduled: <strong>{studentClasses.filter(c => c.status === 'scheduled').length}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Completed: <strong>{completedClasses}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">Rescheduled: <strong>{studentClasses.filter(c => c.status === 'rescheduled').length}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Absent: <strong>{studentClasses.filter(c => c.status === 'absent').length}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredClasses.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No classes found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Teacher</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClasses.map((classItem) => {
                  const classTeacher = teachers.find(t => t.id === classItem.teacherId);
                  const displayDate = classItem.appointmentDate || classItem.date || '';
                  const displayTime = classItem.appointmentTime || classItem.time || '';
                  
                  return (
                    <tr key={classItem.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{formatDate(displayDate)}</div>
                            <div className="text-xs text-gray-500">{displayTime}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-gray-900">
                          {classItem.courseName || 'Regular Class'}
                        </div>
                        {classItem.notes && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-1">{classItem.notes}</div>
                        )}
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-purple-600" />
                          <span className="text-sm text-gray-900">{classTeacher?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{classItem.duration || 60} min</span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(classItem.status)}
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(classItem.status)}`}>
                            {classItem.status}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3 whitespace-nowrap">
                        {classItem.rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-semibold text-gray-900">{classItem.rating}/5</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Not rated</span>
                        )}
                      </td>
                      
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {(classItem.status === 'scheduled' || classItem.status === 'running') && (
                            <button
                              onClick={() => handleJoinClass(classItem)}
                              disabled={loading}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1"
                            >
                              <Video className="h-3 w-3" />
                              Join
                            </button>
                          )}
                          
                          {classItem.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedClass(classItem);
                                  setShowRescheduleModal(true);
                                }}
                                className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-200 transition-all flex items-center gap-1"
                              >
                                <RotateCcw className="h-3 w-3" />
                                Reschedule
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedClass(classItem);
                                  setShowCancelModal(true);
                                }}
                                className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200 transition-all flex items-center gap-1"
                              >
                                <XCircle className="h-3 w-3" />
                                Cancel
                              </button>
                            </>
                          )}
                          
                          {(classItem.status === 'taken' || classItem.status === 'completed') && !classItem.rating && (
                            <button
                              onClick={() => {
                                setSelectedClass(classItem);
                                setShowRatingModal(true);
                              }}
                              className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-200 transition-all flex items-center gap-1"
                            >
                              <Star className="h-3 w-3" />
                              Rate
                            </button>
                          )}
                          
                          {(classItem.status === 'taken' || classItem.status === 'completed') && classItem.rating && (
                            <span className="text-xs text-green-600 font-semibold">✓ Rated</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Table Footer */}
        {filteredClasses.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing <strong>{filteredClasses.length}</strong> of <strong>{studentClasses.length}</strong> classes
            </div>
            <button
              onClick={() => {
                const csv = [
                  ['Date', 'Time', 'Course', 'Teacher', 'Duration', 'Status', 'Rating'].join(','),
                  ...filteredClasses.map(c => [
                    c.appointmentDate || c.date,
                    c.appointmentTime || c.time,
                    c.courseName || 'Regular',
                    teachers.find(t => t.id === c.teacherId)?.name || '',
                    c.duration,
                    c.status,
                    c.rating || ''
                  ].join(','))
                ].join('\n');
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `my-classes-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-orange-600 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Reschedule Class
              </h2>
              <button onClick={() => setShowRescheduleModal(false)} className="text-white hover:bg-white/20 p-2 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">Please provide a reason for rescheduling:</p>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={4}
                placeholder="e.g., I have an emergency, Need to change time, etc."
                required
              />
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReschedule}
                  disabled={loading || !actionReason.trim()}
                  className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-red-600 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Cancel Class
              </h2>
              <button onClick={() => setShowCancelModal(false)} className="text-white hover:bg-white/20 p-2 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">⚠️ This action cannot be undone. Please provide a valid reason.</p>
              </div>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={4}
                placeholder="e.g., Unable to attend, Personal emergency, etc."
                required
              />
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Go Back
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading || !actionReason.trim()}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5" />}
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Star className="h-5 w-5" />
                Rate Your Class
              </h2>
              <button onClick={() => setShowRatingModal(false)} className="text-white hover:bg-white/20 p-2 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">How was your experience?</p>
              
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              
              {rating > 0 && (
                <p className="text-center text-sm font-semibold text-gray-700 mb-4">
                  {rating === 5 && '⭐ Excellent!'}
                  {rating === 4 && '😊 Very Good!'}
                  {rating === 3 && '👍 Good'}
                  {rating === 2 && '😐 Fair'}
                  {rating === 1 && '😞 Needs Improvement'}
                </p>
              )}
              
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                rows={4}
                placeholder="Share your feedback (optional)"
              />
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Skip
                </button>
                <button
                  onClick={handleRateTeacher}
                  disabled={loading || rating === 0}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}