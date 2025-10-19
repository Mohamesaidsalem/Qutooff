import React, { useState, useEffect, useRef } from 'react';
import { Users, BookOpen, DollarSign, TrendingUp, Calendar as CalendarIcon, BarChart, Home, Settings, UserPlus, GraduationCap, CreditCard, CheckCircle, Clock, ClipboardList, ChevronDown, Globe, Briefcase, Calendar, Menu, X, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { ref, onValue, off, push, set, update, remove } from 'firebase/database';
import { database } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useData, Teacher } from '../../contexts/DataContext'; 

import UserManagement from '../admin/UserManagement';
import CourseManagement from '../admin/CourseManagement';
import SubscriptionManagement from '../admin/SubscriptionManagement';
import TeacherScheduleManagement from '../admin/TeacherScheduleManagement';
import DailyClassesManagement from '../admin/DailyClassesManagement';
import InitializeDatabaseButton from '../admin/InitializeDatabaseButton';
import AdminTeacherManagement from '../admin/AdminTeacherManagement';
import TeacherStudents from '../teacher/TeacherStudents';
import AnalyticsDashboard from '../admin/AnalyticsDashboard';

const tabs = [
    { id: 'overview', name: 'Dashboard Overview', icon: Home, shortName: 'Overview' },
    { id: 'daily-classes', name: 'Daily Classes', icon: ClipboardList, shortName: 'Classes' },
    { id: 'users', name: 'User Management', icon: UserPlus, shortName: 'Users' },
    { id: 'teachers', name: 'Teacher Schedules', icon: GraduationCap, shortName: 'Schedules' },
    { id: 'courses', name: 'Course Management', icon: BookOpen, shortName: 'Courses' },
    { id: 'subscriptions', name: 'Subscriptions & Payments', icon: CreditCard, shortName: 'Payments' },
    { id: 'analytics', name: 'Analytics', icon: BarChart, shortName: 'Analytics' },
    { id: 'settings', name: 'Settings', icon: Settings, shortName: 'Settings' },
    { id: 'teacher-management', name: 'Teacher Management', icon: Users, shortName: 'Teachers' },
    { id: 'teacher-students', name: 'View Teacher Students', icon: Users, shortName: 'Students' }
];

