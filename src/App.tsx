import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

// مكونات الرأس والتنقل
import Header from './components/Layout/Header';
import LoginForm from './components/Auth/LoginForm';

// مكونات الصفحة الرئيسية
import Hero from './components/Landing/Hero';
import CoursesTabs from './components/CoursesTabs';

// مكونات لوحات القيادة
import ParentDashboard from './components/Dashboards/ParentDashboard';
import TeacherDashboard from './components/Dashboards/TeacherDashboard';
import StudentDashboard from './components/Dashboards/StudentDashboard';
import AdminDashboard from './components/Dashboards/AdminDashboard';
import SuperAdminDashboard from './components/Dashboards/SuperAdminDashboard';
import AdminSectionManager from './components/Dashboards/AdminSectionManager';

// مكونات الصفحات العامة والوظائف
import CoursesPage from './components/CoursesPage';
import FreeTrial from './components/Pages/FreeTrial';
import WhyUs from './components/Pages/WhyUs';
import Reviews from './components/Pages/Reviews';
import DropdownDemo from './components/Demo/DropdownDemo';
import ClassManagement from './components/ClassManagement';
import WeeklyClassesManager from './components/Modals/Weekly Classes/WeeklyClassesManager';
import AdvanceClassScheduler from './components/Modals/Weekly Classes/AdvanceClassScheduler';
import PublicHolidaysManager from './components/Modals/Weekly Classes/PublicHolidaysManager';
import SalaryClassReport from './components/Modals/Weekly Classes/SalaryClassReport';
import DailyClassReport from './components/Modals/Weekly Classes/DailyClassReport';

// ✅ مكونات Weekly Classes الجديدة


interface CustomUser {
  role: 'parent' | 'teacher' | 'student' | 'admin' | 'super_admin' | string;
}

function LandingPage({ onShowLogin }: { onShowLogin: () => void }) {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Welcome to Quraan Academy</h1>
        <p className="text-xl text-gray-600">
          Your journey to learning the Quran starts here.
        </p>
      </div>
      <Hero onGetStarted={onShowLogin} />
      <CoursesTabs />
    </main>
  );
}

function AppContent() {
  const { user: authUser, loading } = useAuth();
  const user = authUser as (CustomUser & typeof authUser); 
  const [showLogin, setShowLogin] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-700">Loading authentication data...</p>
      </div>
    );
  }

  const getDashboardComponent = () => {
    if (!user || !user.role) {
      return <div>Please log in to view the dashboard.</div>;
    }
    
    switch (user.role) {
      case 'parent':
        return <ParentDashboard />;
      case 'teacher':
        return <TeacherDashboard />;
      case 'student':
        return <StudentDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'super_admin':
        return <SuperAdminDashboard />;
      default:
        return <div>Invalid role</div>;
    }
  };

  const handleShowLogin = () => setShowLogin(true);

  // ✅ دالة للتحقق من صلاحيات Admin/Super Admin
  const isAdminOrSuperAdmin = user && (user.role === 'admin' || user.role === 'super_admin');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onShowLogin={handleShowLogin} /> 
      
      <Routes>
        <Route 
          path="/" 
          element={
            user ? getDashboardComponent() : <LandingPage onShowLogin={handleShowLogin} /> 
          } 
        />

        {/* مسارات الصفحات العامة */}
        <Route path="/courses" element={<CoursesPage onEnroll={handleShowLogin} />} />
        <Route path="/why-us" element={<WhyUs />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/free-trial" element={<FreeTrial />} />
        <Route path="/demo" element={<DropdownDemo />} />
        
        <Route 
          path="/classes" 
          element={user ? <ClassManagement /> : <Navigate to="/" replace />} 
        />
        
        <Route 
          path="/admin-sections" 
          element={isAdminOrSuperAdmin ? <AdminSectionManager /> : <Navigate to="/" replace />} 
        />

        {/* ✅ مسارات Weekly Classes الجديدة - للـ Admin و Super Admin فقط */}
        <Route 
          path="/weekly-classes" 
          element={isAdminOrSuperAdmin ? <WeeklyClassesManager /> : <Navigate to="/" replace />} 
        />
        
        <Route 
          path="/advance-classes" 
          element={isAdminOrSuperAdmin ? <AdvanceClassScheduler /> : <Navigate to="/" replace />} 
        />
        
        <Route 
          path="/public-holidays" 
          element={isAdminOrSuperAdmin ? <PublicHolidaysManager /> : <Navigate to="/" replace />} 
        />
        
        <Route 
          path="/salary-report" 
          element={isAdminOrSuperAdmin ? <SalaryClassReport /> : <Navigate to="/" replace />} 
        />
        
        <Route 
          path="/daily-report" 
          element={isAdminOrSuperAdmin ? <DailyClassReport /> : <Navigate to="/" replace />} 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {showLogin && <LoginForm onClose={() => setShowLogin(false)} />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <AppContent />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;