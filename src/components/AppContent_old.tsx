// src/components/AppContent.tsx
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from './Layout/Header';
import Hero from './Landing/Hero';
import LoginForm from './Auth/LoginForm';
import CoursesPage from './CoursesPage';
import ParentDashboard from './Dashboards/ParentDashboard';
import TeacherDashboard from './Dashboards/TeacherDashboard';
import StudentDashboard from './Dashboards/StudentDashboard';
import AdminDashboard from './Dashboards/AdminDashboard';
import FreeTrial from './Pages/FreeTrial';
import WhyUs from './Pages/WhyUs';
import Reviews from './Pages/Reviews';
import CoursesTabs from './CoursesTabs';

// المكون الذي يحتوي على محتوى التطبيق بناءً على حالة المستخدم
function AppContent() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  // تم تعديل هذا الجزء ليتم عرض الـ Header بشكل دائم بعد تسجيل الدخول
  const renderContent = () => {
    if (user) {
      return (
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route path="/" element={getDashboardComponent()} />
            <Route path="/courses" element={<CoursesPage onEnroll={() => setShowLogin(true)} />} />
            <Route path="/why-us" element={<WhyUs />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/free-trial" element={<FreeTrial />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      );
    } else {
      // هذا الجزء يعرض صفحة الهبوط والمكونات التي تظهر للمستخدم غير المسجل
      return (
        <>
          <Header />
          <Routes>
            <Route path="/" element={<Hero onGetStarted={() => setShowLogin(true)} />} />
            <Route path="/courses" element={<CoursesPage onEnroll={() => setShowLogin(true)} />} />
            <Route path="/why-us" element={<WhyUs />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/free-trial" element={<FreeTrial />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <CoursesTabs />
        </>
      );
    }
  };

  const getDashboardComponent = () => {
    if (!user) {
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
      default:
        return <div>Invalid role</div>;
    }
  };
  
  return (
    <>
      {renderContent()}
      
      {showLogin && (
        <LoginForm onClose={() => setShowLogin(false)} />
      )}
    </>
  );
}

export default AppContent;