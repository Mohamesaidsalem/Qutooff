import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, Video, CheckCircle, Award, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { 
    getStudentsByTeacher, 
    getClassesByTeacher, 
    updateClass,
    teachers,
    loading: dataLoading
  } = useData();

  const [currentTeacher, setCurrentTeacher] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [currentMonthClasses, setCurrentMonthClasses] = useState<any[]>([]);

  // Find current teacher and load data
  useEffect(() => {
    if (user && teachers.length > 0) {
      const teacher = teachers.find(t => t.email === user.email || t.id === user.id);
      
      if (teacher) {
        setCurrentTeacher(teacher);
        
        // Get teacher's students
        const teacherStudents = getStudentsByTeacher(teacher.id);
        setStudents(teacherStudents);
        
        // Get teacher's classes
        const classes = getClassesByTeacher(teacher.id);
        setTeacherClasses(classes);
        
        // Get upcoming classes
        const upcoming = classes
          .filter(cls => {
            const classDateTime = new Date(`${cls.date}T${cls.time}`);
            return classDateTime >= new Date() && cls.status === 'scheduled';
          })
          .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 4);
        
        setUpcomingClasses(upcoming);
        
        // Get current month classes
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthClasses = classes.filter(cls => {
          const classDate = new Date(cls.date);
          return classDate.getMonth() === currentMonth && classDate.getFullYear() === currentYear;
        });
        
        setCurrentMonthClasses(monthClasses);
      }
    }
  }, [user, teachers, getStudentsByTeacher, getClassesByTeacher]);

  const markClassCompleted = async (classId: string) => {
    try {
      await updateClass(classId, { status: 'completed' });
      alert('Class marked as completed!');
    } catch (error) {
      console.error('Error marking class as completed:', error);
      alert('Failed to mark class as completed. Please try again.');
    }
  };

  const markClassCancelled = async (classId: string) => {
    if (window.confirm('Are you sure you want to cancel this class?')) {
      try {
        await updateClass(classId, { status: 'cancelled' });
        alert('Class cancelled!');
      } catch (error) {
        console.error('Error cancelling class:', error);
        alert('Failed to cancel class. Please try again.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

  if (!currentTeacher) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Teacher Profile Not Found</h1>
          <p className="text-gray-600 mb-4">
            We couldn't find your teacher profile. Please contact the administrator.
          </p>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Need Help?</strong> Make sure you're using the correct email registered as a teacher.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const completedClassesThisMonth = currentMonthClasses.filter(cls => cls.status === 'completed');
  const scheduledClassesThisMonth = currentMonthClasses.filter(cls => cls.status === 'scheduled');
  const todayClasses = teacherClasses.filter(cls => cls.date === new Date().toISOString().split('T')[0]);

  const stats = [
    { name: 'Total Students', value: students.length.toString(), icon: Users, color: 'bg-blue-500' },
    { name: "Today's Classes", value: todayClasses.length.toString(), icon: Calendar, color: 'bg-green-500' },
    { name: 'Classes This Month', value: currentMonthClasses.length.toString(), icon: Clock, color: 'bg-yellow-500' },
    { name: 'Completed', value: completedClassesThisMonth.length.toString(), icon: CheckCircle, color: 'bg-emerald-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome, {currentTeacher.name}! Manage your students and classes
        </p>
        <p className="mt-2 text-lg text-blue-600 font-medium">
          {currentTeacher.specialization}
        </p>
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
              <dt className="text-sm font-medium text-gray-500 mb-1">
                {item.name}
              </dt>
              <dd className="text-2xl font-bold text-gray-900">
                {item.value}
              </dd>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Schedule */}
      <div className="mb-8 bg-white shadow-lg rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-lg font-semibold text-gray-900">
            My Monthly Schedule - {new Date().toLocaleString('en', { month: 'long', year: 'numeric' })}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            All classes scheduled for you this month
          </p>
        </div>
        <div className="p-6">
          {currentMonthClasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentMonthClasses
                .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
                .map((classItem) => {
                  const student = students.find(s => s.id === classItem.studentId);
                  const classDateTime = new Date(`${classItem.date}T${classItem.time}`);
                  const isToday = classItem.date === new Date().toISOString().split('T')[0];
                  const isPast = classDateTime < new Date();
                  const isUpcoming = classDateTime > new Date();
                  
                  return (
                    <div key={classItem.id} className={`p-4 rounded-xl border-2 transition-all ${
                      classItem.status === 'completed' ? 'bg-green-50 border-green-300' :
                      classItem.status === 'cancelled' ? 'bg-red-50 border-red-300' :
                      isToday ? 'bg-yellow-50 border-yellow-300' :
                      isPast ? 'bg-orange-50 border-orange-300' :
                      'bg-blue-50 border-blue-300'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{student?.name || 'Unknown Student'}</p>
                          <p className="text-sm text-gray-600">{formatDate(classItem.date)} - {classItem.time}</p>
                          <p className="text-xs text-gray-500 mt-1">{student?.level}</p>
                          
                          <div className="mt-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              classItem.status === 'completed' ? 'bg-green-100 text-green-800' :
                              classItem.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              isToday ? 'bg-yellow-100 text-yellow-800' :
                              isPast ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {classItem.status === 'completed' ? '✓ Completed' :
                               classItem.status === 'cancelled' ? '✗ Cancelled' :
                               isToday ? '🔥 Today' :
                               isPast ? '⚠ Missed' : '📅 Scheduled'}
                            </span>
                          </div>

                          {classItem.notes && (
                            <p className="text-xs text-gray-500 mt-2 italic">
                              "{classItem.notes}"
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-1 ml-2">
                          {classItem.status === 'scheduled' && isUpcoming && (
                            <button 
                              onClick={() => window.open(classItem.zoomLink, '_blank')}
                              className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors flex items-center gap-1"
                              title="Join Class"
                            >
                              <Video className="h-3 w-3" />
                              Join
                            </button>
                          )}
                          {classItem.status === 'scheduled' && (isPast || isToday) && (
                            <>
                              <button 
                                onClick={() => markClassCompleted(classItem.id)}
                                className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors flex items-center gap-1"
                                title="Mark Complete"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Done
                              </button>
                              <button 
                                onClick={() => markClassCancelled(classItem.id)}
                                className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors flex items-center gap-1"
                                title="Cancel Class"
                              >
                                <XCircle className="h-3 w-3" />
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
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No classes scheduled this month</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Classes */}
        <div className="bg-white shadow-lg rounded-xl border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Classes</h2>
          </div>
          <div className="p-6">
            {upcomingClasses.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming classes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingClasses.map((classItem) => {
                  const student = students.find(s => s.id === classItem.studentId);
                  const isToday = classItem.date === new Date().toISOString().split('T')[0];
                  
                  return (
                    <div key={classItem.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-blue-200">
                      <div>
                        <h3 className="font-semibold text-gray-900">{student?.name || 'Unknown'}</h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(classItem.date)} at {classItem.time}
                        </p>
                        <p className="text-xs text-gray-400">{student?.level}</p>
                        {isToday && (
                          <span className="inline-flex items-center gap-1 text-xs text-red-600 font-semibold mt-1">
                            🔥 Today
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => window.open(classItem.zoomLink, '_blank')}
                          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
                        >
                          <Video className="h-4 w-4" />
                          Join
                        </button>
                        <button 
                          onClick={() => markClassCompleted(classItem.id)}
                          className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors shadow-md"
                          title="Mark Complete"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Student Progress */}
        <div className="bg-white shadow-lg rounded-xl border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <h2 className="text-lg font-semibold text-gray-900">Student Progress</h2>
            <p className="text-sm text-gray-500">View only - cannot be modified</p>
          </div>
          <div className="p-6">
            {students.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No students enrolled</p>
              </div>
            ) : (
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student.id} className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{student.name}</h3>
                      <span className="text-sm font-bold text-purple-600">{student.progress}%</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{student.level}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${student.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">Age: {student.age} years</p>
                      {student.progress >= 90 && (
                        <div className="flex items-center text-xs text-yellow-600 font-semibold">
                          <Award className="h-3 w-3 mr-1" />
                          Excellent!
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-lg text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Progress</h3>
          <p className="text-4xl font-bold text-blue-600">
            {students.length > 0 
              ? Math.round(students.reduce((acc, student) => acc + student.progress, 0) / students.length) 
              : 0}%
          </p>
          <p className="text-sm text-gray-500 mt-2">of all students</p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-lg text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Completion Rate</h3>
          <p className="text-4xl font-bold text-green-600">
            {currentMonthClasses.length > 0 
              ? Math.round((completedClassesThisMonth.length / currentMonthClasses.length) * 100) 
              : 0}%
          </p>
          <p className="text-sm text-gray-500 mt-2">classes completed this month</p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-lg text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Classes</h3>
          <p className="text-4xl font-bold text-orange-600">
            {scheduledClassesThisMonth.filter(cls => new Date(`${cls.date}T${cls.time}`) < new Date()).length}
          </p>
          <p className="text-sm text-gray-500 mt-2">need to be completed</p>
        </div>
      </div>
    </div>
  );
}