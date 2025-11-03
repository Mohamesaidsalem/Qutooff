import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, DollarSign, TrendingUp, 
  Calendar as CalendarIcon, Home, Settings, 
  UserPlus, GraduationCap, CreditCard, 
  Clock, ClipboardList, Globe, 
  Briefcase, Calendar, Menu, AlertCircle, Trash2, 
  CheckCircle
} from 'lucide-react';
import { ref, onValue, off, push, set, update, remove } from 'firebase/database';
import { database } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Import Components
import AdminSidebar from '../Layout/AdminSidebar';
import UserManagement from '../admin/UserManagement';
import CourseManagement from '../admin/CourseManagement';
import SubscriptionManagement from '../admin/SubscriptionManagement';
import TeacherScheduleManagement from '../admin/TeacherScheduleManagement';
import DailyClassesManagement from '../admin/DailyClassesManagement';
import InitializeDatabaseButton from '../admin/InitializeDatabaseButton';
import AdminTeacherManagement from '../admin/AdminTeacherManagement';
import TeacherStudents from '../teacher/TeacherStudents';
import AnalyticsDashboard from '../admin/AnalyticsDashboard';
import FamilyManagement from '../FamilyManagement/FamilyManagement';

// Migration utilities
import { 
  migrateChildrenToFamilies, 
  validateMigration, 
  rollbackMigration 
} from '../../utils/migrateFamilies';

// ============================================
// INTERFACES
// ============================================
interface Teacher {
  id: string;
  name: string;
  email: string;
  isActive?: boolean;
}

interface Child {
  id: string;
  name: string;
  parentEmail: string;
  teacherId?: string;
  teacherName?: string;
  isActive?: boolean;
}

interface Course {
  id: string;
  name: string;
  duration: string;
  price: number;
}

interface ClassData {
  id: string;
  studentId?: string;
  teacherId?: string;
  appointmentDate?: string;
  status?: string;
  createdAt?: string;
}

// ============================================
// TABS CONFIGURATION
// ============================================
const tabs = [
  { id: 'overview', name: 'Dashboard Overview' },
  { id: 'daily-classes', name: 'Daily Classes' },
  { id: 'families', name: 'Family Management' },
  { id: 'users', name: 'User Management' },
  { id: 'teachers', name: 'Teacher Schedules' },
  { id: 'teacher-management', name: 'Teacher Management' },
  { id: 'teacher-students', name: 'View Teacher Students' },
  { id: 'courses', name: 'Course Management' },
  { id: 'subscriptions', name: 'Subscriptions & Payments' },
  { id: 'analytics', name: 'Analytics' },
  { id: 'settings', name: 'Settings' }
];

