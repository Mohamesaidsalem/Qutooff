import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Plus, Edit, Trash2, X, Calendar, BookOpen, Award, Star, ChevronLeft, ChevronRight, UserPlus, Mail, Phone, Briefcase, CheckCircle, AlertCircle, Eye, User, MapPin, DollarSign, Save, Clock, Globe } from 'lucide-react';
import { ref, push, set, onValue, off, update } from 'firebase/database';
import { database } from '../../firebase/config';
import { useData } from '../../contexts/DataContext';
import { convertToUTC, convertFromUTC, getUserTimezone, getTimezoneDisplayName, getCurrentLocalDateTime } from '../../utils/timezone';

interface Teacher {
  id: string;
  name: string;
  fatherName?: string;
  cnc?: string;
  email: string;
  nationality?: string;
  phone: string;
  altPhone?: string;
  gender?: string;
  status?: string;
  qualification?: string;
  qualification3?: string;
  experience?: string;
  address?: string;
  job?: string;
  zoom?: string;
  groupId?: string;
  hourlyRate: number;
  username?: string;
  password?: string;
  timezone: string;
  difference?: string;
  registrationDate?: string;
  assistant?: string;
  profilePicture?: string;
  documents?: any[];
  specialization: string;
  country: string;
  city: string;
  qualifications?: string;
  bio: string;
  availableDays: string[];
  startTime: string;
  endTime: string;
  students: string[];
  isActive: boolean;
  createdAt: string;
}

