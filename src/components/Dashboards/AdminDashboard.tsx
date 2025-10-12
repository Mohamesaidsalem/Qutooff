import React, { useState, useEffect, useRef } from 'react';
import { Users, BookOpen, DollarSign, TrendingUp, Calendar as CalendarIcon, BarChart, Home, Settings, UserPlus, GraduationCap, CreditCard, CheckCircle, Clock, ClipboardList, ChevronDown, Globe, Briefcase, Calendar, Menu, X, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { ref, onValue, off, push, set, update, remove } from 'firebase/database';
import { database } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import InvoiceDetailsModal from '../Modals/Invoice Section/InvoiceDetailsModal';

// Import Initialize Database Button


// Import the separated components
import UserManagement from '../admin/UserManagement';
import CourseManagement from '../admin/CourseManagement';
import SubscriptionManagement from '../admin/SubscriptionManagement';
import TeacherScheduleManagement from '../admin/TeacherScheduleManagement';
import DailyClassesManagement from '../admin/DailyClassesManagement';
import InitializeDatabaseButton from '../admin/InitializeDatabaseButton';

// تحديد الأقسام الإدارية
const tabs = [
    { id: 'overview', name: 'Dashboard Overview', icon: Home },
    { id: 'daily-classes', name: 'Daily Classes', icon: ClipboardList },
    { id: 'users', name: 'User Management', icon: UserPlus },
    { id: 'teachers', name: 'Teacher Schedules', icon: GraduationCap },
    { id: 'courses', name: 'Course Management', icon: BookOpen },
    { id: 'subscriptions', name: 'Subscriptions & Payments', icon: CreditCard },
    { id: 'analytics', name: 'Analytics', icon: BarChart },
    { id: 'settings', name: 'Settings', icon: Settings },
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
  
  // Firebase data states
  const [children, setChildren] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  // منطق إغلاق القائمة المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowOptionsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // منطق جلب بيانات Firebase
  useEffect(() => {
    if (!user) return;
    setLoading(false); 
  }, [user]);

  // منطق التعامل مع Classes و Stats
  const handleScheduleClass = async (classData: any) => {
    // Implementation
  };
  
  const handleUpdateClass = async (classId: string, updates: any) => {
    // Implementation
  };
  
  const handleDeleteClass = async (classId: string) => {
    // Implementation
  };
  
  const calculateEnhancedStats = () => {
    return {
        totalStudents: children.length, 
        activeTeachers: teachers.length, 
        totalRevenue: children.length * 60, 
        classesThisMonth: classes.length, 
        todayClasses: 0,
        taken: 0, 
        remaining: 0, 
        running: 0, 
        absent: 0, 
        rescheduled: 0, 
        totalClasses: classes.length
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // إيجاد اسم التبويب النشط للعرض في الـ Header
  const activeTabName = tabs.find(tab => tab.id === activeTab)?.name || 'Dashboard';

  // تحديد عرض القائمة الجانبية وتأثير الانتقال
  const sidebarWidthClass = isSidebarCollapsed ? 'w-20' : 'w-64';

  return (
    <div className="min-h-screen flex bg-gray-100"> 
      
      {/* Sidebar (القائمة الجانبية) */}
      <div 
        className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-all duration-300 ease-in-out z-30 ${sidebarWidthClass} bg-white border-r border-gray-200 flex flex-col shadow-xl`}
      >
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} p-4 bg-gray-50 h-16 border-b border-gray-200`}>
          {!isSidebarCollapsed && <h2 className="text-xl font-bold text-blue-600 whitespace-nowrap">Qutooff</h2>}
          {isSidebarCollapsed && <Home className="h-6 w-6 text-blue-600" />}

          {/* زر إغلاق القائمة في وضع الجوال */}
          <button className="lg:hidden text-gray-400 hover:text-gray-600" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {tabs.map((tab) => (
            <a
              key={tab.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(tab.id);
                setIsSidebarOpen(false); 
              }}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group relative ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              } ${isSidebarCollapsed ? 'justify-center' : 'justify-start'}`}
            >
              <tab.icon 
                className={`h-5 w-5 ${isSidebarCollapsed ? 'mr-0' : 'mr-3'} transition-colors ${
                  activeTab === tab.id ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
                }`} 
              />
              
              {!isSidebarCollapsed && <span className="whitespace-nowrap">{tab.name}</span>}

              {isSidebarCollapsed && (
                <span className="absolute left-full ml-3 px-3 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-40">
                    {tab.name}
                </span>
              )}
            </a>
          ))}
        </nav>

        {/* زر الطي/الفتح في أسفل القائمة */}
        <div className="p-4 border-t border-gray-200 hidden lg:block">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 text-gray-600 hover:bg-gray-200 hover:text-blue-600 rounded-lg transition-colors"
          >
            {isSidebarCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5 mr-2" />}
            {!isSidebarCollapsed && <span className="text-sm">Collapse Sidebar</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area (منطقة المحتوى الرئيسية) */}
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
        {/* Header (الشريط العلوي) */}
        <header className="bg-white shadow-sm border-b z-20">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            
            <div className="flex items-center">
                {/* زر التبديل في أقصى اليسار */}
                <button 
                    className="hidden lg:block text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition-colors" 
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                >
                    {isSidebarCollapsed ? <Menu className="h-6 w-6" /> : <ChevronsLeft className="h-6 w-6" />}
                </button>
                {/* زر فتح القائمة في الجوال */}
                <button 
                    className="lg:hidden text-gray-500 hover:text-gray-900 mr-4" 
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <Menu className="h-6 w-6" />
                </button>
                
                {/* اسم التبويب النشط */}
                <h1 className="text-xl font-bold text-gray-900 ml-2">{activeTabName}</h1>
            </div>
            
            {/* Options Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowOptionsDropdown(!showOptionsDropdown);
                }}
                className={`py-2 px-3 text-sm font-medium flex items-center rounded-lg transition-colors border border-gray-300 ${
                  showOptionsDropdown
                    ? 'bg-blue-50 text-blue-600 border-blue-400'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                type="button"
              >
                Options
                <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showOptionsDropdown ? 'rotate-180 text-blue-600' : ''}`} />
              </button>

              {showOptionsDropdown && (
                <>
                  <div className="fixed inset-0 z-[998]" onClick={() => setShowOptionsDropdown(false)}></div>
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-[999]">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
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
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center transition-colors group"
                        type="button"
                      >
                        <item.icon className="h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-500" />
                        <span className="group-hover:font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Tabs */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* -------------------- Tab Content -------------------- */}
            
            {activeTab === 'overview' && (
            <div className="space-y-8">
                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((item) => (
                    <div key={item.name} className="bg-white overflow-hidden shadow-md rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="p-6">
                        <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className={`p-3 rounded-xl ${item.color}`}>
                            <item.icon className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                                {item.name}
                            </dt>
                            <dd className="flex items-baseline">
                                <div className="text-2xl font-semibold text-gray-900">
                                {item.value}
                                </div>
                                <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                                <TrendingUp className="h-4 w-4 flex-shrink-0 self-center text-green-500" />
                                <span className="ml-1">{item.change}</span>
                                </div>
                            </dd>
                            </dl>
                        </div>
                        </div>
                    </div>
                    </div>
                ))}
                </div>

                {/* Daily Classes Summary */}
                <div className="bg-white rounded-xl shadow-md border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Daily Classes Summary</h3>
                    <button
                    onClick={() => setActiveTab('daily-classes')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                    View Details →
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {dailyStats.map((stat) => (
                    <div key={stat.name} className="text-center">
                        <div className={`p-3 rounded-xl ${stat.color} text-white mx-auto w-fit mb-2`}>
                        <Clock className="h-6 w-6" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        <div className="text-sm text-gray-500">{stat.name}</div>
                    </div>
                    ))}
                </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-md border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <button
                    onClick={() => setActiveTab('daily-classes')}
                    className="flex flex-col items-center p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
                    >
                    <ClipboardList className="h-8 w-8 text-indigo-600 mb-2" />
                    <span className="text-sm font-medium text-indigo-900">Daily Classes</span>
                    </button>
                    <button
                    onClick={() => setActiveTab('users')}
                    className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                    <UserPlus className="h-8 w-8 text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-blue-900">Create Account</span>
                    </button>
                    <button
                    onClick={() => setActiveTab('teachers')}
                    className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                    >
                    <GraduationCap className="h-8 w-8 text-green-600 mb-2" />
                    <span className="text-sm font-medium text-green-900">Manage Teachers</span>
                    </button>
                    <button
                    onClick={() => setActiveTab('courses')}
                    className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                    >
                    <BookOpen className="h-8 w-8 text-purple-600 mb-2" />
                    <span className="text-sm font-medium text-purple-900">Create Course</span>
                    </button>
                    <button
                    onClick={() => setActiveTab('subscriptions')}
                    className="flex flex-col items-center p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
                    >
                    <CreditCard className="h-8 w-8 text-emerald-600 mb-2" />
                    <span className="text-sm font-medium text-emerald-900">View Payments</span>
                    </button>
                </div>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white shadow-md rounded-xl border overflow-hidden">
                    <div className="px-6 py-4 border-b bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
                    </div>
                    <div className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">Class completed: Ahmed Mohamed with Student A</span>
                        </div>
                        <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">New teacher registered: Fatima Ali</span>
                        </div>
                        <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">Student marked absent: Math Class</span>
                        </div>
                        <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">Class rescheduled: English session</span>
                        </div>
                    </div>
                    </div>
                </div>

                <div className="bg-white shadow-md rounded-xl border overflow-hidden">
                    <div className="px-6 py-4 border-b bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
                    </div>
                    <div className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Database Connection</span>
                        <span className="flex items-center text-sm text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Online
                        </span>
                        </div>
                        <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Class Management System</span>
                        <span className="flex items-center text-sm text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Active
                        </span>
                        </div>
                        <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Payment Gateway</span>
                        <span className="flex items-center text-sm text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Active
                        </span>
                        </div>
                        <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Email Service</span>
                        <span className="flex items-center text-sm text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Operational
                        </span>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            )}

            {activeTab === 'daily-classes' && (
            <DailyClassesManagement 
                teachers={teachers}
                children={children}
                classes={classes}
                onUpdateClass={handleUpdateClass}
            />
            )}

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

            {activeTab === 'courses' && (
            <CourseManagement 
                teachers={teachers}
                children={children}
            />
            )}

            {activeTab === 'subscriptions' && (
            <SubscriptionManagement 
                children={children}
                courses={courses}
            />
            )}

            {activeTab === 'analytics' && (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-500">Advanced analytics and reporting features coming soon...</p>
            </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Initialize Database Button */}
                <InitializeDatabaseButton />
                
                {/* System Settings Card */}
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">System Settings</h3>
                  <p className="text-gray-500">Configuration and system settings coming soon...</p>
                </div>
              </div>
            )}
        </main>
      </div>
    </div>
  );
}