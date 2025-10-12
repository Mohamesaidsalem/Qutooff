import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Hero from './Landing/Hero';
import CoursesTabs from './CoursesTabs';

interface LandingPageProps {
  onShowLogin: () => void;
}

/**
 * مكون الصفحة الرئيسية الترحيبي
 */
function LandingPage({ onShowLogin }: LandingPageProps) {
  const { user } = useAuth();

  if (user) {
    // إذا كان المستخدم مسجلاً، وجهه إلى لوحة القيادة
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

export default LandingPage;