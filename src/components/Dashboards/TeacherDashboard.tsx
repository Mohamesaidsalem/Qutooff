import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { Users, Calendar, BookOpen, Clock, Video, DollarSign, Award, Star, CheckCircle, XCircle, AlertCircle, ChevronRight, MessageSquare, TrendingUp, X, BarChart, Home, Play } from 'lucide-react';

// ✅ استيراد Firebase
import { ref, update, onValue } from 'firebase/database';
import { database } from '../../firebase/config';

import { useAuth } from '../../contexts/AuthContext';
import { useData, Class, Child, Teacher } from '../../contexts/DataContext';

import TeacherStudents from '../teacher/TeacherStudents';
import TeacherCalendar from '../teacher/TeacherCalendar';
import TeacherReportsAnalytics from '../teacher/TeacherReportsAnalytics';

type ClassItem = Class & { 
  studentName?: string;
  teacherName?: string;
  history?: string[];
  onlineTime?: string;
  completedAt?: string;
};
type StudentItem = Child;
type ActiveTab = 'dashboard' | 'students' | 'calendar' | 'reports';

export default function TeacherDashboard() {
  const { user, loading: authLoading } = useAuth();
  const {
    loading: dataLoading,
    getClassesByTeacher,
    getStudentsByTeacher,
    updateClass,
    teachers
  } = useData();

  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [startingClassId, setStartingClassId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // ✅ للتحديث التلقائي
  const [evaluation, setEvaluation] = useState({
    attendance: 'present',
    performance: 5,
    memorization: 5,
    tajweed: 5,
    participation: 5,
    homework: 'completed',
    notes: '',
    nextLesson: ''
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // ✅ إضافة refreshTrigger للتحديث التلقائي
  const allTeacherClasses = useMemo(() => {
    return user && user.role === 'teacher' ? getClassesByTeacher(user.id) : [];
  }, [user, getClassesByTeacher, refreshTrigger]);

  const teacherStudents = useMemo(() => {
    return user && user.role === 'teacher' ? getStudentsByTeacher(user.id) : [];
  }, [user, getStudentsByTeacher, refreshTrigger]);

  const upcomingClasses = useMemo(() => {
    const now = new Date();
    return allTeacherClasses
      .filter(cls => {
        const classDateTime = new Date(`${cls.date}T${cls.time}`);
        return classDateTime >= now && (cls.status === 'scheduled' || cls.status === 'in-progress');
      })
      .map(cls => {
        const student = teacherStudents.find(s => s.id === cls.studentId);
        return {
          ...cls,
          studentName: student?.name || 'Unknown Student',
          notes: cls.notes || student?.nextClass || ''
        } as ClassItem;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
  }, [allTeacherClasses, teacherStudents]);

  const todayClasses = upcomingClasses.filter(cls => {
    const today = new Date().toISOString().split('T')[0];
    return cls.date === today;
  });

  const completedClasses = allTeacherClasses.filter(cls => cls.status === 'completed').length;
  const totalEarnings = completedClasses * 15;

  // ✅ Real-time listener لتحديث البيانات تلقائياً
  useEffect(() => {
    if (!user || user.role !== 'teacher') return;

    const dailyClassesRef = ref(database, 'daily_classes');
    
    const unsubscribe = onValue(dailyClassesRef, (snapshot) => {
      if (snapshot.exists()) {
        console.log('🔄 Firebase data updated - triggering UI refresh');
        setRefreshTrigger(prev => prev + 1);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  // ✅ دالة بدء الحصة - معدلة
  const handleMarkAsRunning = async (classItem: ClassItem) => {
    console.log('🟢 ========== Teacher START Class ==========');
    console.log('🟢 Class ID:', classItem.id);
    console.log('🟢 Current Status:', classItem.status);
    
    if (classItem.status === 'in-progress') {
      alert('⚠️ Class is already in progress!');
      return;
    }

    try {
      setStartingClassId(classItem.id);
      const currentTime = new Date().toISOString();
      
      console.log('🟢 Setting onlineTime:', currentTime);

      const currentHistory = Array.isArray(classItem.history) ? classItem.history : [];
      
      const updates: any = {
        status: 'in-progress',
        onlineTime: currentTime,
        updatedAt: currentTime,
        history: [
          ...currentHistory,
          `🟢 Teacher ${user?.name} went ONLINE at ${new Date().toLocaleString()}`
        ]
      };

      console.log('🟢 Updates:', updates);
      console.log('🟢 Firebase path:', `daily_classes/${classItem.id}`);

      // ✅ استخدام Firebase مباشرة
      const classRef = ref(database, `daily_classes/${classItem.id}`);
      await update(classRef, updates);

      console.log('✅✅✅ Class started successfully! ✅✅✅');
      
      // ✅ سيتحدث تلقائياً عبر onValue listener
      
      alert('✅ Class marked as in progress successfully!');
      
    } catch (error) {
      console.error('❌ Error starting class:', error);
      alert('❌ Failed to start class. Please try again.');
    } finally {
      setStartingClassId(null);
    }
  };

  const handleJoinZoom = (classItem: ClassItem) => {
    console.log('🔵 Joining Zoom for class:', classItem.id);
    if (classItem.zoomLink) {
      window.open(classItem.zoomLink, '_blank');
    } else {
      alert('⚠️ No Zoom link available for this class');
    }
  };

  const handleStartAndJoin = async (classItem: ClassItem) => {
    if (classItem.status !== 'in-progress') {
      await handleMarkAsRunning(classItem);
    }
    handleJoinZoom(classItem);
  };

  const handleCompleteClass = (classItem: ClassItem | null) => {
    console.log('🔵 Opening evaluation modal for class:', classItem?.id);
    setSelectedClass(classItem);
    setShowEvaluationModal(true);
    setErrorMessage(null);
  };

  // ✅ دالة إنهاء الحصة - معدلة
  const submitEvaluation = async () => {
    console.log('🟢 ========== Teacher END Class ==========');
    
    if (!selectedClass || !user) {
      console.warn('❌ No selectedClass or user');
      setShowEvaluationModal(false);
      return;
    }

    console.log('🟢 Selected Class ID:', selectedClass.id);
    console.log('🟢 Evaluation:', evaluation);

    try {
      setErrorMessage(null);
      const currentTime = new Date().toISOString();
      
      const currentHistory = Array.isArray(selectedClass.history) ? selectedClass.history : [];
      
      const evaluationSummary = `Evaluation: Performance=${evaluation.performance}/5, Memorization=${evaluation.memorization}/5, Tajweed=${evaluation.tajweed}/5, Participation=${evaluation.participation}/5, Attendance=${evaluation.attendance}, Homework=${evaluation.homework}. Notes: ${evaluation.notes}`;
      
      const updates: any = {
        status: 'completed',
        completedAt: currentTime,
        updatedAt: currentTime,
        notes: evaluationSummary,
        rating: evaluation.performance,
        history: [
          ...currentHistory,
          `✅ Class COMPLETED by ${user.name} at ${new Date().toLocaleString()}`,
          evaluationSummary
        ]
      };

      console.log('🟢 Completion updates:', updates);
      console.log('🟢 Firebase path:', `daily_classes/${selectedClass.id}`);

      // ✅ استخدام Firebase مباشرة
      const classRef = ref(database, `daily_classes/${selectedClass.id}`);
      await update(classRef, updates);

      console.log('✅✅✅ Evaluation saved successfully! ✅✅✅');
      
      // ✅ سيتحدث تلقائياً عبر onValue listener
      
      alert('✅ Evaluation saved and class marked as completed!');
      
      // إغلاق المودال
      setShowEvaluationModal(false);
      setSelectedClass(null);
      setEvaluation({
        attendance: 'present',
        performance: 5,
        memorization: 5,
        tajweed: 5,
        participation: 5,
        homework: 'completed',
        notes: '',
        nextLesson: ''
      });
      
    } catch (error) {
      console.error('❌ Error submitting evaluation:', error);
      setErrorMessage('❌ Failed to save evaluation. Please try again.');
    }
  };

  const stats = [
    { name: 'My Students', value: teacherStudents.length.toString(), icon: Users, color: 'bg-blue-500' },
    { name: 'Classes This Month', value: allTeacherClasses.filter(cls => new Date(cls.date).getMonth() === new Date().getMonth()).length.toString(), icon: Calendar, color: 'bg-green-500' },
    { name: 'Completed Classes', value: completedClasses.toString(), icon: CheckCircle, color: 'bg-purple-500' },
    { name: 'Earnings', value: `$${totalEarnings}`, icon: DollarSign, color: 'bg-emerald-500' },
  ];

  if (authLoading || dataLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-xl">
          <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-700 font-medium">Loading Dashboard Data...</p>
          {!user && <p className="text-sm text-red-500 mt-2">No active user session found. Please log in.</p>}
        </div>
      </div>
    );
  }

  const teacherDetails = teachers.find(t => t.id === user.id) || { name: user.name };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'students', name: 'Students', icon: Users },
    { id: 'reports', name: 'Reports', icon: BarChart },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowEvaluationModal(false);
      }
    };

    if (showEvaluationModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEvaluationModal]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Teacher Dashboard</h1>
          <p className="text-gray-600">Welcome, {teacherDetails.name}! 👨‍🏫</p>
        </div>

        <div className="mb-8 flex space-x-4 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`pb-2 px-4 text-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-b-4 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label={`Switch to ${tab.name} tab`}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              <tab.icon className="h-5 w-5" />
              {tab.name}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((item) => (
                <div key={item.name} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${item.color} p-3 rounded-xl`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{item.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>

            {todayClasses.length > 0 && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                  <h3 className="text-lg font-bold text-gray-900">Today's Classes ({todayClasses.length})</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {todayClasses.map((cls) => (
                    <div key={cls.id} className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-gray-900">{cls.studentName}</h4>
                          <p className="text-sm text-gray-600">{cls.subject}</p>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold">
                            {cls.time}
                          </span>
                          {cls.status === 'in-progress' && (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                              ● Live
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {cls.status !== 'in-progress' && cls.status !== 'completed' && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('🔴 Teacher START clicked (Today)!', cls.id);
                              handleMarkAsRunning(cls);
                            }}
                            disabled={startingClassId === cls.id}
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            aria-label="Mark class as in progress"
                          >
                            {startingClassId === cls.id ? (
                              <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                Starting...
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4" />
                                Start Class
                              </>
                            )}
                          </button>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🔴 Teacher JOIN ZOOM clicked (Today)!');
                            handleJoinZoom(cls);
                          }}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2"
                          aria-label="Join Zoom meeting"
                        >
                          <Video className="h-4 w-4" />
                          Join Zoom
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600">
                  <h2 className="text-xl font-bold text-white">Upcoming Classes</h2>
                </div>
                <div className="p-6">
                  {upcomingClasses.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No Upcoming Classes</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingClasses.slice(0, 6).map((cls) => {
                        const student = teacherStudents.find(s => s.id === cls.studentId);
                        const isToday = cls.date === new Date().toISOString().split('T')[0];
                        
                        return (
                          <div key={cls.id} className={`border-2 rounded-xl p-5 transition-all hover:shadow-lg ${isToday ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                  {cls.studentName?.charAt(0)}
                                </div>
                                <div>
                                  <h3 className="font-bold text-gray-900 text-lg">{cls.studentName}</h3>
                                  <p className="text-sm text-gray-600">{student?.level} • Progress: {student?.progress || 0}%</p>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1 items-end">
                                {isToday && (
                                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                                    Today
                                  </span>
                                )}
                                {cls.status === 'in-progress' && (
                                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                    ● Live
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
                              <div className="flex items-center gap-2 text-gray-700">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                <span>{cls.date}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <Clock className="h-4 w-4 text-green-500" />
                                <span>{cls.time} ({cls.duration} mins)</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700 col-span-2">
                                <BookOpen className="h-4 w-4 text-purple-500" />
                                <span className="font-medium">{cls.subject}</span>
                              </div>
                            </div>

                            {cls.notes && (
                              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                                <p className="text-sm text-gray-700">
                                  <MessageSquare className="h-4 w-4 inline ml-2 text-blue-600" />
                                  {cls.notes}
                                </p>
                              </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-2">
                              {cls.status !== 'in-progress' && cls.status !== 'completed' && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('🔴 Teacher START clicked (Upcoming)!', cls.id);
                                    handleMarkAsRunning(cls);
                                  }}
                                  disabled={startingClassId === cls.id}
                                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2.5 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                  aria-label="Mark class as in progress"
                                >
                                  {startingClassId === cls.id ? (
                                    <>
                                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                      </svg>
                                      Starting...
                                    </>
                                  ) : (
                                    <>
                                      <Play className="h-4 w-4" />
                                      Start Class
                                    </>
                                  )}
                                </button>
                              )}
                              
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('🔴 Teacher JOIN ZOOM clicked (Upcoming)!');
                                  handleJoinZoom(cls);
                                }}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2"
                                aria-label="Join Zoom meeting"
                              >
                                <Video className="h-4 w-4" />
                                Join Zoom
                              </button>

                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('🔴 Teacher END clicked!', cls.id);
                                  handleCompleteClass(cls);
                                }}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2.5 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all flex items-center justify-center gap-2"
                                aria-label="End and evaluate class"
                              >
                                <CheckCircle className="h-4 w-4" />
                                End & Evaluate
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600">
                  <h2 className="text-xl font-bold text-white">My Students ({teacherStudents.length})</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {teacherStudents.map((student) => (
                      <div 
                        key={student.id} 
                        onClick={() => setActiveTab('students')}
                        className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                        role="button"
                        tabIndex={0}
                        aria-label={`View details for student ${student.name}`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg">
                            {student.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{student.name}</h3>
                            <p className="text-xs text-gray-600">{student.level} • {student.age} years old</p>
                          </div>
                        </div>
                        
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span className="font-bold">{student.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                              style={{ width: `${student.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Last Class: N/A</span>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button  
                    onClick={() => setActiveTab('students')}  
                    className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    aria-label="View all students"
                  >  
                    View All Students →
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                  <Clock className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-gray-900 mb-1">{allTeacherClasses.length}</p>
                  <p className="text-sm text-gray-600">Total Classes</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
                  <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-gray-900 mb-1">{completedClasses}</p>
                  <p className="text-sm text-gray-600">Completed Classes</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
                  <Users className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-gray-900 mb-1">{teacherStudents.length}</p>
                  <p className="text-sm text-gray-600">Number of Students</p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'students' && (
          <Suspense fallback={<div className="text-center p-8">Loading Students...</div>}>
            <TeacherStudents />
          </Suspense>
        )}
        
        {activeTab === 'calendar' && (
          <Suspense fallback={<div className="text-center p-8">Loading Calendar...</div>}>
            <TeacherCalendar />
          </Suspense>
        )}

        {activeTab === 'reports' && (
          <Suspense fallback={<div className="text-center p-8">Loading Reports...</div>}>
            <TeacherReportsAnalytics />
          </Suspense>
        )}

        {showEvaluationModal && selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-auto">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-2xl font-bold text-white">Class Evaluation</h2>
                <button
                  onClick={() => setShowEvaluationModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                  aria-label="Close evaluation modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                {errorMessage && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                    {errorMessage}
                  </div>
                )}

                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                      {selectedClass.studentName?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{selectedClass.studentName}</h3>
                      <p className="text-sm text-gray-600">{selectedClass.subject}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>📅 {selectedClass.date}</span>
                    <span>⏰ {selectedClass.time}</span>
                    <span>⏱️ {selectedClass.duration} mins</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Attendance</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {['present', 'absent', 'late'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setEvaluation({ ...evaluation, attendance: status as any })}
                          className={`p-3 rounded-xl font-medium transition-all ${
                            evaluation.attendance === status
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          aria-pressed={evaluation.attendance === status}
                        >
                          {status === 'present' ? '✅ Present' : status === 'absent' ? '❌ Absent' : '⏰ Late'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Overall Performance</label>
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setEvaluation({ ...evaluation, performance: rating })}
                          className="p-2 transition-all"
                          aria-label={`Rate performance ${rating} out of 5`}
                        >
                          <Star
                            className={`h-10 w-10 ${
                              rating <= evaluation.performance
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Memorization ({evaluation.memorization}/5)</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={evaluation.memorization}
                      onChange={(e) => setEvaluation({ ...evaluation, memorization: Number(e.target.value) })}
                      className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                      aria-label="Memorization rating"
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>Weak</span>
                      <span>Excellent</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Tajweed ({evaluation.tajweed}/5)</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={evaluation.tajweed}
                      onChange={(e) => setEvaluation({ ...evaluation, tajweed: Number(e.target.value) })}
                      className="w-full h-3 bg-green-200 rounded-lg appearance-none cursor-pointer"
                      aria-label="Tajweed rating"
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>Weak</span>
                      <span>Excellent</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Participation ({evaluation.participation}/5)</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={evaluation.participation}
                      onChange={(e) => setEvaluation({ ...evaluation, participation: Number(e.target.value) })}
                      className="w-full h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                      aria-label="Participation rating"
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>Weak</span>
                      <span>Excellent</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Homework</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {['completed', 'partial', 'not-done'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setEvaluation({ ...evaluation, homework: status as any })}
                          className={`p-3 rounded-xl font-medium transition-all ${
                            evaluation.homework === status
                              ? 'bg-green-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          aria-pressed={evaluation.homework === status}
                        >
                          {status === 'completed' ? '✅ Completed' : status === 'partial' ? '⚠️ Partial' : '❌ Not Done'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Notes</label>
                    <textarea
                      value={evaluation.notes}
                      onChange={(e) => setEvaluation({ ...evaluation, notes: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      placeholder="Write your notes here..."
                      aria-label="Evaluation notes"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Next Lesson</label>
                    <input
                      type="text"
                      value={evaluation.nextLesson}
                      onChange={(e) => setEvaluation({ ...evaluation, nextLesson: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Example: Surah Al-Kahf from verse 1 to 10"
                      aria-label="Next lesson plan"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <button
                    onClick={() => setShowEvaluationModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-bold hover:bg-gray-300 transition-all"
                    aria-label="Cancel evaluation"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitEvaluation}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all shadow-lg"
                    aria-label="Save evaluation"
                  >
                    Save Evaluation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}