import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

// Components
import Header from './components/Layout/Header';
import LoginForm from './components/Auth/LoginForm';

// Landing Page Components
import Hero from './components/Landing/Hero';
import CoursesTabs from './components/CoursesTabs';

// Dashboards
import ParentDashboard from './components/Dashboards/ParentDashboard';
import TeacherDashboard from './components/Dashboards/TeacherDashboard';
import StudentDashboard from './components/Dashboards/StudentDashboard';
import AdminDashboard from './components/Dashboards/AdminDashboard';
import SuperAdminDashboard from './components/Dashboards/SuperAdminDashboard';
import AdminSectionManager from './components/Dashboards/AdminSectionManager';

// ✅ Family Management & Profiles
import FamilyManagement from './components/FamilyManagement/FamilyManagement';

import StudentProfile from './components/Students/StudentProfile'; // ✅ Added

// Public Pages
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
import ParentProfile from './components/Modals/Parent/ParentProfile';

interface CustomUser {
  role: 'parent' | 'teacher' | 'student' | 'admin' | 'super_admin' | string;
}

function LandingPage({ onShowLogin }: { onShowLogin: () => void }) {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        {/* <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Welcome to Quraan Academy</h1> */}
        {/* <p className="text-xl text-gray-600">
          Your journey to learning the Quran starts here.
        </p> */}
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading authentication data...</p>
        </div>
      </div>
    );
  }

  const getDashboardComponent = () => {
    if (!user || !user.role) {
      console.log('❌ No user or role found');
      return <Navigate to="/" replace />;
    }
    
    console.log('✅ Routing user to dashboard:', user.role, user);
    
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
        console.log('❌ Unknown role:', user.role);
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center bg-white p-8 rounded-lg shadow-lg">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Role</h1>
              <p className="text-gray-600 mb-4">Your account role is not recognized: <strong>{user.role}</strong></p>
              <p className="text-sm text-gray-500">Please contact support.</p>
            </div>
          </div>
        );
    }
  };

  const handleShowLogin = () => setShowLogin(true);

  const isAdminOrSuperAdmin = user && (user.role === 'admin' || user.role === 'super_admin');
  const isParent = user && user.role === 'parent';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onShowLogin={handleShowLogin} /> 
      
      <Routes>
        {/* Main Route */}
        <Route 
          path="/" 
          element={
            user ? getDashboardComponent() : <LandingPage onShowLogin={handleShowLogin} /> 
          } 
        />

        {/* Public Pages */}
        <Route path="/courses" element={<CoursesPage onEnroll={handleShowLogin} />} />
        <Route path="/why-us" element={<WhyUs />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/free-trial" element={<FreeTrial />} />
        <Route path="/demo" element={<DropdownDemo />} />
        
        {/* Protected Routes */}
        <Route 
          path="/classes" 
          element={user ? <ClassManagement /> : <Navigate to="/" replace />} 
        />
        
        {/* ============================================ */}
        {/* FAMILY MANAGEMENT ROUTES */}
        {/* ============================================ */}
        
        {/* Admin Family Management */}
        <Route 
          path="/admin/families" 
          element={isAdminOrSuperAdmin ? <FamilyManagement /> : <Navigate to="/" replace />} 
        />
        
        {/* Parent Family Management */}
        <Route 
          path="/parent/families" 
          element={isParent ? <FamilyManagement /> : <Navigate to="/" replace />} 
        />
        
        {/* Parent Profile Page */}
        <Route 
          path="/admin/parent/:parentId" 
          element={isAdminOrSuperAdmin ? <ParentProfile /> : <Navigate to="/" replace />} 
        />

        {/* ✅ Student Profile Page */}
        <Route 
          path="/admin/student/:studentId" 
          element={isAdminOrSuperAdmin ? <StudentProfile /> : <Navigate to="/" replace />} 
        />
        
        {/* ============================================ */}
        {/* Admin & Super Admin Only Routes */}
        {/* ============================================ */}
        <Route 
          path="/admin-sections" 
          element={isAdminOrSuperAdmin ? <AdminSectionManager /> : <Navigate to="/" replace />} 
        />

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

        {/* Catch all */}
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