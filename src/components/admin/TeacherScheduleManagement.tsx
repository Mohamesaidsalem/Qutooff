import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Calendar as CalendarIcon, Award, Clock, Plus, Trash2, Globe, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { convertToUTC, convertFromUTC, getUserTimezone, getTimezoneDisplayName, getCurrentLocalDateTime } from '../../utils/timezone';

interface TeacherScheduleManagementProps {
  teachers: any[];
  children: any[];
  classes: any[];
  onScheduleClass: (data: any) => void;
  onUpdateClass: (classId: string, updates: any) => void;
  onDeleteClass: (classId: string) => void;
}

export default function TeacherScheduleManagement({ 
  teachers = [], 
  children = [], 
  classes = [], 
  onScheduleClass, 
  onUpdateClass,
  onDeleteClass
}: TeacherScheduleManagementProps) {
  console.log('🔍 [TeacherScheduleManagement] Received props:', {
    teachersCount: teachers.length,
    teachers: teachers,
    childrenCount: children.length,
    classesCount: classes.length
  });
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [deletingClass, setDeletingClass] = useState<any>(null);
  const [userTimezone] = useState(getUserTimezone());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduleData, setScheduleData] = useState({
    teacherId: '',
    studentId: '',
    date: '',
    time: '',
    duration: 60,
    zoomLink: 'https://zoom.us/j/123456789',
    notes: ''
  });

  const [editData, setEditData] = useState({
    teacherId: '',
    studentId: '',
    date: '',
    time: '',
    duration: 60,
    zoomLink: '',
    notes: ''
  });

  // Initialize form with current local time
  useEffect(() => {
    const { date, time } = getCurrentLocalDateTime();
    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
    const defaultTime = nextHour.toLocaleTimeString('en-GB', { 
      hour12: false,
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    setScheduleData(prev => ({
      ...prev,
      date: prev.date || date,
      time: prev.time || defaultTime
    }));
  }, []);

  const isDateToday = (utcDate: string, utcTime: string) => {
    const { localDateTime } = convertFromUTC(utcDate, utcTime);
    const today = new Date();
    return localDateTime.toDateString() === today.toDateString();
  };

  const isDatePast = (utcDate: string, utcTime: string) => {
    const { localDateTime } = convertFromUTC(utcDate, utcTime);
    return localDateTime < new Date();
  };

  const teacherSchedules = teachers.map((teacher: any) => {
    const teacherClasses = classes.filter(cls => {
      const { localDateTime } = convertFromUTC(cls.utcDate || cls.date, cls.utcTime || cls.time);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      return cls.teacherId === teacher.id && 
             localDateTime.getMonth() === currentMonth && 
             localDateTime.getFullYear() === currentYear;
    });

    const upcomingClasses = teacherClasses.filter(cls => {
      return !isDatePast(cls.utcDate || cls.date, cls.utcTime || cls.time) && cls.status === 'scheduled';
    });

    const completedClasses = teacherClasses.filter(cls => cls.status === 'completed');

    return {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      totalClassesThisMonth: teacherClasses.length,
      upcomingClasses: upcomingClasses.length,
      completedClasses: completedClasses.length,
      upcomingClassesDetails: upcomingClasses.slice(0, 3),
      students: children.filter(child => child.teacher === teacher.name).length,
      allClasses: teacherClasses
    };
  });

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getClassesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    return classes.filter(cls => {
      if (cls.status === 'cancelled') return false;
      
      // Convert UTC to local for comparison
      const { localDate } = convertFromUTC(
        cls.utcDate || cls.date, 
        cls.utcTime || cls.time, 
        userTimezone
      );
      
      return localDate === dateStr;
    }).map(cls => {
      const teacher = teachers.find(t => t.id === cls.teacherId);
      const student = children.find(c => c.id === cls.studentId);
      const { localTime } = convertFromUTC(
        cls.utcDate || cls.date, 
        cls.utcTime || cls.time, 
        userTimezone
      );
      
      return {
        ...cls,
        teacherName: teacher?.name || 'Unknown Teacher',
        studentName: student?.name || 'Unknown Student',
        localTime,
        teacher,
        student
      };
    });
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const handleEditClass = (classItem: any) => {
    const { localDate, localTime } = convertFromUTC(
      classItem.utcDate || classItem.date, 
      classItem.utcTime || classItem.time
    );
    
    setEditingClass(classItem);
    setEditData({
      teacherId: classItem.teacherId,
      studentId: classItem.studentId,
      date: localDate,
      time: localTime,
      duration: classItem.duration,
      zoomLink: classItem.zoomLink || 'https://zoom.us/j/123456789',
      notes: classItem.notes || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteClass = (classItem: any) => {
    setDeletingClass(classItem);
    setShowDeleteModal(true);
  };

  const confirmDeleteClass = () => {
    if (deletingClass && onDeleteClass) {
      try {
        onDeleteClass(deletingClass.id);
        setShowDeleteModal(false);
        setDeletingClass(null);
        alert('Class deleted successfully!');
      } catch (error) {
        console.error('Error deleting class:', error);
        alert('Error deleting class. Please try again.');
      }
    }
  };

  // Function to handle adding new class from calendar view
  const handleAddClassFromCalendar = (selectedDate?: Date) => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const nextHour = new Date();
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
      const defaultTime = nextHour.toLocaleTimeString('en-GB', { 
        hour12: false,
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      setScheduleData(prev => ({
        ...prev,
        date: dateStr,
        time: defaultTime
      }));
    }
    setShowScheduleModal(true);
    setShowCalendarView(false); // Close calendar view when opening schedule modal
  };

  const handleUpdateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (editData.teacherId && editData.studentId && editData.date && editData.time && editData.duration && editingClass) {
      const { utcDate, utcTime, utcDateTime } = convertToUTC(
        editData.date, 
        editData.time, 
        userTimezone
      );

      // Check for conflicts (excluding current class)
      const existingClasses = classes.filter(cls => 
        cls.teacherId === editData.teacherId && 
        (cls.utcDate || cls.date) === utcDate &&
        cls.status === 'scheduled' &&
        cls.id !== editingClass.id
      );

      const newStartTime = new Date(`${utcDate}T${utcTime}:00.000Z`);
      const newEndTime = new Date(newStartTime.getTime() + editData.duration * 60000);

      const hasConflict = existingClasses.some(cls => {
        const existingStart = new Date(`${cls.utcDate || cls.date}T${cls.utcTime || cls.time}:00.000Z`);
        const existingEnd = new Date(existingStart.getTime() + cls.duration * 60000);
        
        return (newStartTime < existingEnd && newEndTime > existingStart);
      });

      if (hasConflict) {
        alert('Time conflict detected! Please choose a different time slot.');
        return;
      }

      onUpdateClass(editingClass.id, {
        studentId: editData.studentId,
        teacherId: editData.teacherId,
        date: editData.date,
        time: editData.time,
        utcDate,
        utcTime,
        utcDateTime,
        duration: editData.duration,
        zoomLink: editData.zoomLink,
        notes: editData.notes,
        timezone: userTimezone,
        updatedAt: new Date().toISOString()
      });
      
      setShowEditModal(false);
      setEditingClass(null);
      setEditData({
        teacherId: '',
        studentId: '',
        date: '',
        time: '',
        duration: 60,
        zoomLink: '',
        notes: ''
      });
      alert('Class updated successfully!');
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for the first week
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-[120px] bg-gray-50 border border-gray-200"></div>
      );
    }

    // Add days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayClasses = getClassesForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

      days.push(
        <div
          key={day}
          className={`min-h-[120px] border border-gray-200 p-2 relative group ${
            isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
          } ${isPast ? 'opacity-75' : ''}`}
        >
          <div className={`font-semibold text-sm mb-1 flex items-center justify-between ${
            isToday ? 'text-blue-600' : 'text-gray-900'
          }`}>
            <span>
              {day}
              {isToday && (
                <span className="ml-2 bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs">
                  Today
                </span>
              )}
            </span>
            
            {/* Add button that appears on hover */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddClassFromCalendar(date);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-blue-100 rounded-full text-blue-600"
              title="Add class on this date"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-1">
            {dayClasses.slice(0, 3).map((classItem, index) => {
              const teacherColor = index % 4 === 0 ? 'bg-blue-100 text-blue-800' :
                                 index % 4 === 1 ? 'bg-green-100 text-green-800' :
                                 index % 4 === 2 ? 'bg-purple-100 text-purple-800' :
                                 'bg-orange-100 text-orange-800';
              
              return (
                <div
                  key={classItem.id}
                  className={`text-xs p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity relative group/class ${teacherColor} ${
                    classItem.status === 'completed' ? 'opacity-60' : ''
                  }`}
                  onClick={() => handleEditClass(classItem)}
                  title="Click to edit this class"
                >
                  <div className="font-medium truncate">
                    {classItem.teacherName}
                  </div>
                  <div className="truncate opacity-90">
                    {classItem.studentName}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{classItem.localTime}</span>
                      {classItem.status === 'completed' && (
                        <span className="ml-1 text-xs">✓</span>
                      )}
                    </div>
                    {classItem.status === 'scheduled' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClass(classItem);
                        }}
                        className="opacity-0 group-hover/class:opacity-100 transition-opacity duration-200 text-red-600 hover:text-red-800 hover:bg-red-50 rounded p-0.5"
                        title="Delete this class"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            
            {dayClasses.length > 3 && (
              <div className="text-xs text-gray-500 font-medium">
                +{dayClasses.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const handleScheduleClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (scheduleData.teacherId && scheduleData.studentId && scheduleData.date && scheduleData.time && scheduleData.duration) {
      const { utcDate, utcTime, utcDateTime } = convertToUTC(
        scheduleData.date, 
        scheduleData.time, 
        userTimezone
      );

      // Check for conflicts using UTC times
      const existingClasses = classes.filter(cls => 
        cls.teacherId === scheduleData.teacherId && 
        (cls.utcDate || cls.date) === utcDate &&
        cls.status === 'scheduled'
      );

      const newStartTime = new Date(`${utcDate}T${utcTime}:00.000Z`);
      const newEndTime = new Date(newStartTime.getTime() + scheduleData.duration * 60000);

      const hasConflict = existingClasses.some(cls => {
        const existingStart = new Date(`${cls.utcDate || cls.date}T${cls.utcTime || cls.time}:00.000Z`);
        const existingEnd = new Date(existingStart.getTime() + cls.duration * 60000);
        
        return (newStartTime < existingEnd && newEndTime > existingStart);
      });

      if (hasConflict) {
        alert('Time conflict detected! Please choose a different time slot.');
        return;
      }

      onScheduleClass({
        studentId: scheduleData.studentId,
        teacherId: scheduleData.teacherId,
        date: scheduleData.date,
        time: scheduleData.time,
        utcDate,
        utcTime,
        utcDateTime,
        duration: scheduleData.duration,
        status: 'scheduled',
        zoomLink: scheduleData.zoomLink,
        notes: scheduleData.notes,
        timezone: userTimezone,
        createdAt: new Date().toISOString()
      });
      
      setScheduleData({
        teacherId: '',
        studentId: '',
        date: '',
        time: '',
        duration: 60,
        zoomLink: 'https://zoom.us/j/123456789',
        notes: ''
      });
      setShowScheduleModal(false);
      alert('Class scheduled successfully!');
    }
  };

  return (
    <div className="space-y-6"> 
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teacher Schedule Management</h2>
          <p className="mt-2 text-sm text-gray-600">
            Manage all teacher schedules, assign classes, and monitor teaching activities
          </p>
          <div className="mt-1 flex items-center text-xs text-blue-600">
            <Globe className="h-3 w-3 mr-1" />
            <span>Your timezone: {getTimezoneDisplayName(userTimezone)}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCalendarView(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center shadow-sm"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar View
          </button>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule New Class
          </button>
        </div>
      </div>

      {/* Teacher Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Teachers</p>
              <p className="text-2xl font-bold text-gray-900">{teachers.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Classes</p>
              <p className="text-2xl font-bold text-gray-900">
                {classes.filter(cls => cls.status === 'scheduled').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Classes</p>
              <p className="text-2xl font-bold text-gray-900">
                {classes.filter(cls => cls.status === 'completed').length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{children.length}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Schedule Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Teacher Schedules Overview</h3>
          <p className="mt-1 text-sm text-gray-600">
            Current month schedule details for all teachers (times shown in your timezone)
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classes Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upcoming Classes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teacherSchedules.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                      <div className="text-sm text-gray-500">{teacher.email}</div>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          ID: {teacher.id}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{teacher.students}</span>
                      <span className="ml-1 text-sm text-gray-500">students</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Award className="h-3 w-3 mr-1" />
                        {teacher.completedClasses} Completed
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Clock className="h-3 w-3 mr-1" />
                        {teacher.upcomingClasses} Upcoming
                      </span>
                    </div>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {teacher.totalClassesThisMonth} Total This Month
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 max-w-xs">
                      {teacher.upcomingClassesDetails.length > 0 ? (
                        teacher.upcomingClassesDetails.map((classItem: any) => {
                          const student = children.find(s => s.id === classItem.studentId);
                          const { localDate, localTime } = convertFromUTC(
                            classItem.utcDate || classItem.date, 
                            classItem.utcTime || classItem.time
                          );
                          const isToday = isDateToday(
                            classItem.utcDate || classItem.date, 
                            classItem.utcTime || classItem.time
                          );
                          
                          return (
                            <div key={classItem.id} className="flex items-center text-xs">
                              <div className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${isToday ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                              <span className="text-gray-600 truncate">
                                {student?.name} - {localDate} at {localTime}
                              </span>
                              {isToday && (
                                <span className="ml-2 px-1 py-0.5 bg-red-100 text-red-600 rounded text-xs flex-shrink-0">
                                  Today
                                </span>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-xs text-gray-500">No upcoming classes</span>
                      )}
                      {teacher.upcomingClasses > 3 && (
                        <div className="text-xs text-gray-500">
                          + {teacher.upcomingClasses - 3} more classes
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setScheduleData({
                          ...scheduleData,
                          teacherId: teacher.id
                        });
                        setShowScheduleModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Add new class"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {teacherSchedules.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium">No teachers registered</p>
              <p className="text-sm">Teachers will appear here once they register</p>
            </div>
          )}
        </div>
      </div>

      {/* Calendar View Modal */}
      {showCalendarView && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-xl max-w-7xl w-full mx-auto max-h-[90vh] overflow-hidden">
            {/* Calendar Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Teacher Schedule Calendar</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Complete view of all teacher schedules - All times in your timezone: {getTimezoneDisplayName(userTimezone)}
                  </p>
                  <p className="mt-1 text-xs text-blue-600">
                    💡 Hover over any day to see the Add button, click on classes to edit them
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {/* Add New Class Button in Calendar Header */}
                  <button
                    onClick={() => handleAddClassFromCalendar()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Class
                  </button>
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
                    {getMonthName(currentDate)}
                  </h3>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setShowCalendarView(false)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors ml-4"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Legend */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-100 rounded mr-2"></div>
                    <span>Teacher Classes</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                    <span>Today</span>
                  </div>
                  <div className="flex items-center">
                    <Plus className="h-3 w-3 mr-1 text-blue-600" />
                    <span>Add (on hover)</span>
                  </div>
                  <div className="flex items-center">
                    <Trash2 className="h-3 w-3 mr-1 text-red-600" />
                    <span>Delete (on hover)</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Class Time</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">✓</span>
                    <span>Completed</span>
                  </div>
                </div>
                <div className="text-gray-600">
                  Stored as UTC, displayed in your local time
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="overflow-auto max-h-[calc(90vh-200px)]">
              <div className="p-6">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                    <div key={day} className="p-3 text-center font-semibold text-gray-700 bg-gray-100 rounded-t-lg">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar()}
                </div>
              </div>
            </div>

            {/* Calendar Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <span className="font-medium">Total Classes This Month:</span>
                    <span className="ml-2 font-bold text-gray-900">
                      {classes.filter(cls => {
                        const { localDateTime } = convertFromUTC(cls.utcDate || cls.date, cls.utcTime || cls.time);
                        return localDateTime.getMonth() === currentDate.getMonth() && 
                               localDateTime.getFullYear() === currentDate.getFullYear() &&
                               cls.status !== 'cancelled';
                      }).length}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Active Teachers:</span>
                    <span className="ml-2 font-bold text-gray-900">
                      {new Set(classes.filter(cls => {
                        const { localDateTime } = convertFromUTC(cls.utcDate || cls.date, cls.utcTime || cls.time);
                        return localDateTime.getMonth() === currentDate.getMonth() && 
                               localDateTime.getFullYear() === currentDate.getFullYear() &&
                               cls.status !== 'cancelled';
                      }).map(cls => cls.teacherId)).size}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Go to Current Month
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {showEditModal && editingClass && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Class</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingClass(null);
                    setEditData({
                      teacherId: '',
                      studentId: '',
                      date: '',
                      time: '',
                      duration: 60,
                      zoomLink: '',
                      notes: ''
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Class Info Display */}
              <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center text-sm text-yellow-800 mb-2">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span className="font-medium">Editing Class ID: {editingClass.id}</span>
                </div>
                <div className="text-xs text-yellow-700">
                  <div>Status: <span className="font-medium">{editingClass.status}</span></div>
                  <div>Created: <span className="font-medium">{new Date(editingClass.createdAt).toLocaleDateString()}</span></div>
                </div>
              </div>

              {/* Timezone Display */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center text-sm text-blue-800">
                  <Globe className="h-4 w-4 mr-2" />
                  <span>
                    Editing in your timezone: <strong>{getTimezoneDisplayName(userTimezone)}</strong>
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Times will be automatically converted to UTC for storage.
                </p>
              </div>

              <form onSubmit={handleUpdateClass} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Teacher *
                  </label>
                  <select 
                    value={editData.teacherId}
                    onChange={(e) => setEditData({ ...editData, teacherId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose a teacher...</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Student *
                  </label>
                  <select 
                    value={editData.studentId}
                    onChange={(e) => setEditData({ ...editData, studentId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose a student...</option>
                    {children.map(child => (
                      <option key={child.id} value={child.id}>{child.name} - {child.level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date * <span className="text-xs text-gray-500">(in your timezone)</span>
                  </label>
                  <input
                    type="date"
                    value={editData.date}
                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time * <span className="text-xs text-gray-500">(in your timezone)</span>
                  </label>
                  <input
                    type="time"
                    value={editData.time}
                    onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {editData.date && editData.time && (
                    <div className="mt-2 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          UTC time: {convertToUTC(editData.date, editData.time).utcTime} on {convertToUTC(editData.date, editData.time).utcDate}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={editData.duration}
                    onChange={(e) => setEditData({ ...editData, duration: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="15"
                    max="180"
                    step="15"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zoom Link
                  </label>
                  <input
                    type="url"
                    value={editData.zoomLink}
                    onChange={(e) => setEditData({ ...editData, zoomLink: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://zoom.us/j/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Any notes about the class..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingClass(null);
                      setEditData({
                        teacherId: '',
                        studentId: '',
                        date: '',
                        time: '',
                        duration: 60,
                        zoomLink: '',
                        notes: ''
                      });
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Class
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Class Modal */}
      {showDeleteModal && deletingClass && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-red-600">Delete Class</h2>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingClass(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Warning Message */}
              <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center text-red-800 mb-2">
                  <Trash2 className="h-5 w-5 mr-2" />
                  <span className="font-medium">Are you sure you want to delete this class?</span>
                </div>
                <p className="text-sm text-red-700">
                  This action cannot be undone. The class will be permanently removed from the system.
                </p>
              </div>

              {/* Class Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Class Details:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Class ID:</span>
                    <span className="font-medium">{deletingClass.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Teacher:</span>
                    <span className="font-medium">
                      {teachers.find(t => t.id === deletingClass.teacherId)?.name || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Student:</span>
                    <span className="font-medium">
                      {children.find(c => c.id === deletingClass.studentId)?.name || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="font-medium">
                      {(() => {
                        const { localDate, localTime } = convertFromUTC(
                          deletingClass.utcDate || deletingClass.date,
                          deletingClass.utcTime || deletingClass.time
                        );
                        return `${localDate} at ${localTime}`;
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      deletingClass.status === 'scheduled' ? 'text-blue-600' :
                      deletingClass.status === 'completed' ? 'text-green-600' :
                      'text-gray-600'
                    }`}>
                      {deletingClass.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingClass(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteClass}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Class
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Class Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Schedule New Class</h2>
                <button
                  onClick={() => {
                    setShowScheduleModal(false);
                    setScheduleData({
                      teacherId: '',
                      studentId: '',
                      date: '',
                      time: '',
                      duration: 60,
                      zoomLink: 'https://zoom.us/j/123456789',
                      notes: ''
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Timezone Display */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center text-sm text-blue-800">
                  <Globe className="h-4 w-4 mr-2" />
                  <span>
                    Scheduling in your timezone: <strong>{getTimezoneDisplayName(userTimezone)}</strong>
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Times will be automatically converted to UTC for storage and displayed in each user's local timezone.
                </p>
              </div>

              <form onSubmit={handleScheduleClass} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Teacher *
                  </label>
                  <select 
                    value={scheduleData.teacherId}
                    onChange={(e) => setScheduleData({ ...scheduleData, teacherId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose a teacher...</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Student *
                  </label>
                  <select 
                    value={scheduleData.studentId}
                    onChange={(e) => setScheduleData({ ...scheduleData, studentId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose a student...</option>
                    {children.map(child => (
                      <option key={child.id} value={child.id}>{child.name} - {child.level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date * <span className="text-xs text-gray-500">(in your timezone)</span>
                  </label>
                  <input
                    type="date"
                    value={scheduleData.date}
                    onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time * <span className="text-xs text-gray-500">(in your timezone)</span>
                  </label>
                  <input
                    type="time"
                    value={scheduleData.time}
                    onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {scheduleData.date && scheduleData.time && (
                    <div className="mt-2 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          UTC time: {convertToUTC(scheduleData.date, scheduleData.time).utcTime} on {convertToUTC(scheduleData.date, scheduleData.time).utcDate}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={scheduleData.duration}
                    onChange={(e) => setScheduleData({ ...scheduleData, duration: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="15"
                    max="180"
                    step="15"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zoom Link
                  </label>
                  <input
                    type="url"
                    value={scheduleData.zoomLink}
                    onChange={(e) => setScheduleData({ ...scheduleData, zoomLink: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://zoom.us/j/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={scheduleData.notes}
                    onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Any notes about the class..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowScheduleModal(false);
                      setScheduleData({
                        teacherId: '',
                        studentId: '',
                        date: '',
                        time: '',
                        duration: 60,
                        zoomLink: 'https://zoom.us/j/123456789',
                        notes: ''
                      });
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Schedule Class
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}