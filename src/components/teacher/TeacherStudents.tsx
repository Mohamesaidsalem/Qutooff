import React, { useState, useMemo } from 'react';
import { Users, Search, X, Calendar, BookOpen, Award, Clock, TrendingUp, ChevronLeft, ChevronRight, Star, CheckCircle, Video, MessageSquare } from 'lucide-react';

// ✅ استيراد الهوكات والأنواع الحقيقية
import { useAuth } from '../../contexts/AuthContext'; 
import { useData, Child, Class } from '../../contexts/DataContext';

// تعريف أنواع البيانات المُمررة للمكون
interface TeacherStudentsProps {
  // 🆕 الخاصية الجديدة: Admin يمكنه تمرير ID المعلم هنا
  teacherId?: string; 
}

// تعريف نوع مُحسن للطالب ليشمل تفاصيل الحصص والإحصائيات
interface StudentWithStats extends Child {
    phone: string;
    totalClasses: number;
    completedClasses: number;
    upcomingClasses: number;
    averageRating: number;
    lastClassDate: string; 
    joinDate: string; 
}

// تعديل تعريف المكون لقبول الخاصية الجديدة
export default function TeacherStudents({ teacherId: adminViewTeacherId }: TeacherStudentsProps) {
  // 1. جلب البيانات الأساسية من Contexts
  const { user, loading: authLoading } = useAuth();
  const { 
    loading: dataLoading, 
    getStudentsByTeacher, 
    getClassesByStudent 
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithStats | null>(null);
  const studentsPerPage = 10;

  // 🆕 منطق جلب المعرف: يفضل Admin ID، وإلا المعلم الحالي ID
  const currentTeacherId = adminViewTeacherId 
    ? adminViewTeacherId 
    : (user?.role === 'teacher' ? user.id : null);
  
  // 2. جلب وتجهيز بيانات الطلاب والحصص للمُعلم المحدد
  const allStudentsWithStats: StudentWithStats[] = useMemo(() => {
    // ⚠️ التحقق من وجود المعرف قبل محاولة جلب البيانات
    if (authLoading || dataLoading || !currentTeacherId) return [];

    const rawStudents = getStudentsByTeacher(currentTeacherId);
    
    return rawStudents.map(student => {
        const studentClasses = getClassesByStudent(student.id);
        
        // حساب إحصائيات الحصص
        const totalClasses = studentClasses.length;
        const completedClasses = studentClasses.filter(c => c.status === 'completed').length;
        const upcomingClasses = studentClasses.filter(c => c.status === 'scheduled').length;

        // حساب متوسط التقييم (نفس منطق الحساب السابق)
        const completedClassesWithRating = studentClasses.filter(c => c.status === 'completed' && c.notes && c.notes.match(/Rating=(\d\.?\d?)\/5/));
        
        const totalRating = completedClassesWithRating.reduce((sum, cls) => {
            const match = cls.notes?.match(/Rating=(\d\.?\d?)\/5/); 
            return sum + (match ? parseFloat(match[1]) : 0);
        }, 0);
        
        const averageRating = completedClassesWithRating.length > 0 
            ? parseFloat((totalRating / completedClassesWithRating.length).toFixed(1))
            : 0;

        const lastCompletedClass = studentClasses
            .filter(c => c.status === 'completed')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        const lastClassDate = lastCompletedClass 
            ? new Date(lastCompletedClass.date).toLocaleDateString()
            : 'N/A';

        return {
            ...student,
            phone: student.phone || 'N/A', // التأكد من وجود قيمة
            totalClasses,
            completedClasses,
            upcomingClasses,
            averageRating: averageRating > 0 ? averageRating : 4.0, // قيمة افتراضية للجدول
            lastClassDate,
            joinDate: student.createdAt,
        } as StudentWithStats;
    });
  }, [authLoading, dataLoading, currentTeacherId, getStudentsByTeacher, getClassesByStudent]);

  // 3. التصفية بناءً على البحث والمستوى
  const filteredStudents = useMemo(() => {
    // ... (نفس منطق التصفية السابق)
    return allStudentsWithStats.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = filterLevel === 'all' || student.level === filterLevel;
      return matchesSearch && matchesLevel;
    });
  }, [searchTerm, filterLevel, allStudentsWithStats]);

  // استخراج قائمة فريدة من المستويات
  const uniqueLevels = useMemo(() => {
    const levels = new Set(allStudentsWithStats.map(s => s.level).filter(Boolean));
    return ['all', ...Array.from(levels).sort()];
  }, [allStudentsWithStats]);

  // 4. تقسيم الصفحات
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // ... (بقية الدوال المساعدة مثل getLevelColor و handleViewStudent)
  const handleViewStudent = (student: StudentWithStats) => {
    setSelectedStudent(student);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-blue-100 text-blue-800';
      case 'Intermediate': return 'bg-green-100 text-green-800';
      case 'Advanced': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  // 5. شاشة التحميل/المحتوى الفارغ في حالة المدير
  if (authLoading || dataLoading || !currentTeacherId) {
    // إذا كان المستخدم الحالي معلماً، نعرض شاشة تحميل عادية
    if (user?.role === 'teacher') {
        return (
            <div className="flex items-center justify-center min-h-[50vh] bg-white rounded-xl shadow-lg p-8">
                <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-700 font-medium">Loading Students Data...</p>
            </div>
        );
    }
    // إذا كان مديراً ولم يحدد معلماً، يتم عرض محتوى فارغ (يجب أن يتم التعامل معه في AdminDashboard)
    return null; 
  }

  // ... (بقية المكون StudentDetailModal و العرض الرئيسي)
  // ⛔ لا يوجد تغيير في الأجزاء المتبقية

  const StudentDetailModal = () => {
    // ... (الكود الأصلي للمودال)
    if (!selectedStudent) return null;

    // جلب سجل الحصص الكامل للطالب المحدد وترتيبه
    const studentHistory = getClassesByStudent(selectedStudent.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
    const totalClasses = studentHistory.length;
    const completedClasses = selectedStudent.completedClasses;
    const averageRatingValue = selectedStudent.averageRating.toFixed(1);
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto transform transition-all scale-100">
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center rounded-t-2xl shadow-md z-10">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Users className='h-6 w-6'/>
                        {selectedStudent.name}'s Profile
                    </h2>
                    <button
                        onClick={() => setSelectedStudent(null)}
                        className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="p-6">
                    {/* Student Info and Contact - Responsive: grid-cols-1 md:grid-cols-3 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <div className="md:col-span-2 space-y-3">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedStudent.name}</h3>
                            <p className="text-gray-600 flex items-center gap-2"><Award className='h-5 w-5 text-blue-500'/> Level: <span className="font-semibold text-gray-900">{selectedStudent.level}</span></p>
                            <p className="text-gray-600 flex items-center gap-2"><Clock className='h-5 w-5 text-purple-500'/> Age: <span className="font-semibold text-gray-900">{selectedStudent.age || 'N/A'} years</span></p>
                            <p className="text-gray-600 flex items-center gap-2"><Calendar className='h-5 w-5 text-green-500'/> Joined: <span className="font-semibold text-gray-900">{new Date(selectedStudent.joinDate).toLocaleDateString()}</span></p>
                        </div>
                         <div className="md:col-span-1 space-y-3 md:pl-6 border-gray-200 md:border-l pt-4 md:pt-0">
                            <h4 className="text-lg font-bold text-gray-900 mb-2">Contact</h4>
                            <p className="text-sm text-gray-700 truncate">Email: <a href={`mailto:${selectedStudent.email}`} className="text-blue-600 hover:underline">{selectedStudent.email}</a></p>
                            <p className="text-sm text-gray-700">Phone: {selectedStudent.phone || 'N/A'}</p> 
                            {/* يمكن استخدام اسم المعلم من بيانات الطالب */}
                            <p className="text-sm text-gray-700">Teacher: {selectedStudent.teacherName || user?.name}</p>
                        </div>
                    </div>
                    
                    {/* Performance Overview Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white p-5 rounded-xl shadow-md border-b-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Completed Classes</p>
                                    <p className="text-2xl font-bold text-gray-900">{completedClasses} / {totalClasses}</p>
                                </div>
                                <BookOpen className="h-8 w-8 text-blue-500 bg-blue-50 p-1 rounded-full" />
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-md border-b-4 border-purple-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Last Class</p>
                                    <p className="text-2xl font-bold text-gray-900">{selectedStudent.lastClassDate}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-purple-500 bg-purple-50 p-1 rounded-full" />
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-md border-b-4 border-yellow-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Average Rating</p>
                                    <p className="text-2xl font-bold text-yellow-600 flex items-center">{averageRatingValue} <Star className="h-6 w-6 ml-1 fill-current"/></p>
                                </div>
                                <Award className="h-8 w-8 text-yellow-600 bg-yellow-50 p-1 rounded-full" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
                        <div className="flex justify-between text-sm font-semibold text-gray-900 mb-2">
                            <span>Overall Curriculum Progress</span>
                            <span className="text-blue-600">{selectedStudent.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${selectedStudent.progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Class History */}
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><BookOpen className='h-5 w-5 text-blue-600'/> Class History ({studentHistory.length} Total)</h3>
                        
                        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                            {studentHistory.length === 0 ? (
                                <div className='text-center py-6 bg-gray-50 rounded-lg'>
                                    <p className='text-gray-500'>No class history available.</p>
                                </div>
                            ) : (
                                studentHistory.map((classItem) => (
                                    <div key={classItem.id} className="bg-gray-100 p-4 rounded-xl shadow-sm border border-gray-200">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${classItem.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {classItem.status === 'completed' ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{classItem.subject}</p>
                                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                                        <Calendar className='h-4 w-4'/> {new Date(classItem.date).toLocaleDateString()} at {classItem.time}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                classItem.status === 'completed' ? 'bg-green-500 text-white' : 
                                                classItem.status === 'scheduled' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
                                            }`}>
                                                {classItem.status.charAt(0).toUpperCase() + classItem.status.slice(1)}
                                            </span>
                                        </div>

                                        {/* Class Details (Rating & Notes) */}
                                        {classItem.status === 'completed' && (
                                            <div className="mt-3 bg-white p-3 rounded-lg border border-gray-100">
                                                <div className="flex justify-between items-center text-sm">
                                                    <div className='flex items-center gap-1 text-yellow-600 font-bold'>
                                                        <Star className='h-4 w-4 fill-current'/> 
                                                        {classItem.notes?.match(/Rating=(\d\.?\d?)\/5/)?.[1] || 'N/A'} / 5
                                                    </div>
                                                    <div className='text-gray-700 flex items-center gap-1'>
                                                        <MessageSquare className='h-4 w-4'/> Notes
                                                    </div>
                                                </div>
                                                {classItem.notes && (
                                                  <div className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                                                    {classItem.notes}
                                                  </div>
                                                )}
                                            </div>
                                        )}

                                        {classItem.status === 'scheduled' && classItem.notes && (
                                            <div className="mt-3 bg-white rounded-lg p-2 text-sm border border-gray-100">
                                                <MessageSquare className="h-4 w-4 inline text-blue-600 mr-1" />
                                                <span className="text-gray-700">{classItem.notes}</span>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={() => setSelectedStudent(null)}
                        className="w-full mt-6 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
  };
  
  // حساب الإحصائيات العامة للبطاقات العلوية
  const totalStudents = allStudentsWithStats.length;
const avgProgress = totalStudents > 0 
    ? Math.round(allStudentsWithStats.reduce((acc, s) => acc + (s.progress || 0), 0) / totalStudents) 
    : 0;
const totalClassesCount = allStudentsWithStats.reduce((acc, s) => acc + (s.totalClasses || 0), 0);
const avgRating = totalStudents > 0 
    ? (allStudentsWithStats.reduce((acc, s) => acc + (s.averageRating || 0), 0) / totalStudents).toFixed(1) 
    : '0';
  
  // 6. العرض الرئيسي
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Students</h1>
          <p className="text-gray-600">View and track your students' progress</p>
        </div>

        {/* Stats Cards - تم ربطها بالبيانات الحقيقية */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold text-green-600">
                  {avgProgress}%
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-purple-600">
                  {totalClassesCount}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {avgRating}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterLevel}
              onChange={(e) => {
                setFilterLevel(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {uniqueLevels.map(level => (
                  <option key={level} value={level}>
                      {level === 'all' ? 'All Levels' : level}
                  </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* No Students Found Message */}
        {filteredStudents.length === 0 && (
            <div className='text-center py-20 bg-white rounded-xl shadow-lg border border-gray-200'>
                <Users className='h-12 w-12 text-gray-400 mx-auto mb-4'/>
                <p className='text-lg font-medium text-gray-600'>No students found matching your criteria.</p>
            </div>
        )}

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level & Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                          {student.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                          <div className="text-xs text-gray-400">{student.age || 'N/A'} years old</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 ${getLevelColor(student.level)}`}>
                        {student.level}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: `${student.progress}%` }} ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                          <span>{student.completedClasses} completed</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Clock className="h-4 w-4 text-blue-600 mr-1" />
                          <span>{student.upcomingClasses} upcoming</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                        <span className="ml-1 text-sm font-semibold text-gray-900">{student.averageRating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(student.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleViewStudent(student)} 
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      > 
                        View Profile 
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredStudents.length > studentsPerPage && (
            <div className="px-6 py-4 flex justify-between items-center border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} results
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm font-semibold text-gray-700">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Student Details Modal */}
        <StudentDetailModal />
      </div>
    </div>
  );
}