const optionsMenuItems = [
    { label: 'Add New Employee', icon: UserPlus },
    { label: 'Add New Family', icon: Users },
    { label: 'Add New Country', icon: Globe },
    { label: 'Add New Task', icon: ClipboardList },
    { label: 'Add New Vendor', icon: Briefcase },
    { label: 'Add New Year', icon: Calendar },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  
  const [children, setChildren] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [dailyClasses, setDailyClasses] = useState<any[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowOptionsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    console.log('🔥 AdminDashboard - Loading Firebase data...');

    const childrenRef = ref(database, 'children');
    const teachersRef = ref(database, 'teachers');
    const classesRef = ref(database, 'classes');
    const coursesRef = ref(database, 'courses');
    const dailyClassesRef = ref(database, 'daily_classes');

    const unsubChildren = onValue(childrenRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const arr = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setChildren(arr.filter(child => child.isActive !== false));
        console.log('✅ Children loaded:', arr.length);
      } else {
        setChildren([]);
      }
    });

    const unsubTeachers = onValue(teachersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const arr = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        const activeTeachers = arr.filter(t => t.isActive !== false);
        setTeachers(activeTeachers);
        console.log('✅ Teachers loaded:', activeTeachers.length);
      } else {
        setTeachers([]);
      }
    });

    const unsubClasses = onValue(classesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const arr = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setClasses(arr);
        console.log('✅ Classes loaded:', arr.length);
      } else {
        setClasses([]);
      }
    });

    const unsubCourses = onValue(coursesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const arr = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setCourses(arr);
        console.log('✅ Courses loaded:', arr.length);
      } else {
        setCourses([]);
      }
    });

    const unsubDailyClasses = onValue(dailyClassesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const arr = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setDailyClasses(arr);
        console.log('✅ Daily Classes loaded:', arr.length);
      } else {
        setDailyClasses([]);
      }
      setLoading(false);
    });

    return () => {
      off(childrenRef, 'value', unsubChildren);
      off(teachersRef, 'value', unsubTeachers);
      off(classesRef, 'value', unsubClasses);
      off(coursesRef, 'value', unsubCourses);
      off(dailyClassesRef, 'value', unsubDailyClasses);
    };
  }, [user]);

  const handleScheduleClass = async (classData: any) => {
    try {
      const classesRef = ref(database, 'classes');
      const newClassRef = push(classesRef);
      await set(newClassRef, {
        ...classData,
        createdAt: new Date().toISOString()
      });

      if (classData.studentId && classData.teacherId) {
        const teacher = teachers.find(t => t.id === classData.teacherId);
        const childRef = ref(database, `children/${classData.studentId}`);
        await update(childRef, {
          teacherId: classData.teacherId,
          teacherName: teacher?.name || '',
          updatedAt: new Date().toISOString()
        });
      }

      const dailyClassesRef = ref(database, 'daily_classes');
      const newDailyClassRef = push(dailyClassesRef);
      await set(newDailyClassRef, {
        ...classData,
        status: 'scheduled',
        history: [`Class scheduled at ${new Date().toLocaleString()}`],
        createdAt: new Date().toISOString()
      });

      alert('Class scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling class:', error);
      alert('Error scheduling class. Please try again.');
    }
  };
  
  const handleUpdateClass = async (classId: string, updates: any) => {
    try {
      const classRef = ref(database, `classes/${classId}`);
      await update(classRef, { ...updates, updatedAt: new Date().toISOString() });
      const dailyClassRef = ref(database, `daily_classes/${classId}`);
      await update(dailyClassRef, { ...updates, updatedAt: new Date().toISOString() });
    } catch (error) {
      console.error('Error updating class:', error);
    }
  };
  
  const handleDeleteClass = async (classId: string) => {
    try {
      const classRef = ref(database, `classes/${classId}`);
      await remove(classRef);
      const dailyClassRef = ref(database, `daily_classes/${classId}`);
      await remove(dailyClassRef);
      alert('Class deleted successfully!');
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Error deleting class. Please try again.');
    }
  };
  
  const calculateEnhancedStats = () => {
    const today = new Date().toISOString().split('T')[0];
    return {
      totalStudents: children.length,
      activeTeachers: teachers.length,
      totalRevenue: children.length * 60,
      classesThisMonth: classes.length,
      todayClasses: dailyClasses.filter(cls => cls.appointmentDate === today).length,
      taken: dailyClasses.filter(cls => cls.status === 'taken').length,
      remaining: dailyClasses.filter(cls => cls.status === 'scheduled').length,
      running: dailyClasses.filter(cls => cls.status === 'running').length,
      absent: dailyClasses.filter(cls => cls.status === 'absent').length,
      rescheduled: dailyClasses.filter(cls => cls.status === 'rescheduled').length,
      totalClasses: dailyClasses.length
    };
  };

  const enhancedStats = calculateEnhancedStats();

  const stats = [
    { name: 'Total Students', value: enhancedStats.totalStudents.toString(), icon: Users, color: 'bg-blue-500', change: '+12%' },
    { name: 'Active Teachers', value: enhancedStats.activeTeachers.toString(), icon: BookOpen, color: 'bg-green-500', change: '+2' },
    { name: 'Monthly Revenue', value: `$${enhancedStats.totalRevenue}`, icon: DollarSign, color: 'bg-emerald-500', change: '+18%' },
    { name: 'Classes this Month', value: enhancedStats.classesThisMonth.toString(), icon: CalendarIcon, color: 'bg-purple-500', change: '+24%' },
  ];

  const dailyStats = [
    { name: "Today's Classes", value: enhancedStats.todayClasses, color: 'bg-indigo-500' },
    { name: 'Completed', value: enhancedStats.taken, color: 'bg-green-500' },
    { name: 'Running Now', value: enhancedStats.running, color: 'bg-blue-500' },
    { name: 'Remaining', value: enhancedStats.remaining, color: 'bg-yellow-500' },
    { name: 'Absent', value: enhancedStats.absent, color: 'bg-red-500' },
    { name: 'Rescheduled', value: enhancedStats.rescheduled, color: 'bg-purple-500' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const activeTabName = tabs.find(tab => tab.id === activeTab)?.name || 'Dashboard';
  const sidebarWidthClass = isSidebarCollapsed ? 'w-16 sm:w-20' : 'w-64 sm:w-72';

  return (
    <div className="min-h-screen flex bg-gray-50 sm:bg-gray-100">
      {/* Sidebar - Responsive */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-all duration-300 ease-in-out z-30 ${sidebarWidthClass} bg-white border-r border-gray-200 flex flex-col shadow-xl`}>
        {/* Sidebar Header */}
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 h-14 sm:h-16 border-b border-blue-200`}>
          {!isSidebarCollapsed && (
            <h2 className="text-lg sm:text-xl font-bold text-blue-600 whitespace-nowrap truncate">
              Qutooff
            </h2>
          )}
          {isSidebarCollapsed && <Home className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
          <button 
            className="lg:hidden text-gray-400 hover:text-gray-600 p-1" 
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
        
        {/* Sidebar Navigation */}
        <nav className="flex-1 px-1 sm:px-2 py-2 sm:py-4 space-y-0.5 sm:space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          {tabs.map((tab) => (
            <a
              key={tab.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(tab.id);
                setIsSidebarOpen(false);
              }}
              className={`flex items-center px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg transition-all group relative ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md scale-105'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:scale-102'
              } ${isSidebarCollapsed ? 'justify-center' : 'justify-start'}`}
            >
              <tab.icon className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${isSidebarCollapsed ? 'mr-0' : 'mr-2 sm:mr-3'} transition-colors ${activeTab === tab.id ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`} />
              {!isSidebarCollapsed && (
                <span className="whitespace-nowrap truncate hidden sm:inline">
                  {tab.name}
                </span>
              )}
              {!isSidebarCollapsed && (
                <span className="whitespace-nowrap truncate sm:hidden">
                  {tab.shortName}
                </span>
              )}
              {isSidebarCollapsed && (
                <span className="absolute left-full ml-2 sm:ml-3 px-2 sm:px-3 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-40">
                  {tab.name}
                </span>
              )}
            </a>
          ))}
        </nav>

        {/* Sidebar Footer - Collapse Button */}
        <div className="p-2 sm:p-4 border-t border-gray-200 hidden lg:block">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            className="w-full flex items-center justify-center p-2 text-gray-600 hover:bg-gray-200 hover:text-blue-600 rounded-lg transition-colors text-xs sm:text-sm"
          >
            {isSidebarCollapsed ? (
              <ChevronsRight className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <>
                <ChevronsLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="hidden sm:inline">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out min-w-0">
        {/* Header - Responsive */}
        <header className="bg-white shadow-sm border-b z-20 sticky top-0">
          <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 flex justify-between items-center gap-2 sm:gap-4">
            <div className="flex items-center min-w-0 flex-1">
              {/* Desktop Collapse Button */}
              <button 
                className="hidden lg:block text-gray-500 hover:text-blue-600 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0" 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              >
                {isSidebarCollapsed ? (
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <ChevronsLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </button>
              {/* Mobile Menu Button */}
              <button 
                className="lg:hidden text-gray-500 hover:text-gray-900 mr-2 sm:mr-4 flex-shrink-0" 
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 ml-1 sm:ml-2 truncate">
                {activeTabName}
              </h1>
            </div>
            
            {/* Options Dropdown - Responsive */}
            <div className="relative flex-shrink-0" ref={dropdownRef}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowOptionsDropdown(!showOptionsDropdown);
                }}
                className={`py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm font-medium flex items-center rounded-lg transition-colors border border-gray-300 ${
                  showOptionsDropdown ? 'bg-blue-50 text-blue-600 border-blue-400' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                type="button"
              >
                <span className="hidden sm:inline">Options</span>
                <span className="sm:hidden">⚙️</span>
                <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 ml-0.5 sm:ml-1 transition-transform ${showOptionsDropdown ? 'rotate-180 text-blue-600' : ''}`} />
              </button>

              {showOptionsDropdown && (
                <>
                  <div className="fixed inset-0 z-[998]" onClick={() => setShowOptionsDropdown(false)}></div>
                  <div className="absolute top-full right-0 mt-2 w-56 sm:w-64 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-[999]">
                    <div className="px-3 sm:px-4 py-2 border-b border-gray-100 mb-1">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase">Add Options</h3>
                    </div>
                    {optionsMenuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowOptionsDropdown(false);
                          console.log(`Clicked: ${item.label}`);
                        }}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center transition-colors group"
                        type="button"
                      >
                        <item.icon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                        <span className="group-hover:font-medium truncate">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content - Responsive */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Stats Grid - Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {stats.map((item) => (
                  <div key={item.name} className="bg-white overflow-hidden shadow-md rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="p-4 sm:p-5 lg:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`p-2 sm:p-3 rounded-xl ${item.color}`}>
                            <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                        </div>
                        <div className="ml-3 sm:ml-4 lg:ml-5 w-0 flex-1 min-w-0">
                          <dl>
                            <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                            <dd className="flex items-baseline flex-wrap gap-1">
                              <div className="text-xl sm:text-2xl font-semibold text-gray-900">{item.value}</div>
                              <div className="flex items-baseline text-xs sm:text-sm font-semibold text-green-600">
                                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 self-center text-green-500" />
                                <span className="ml-0.5 sm:ml-1">{item.change}</span>
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Daily Classes Summary - Responsive */}
              <div className="bg-white rounded-xl shadow-md border p-4 sm:p-5 lg:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Daily Classes Summary</h3>
                  <button 
                    onClick={() => setActiveTab('daily-classes')} 
                    className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
                  >
                    View Details →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                  {dailyStats.map((stat) => (
                    <div key={stat.name} className="text-center">
                      <div className={`p-2 sm:p-3 rounded-xl ${stat.color} text-white mx-auto w-fit mb-2`}>
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                      </div>
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs sm:text-sm text-gray-500 truncate">{stat.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions - Responsive */}
              <div className="bg-white rounded-xl shadow-md border p-4 sm:p-5 lg:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  <button onClick={() => setActiveTab('daily-classes')} className="flex flex-col items-center p-3 sm:p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
                    <ClipboardList className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-indigo-600 mb-2" />
                    <span className="text-xs sm:text-sm font-medium text-indigo-900 text-center">Daily Classes</span>
                  </button>
                  <button onClick={() => setActiveTab('users')} className="flex flex-col items-center p-3 sm:p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                    <UserPlus className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600 mb-2" />
                    <span className="text-xs sm:text-sm font-medium text-blue-900 text-center">Create Account</span>
                  </button>
                  <button onClick={() => setActiveTab('teachers')} className="flex flex-col items-center p-3 sm:p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                    <GraduationCap className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-green-600 mb-2" />
                    <span className="text-xs sm:text-sm font-medium text-green-900 text-center">Manage Teachers</span>
                  </button>
                  <button onClick={() => setActiveTab('courses')} className="flex flex-col items-center p-3 sm:p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                    <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-purple-600 mb-2" />
                    <span className="text-xs sm:text-sm font-medium text-purple-900 text-center">Create Course</span>
                  </button>
                  <button onClick={() => setActiveTab('subscriptions')} className="flex flex-col items-center p-3 sm:p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors col-span-2 sm:col-span-1">
                    <CreditCard className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-emerald-600 mb-2" />
                    <span className="text-xs sm:text-sm font-medium text-emerald-900 text-center">View Payments</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'daily-classes' && (
            <DailyClassesManagement 
              teachers={teachers}
              children={children}
              classes={dailyClasses}
              onUpdateClass={handleUpdateClass}
            />
          )}
          
          {activeTab === 'teacher-management' && <AdminTeacherManagement />} 
          
          {activeTab === 'users' && <UserManagement />}
          
          {activeTab === 'teachers' && (
            <TeacherScheduleManagement 
              teachers={teachers}
              children={children}
              classes={classes}
              onScheduleClass={handleScheduleClass}
              onUpdateClass={handleUpdateClass}
              onDeleteClass={handleDeleteClass}
            />
          )}

          {activeTab === 'courses' && <CourseManagement />}

          {activeTab === 'subscriptions' && (
            <SubscriptionManagement 
              children={children}
              courses={courses}
            />
          )}
          
          {/* Teacher Students View - Responsive */}
          {activeTab === 'teacher-students' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
                View Teacher Students
              </h2>
              
              {/* Teacher Selector - Responsive */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl shadow-md border border-gray-200">
                <label className="text-gray-700 font-medium whitespace-nowrap text-sm sm:text-base">
                  Select Teacher:
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  disabled={loading}
                >
                  <option value="" disabled>--- Choose a Teacher ---</option>
                  {teachers.map((teacher: Teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Teacher Students Content */}
              {selectedTeacherId ? (
                <TeacherStudents teacherId={selectedTeacherId} />
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10 text-center border-2 border-dashed border-gray-300">
                  <Users className='h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4'/>
                  <p className='text-sm sm:text-base lg:text-lg font-medium text-gray-600'>
                    Please select a teacher from the dropdown above to view their student list and performance.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Analytics Dashboard */}
          {activeTab === 'analytics' && <AnalyticsDashboard />}

          {/* Settings - Responsive */}
          {activeTab === 'settings' && (
            <div className="space-y-4 sm:space-y-6">
              <InitializeDatabaseButton />
              <div className="bg-white rounded-lg shadow-sm border p-6 sm:p-8 text-center">
                <Settings className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">System Settings</h3>
                <p className="text-sm sm:text-base text-gray-500">Configuration and system settings coming soon...</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}