export default function AdminTeacherManagement() {
  const navigate = useNavigate();
  const { courses } = useData();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // 🔥 New states for Calendar and Schedule
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [showDeleteClassModal, setShowDeleteClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [deletingClass, setDeletingClass] = useState<any>(null);
  const [userTimezone] = useState(getUserTimezone());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [classes, setClasses] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);

  const teachersPerPage = 10;

  const [teacherForm, setTeacherForm] = useState({
    name: '', 
    fatherName: '',
    cnc: '',
    email: '', 
    nationality: '',
    phone: '', 
    altPhone: '',
    gender: '',
    specialization: '',
    hourlyRate: 15, 
    country: 'Egypt', 
    city: '', 
    timezone: 'Africa/Cairo',
    qualifications: '', 
    experience: '', 
    bio: '', 
    availableDays: [] as string[],
    startTime: '09:00', 
    endTime: '17:00',
    job: 'Zoom Teacher',
    zoom: '',
    groupId: '',
    username: '',
    password: '',
    difference: '',
    assistant: '',
    address: '',
  });
  const [teacherErrors, setTeacherErrors] = useState<any>({});

  // 🔥 Schedule form state
  const [scheduleData, setScheduleData] = useState({
    teacherId: '',
    studentId: '',
    courseId: '',
    date: '',
    time: '',
    duration: 60,
    zoomLink: 'https://zoom.us/j/123456789',
    notes: ''
  });

  // 🔥 Edit class form state
  const [editClassData, setEditClassData] = useState({
    teacherId: '',
    studentId: '',
    courseId: '',
    date: '',
    time: '',
    duration: 60,
    zoomLink: '',
    notes: ''
  });

  const specializations = courses.length > 0 
    ? courses.map(course => course.title || course.name).filter(Boolean)
    : ['Quran Memorization', 'Tajweed & Recitation', 'Islamic Studies'];
  
  const countries = ['Egypt', 'Saudi Arabia', 'UAE', 'Jordan', 'Palestine', 'Morocco', 'Tunisia', 'Algeria', 'Libya', 'Sudan', 'Other'];
  const timezones = [
    { value: 'Africa/Cairo', label: 'Cairo (GMT+2)' },
    { value: 'Asia/Riyadh', label: 'Riyadh (GMT+3)' },
    { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
    { value: 'America/New_York', label: 'New York (GMT-5)' },
    { value: 'Europe/London', label: 'London (GMT+0)' },
  ];
  const weekDays = [
    { id: 'sunday', label: 'Sun' }, { id: 'monday', label: 'Mon' },
    { id: 'tuesday', label: 'Tue' }, { id: 'wednesday', label: 'Wed' },
    { id: 'thursday', label: 'Thu' }, { id: 'friday', label: 'Fri' }, { id: 'saturday', label: 'Sat' }
  ];

  // 🔥 Load all data
  useEffect(() => {
    const teachersRef = ref(database, 'teachers');
    const classesRef = ref(database, 'classes');
    const childrenRef = ref(database, 'children');
    
    const unsubscribeTeachers = onValue(teachersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const teachersArray = Object.keys(data).map(key => ({ 
          id: key, 
          ...data[key] 
        }));
        console.log('✅ Teachers loaded:', teachersArray.length);
        setTeachers(teachersArray);
      } else {
        setTeachers([]);
      }
      setLoading(false);
    });

    const unsubscribeClasses = onValue(classesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const classesArray = Object.keys(data).map(key => ({ 
          id: key, 
          ...data[key] 
        }));
        console.log('✅ Classes loaded:', classesArray.length);
        setClasses(classesArray);
      } else {
        setClasses([]);
      }
    });

    const unsubscribeChildren = onValue(childrenRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const childrenArray = Object.keys(data).map(key => ({ 
          id: key, 
          ...data[key] 
        }));
        console.log('✅ Children loaded:', childrenArray.length);
        setChildren(childrenArray);
      } else {
        setChildren([]);
      }
    });

    return () => {
      off(teachersRef, 'value', unsubscribeTeachers);
      off(classesRef, 'value', unsubscribeClasses);
      off(childrenRef, 'value', unsubscribeChildren);
    };
  }, []);

  // Initialize schedule form with current time
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

  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && teacher.isActive !== false) ||
                           (filterStatus === 'inactive' && teacher.isActive === false);
      return matchesSearch && matchesStatus;
    });
  }, [teachers, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredTeachers.length / teachersPerPage);
  const startIndex = (currentPage - 1) * teachersPerPage;
  const endIndex = startIndex + teachersPerPage;
  const currentTeachers = filteredTeachers.slice(startIndex, endIndex);

  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.isActive !== false).length,
    avgRate: teachers.length > 0 
      ? Math.round(teachers.reduce((acc, t) => acc + (Number(t.hourlyRate) || 0), 0) / teachers.length)
      : 0,
    scheduledClasses: classes.filter(c => c.status === 'scheduled').length,
  };

  // 🔥 Calendar helper functions
  const isDateToday = (utcDate: string, utcTime: string) => {
    const { localDateTime } = convertFromUTC(utcDate, utcTime);
    const today = new Date();
    return localDateTime.toDateString() === today.toDateString();
  };

  const isDatePast = (utcDate: string, utcTime: string) => {
    const { localDateTime } = convertFromUTC(utcDate, utcTime);
    return localDateTime < new Date();
  };

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

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-[120px] bg-gray-50 border border-gray-200"></div>
      );
    }

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

  // 🔥 Teacher form handlers
  const handleTeacherFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTeacherForm(prev => ({ ...prev, [name]: value }));
    if (teacherErrors[name]) setTeacherErrors((prev: any) => ({ ...prev, [name]: '' }));
  };

  const toggleDay = (dayId: string) => {
    setTeacherForm(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(dayId)
        ? prev.availableDays.filter(d => d !== dayId)
        : [...prev.availableDays, dayId]
    }));
  };

  const validateTeacherForm = () => {
    const errors: any = {};
    if (!teacherForm.name.trim()) errors.name = 'Name required';
    if (!teacherForm.email.trim()) errors.email = 'Email required';
    if (!teacherForm.phone.trim()) errors.phone = 'Phone required';
    if (!teacherForm.city.trim()) errors.city = 'City required';
    if (!teacherForm.specialization) errors.specialization = 'Specialization required';
    if (teacherForm.hourlyRate < 5) errors.hourlyRate = 'Min $5';
    if (teacherForm.availableDays.length === 0) errors.availableDays = 'Select days';
    setTeacherErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetTeacherForm = () => {
    setTeacherForm({
      name: '', 
      fatherName: '',
      cnc: '',
      email: '', 
      nationality: '',
      phone: '', 
      altPhone: '',
      gender: '',
      specialization: specializations.length > 0 ? specializations[0] : '',
      hourlyRate: 15, 
      country: 'Egypt', 
      city: '', 
      timezone: 'Africa/Cairo',
      qualifications: '', 
      experience: '', 
      bio: '', 
      availableDays: [],
      startTime: '09:00', 
      endTime: '17:00',
      job: 'Zoom Teacher',
      zoom: '',
      groupId: '',
      username: '',
      password: '',
      difference: '',
      assistant: '',
      address: '',
    });
    setTeacherErrors({});
  };

  const handleAddTeacher = async () => {
    if (validateTeacherForm()) {
      try {
        const teachersRef = ref(database, 'teachers');
        const newTeacherRef = push(teachersRef);
        const newTeacher = {
          ...teacherForm,
          students: [],
          isActive: true,
          createdAt: new Date().toISOString(),
          registrationDate: new Date().toISOString()
        };
        await set(newTeacherRef, newTeacher);
        alert('✅ Teacher added successfully!');
        setShowAddModal(false);
        resetTeacherForm();
      } catch (error) {
        console.error('❌ Error adding teacher:', error);
        alert('❌ Error adding teacher');
      }
    }
  };

  const handleEditTeacher = async () => {
    if (selectedTeacher && validateTeacherForm()) {
      try {
        const teacherRef = ref(database, `teachers/${selectedTeacher.id}`);
        const updates = {
          ...teacherForm,
          updatedAt: new Date().toISOString()
        };
        await update(teacherRef, updates);
        alert('✅ Teacher updated successfully!');
        setShowEditModal(false);
        setSelectedTeacher(null);
        resetTeacherForm();
      } catch (error) {
        console.error('❌ Error updating teacher:', error);
        alert('❌ Error updating teacher');
      }
    }
  };

  const handleDeleteTeacher = async () => {
    if (selectedTeacher) {
      try {
        const teacherRef = ref(database, `teachers/${selectedTeacher.id}`);
        await update(teacherRef, { 
          isActive: false,
          deactivatedAt: new Date().toISOString()
        });
        alert('⚠️ Teacher deactivated!');
        setShowDeleteModal(false);
        setSelectedTeacher(null);
      } catch (error) {
        console.error('❌ Error deactivating teacher:', error);
        alert('❌ Error deactivating teacher');
      }
    }
  };

  const openEditModal = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setTeacherForm({
      name: teacher.name,
      fatherName: teacher.fatherName || '',
      cnc: teacher.cnc || '',
      email: teacher.email,
      nationality: teacher.nationality || '',
      phone: teacher.phone,
      altPhone: teacher.altPhone || '',
      gender: teacher.gender || '',
      specialization: teacher.specialization,
      hourlyRate: teacher.hourlyRate,
      country: teacher.country || 'Egypt',
      city: teacher.city || '',
      timezone: teacher.timezone || 'Africa/Cairo',
      qualifications: teacher.qualifications || '',
      experience: teacher.experience || '',
      bio: teacher.bio || '',
      availableDays: teacher.availableDays || [],
      startTime: teacher.startTime || '09:00',
      endTime: teacher.endTime || '17:00',
      job: teacher.job || 'Zoom Teacher',
      zoom: teacher.zoom || '',
      groupId: teacher.groupId || '',
      username: teacher.username || '',
      password: teacher.password || '',
      difference: teacher.difference || '',
      assistant: teacher.assistant || '',
      address: teacher.address || '',
    });
    setShowEditModal(true);
  };

  // 🔥 Class scheduling handlers
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
    setShowCalendarView(false);
  };

  const handleScheduleClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (scheduleData.teacherId && scheduleData.studentId && scheduleData.date && scheduleData.time && scheduleData.duration) {
      const { utcDate, utcTime, utcDateTime } = convertToUTC(
        scheduleData.date, 
        scheduleData.time, 
        userTimezone
      );

      // Check for conflicts
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
        alert('⚠️ Time conflict detected! Please choose a different time slot.');
        return;
      }

      const teacher = teachers.find(t => t.id === scheduleData.teacherId);
      const student = children.find(c => c.id === scheduleData.studentId);
      const course = courses.find(c => c.id === scheduleData.courseId);

      const adminTime = new Date().toISOString();
      let teacherTime = utcDateTime;
      if (teacher?.timezone) {
        try {
          const { localDate, localTime } = convertFromUTC(utcDate, utcTime, teacher.timezone);
          teacherTime = new Date(`${localDate}T${localTime}:00`).toISOString();
        } catch (error) {
          console.warn('Error converting teacher time:', error);
        }
      }

      let studentTime = utcDateTime;
      if (student?.timezone) {
        try {
          const { localDate, localTime } = convertFromUTC(utcDate, utcTime, student.timezone);
          studentTime = new Date(`${localDate}T${localTime}:00`).toISOString();
        } catch (error) {
          console.warn('Error converting student time:', error);
        }
      }

      const completeClassData = {
        studentId: scheduleData.studentId,
        teacherId: scheduleData.teacherId,
        courseId: scheduleData.courseId || null,
        date: scheduleData.date,
        time: scheduleData.time,
        utcDate,
        utcTime,
        utcDateTime,
        duration: scheduleData.duration,
        status: 'scheduled',
        subject: course?.name || 'Quran Class',
        zoomLink: scheduleData.zoomLink,
        notes: scheduleData.notes,
        timezone: userTimezone,
        createdAt: new Date().toISOString(),
        appointmentDate: utcDate,
        appointmentTime: utcTime,
        adminTime,
        teacherTime,
        studentTime,
        onlineTime: null,
        courseName: course?.name || 'Regular Class',
        history: [`Class scheduled at ${new Date().toLocaleString()} by admin`]
      };

      try {
        // Add to classes
        const classesRef = ref(database, 'classes');
        const newClassRef = push(classesRef);
        await set(newClassRef, completeClassData);

        // Add to daily_classes
        const dailyClassesRef = ref(database, 'daily_classes');
        const newDailyClassRef = push(dailyClassesRef);
        await set(newDailyClassRef, completeClassData);

        console.log('✅ Class scheduled successfully!');
        alert('✅ Class scheduled successfully!');
        
        setScheduleData({
          teacherId: '',
          studentId: '',
          courseId: '',
          date: '',
          time: '',
          duration: 60,
          zoomLink: 'https://zoom.us/j/123456789',
          notes: ''
        });
        setShowScheduleModal(false);
      } catch (error) {
        console.error('❌ Error scheduling class:', error);
        alert('❌ Error scheduling class. Please try again.');
      }
    }
  };

  const handleEditClass = (classItem: any) => {
    const { localDate, localTime } = convertFromUTC(
      classItem.utcDate || classItem.date, 
      classItem.utcTime || classItem.time
    );
    
    setEditingClass(classItem);
    setEditClassData({
      teacherId: classItem.teacherId,
      studentId: classItem.studentId,
      courseId: classItem.courseId || '',
      date: localDate,
      time: localTime,
      duration: classItem.duration,
      zoomLink: classItem.zoomLink || 'https://zoom.us/j/123456789',
      notes: classItem.notes || ''
    });
    setShowEditClassModal(true);
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editClassData.teacherId && editClassData.studentId && editClassData.date && editClassData.time && editClassData.duration && editingClass) {
      const { utcDate, utcTime, utcDateTime } = convertToUTC(
        editClassData.date, 
        editClassData.time, 
        userTimezone
      );

      // Check for conflicts (excluding current class)
      const existingClasses = classes.filter(cls => 
        cls.teacherId === editClassData.teacherId && 
        (cls.utcDate || cls.date) === utcDate &&
        cls.status === 'scheduled' &&
        cls.id !== editingClass.id
      );

      const newStartTime = new Date(`${utcDate}T${utcTime}:00.000Z`);
      const newEndTime = new Date(newStartTime.getTime() + editClassData.duration * 60000);

      const hasConflict = existingClasses.some(cls => {
        const existingStart = new Date(`${cls.utcDate || cls.date}T${cls.utcTime || cls.time}:00.000Z`);
        const existingEnd = new Date(existingStart.getTime() + cls.duration * 60000);
        return (newStartTime < existingEnd && newEndTime > existingStart);
      });

      if (hasConflict) {
        alert('⚠️ Time conflict detected! Please choose a different time slot.');
        return;
      }

      const course = courses.find(c => c.id === editClassData.courseId);

      try {
        const classRef = ref(database, `classes/${editingClass.id}`);
        await update(classRef, {
          studentId: editClassData.studentId,
          teacherId: editClassData.teacherId,
          courseId: editClassData.courseId || null,
          courseName: course?.name || 'Regular Class',
          subject: course?.name || 'Quran Class',
          date: editClassData.date,
          time: editClassData.time,
          utcDate,
          utcTime,
          utcDateTime,
          duration: editClassData.duration,
          zoomLink: editClassData.zoomLink,
          notes: editClassData.notes,
          timezone: userTimezone,
          updatedAt: new Date().toISOString()
        });
        
        alert('✅ Class updated successfully!');
        setShowEditClassModal(false);
        setEditingClass(null);
        setEditClassData({
          teacherId: '',
          studentId: '',
          courseId: '',
          date: '',
          time: '',
          duration: 60,
          zoomLink: '',
          notes: ''
        });
      } catch (error) {
        console.error('❌ Error updating class:', error);
        alert('❌ Error updating class');
      }
    }
  };

  const handleDeleteClass = (classItem: any) => {
    setDeletingClass(classItem);
    setShowDeleteClassModal(true);
  };

  const confirmDeleteClass = async () => {
    if (deletingClass) {
      try {
        const classRef = ref(database, `classes/${deletingClass.id}`);
        await update(classRef, {
          status: 'cancelled',
          cancelledAt: new Date().toISOString()
        });
        alert('✅ Class deleted successfully!');
        setShowDeleteClassModal(false);
        setDeletingClass(null);
      } catch (error) {
        console.error('❌ Error deleting class:', error);
        alert('❌ Error deleting class');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teacher Management</h2>
          <p className="mt-1 text-sm text-gray-600">Manage all teachers, schedules, and classes</p>
          <div className="mt-1 flex items-center text-xs text-blue-600">
            <Globe className="h-3 w-3 mr-1" />
            <span>Your timezone: {getTimezoneDisplayName(userTimezone)}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCalendarView(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Calendar View
          </button>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Schedule Class
          </button>
          <button
            onClick={() => {
              resetTeacherForm();
              setShowAddModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Teacher
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Teachers</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Teachers</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled Classes</p>
              <p className="text-2xl font-bold text-purple-600">{stats.scheduledClasses}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Rate</p>
              <p className="text-2xl font-bold text-amber-600">${stats.avgRate}/hr</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
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
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {currentTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-600">No teachers found</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {searchTerm || filterStatus !== 'all' 
                        ? 'Try adjusting your filters' 
                        : 'Click "Add Teacher" to get started'}
                    </p>
                  </td>
                </tr>
              ) : (
                currentTeachers.map((teacher, index) => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        #{startIndex + index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                          {teacher.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <button
                            onClick={() => navigate(`/admin/teachers/${teacher.id}`)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                          >
                            {teacher.name}
                          </button>
                          <div className="text-sm text-gray-500">{teacher.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {teacher.specialization}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{teacher.city || 'N/A'}, {teacher.country || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{teacher.timezone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">${teacher.hourlyRate || 0}/hr</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        teacher.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {teacher.isActive !== false ? '✓ Active' : '✗ Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setShowViewModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(teacher)}
                          className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredTeachers.length)} of {filteredTeachers.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded border hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="px-3 py-1">{currentPage} / {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded border hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🔥 Calendar View Modal */}
      {showCalendarView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-xl max-w-7xl w-full mx-auto max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Teacher Schedule Calendar</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    All times in your timezone: {getTimezoneDisplayName(userTimezone)}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleAddClassFromCalendar()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Class
                  </button>
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-gray-200 rounded-lg"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
                    {getMonthName(currentDate)}
                  </h3>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-gray-200 rounded-lg"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setShowCalendarView(false)}
                    className="p-2 hover:bg-gray-200 rounded-lg ml-4"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-auto max-h-[calc(90vh-200px)]">
              <div className="p-6">
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                    <div key={day} className="p-3 text-center font-semibold text-gray-700 bg-gray-100 rounded-t-lg">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar()}
                </div>
              </div>
            </div>

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

      {/* 🔥 Schedule Class Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Schedule New Class</h2>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center text-sm text-blue-800">
                  <Globe className="h-4 w-4 mr-2" />
                  <span>Timezone: <strong>{getTimezoneDisplayName(userTimezone)}</strong></span>
                </div>
              </div>

              <form onSubmit={handleScheduleClass} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teacher *</label>
                  <select 
                    value={scheduleData.teacherId}
                    onChange={(e) => setScheduleData({ ...scheduleData, teacherId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose a teacher...</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student *</label>
                  <select 
                    value={scheduleData.studentId}
                    onChange={(e) => setScheduleData({ ...scheduleData, studentId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose a student...</option>
                    {children.map(child => (
                      <option key={child.id} value={child.id}>{child.name} - {child.level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course (Optional)</label>
                  <select 
                    value={scheduleData.courseId}
                    onChange={(e) => setScheduleData({ ...scheduleData, courseId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No specific course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name} - {course.level || 'All Levels'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={scheduleData.date}
                    onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                  <input
                    type="time"
                    value={scheduleData.time}
                    onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes) *</label>
                  <input
                    type="number"
                    value={scheduleData.duration}
                    onChange={(e) => setScheduleData({ ...scheduleData, duration: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    min="15"
                    max="180"
                    step="15"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zoom Link</label>
                  <input
                    type="url"
                    value={scheduleData.zoomLink}
                    onChange={(e) => setScheduleData({ ...scheduleData, zoomLink: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="https://zoom.us/j/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={scheduleData.notes}
                    onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    Schedule Class
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 Edit Class Modal */}
      {showEditClassModal && editingClass && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Class</h2>
                <button
                  onClick={() => {
                    setShowEditClassModal(false);
                    setEditingClass(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateClass} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teacher *</label>
                  <select 
                    value={editClassData.teacherId}
                    onChange={(e) => setEditClassData({ ...editClassData, teacherId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose a teacher...</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student *</label>
                  <select 
                    value={editClassData.studentId}
                    onChange={(e) => setEditClassData({ ...editClassData, studentId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose a student...</option>
                    {children.map(child => (
                      <option key={child.id} value={child.id}>{child.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course (Optional)</label>
                  <select 
                    value={editClassData.courseId}
                    onChange={(e) => setEditClassData({ ...editClassData, courseId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No specific course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={editClassData.date}
                    onChange={(e) => setEditClassData({ ...editClassData, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                  <input
                    type="time"
                    value={editClassData.time}
                    onChange={(e) => setEditClassData({ ...editClassData, time: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
                  <input
                    type="number"
                    value={editClassData.duration}
                    onChange={(e) => setEditClassData({ ...editClassData, duration: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    min="15"
                    max="180"
                    step="15"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditClassModal(false);
                      setEditingClass(null);
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    Update Class
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 Delete Class Modal */}
      {showDeleteClassModal && deletingClass && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-red-600">Delete Class</h2>
                <button
                  onClick={() => {
                    setShowDeleteClassModal(false);
                    setDeletingClass(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-700">
                  Are you sure you want to delete this class? This action cannot be undone.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteClassModal(false);
                    setDeletingClass(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteClass}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Teacher Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{showAddModal ? 'Add New Teacher' : 'Edit Teacher'}</h2>
                <button onClick={() => {
                  showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                  resetTeacherForm();
                  setSelectedTeacher(null);
                }} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <User className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold">Personal Information</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={teacherForm.name}
                      onChange={handleTeacherFormChange}
                      className={`w-full px-3 py-2 border rounded-lg ${teacherErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {teacherErrors.name && <p className="text-xs text-red-600 mt-1">{teacherErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Father Name</label>
                    <input
                      type="text"
                      name="fatherName"
                      value={teacherForm.fatherName}
                      onChange={handleTeacherFormChange}
                      className="w-full px-3 py-2 border rounded-lg border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={teacherForm.email}
                      onChange={handleTeacherFormChange}
                      className={`w-full px-3 py-2 border rounded-lg ${teacherErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {teacherErrors.email && <p className="text-xs text-red-600 mt-1">{teacherErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={teacherForm.phone}
                      onChange={handleTeacherFormChange}
                      className={`w-full px-3 py-2 border rounded-lg ${teacherErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {teacherErrors.phone && <p className="text-xs text-red-600 mt-1">{teacherErrors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Alt Phone</label>
                    <input
                      type="tel"
                      name="altPhone"
                      value={teacherForm.altPhone}
                      onChange={handleTeacherFormChange}
                      className="w-full px-3 py-2 border rounded-lg border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select
                      name="gender"
                      value={teacherForm.gender}
                      onChange={handleTeacherFormChange}
                      className="w-full px-3 py-2 border rounded-lg border-gray-300"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Specialization *</label>
                    <select 
                      name="specialization" 
                      value={teacherForm.specialization} 
                      onChange={handleTeacherFormChange} 
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Select Specialization</option>
                      {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">CNC</label>
                    <input
                      type="text"
                      name="cnc"
                      value={teacherForm.cnc}
                      onChange={handleTeacherFormChange}
                      className="w-full px-3 py-2 border rounded-lg border-gray-300"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <MapPin className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-semibold">Location & Payment</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <select name="country" value={teacherForm.country} onChange={handleTeacherFormChange} className="w-full px-3 py-2 border rounded-lg">
                      {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City *</label>
                    <input type="text" name="city" value={teacherForm.city} onChange={handleTeacherFormChange} className={`w-full px-3 py-2 border rounded-lg ${teacherErrors.city ? 'border-red-500' : 'border-gray-300'}`} />
                    {teacherErrors.city && <p className="text-xs text-red-600 mt-1">{teacherErrors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nationality</label>
                    <input
                      type="text"
                      name="nationality"
                      value={teacherForm.nationality}
                      onChange={handleTeacherFormChange}
                      className="w-full px-3 py-2 border rounded-lg border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Timezone</label>
                    <select name="timezone" value={teacherForm.timezone} onChange={handleTeacherFormChange} className="w-full px-3 py-2 border rounded-lg">
                      {timezones.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Hourly Rate (USD) *</label>
                    <input type="number" name="hourlyRate" value={teacherForm.hourlyRate} onChange={handleTeacherFormChange} min="5" className={`w-full px-3 py-2 border rounded-lg ${teacherErrors.hourlyRate ? 'border-red-500' : 'border-gray-300'}`} />
                    {teacherErrors.hourlyRate && <p className="text-xs text-red-600 mt-1">{teacherErrors.hourlyRate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={teacherForm.address}
                      onChange={handleTeacherFormChange}
                      className="w-full px-3 py-2 border rounded-lg border-gray-300"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <Briefcase className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="font-semibold">Official Details</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Job Title</label>
                    <input
                      type="text"
                      name="job"
                      value={teacherForm.job}
                      onChange={handleTeacherFormChange}
                      className="w-full px-3 py-2 border rounded-lg border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Zoom Link</label>
                    <input
                      type="url"
                      name="zoom"
                      value={teacherForm.zoom}
                      onChange={handleTeacherFormChange}
                      className="w-full px-3 py-2 border rounded-lg border-gray-300"
                      placeholder="https://zoom.us/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Group ID</label>
                    <input
                      type="text"
                      name="groupId"
                      value={teacherForm.groupId}
                      onChange={handleTeacherFormChange}
                      className="w-full px-3 py-2 border rounded-lg border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={teacherForm.username}
                      onChange={handleTeacherFormChange}
                      className="w-full px-3 py-2 border rounded-lg border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={teacherForm.password}
                      onChange={handleTeacherFormChange}
                      className="w-full px-3 py-2 border rounded-lg border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Assistant</label>
                    <input
                      type="text"
                      name="assistant"
                      value={teacherForm.assistant}
                      onChange={handleTeacherFormChange}
                      className="w-full px-3 py-2 border rounded-lg border-gray-300"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="font-semibold">Availability</h3>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Available Days *</label>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                    {weekDays.map(day => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay(day.id)}
                        className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          teacherForm.availableDays.includes(day.id)
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  {teacherErrors.availableDays && <p className="text-xs text-red-600 mt-1">{teacherErrors.availableDays}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Time</label>
                    <input type="time" name="startTime" value={teacherForm.startTime} onChange={handleTeacherFormChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Time</label>
                    <input type="time" name="endTime" value={teacherForm.endTime} onChange={handleTeacherFormChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-4">Additional Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Qualifications</label>
                    <textarea name="qualifications" value={teacherForm.qualifications} onChange={handleTeacherFormChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Experience</label>
                    <textarea name="experience" value={teacherForm.experience} onChange={handleTeacherFormChange} rows={2} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Biography</label>
                    <textarea name="bio" value={teacherForm.bio} onChange={handleTeacherFormChange} rows={3} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
              <button onClick={() => {
                showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                resetTeacherForm();
                setSelectedTeacher(null);
              }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                Cancel
              </button>
              <button onClick={showAddModal ? handleAddTeacher : handleEditTeacher} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                <Save className="h-4 w-4 mr-2" />
                {showAddModal ? 'Add Teacher' : 'Update Teacher'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Teacher Modal */}
      {showViewModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">Teacher Details</h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedTeacher(null);
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-3xl">
                  {selectedTeacher.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900">{selectedTeacher.name}</h4>
                  <p className="text-gray-600">{selectedTeacher.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {selectedTeacher.specialization}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedTeacher.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedTeacher.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl text-center">
                  <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">${selectedTeacher.hourlyRate}</p>
                  <p className="text-sm text-gray-600">Per Hour</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl text-center">
                  <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-gray-900">{selectedTeacher.city}</p>
                  <p className="text-sm text-gray-600">{selectedTeacher.country}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl text-center">
                  <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-gray-900">{selectedTeacher.availableDays.length}</p>
                  <p className="text-sm text-gray-600">Days Available</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                <h5 className="font-bold text-gray-900 mb-3">Contact & Details</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold text-gray-900">{selectedTeacher.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-semibold text-gray-900">{selectedTeacher.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Timezone:</span>
                    <span className="font-semibold text-gray-900">{selectedTeacher.timezone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Hours:</span>
                    <span className="font-semibold text-gray-900">{selectedTeacher.startTime} - {selectedTeacher.endTime}</span>
                  </div>
                </div>
              </div>

              {selectedTeacher.availableDays.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-xl">
                  <h5 className="font-bold text-gray-900 mb-2">Available Days</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeacher.availableDays.map(day => (
                      <span key={day} className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm capitalize">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedTeacher.qualifications && (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h5 className="font-bold text-gray-900 mb-2">Qualifications</h5>
                  <p className="text-gray-700">{selectedTeacher.qualifications}</p>
                </div>
              )}

              {selectedTeacher.experience && (
                <div className="bg-green-50 p-4 rounded-xl">
                  <h5 className="font-bold text-gray-900 mb-2">Experience</h5>
                  <p className="text-gray-700">{selectedTeacher.experience}</p>
                </div>
              )}

              {selectedTeacher.bio && (
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <h5 className="font-bold text-gray-900 mb-2">Biography</h5>
                  <p className="text-gray-700">{selectedTeacher.bio}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/admin/teachers/${selectedTeacher.id}`)}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  View Full Profile
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedTeacher(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Teacher Modal */}
      {showDeleteModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">Deactivate Teacher</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTeacher(null);
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center text-red-800 mb-2">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">Are you sure?</span>
                </div>
                <p className="text-sm text-red-700">
                  This will deactivate {selectedTeacher.name}'s account.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedTeacher(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTeacher}
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}