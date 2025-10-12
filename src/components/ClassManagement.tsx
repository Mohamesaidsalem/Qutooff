import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  Users, 
  Star, 
  BookOpen, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Play,
  FileText,
  Award,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Class, Child, Teacher } from '../contexts/DataContext';

export default function ClassManagement() {
  const { user } = useAuth();
  const { children, teachers, classes, updateClass } = useData();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showClassDetails, setShowClassDetails] = useState(false);
  const [isInClass, setIsInClass] = useState(false);
  const [classTimer, setClassTimer] = useState(0);
  const [rating, setRating] = useState({
    participation: 5,
    understanding: 5,
    homework: 5,
    behavior: 5,
    overall: 5,
    notes: ''
  });

  const currentTeacher = teachers.find(t => t.email === user?.email);
  const teacherId = currentTeacher?.id || '1';

  const teacherClasses = classes.filter(cls => cls.teacherId === teacherId);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getClassesForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return teacherClasses.filter(cls => cls.date === dateString);
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const startClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsInClass(true);
    setClassTimer(0);
    updateClass(classItem.id, { status: 'in-progress' });
    window.open(classItem.zoomLink, '_blank');
  };

  const endClass = () => {
    if (selectedClass) {
      updateClass(selectedClass.id, { status: 'completed' });
      setIsInClass(false);
      setShowRatingModal(true);
    }
  };

  const submitRating = () => {
    if (selectedClass) {
      console.log('Rating submitted:', rating);
      setShowRatingModal(false);
      setSelectedClass(null);
      setRating({
        participation: 5,
        understanding: 5,
        homework: 5,
        behavior: 5,
        overall: 5,
        notes: ''
      });
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInClass) {
      interval = setInterval(() => {
        setClassTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInClass]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const dayHeaders = dayNames.map(day => (
      <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
        {day}
      </div>
    ));

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const classesForDay = getClassesForDate(date);
      const isSelected = selectedDate.toDateString() === date.toDateString();
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`p-2 cursor-pointer rounded-lg transition-all duration-200 ${
            isSelected 
              ? 'bg-blue-600 text-white' 
              : isToday 
                ? 'bg-blue-100 text-blue-800' 
                : 'hover:bg-gray-100'
          }`}
        >
          <div className="text-center">
            <div className="text-sm font-medium">{day}</div>
            {classesForDay.length > 0 && (
              <div className="flex justify-center mt-1">
                <div className={`w-2 h-2 rounded-full ${
                  classesForDay.some(c => c.status === 'scheduled') ? 'bg-blue-500' :
                  classesForDay.some(c => c.status === 'completed') ? 'bg-green-500' :
                  'bg-gray-400'
                }`}></div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-7 gap-1">
            {dayHeaders}
            {days}
          </div>
        </div>
      </div>
    );
  };

  const selectedDateClasses = getClassesForDate(selectedDate);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Class Management</h1>
        <p className="mt-2 text-gray-600">
          Manage your classes, conduct sessions, and evaluate student performance
        </p>
      </div>

      {/* Active Class Banner */}
      {isInClass && selectedClass && (
        <div className="mb-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Video className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Class in Progress</h3>
                <p className="text-green-100">
                  {children.find(s => s.id === selectedClass.studentId)?.name} • Duration: {formatTimer(classTimer)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live</span>
              </div>
              <button
                onClick={endClass}
                className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                End Class
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          {renderCalendar()}
        </div>

        {/* Daily Schedule */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {selectedDateClasses.length} {selectedDateClasses.length === 1 ? 'class' : 'classes'} scheduled
              </p>
            </div>
            <div className="p-6">
              {selectedDateClasses.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateClasses
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((classItem) => {
                      const student = children.find(s => s.id === classItem.studentId);
                      const classTime = new Date(`${classItem.date}T${classItem.time}`);
                      const canStart = classItem.status === 'scheduled';
                      
                      return (
                        <div
                          key={classItem.id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => {
                            setSelectedClass(classItem);
                            setShowClassDetails(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                  {student?.name.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{student?.name}</h4>
                                  <p className="text-sm text-gray-500">{student?.level}</p>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{formatTime(classItem.time)}</span>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(classItem.status)}`}>
                                  {classItem.status.charAt(0).toUpperCase() + classItem.status.slice(1)}
                                </span>
                              </div>
                            </div>
                            {canStart && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startClass(classItem);
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                              >
                                <Play className="h-4 w-4" />
                                <span>Start</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No classes scheduled for this day</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Overview</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Scheduled</span>
                </div>
                <span className="text-sm font-medium">
                  {teacherClasses.filter(c => c.status === 'scheduled' && c.date === new Date().toISOString().split('T')[0]).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Completed</span>
                </div>
                <span className="text-sm font-medium">
                  {teacherClasses.filter(c => c.status === 'completed' && c.date === new Date().toISOString().split('T')[0]).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Total Students</span>
                </div>
                <span className="text-sm font-medium">
                  {children.filter(child => child.teacher === currentTeacher?.name).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Class Details Modal */}
      {showClassDetails && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Class Details</h2>
                <button
                  onClick={() => setShowClassDetails(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              {(() => {
                const student = children.find(s => s.id === selectedClass.studentId);
                return (
                  <div className="space-y-6">
                    {/* Student Info */}
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {student?.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{student?.name}</h3>
                        <p className="text-gray-600">{student?.level} • Age {student?.age}</p>
                        <p className="text-sm text-gray-500">Progress: {student?.progress}%</p>
                      </div>
                    </div>

                    {/* Class Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="h-5 w-5 text-gray-500" />
                          <span className="font-medium text-gray-900">Date & Time</span>
                        </div>
                        <p className="text-gray-600">
                          {new Date(selectedClass.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-gray-600">{formatTime(selectedClass.time)}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="h-5 w-5 text-gray-500" />
                          <span className="font-medium text-gray-900">Status</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedClass.status)}`}>
                          {selectedClass.status.charAt(0).toUpperCase() + selectedClass.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      {selectedClass.status === 'scheduled' && (
                        <button
                          onClick={() => {
                            startClass(selectedClass);
                            setShowClassDetails(false);
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                        >
                          <Play className="h-5 w-5" />
                          <span>Start Class</span>
                        </button>
                      )}
                      {selectedClass.status === 'completed' && (
                        <button
                          onClick={() => {
                            setShowClassDetails(false);
                            setShowRatingModal(true);
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                        >
                          <Star className="h-5 w-5" />
                          <span>Rate Student</span>
                        </button>
                      )}
                      <button
                        onClick={() => window.open(selectedClass.zoomLink, '_blank')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <Video className="h-5 w-5" />
                        <span>Join Zoom</span>
                      </button>
                    </div>

                    {/* Notes */}
                    {selectedClass.notes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="h-5 w-5 text-yellow-600" />
                          <span className="font-medium text-yellow-800">Class Notes</span>
                        </div>
                        <p className="text-yellow-700">{selectedClass.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Rate Student Performance</h2>
              <p className="text-gray-600 mt-1">
                {children.find(s => s.id === selectedClass.studentId)?.name}
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Rating Categories */}
                {[
                  { key: 'participation', label: 'Class Participation', icon: Users },
                  { key: 'understanding', label: 'Understanding', icon: BookOpen },
                  { key: 'homework', label: 'Homework Completion', icon: FileText },
                  { key: 'behavior', label: 'Behavior', icon: Award },
                  { key: 'overall', label: 'Overall Performance', icon: TrendingUp }
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key}>
                    <div className="flex items-center space-x-2 mb-3">
                      <Icon className="h-5 w-5 text-gray-500" />
                      <label className="font-medium text-gray-900">{label}</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(prev => ({ ...prev, [key]: star }))}
                          className={`w-8 h-8 rounded-full transition-colors ${
                            star <= parseInt(rating[key as keyof typeof rating] as string)
                              ? 'bg-yellow-400 text-white'
                              : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                          }`}
                        >
                          <Star className="h-4 w-4 mx-auto" fill="currentColor" />
                        </button>
                      ))}
                      <span className="ml-2 text-sm font-medium text-gray-600">
                        {rating[key as keyof typeof rating]}/10
                      </span>
                    </div>
                  </div>
                ))}

                {/* Notes */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={rating.notes}
                    onChange={(e) => setRating(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Add any specific feedback or observations..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowRatingModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitRating}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Submit Rating
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}