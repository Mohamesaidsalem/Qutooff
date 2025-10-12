import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Header from './components/Layout/Header';
import Hero from './components/Landing/Hero';
import LoginForm from './components/Auth/LoginForm';

// استيراد المكونات
import CoursesPage from './components/CoursesPage';
import ParentDashboard from './components/Dashboards/ParentDashboard';
import TeacherDashboard from './components/Dashboards/TeacherDashboard';
import StudentDashboard from './components/Dashboards/StudentDashboard';
import AdminDashboard from './components/Dashboards/AdminDashboard';
import SuperAdminDashboard from './components/Dashboards/SuperAdminDashboard';
import FreeTrial from './components/Pages/FreeTrial';
import WhyUs from './components/Pages/WhyUs';
import Reviews from './components/Pages/Reviews';
import CoursesTabs from './components/CoursesTabs';
import ClassManagement from './components/ClassManagement';

// تحديد نوع بيانات مبسط لدور المستخدم (لتحسين TypeScript)
interface CustomUser {
  role: 'parent' | 'teacher' | 'student' | 'admin' | 'super_admin' | string;
  // خصائص أخرى للمستخدم يمكن إضافتها هنا
}

/**
 * مكون AppContent: يحتوي على منطق التوجيه والتحقق من الدور.
 */
function AppContent() {
  // نفترض أن useAuth يرجع حقل 'user' الذي يحتوي على 'role'.
  const { user: authUser, loading } = useAuth();
  const user = authUser as (CustomUser & typeof authUser); 
  
  const [showLogin, setShowLogin] = useState(false);

  /**
   * دالة تحديد لوحة القيادة المناسبة بناءً على دور المستخدم.
   */
  const getDashboardComponent = () => {
    // يجب أن تكون هذه الحالة نادرة لأن التحقق يتم في المسار الرئيسي، 
    // لكنها تُستخدم لضمان وجود الدور.
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onShowLogin={function (): void {
        throw new Error('Function not implemented.');
      } } />
      
      <Routes>
        {/* المسار الرئيسي: يعرض لوحة القيادة للمستخدم المسجل، وإلا يعرض الصفحة الرئيسية (Hero + CoursesTabs) */}
        <Route 
          path="/" 
          element={
            user ? (
              getDashboardComponent()
            ) : (
              <>
                <Hero onGetStarted={() => setShowLogin(true)} />
                <CoursesTabs />
              </>
            )
          } 
        />

        {/* مسارات الصفحات العامة */}
        <Route path="/courses" element={<CoursesPage onEnroll={() => setShowLogin(true)} />} />
        <Route path="/why-us" element={<WhyUs />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/free-trial" element={<FreeTrial />} />
        
        {/* مسار إدارة الصفوف: يتطلب مصادقة لعرضه */}
        <Route 
            path="/classes" 
            element={user ? <ClassManagement /> : <Navigate to="/" replace />} 
        />
        
        {/* مسار بديل لأي مسار غير موجود */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* نافذة تسجيل الدخول المنبثقة (Modal) */}
      {showLogin && <LoginForm onClose={() => setShowLogin(false)} />}
    </div>
  );
}

/**
 * المكون الرئيسي App: يجمع كل الـ Providers والموجه (Router).
 */
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