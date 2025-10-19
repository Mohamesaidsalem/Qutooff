import React, { useState, useMemo, useEffect } from 'react';
import { Users, Calendar, BookOpen, Clock, Video, DollarSign, Award, Star, CheckCircle, XCircle, AlertCircle, ChevronRight, MessageSquare, TrendingUp, X, BarChart, Home } from 'lucide-react';
// 💡 استيراد الهوكات الجديدة
import { useAuth } from '../../contexts/AuthContext'; 
import { useData, Class, Child, Teacher } from '../../contexts/DataContext';

// ✅ استيراد المكونات الجديدة
import TeacherStudents from '../teacher/TeacherStudents'; 
import TeacherCalendar from '../teacher/TeacherCalendar'; // تم إضافته
import TeacherReportsAnalytics from '../teacher/TeacherReportsAnalytics'; // تم إضافته

// تعريف أنواع البيانات من DataContext لضمان التوافق
type ClassItem = Class & { studentName?: string, teacherName?: string };
type StudentItem = Child;

// تعريف أنواع الألسنة
type ActiveTab = 'dashboard' | 'students' | 'calendar' | 'reports';

export default function TeacherDashboard() {
  // 1. جلب بيانات المستخدم والحالة من AuthContext
  const { user, loading: authLoading } = useAuth();
  // 2. جلب البيانات والدوال من DataContext
  const { 
    loading: dataLoading, 
    getClassesByTeacher, 
    getStudentsByTeacher,
    updateClass,
    teachers // للاستفادة من بيانات المعلمين لتحديد اسم المعلم
  } = useData();

  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  // ✅ الحالة الجديدة للتحكم في الألسنة مع إضافة Calendar و Reports
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
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

  // 3. منطق جلب وتصفية البيانات الحقيقية
  const allTeacherClasses = useMemo(() => {
    // يجب التأكد من وجود المعلم قبل جلب البيانات
    return user && user.role === 'teacher' ? getClassesByTeacher(user.id) : [];
  }, [user, getClassesByTeacher]); // تعتمد على user و getClassesByTeacher

  const teacherStudents = useMemo(() => {
    return user && user.role === 'teacher' ? getStudentsByTeacher(user.id) : [];
  }, [user, getStudentsByTeacher]);

  const upcomingClasses = useMemo(() => {
    const now = new Date();
    // تصفية الحصص القادمة والـ scheduled فقط
    return allTeacherClasses
      .filter(cls => {
        const classDateTime = new Date(`${cls.date}T${cls.time}`);
        return classDateTime >= now && cls.status === 'scheduled';
      })
      .map(cls => {
        // إضافة اسم الطالب وتفاصيل المعلم من البيانات المجلوبة
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
  const totalEarnings = completedClasses * 15; // افتراض $15 للحصة

  // 4. دالة إنهاء وتقييم الحصة (End & Evaluate)
  const handleCompleteClass = (classItem: ClassItem | null) => {
    setSelectedClass(classItem);
    setShowEvaluationModal(true);
  };

  const submitEvaluation = async () => {
    if (!selectedClass || !user) {
      console.warn('Submit evaluation called with no selectedClass or user');
      setShowEvaluationModal(false);
      return;
    }
    
    try {
      // 1. تحديث حالة الحصة في قاعدة البيانات إلى 'completed'
      await updateClass(selectedClass.id, {
        status: 'completed',
        // مثال لإضافة ملخص التقييم في Notes:
        notes: `Evaluation Summary: Performance=${evaluation.performance}/5, Tajweed=${evaluation.tajweed}/5, Attendance=${evaluation.attendance}. ${evaluation.notes}`
      });
      
      // 2. تحديث تقدم الطالب بعد التقييم (مثال توضيحي)
      const student = teacherStudents.find(s => s.id === selectedClass.studentId);
      if (student) {
        // هنا يمكن حساب قيمة التقدم الجديدة بناءً على التقييم
        const newProgress = Math.min(100, student.progress + Math.floor(evaluation.performance * 2));
        // يمكنك استدعاء دالة تحديث الطالب هنا إذا كانت لديك (لم يتم استيرادها الآن)
        // await updateChild(student.id, { progress: newProgress }); 
      }

      alert('Evaluation saved and class marked as completed! ✅ Dashboard will update automatically.');
      
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      alert('❌ Failed to save evaluation. Check console for details.');
    } finally {
      // 3. إغلاق المودال وتصفير الحالة بغض النظر عن النتيجة
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
    }
  };

  const stats = [
    { name: 'My Students', value: teacherStudents.length.toString(), icon: Users, color: 'bg-blue-500' },
    { name: 'Classes This Month', value: allTeacherClasses.filter(cls => new Date(cls.date).getMonth() === new Date().getMonth()).length.toString(), icon: Calendar, color: 'bg-green-500' },
    { name: 'Completed Classes', value: completedClasses.toString(), icon: CheckCircle, color: 'bg-purple-500' },
    { name: 'Earnings', value: `$${totalEarnings}`, icon: DollarSign, color: 'bg-emerald-500' },
  ];

  // 5. شاشة التحميل
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

  // 6. استرجاع بيانات المعلم لعرض اسمه الحقيقي
  const teacherDetails = teachers.find(t => t.id === user.id) || { name: user.name };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'calendar', name: 'Calendar', icon: Calendar }, // تم إضافته
    { id: 'students', name: 'Students', icon: Users },
    { id: 'reports', name: 'Reports', icon: BarChart }, // تم إضافته
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Teacher Dashboard</h1>
          <p className="text-gray-600">Welcome, {teacherDetails.name}! 👨‍🏫</p>
        </div>
        </div>
        {/* ✅ Tab Navigation */}
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
            >
                <tab.icon className="h-5 w-5" />
              {tab.name}
            </button>
          ))}
        </div>
        {/* End Tab Navigation */}

        {/* ========================================================= */}
        {/* ============= Tab Content Rendering ===================== */}
        {/* ========================================================= */}


        {/* ✅ Dashboard Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

            {/* Today's Classes Alert */}
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
                        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold">
                          {cls.time}
                        </span>
                      </div>
                      <button
                        onClick={() => window.open(cls.zoomLink, '_blank')}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2"
                      >
                        <Video className="h-4 w-4" />
                        Start Class
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upcoming Classes */}
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
                              {isToday && (
                                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                                  Today
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
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

                            <div className="flex gap-2">
                              <button
                                onClick={() => window.open(cls.zoomLink, '_blank')}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2"
                              >
                                <Video className="h-4 w-4" />
                                Start Class
                              </button>
                              <button
                                onClick={() => handleCompleteClass(cls)}
                                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2.5 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2"
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

              {/* Students List */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600">
                  <h2 className="text-xl font-bold text-white">My Students ({teacherStudents.length})</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {teacherStudents.map((student) => (
                      <div 
                        key={student.id} 
                        // ✅ جعل العنصر قابلاً للنقر للانتقال لتبويب الطلاب
                        onClick={() => setActiveTab('students')}
                        className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
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
                        
                        {/* Progress Bar */}
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
                          <span>Last Class: N/A</span> {/* هذا يتطلب منطق إضافي */}
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* ✅ زر "View All Students" */}
                  <button  
                    onClick={() => setActiveTab('students')}  
                    className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >  
                    View All Students →
                  </button>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
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
        
        {/* ========================================================= */}


        {/* ✅ Students Tab Content */}
        {activeTab === 'students' && (
          <TeacherStudents />
        )}
        
        {/* ✅ Calendar Tab Content (جديد) */}
        {activeTab === 'calendar' && (
            <TeacherCalendar />
        )}

        {/* ✅ Reports Tab Content (جديد) */}
        {activeTab === 'reports' && (
            <TeacherReportsAnalytics />
        )}
        
        {/* ========================================================= */}


      {/* Evaluation Modal */}
      {showEvaluationModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Class Evaluation</h2>
              <button
                onClick={() => setShowEvaluationModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Class Info */}
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
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>📅 {selectedClass.date}</span>
                  <span>⏰ {selectedClass.time}</span>
                  <span>⏱️ {selectedClass.duration} mins</span>
                </div>
              </div>

              {/* Evaluation Form */}
              <div className="space-y-6">
                {/* Attendance */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Attendance</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['present', 'absent', 'late'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setEvaluation({ ...evaluation, attendance: status as any })}
                        className={`p-3 rounded-xl font-medium transition-all ${
                          evaluation.attendance === status
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status === 'present' ? '✅ Present' : status === 'absent' ? '❌ Absent' : '⏰ Late'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Performance Rating */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Overall Performance</label>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setEvaluation({ ...evaluation, performance: rating })}
                        className="p-2 transition-all"
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

                {/* Memorization */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Memorization ({evaluation.memorization}/5)</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={evaluation.memorization}
                    onChange={(e) => setEvaluation({ ...evaluation, memorization: Number(e.target.value) })}
                    className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>Weak</span>
                    <span>Excellent</span>
                  </div>
                </div>

                {/* Tajweed */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Tajweed ({evaluation.tajweed}/5)</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={evaluation.tajweed}
                    onChange={(e) => setEvaluation({ ...evaluation, tajweed: Number(e.target.value) })}
                    className="w-full h-3 bg-green-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>Weak</span>
                    <span>Excellent</span>
                  </div>
                </div>

                {/* Participation */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Participation ({evaluation.participation}/5)</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={evaluation.participation}
                    onChange={(e) => setEvaluation({ ...evaluation, participation: Number(e.target.value) })}
                    className="w-full h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>Weak</span>
                    <span>Excellent</span>
                  </div>
                </div>

                {/* Homework */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Homework</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['completed', 'partial', 'not-done'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setEvaluation({ ...evaluation, homework: status as any })}
                        className={`p-3 rounded-xl font-medium transition-all ${
                          evaluation.homework === status
                            ? 'bg-green-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status === 'completed' ? '✅ Completed' : status === 'partial' ? '⚠️ Partial' : '❌ Not Done'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Notes</label>
                  <textarea
                    value={evaluation.notes}
                    onChange={(e) => setEvaluation({ ...evaluation, notes: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Write your notes here..."
                  />
                </div>

                {/* Next Lesson */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Next Lesson</label>
                  <input
                    type="text"
                    value={evaluation.nextLesson}
                    onChange={(e) => setEvaluation({ ...evaluation, nextLesson: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Example: Surah Al-Kahf from verse 1 to 10"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowEvaluationModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={submitEvaluation}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all shadow-lg"
                >
                  Save Evaluation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}