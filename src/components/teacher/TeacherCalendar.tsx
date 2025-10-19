import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, X, Video, BookOpen, User, MapPin, Home, BarChart } from 'lucide-react';

// ✅ استيراد البيانات الحقيقية من Context
import { useAuth } from '../../contexts/AuthContext'; //
import { useData, Class, Child } from '../../contexts/DataContext'; //

// ✅ تعريف نوع مُحسن للحصص ليشمل اسم الطالب
interface EnhancedClass extends Class {
  studentName: string;
}

export default function TeacherCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedClass, setSelectedClass] = useState<EnhancedClass | null>(null);

  // 1. جلب البيانات الأساسية من Contexts
  const { user, loading: authLoading } = useAuth(); //
  const { 
    loading: dataLoading, 
    getClassesByTeacher, 
    getStudentsByTeacher 
  } = useData(); //

  // 2. جلب وتجهيز بيانات الطلاب والحصص للمُعلم الحالي
  const rawTeacherClasses = useMemo(() => {
    // جلب حصص المعلم
    return user && user.role === 'teacher' ? getClassesByTeacher(user.id) : [];
  }, [user, getClassesByTeacher]);

  const teacherStudents = useMemo(() => {
    // جلب طلاب المعلم
    return user && user.role === 'teacher' ? getStudentsByTeacher(user.id) : [];
  }, [user, getStudentsByTeacher]);

  // 3. دمج بيانات الحصص مع أسماء الطلاب
  const classes: EnhancedClass[] = useMemo(() => {
    return rawTeacherClasses.map(cls => {
      const student = teacherStudents.find(s => s.id === cls.studentId);
      return {
        ...cls,
        studentName: student?.name || 'Unknown Student',
      } as EnhancedClass;
    });
  }, [rawTeacherClasses, teacherStudents]);

  // ============================================
  // Helper Functions
  // ============================================

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    // Note: getDay() returns 0 for Sunday, 6 for Saturday
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getClassesForDate = (date: Date): EnhancedClass[] => {
    const dateStr = date.toISOString().split('T')[0];
    return classes.filter(cls => cls.date === dateStr);
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // ============================================
  // View Rendering Functions
  // ============================================

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for first week
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div 
          key={`empty-${i}`} 
          // ✅ تحسين الاستجابة: استخدام min-h-24 بدلاً من قيمة ثابتة لبعض الشاشات
          className="min-h-[120px] bg-gray-50 border border-gray-200"
        ></div>
      );
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayClasses = getClassesForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

      days.push(
        <div
          key={day}
          className={`min-h-[120px] border border-gray-200 p-2 ${
            isToday ? 'bg-blue-50 border-blue-400' : 'bg-white'
          } ${isPast ? 'opacity-60' : ''}`}
        >
          <div className={`font-semibold text-sm mb-2 ${
            isToday ? 'text-blue-600' : 'text-gray-900'
          }`}>
            {day}
            {isToday && (
              <span className="ml-2 bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs hidden sm:inline">
                Today
              </span>
            )}
          </div>
          
          <div className="space-y-1">
            {/* عرض أول 3 حصص فقط */}
            {dayClasses.slice(0, 3).map((classItem, index) => {
              const colors = [
                'bg-blue-100 text-blue-800 border-blue-300',
                'bg-green-100 text-green-800 border-green-300',
                'bg-purple-100 text-purple-800 border-purple-300',
                'bg-orange-100 text-orange-800 border-orange-300'
              ];
              const color = colors[index % colors.length];
              
              return (
                <div
                  key={classItem.id}
                  onClick={() => setSelectedClass(classItem)}
                  className={`text-xs p-1 sm:p-2 rounded border cursor-pointer hover:shadow-md transition-all ${color} ${
                    classItem.status === 'completed' ? 'opacity-70' : ''
                  }`}
                >
                  {/* truncate ensures the text fits on small screens */}
                  <div className="font-semibold truncate">{classItem.studentName}</div>
                  <div className="flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{classItem.time}</span>
                    {classItem.status === 'completed' && (
                      <span className="ml-auto text-sm">✓</span>
                    )}
                  </div>
                </div>
              );
            })}
            
            {dayClasses.length > 3 && (
              <div className="text-xs text-gray-600 font-medium pl-2">
                +{dayClasses.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const getWeekDays = () => {
    const start = new Date(currentDate);
    // Note: 0 for Sunday, 6 for Saturday. Adjusting to display current week.
    // Set to the past Sunday
    start.setDate(start.getDate() - start.getDay()); 
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    // 8 AM to 9 PM (14 hours)
    const hours = Array.from({ length: 14 }, (_, i) => i + 8); 

    return (
      // ✅ الاستجابة: تمكين التمرير الأفقي للجداول الزمنية الطويلة
      <div className="overflow-x-auto"> 
        <div className="min-w-[800px]"> {/* ✅ تحديد الحد الأدنى للعرض لمنع التكدس */}
          {/* Header */}
          <div className="grid grid-cols-8 border-b-2 border-gray-300 bg-gray-50">
            <div className="p-3 text-sm font-semibold text-gray-600">Time</div>
            {weekDays.map((day, index) => {
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div
                  key={index}
                  className={`p-3 text-center border-l ${
                    isToday ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                >
                  <div className={`text-sm font-semibold ${
                    isToday ? 'text-blue-600' : 'text-gray-900'
                  } hidden sm:block`}
                  > {/* إخفاء اسم اليوم في الشاشات الصغيرة جداً */}
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-bold ${
                    isToday ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time slots */}
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-200">
              <div className="p-3 text-sm text-gray-600 font-medium bg-gray-50">
                {hour.toString().padStart(2, '0')}:00
              </div>
              {weekDays.map((day, dayIndex) => {
                const dayClasses = getClassesForDate(day).filter(cls => {
                  const classHour = parseInt(cls.time.split(':')[0]);
                  return classHour === hour;
                });
                
                const isToday = day.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={dayIndex}
                    className={`p-2 border-l min-h-[60px] ${
                      isToday ? 'bg-blue-50/30' : 'bg-white'
                    }`}
                  >
                    {dayClasses.map(classItem => (
                      <div
                        key={classItem.id}
                        onClick={() => setSelectedClass(classItem)}
                        className={`text-xs p-2 rounded border cursor-pointer hover:shadow-md transition-all mb-1 ${
                          classItem.status === 'completed'
                            ? 'bg-gray-100 text-gray-700 border-gray-300 opacity-70'
                            : 'bg-blue-100 text-blue-800 border-blue-300'
                        }`}
                      >
                        <div className="font-semibold truncate">{classItem.studentName}</div>
                        <div className="flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{classItem.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const totalClasses = classes.length;
  const completedClasses = classes.filter(c => c.status === 'completed').length;
  const upcomingClasses = classes.filter(c => c.status === 'scheduled').length;

  // ============================================
  // Loading State
  // ============================================

  if (authLoading || dataLoading || !user) {
    return (
        <div className="flex items-center justify-center min-h-[50vh] bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
            <div className="text-center p-8 bg-white rounded-xl shadow-xl">
                <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-700 font-medium">Loading Calendar Data...</p>
            </div>
        </div>
    );
  }

  // ============================================
  // Main Render
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Teaching Calendar</h1>
          <p className="text-gray-600">View your schedule and upcoming classes</p>
        </div>

        {/* Stats */}
        {/* ✅ الاستجابة: استخدام الأعمدة الديناميكية (grid-cols-1/md:grid-cols-3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">{totalClasses}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-green-600">{upcomingClasses}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-purple-600">{completedClasses}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            {/* ✅ الاستجابة: تحويل العناصر إلى عمود واحد في الشاشات الصغيرة ثم صف في الشاشات الأكبر */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              
              {/* Month Navigation */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-bold text-gray-900 min-w-[150px] text-center">
                  {getMonthName(currentDate)}
                </h2>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  onClick={goToToday}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Today
                </button>
              </div>

              {/* View Mode Switch */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    viewMode === 'month'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    viewMode === 'week'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Week
                </button>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                <span>Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span>Today</span>
              </div>
              <div className="ml-auto text-gray-600 hidden sm:block">
                📖 Click on any class to view details
              </div>
            </div>
          </div>

          {/* Calendar View */}
          <div className="p-1 sm:p-4"> {/* تقليل الحشو على الشاشات الصغيرة */}
            {viewMode === 'month' ? (
              <>
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-1 sm:p-3 text-center font-semibold text-gray-700 bg-gray-100 rounded-t-lg text-xs sm:text-sm">
                      {day}
                    </div>
                  ))}
                </div>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {renderMonthView()}
                </div>
              </>
            ) : (
              renderWeekView()
            )}
          </div>
        </div>

        {/* Class Details Modal */}
        {selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
                <h3 className="text-xl font-bold text-white">Class Details</h3>
                <button
                  onClick={() => setSelectedClass(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Student Info */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-3 rounded-full">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Student</p>
                      <p className="text-lg font-bold text-gray-900">{selectedClass.studentName}</p>
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Subject</p>
                    <p className="font-semibold text-gray-900">{selectedClass.subject}</p>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarIcon className="h-4 w-4 text-green-600" />
                      <p className="text-sm text-gray-600">Date</p>
                    </div>
                    <p className="font-semibold text-gray-900">{selectedClass.date}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <p className="text-sm text-gray-600">Time</p>
                    </div>
                    <p className="font-semibold text-gray-900">{selectedClass.time}</p>
                  </div>
                </div>

                {/* Duration */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-gray-600">Duration</p>
                  </div>
                  <p className="font-semibold text-gray-900">{selectedClass.duration} minutes</p>
                </div>

                {/* Status */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedClass.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedClass.status === 'completed' ? '✓ Completed' : '◷ Scheduled'}
                  </span>
                </div>

                {/* Notes */}
                {selectedClass.notes && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-600 mb-1">Notes</p>
                    <p className="text-gray-900">{selectedClass.notes}</p>
                  </div>
                )}

                {/* Join Button */}
                {selectedClass.status === 'scheduled' && (
                  <button
                    onClick={() => window.open(selectedClass.zoomLink, '_blank')}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Video className="h-5 w-5" />
                    Join Class
                  </button>
                )}

                <button
                  onClick={() => setSelectedClass(null)}
                  className="w-full bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}