// ============================================
// MAIN COMPONENT
// ============================================
export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  
  // Data State
  const [children, setChildren] = useState<Child[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [dailyClasses, setDailyClasses] = useState<ClassData[]>([]);

  // Migration State
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);

  // ============================================
  // FIREBASE DATA LOADING
  // ============================================
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    console.log('🔥 AdminDashboard - Starting Firebase data load...');
    setError(null);

    const loadingTimeout = setTimeout(() => {
      console.log('⏰ Safety timeout reached - forcing loading to false');
      setLoading(false);
    }, 10000);

    const dataStatus = {
      children: false,
      teachers: false,
      classes: false,
      courses: false,
      dailyClasses: false
    };

    const checkAllLoaded = () => {
      const allLoaded = Object.values(dataStatus).every(v => v === true);
      if (allLoaded) {
        console.log('✅ All data sources loaded successfully');
        clearTimeout(loadingTimeout);
        setLoading(false);
      }
    };

    // ============ CHILDREN ============
    const childrenRef = ref(database, 'children');
    const unsubChildren = onValue(
      childrenRef,
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const arr = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            const activeChildren = arr.filter(child => child.isActive !== false);
            setChildren(activeChildren);
            console.log('✅ Children loaded:', activeChildren.length);
          } else {
            setChildren([]);
            console.log('ℹ️ No children data');
          }
        } catch (err) {
          console.error('❌ Error processing children:', err);
          setChildren([]);
        }
        dataStatus.children = true;
        checkAllLoaded();
      },
      (error) => {
        console.error('❌ Children load error:', error.message);
        setChildren([]);
        dataStatus.children = true;
        checkAllLoaded();
      }
    );

    // ============ TEACHERS ============
    const teachersRef = ref(database, 'teachers');
    const unsubTeachers = onValue(
      teachersRef,
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const arr = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            const activeTeachers = arr.filter(t => t.isActive !== false);
            setTeachers(activeTeachers);
            console.log('✅ Teachers loaded:', activeTeachers.length);
          } else {
            setTeachers([]);
            console.log('ℹ️ No teachers data');
          }
        } catch (err) {
          console.error('❌ Error processing teachers:', err);
          setTeachers([]);
        }
        dataStatus.teachers = true;
        checkAllLoaded();
      },
      (error) => {
        console.error('❌ Teachers load error:', error.message);
        setTeachers([]);
        dataStatus.teachers = true;
        checkAllLoaded();
      }
    );

    // ============ CLASSES ============
    const classesRef = ref(database, 'classes');
    const unsubClasses = onValue(
      classesRef,
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const arr = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            setClasses(arr);
            console.log('✅ Classes loaded:', arr.length);
          } else {
            setClasses([]);
            console.log('ℹ️ No classes data');
          }
        } catch (err) {
          console.error('❌ Error processing classes:', err);
          setClasses([]);
        }
        dataStatus.classes = true;
        checkAllLoaded();
      },
      (error) => {
        console.error('❌ Classes load error:', error.message);
        setClasses([]);
        dataStatus.classes = true;
        checkAllLoaded();
      }
    );

    // ============ COURSES ============
    const coursesRef = ref(database, 'courses');
    const unsubCourses = onValue(
      coursesRef,
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const arr = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            setCourses(arr);
            console.log('✅ Courses loaded:', arr.length);
          } else {
            setCourses([]);
            console.log('ℹ️ No courses data');
          }
        } catch (err) {
          console.error('❌ Error processing courses:', err);
          setCourses([]);
        }
        dataStatus.courses = true;
        checkAllLoaded();
      },
      (error) => {
        console.error('❌ Courses load error:', error.message);
        setCourses([]);
        dataStatus.courses = true;
        checkAllLoaded();
      }
    );

    // ============ DAILY CLASSES ============
    const dailyClassesRef = ref(database, 'daily_classes');
    const unsubDailyClasses = onValue(
      dailyClassesRef,
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const arr = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            setDailyClasses(arr);
            console.log('✅ Daily Classes loaded:', arr.length);
          } else {
            setDailyClasses([]);
            console.log('ℹ️ No daily classes data');
          }
        } catch (err) {
          console.error('❌ Error processing daily classes:', err);
          setDailyClasses([]);
        }
        dataStatus.dailyClasses = true;
        checkAllLoaded();
      },
      (error) => {
        console.warn('⚠️ Daily classes not accessible:', error.message);
        setDailyClasses([]);
        dataStatus.dailyClasses = true;
        checkAllLoaded();
      }
    );

    return () => {
      clearTimeout(loadingTimeout);
      off(childrenRef, 'value', unsubChildren);
      off(teachersRef, 'value', unsubTeachers);
      off(classesRef, 'value', unsubClasses);
      off(coursesRef, 'value', unsubCourses);
      off(dailyClassesRef, 'value', unsubDailyClasses);
      console.log('🧹 Cleaned up Firebase listeners');
    };
  }, [user]);

  // ============================================
  // CLASS MANAGEMENT HANDLERS
  // ============================================
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

      alert('✅ Class scheduled successfully!');
    } catch (error) {
      console.error('❌ Error scheduling class:', error);
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
      console.error('❌ Error updating class:', error);
      throw error;
    }
  };
  
  const handleDeleteClass = async (classId: string) => {
    try {
      const classRef = ref(database, `classes/${classId}`);
      await remove(classRef);
      
      const dailyClassRef = ref(database, `daily_classes/${classId}`);
      await remove(dailyClassRef);
      
      alert('✅ Class deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting class:', error);
      alert('Error deleting class. Please try again.');
    }
  };

  // ============================================
  // MIGRATION HANDLERS
  // ============================================
  const handleMigration = async () => {
    if (!window.confirm('⚠️ This will create families from existing children.\n\nDo you want to continue?')) {
      return;
    }

    setIsMigrating(true);
    setMigrationResult(null);
    
    try {
      console.log('🚀 Starting migration...');
      const result = await migrateChildrenToFamilies();
      setMigrationResult(result);
      
      if (result.success) {
        alert(`✅ Migration Successful!\n\n` +
              `Families Created: ${result.familiesCreated}\n` +
              `Children Migrated: ${result.childrenMigrated}\n` +
              `Total Families: ${result.familyDetails.length}`);
      } else {
        alert(`⚠️ Migration completed with ${result.errors.length} error(s).\n\nCheck console for details.`);
      }
    } catch (error: any) {
      console.error('❌ Migration error:', error);
      alert(`❌ Migration failed!\n\n${error.message}`);
      setMigrationResult({ 
        success: false, 
        errors: [error.message],
        familiesCreated: 0,
        childrenMigrated: 0,
        familyDetails: []
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleValidation = async () => {
    try {
      const result = await validateMigration();
      
      if (result.isValid) {
        alert(`✅ Validation Passed!\n\n` +
              `Children: ${result.stats.totalChildren}\n` +
              `Families: ${result.stats.totalFamilies}\n` +
              `Orphaned Children: ${result.stats.childrenWithoutFamily}\n\n` +
              `No critical issues found.`);
      } else {
        const issuesText = result.issues.join('\n• ');
        alert(`⚠️ Validation Issues Found:\n\n• ${issuesText}`);
      }
      
      console.log('📊 Full Validation Result:', result);
    } catch (error: any) {
      console.error('❌ Validation error:', error);
      alert(`❌ Validation failed!\n\n${error.message}`);
    }
  };

  const handleRollback = async () => {
    if (!window.confirm('⚠️ WARNING: This will mark all families as inactive!\n\nThis action cannot be undone easily.\n\nAre you absolutely sure?')) {
      return;
    }

    try {
      const success = await rollbackMigration();
      if (success) {
        alert('✅ Rollback successful!\n\nAll families have been marked as inactive.');
        setMigrationResult(null);
      } else {
        alert('❌ Rollback failed. Check console for errors.');
      }
    } catch (error: any) {
      console.error('❌ Rollback error:', error);
      alert(`❌ Rollback failed!\n\n${error.message}`);
    }
  };

  // ============================================
  // STATISTICS CALCULATION
  // ============================================
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

  // ============================================
  // LOADING & ERROR STATES
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Home className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <p className="mt-6 text-gray-700 text-lg font-semibold">Loading Admin Dashboard...</p>
          <p className="mt-2 text-gray-500 text-sm">Fetching data from Firebase</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full border-2 border-red-200">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Reload Dashboard
          </button>
        </div>
      </div>
    );
  }

  const activeTabName = tabs.find(tab => tab.id === activeTab)?.name || 'Dashboard';

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="min-h-screen flex bg-gray-50 sm:bg-gray-100">
      
      {/* ============================================ */}
      {/* SIDEBAR COMPONENT */}
      {/* ============================================ */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />

      {/* ============================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        
        {/* Header */}
        {/* <header className="bg-white shadow-sm border-b z-20 sticky top-0">
          <div className="max-w-full mx-auto px-4 lg:px-6 py-4 flex justify-between items-center gap-4">
            <div className="flex items-center min-w-0 flex-1">
              <button 
                className="lg:hidden text-gray-500 hover:text-gray-900 mr-4" 
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-lg lg:text-xl font-bold text-gray-900 truncate">
                {activeTabName}
              </h1>
            </div>
          </div>
        </header> */}

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 lg:px-6 py-6">
          
          {/* ============================================ */}
          {/* OVERVIEW TAB */}
          {/* ============================================ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {stats.map((item) => (
                  <div key={item.name} className="bg-white overflow-hidden shadow-lg rounded-xl border hover:shadow-xl transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`p-3 rounded-xl ${item.color}`}>
                            <item.icon className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                              <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                {item.change}
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
              <div className="bg-white rounded-xl shadow-lg border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">📅 Daily Classes Summary</h3>
                  <button 
                    onClick={() => setActiveTab('daily-classes')} 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                  >
                    View Details →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
              <div className="bg-white rounded-xl shadow-lg border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">⚡ Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { tab: 'daily-classes', icon: ClipboardList, label: 'Daily Classes', color: 'indigo' },
                    { tab: 'users', icon: UserPlus, label: 'Create Account', color: 'blue' },
                    { tab: 'teachers', icon: GraduationCap, label: 'Manage Teachers', color: 'green' },
                    { tab: 'courses', icon: BookOpen, label: 'Create Course', color: 'purple' },
                    { tab: 'subscriptions', icon: CreditCard, label: 'View Payments', color: 'emerald' }
                  ].map((action) => (
                    <button 
                      key={action.tab}
                      onClick={() => setActiveTab(action.tab)} 
                      className={`flex flex-col items-center p-4 bg-${action.color}-50 rounded-xl hover:bg-${action.color}-100 transition-all hover:shadow-md border border-${action.color}-100`}
                    >
                      <action.icon className={`h-8 w-8 text-${action.color}-600 mb-2`} />
                      <span className={`text-sm font-medium text-${action.color}-900 text-center`}>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* OTHER TABS */}
          {/* ============================================ */}
          {activeTab === 'daily-classes' && (
            <DailyClassesManagement 
              teachers={teachers}
              children={children}
              classes={dailyClasses}
              onUpdateClass={handleUpdateClass}
            />
          )}
          
          {activeTab === 'families' && (
            <>
              {React.createElement(FamilyManagement as any, {
                onViewProfile: (parentId: string) => navigate(`/admin/parent/${parentId}`)
              })}
            </>
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

          {activeTab === 'teacher-management' && <AdminTeacherManagement />}

          {activeTab === 'teacher-students' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">👨‍🏫 View Teacher Students</h2>
              
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-md border">
                <label className="text-gray-700 font-medium whitespace-nowrap">Select Teacher:</label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">--- Choose a Teacher ---</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>

              {selectedTeacherId ? (
                <TeacherStudents teacherId={selectedTeacherId} />
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-10 text-center border-2 border-dashed border-gray-300">
                  <Users className='h-16 w-16 text-gray-400 mx-auto mb-4'/>
                  <p className='text-lg font-medium text-gray-600'>
                    Please select a teacher to view their student list and performance.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'courses' && <CourseManagement />}

          {activeTab === 'subscriptions' && (
            <SubscriptionManagement 
              children={children}
              courses={courses}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsDashboard />}

          {/* ============================================ */}
          {/* SETTINGS TAB */}
          {/* ============================================ */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              
              {/* Family Migration Tools */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-600 p-3 rounded-xl">
                    <Home className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">🏠 Family Migration Tools</h2>
                    <p className="text-sm text-gray-600">One-time migration to organize existing children into family groups</p>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">⚠️ Advanced Feature</h4>
                    <p className="text-sm text-yellow-800">
                      These tools are for migrating existing data. Only use if you have children without families.
                      <br />
                      <strong>Tip:</strong> Click "Validate Data" first to check if migration is needed.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <button
                    onClick={handleValidation}
                    className="bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2 font-semibold"
                  >
                    <AlertCircle className="h-5 w-5" />
                    Validate Data
                  </button>

                  <button
                    onClick={handleMigration}
                    disabled={isMigrating}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isMigrating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Migrating...
                      </>
                    ) : (
                      <>
                        <Home className="h-5 w-5" />
                        Run Migration
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleRollback}
                    disabled={isMigrating}
                    className="bg-red-600 text-white px-6 py-4 rounded-xl hover:bg-red-700 transition-all shadow-lg flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
                  >
                    <Trash2 className="h-5 w-5" />
                    Rollback
                  </button>
                </div>

                {/* Migration Result */}
                {migrationResult && (
                  <div className="bg-white rounded-xl p-6 border-2 border-purple-200">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      {migrationResult.success ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          ✅ Migration Successful!
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                          ⚠️ Migration Completed with Warnings
                        </>
                      )}
                    </h3>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
                        <p className="text-3xl font-bold text-green-600">{migrationResult.familiesCreated}</p>
                        <p className="text-sm text-gray-600 mt-1">Families Created</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
                        <p className="text-3xl font-bold text-blue-600">{migrationResult.childrenMigrated}</p>
                        <p className="text-sm text-gray-600 mt-1">Children Migrated</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-200">
                        <p className="text-3xl font-bold text-purple-600">{migrationResult.familyDetails?.length || 0}</p>
                        <p className="text-sm text-gray-600 mt-1">Total Families</p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg text-center border border-red-200">
                        <p className="text-3xl font-bold text-red-600">{migrationResult.errors?.length || 0}</p>
                        <p className="text-sm text-gray-600 mt-1">Errors</p>
                      </div>
                    </div>

                    {migrationResult.familyDetails && migrationResult.familyDetails.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          Family Details:
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {migrationResult.familyDetails.map((family: any, index: number) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="bg-purple-100 p-2 rounded-lg">
                                  <Home className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{family.familyName}</p>
                                  <p className="text-sm text-gray-600">{family.parentName}</p>
                                </div>
                              </div>
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                {family.childrenCount} {family.childrenCount === 1 ? 'child' : 'children'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {migrationResult.errors && migrationResult.errors.length > 0 && (
                      <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Errors Found:
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                          {migrationResult.errors.map((error: string, index: number) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Database Management */}
              <div className="bg-white rounded-xl shadow-lg border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-600 p-3 rounded-xl">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">🗄️ Database Management</h2>
                    <p className="text-sm text-gray-600">Initialize or reset database structure</p>
                  </div>
                </div>
                <InitializeDatabaseButton />
              </div>

              {/* System Settings Placeholder */}
              <div className="bg-white rounded-xl shadow-lg border p-8 text-center">
                <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">⚙️ System Settings</h3>
                <p className="text-gray-500">Additional configuration options coming soon...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}