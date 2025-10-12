import React, { useState, useEffect } from 'react'; // تم إضافة useEffect
import { X, Eye, EyeOff, User, GraduationCap, Users, Shield, Clock, Crown, type LucideIcon } from 'lucide-react';
import { useAuth, User as AuthUser } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface RoleOption {
  value: AuthUser['role'];
  label: string;
  icon: LucideIcon;
  color: string;
}

interface DemoAccount {
  email: string;
  password: string;
  name: string;
  role: AuthUser['role'];
}

interface LoginFormProps {
  onClose: () => void;
}

export default function LoginForm({ onClose }: LoginFormProps) {
  // تم إضافة user من useAuth
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // حالة لمعرفة ما إذا كانت عملية تسجيل الدخول قد نجحت وتم انتظار تحديث Context
  const [loginSuccess, setLoginSuccess] = useState(false); 

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'parent' as AuthUser['role'],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  
  // -----------------------------------------------------------------------------------
  // المنطق الجديد: التنقل يعتمد على تحديث 'user' في الـ Context بعد نجاح الـ login API
  // -----------------------------------------------------------------------------------
  useEffect(() => {
    if (loginSuccess && user) {
      // تم تسجيل الدخول بنجاح وتم تحديث بيانات المستخدم في الـ Context
      const userRole = user.role;
      if (userRole === 'admin' || userRole === 'super_admin') {
        navigate('/dashboard'); // توجيه الأدمن
      } else {
        navigate('/'); // توجيه المستخدمين الآخرين
      }
      onClose(); // إغلاق النافذة المنبثقة
      setLoginSuccess(false); // إعادة تعيين الحالة
    }
  }, [user, loginSuccess, navigate, onClose]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // دالة login هنا تُرجع boolean
        const success = await login(formData.email, formData.password); 

        if (success) {
          // بدلاً من التنقل الفوري، نحدد أن تسجيل الدخول نجح
          setLoginSuccess(true); 
          // سيقوم useEffect الآن بالانتظار وتحديد وجهة التنقل
        } else {
          setError('Invalid email or password. Please try again.');
          setLoginSuccess(false);
        }
      } else {
        const success = await register(formData.email, formData.password, formData.role, formData.name, formData.timezone);
        if (success) {
          // بعد التسجيل، نعتمد أيضاً على الـ useEffect لتحديث حالة المستخدم ثم التنقل
          setLoginSuccess(true); 
        } else {
          setError('Registration failed. Please try again.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    }
    setLoading(false);
  };
  
  // ... (باقي المتغيرات والثوابت كما هي)

  const commonTimezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Europe/Istanbul', label: 'Istanbul (TRT)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Asia/Riyadh', label: 'Riyadh (AST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT)' }
  ];

  const roleOptions: RoleOption[] = [
    { value: 'parent', label: 'Parent', icon: Users, color: 'text-green-600' },
    { value: 'teacher', label: 'Teacher', icon: GraduationCap, color: 'text-blue-600' },
    { value: 'student', label: 'Student', icon: User, color: 'text-orange-600' },
    { value: 'admin', label: 'Admin', icon: Shield, color: 'text-purple-600' },
  ];

  const demoAccounts: DemoAccount[] = [
    { email: 'parent@demo.com', password: 'password', name: 'Demo Parent', role: 'parent' },
    { email: 'teacher@demo.com', password: 'password', name: 'Demo Teacher', role: 'teacher' },
    { email: 'student@demo.com', password: 'password', name: 'Demo Student', role: 'student' },
    { email: 'admin@demo.com', password: 'password', name: 'Demo Admin', role: 'admin' },
    { email: 'superadmin@demo.com', password: 'password', name: 'Super Admin', role: 'super_admin' },
  ];

  const fillDemoAccount = (account: DemoAccount) => {
    setFormData({
      email: account.email,
      password: account.password,
      name: account.name,
      role: account.role,
      timezone: formData.timezone
    });
    setIsLogin(true);
  };

  const isValidTimezone = (timezone: string): boolean => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  };

  const getCurrentTime = () => {
    try {
      if (!isValidTimezone(formData.timezone)) {
        return 'Invalid timezone';
      }
      
      return new Date().toLocaleString('en-US', {
        timeZone: formData.timezone,
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    } catch (error) {
      console.warn('Error getting current time:', error);
      return 'Unable to display time';
    }
  };

  const handleTimezoneChange = (timezone: string) => {
    setFormData({ ...formData, timezone });
  };


  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={!isLogin}
                    placeholder="Enter your full name"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {roleOptions.slice(0, 4).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: option.value })}
                        className={`p-3 border rounded-md text-center transition-colors ${
                          formData.role === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <option.icon className={`h-5 w-5 mx-auto mb-1 ${
                          formData.role === option.value ? 'text-blue-600' : option.color
                        }`} />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                  
                  {/* Super Admin - Full width button */}
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'super_admin' })}
                      className={`w-full p-3 border rounded-md text-center transition-colors ${
                        formData.role === 'super_admin'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Crown className={`h-5 w-5 mx-auto mb-1 ${
                        formData.role === 'super_admin' ? 'text-red-600' : 'text-red-600'
                      }`} />
                      <span className="text-sm font-medium">Super Admin</span>
                      <p className="text-xs text-gray-500 mt-1">Highest system privileges</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Time Zone *
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => handleTimezoneChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={!isLogin}
                  >
                    {commonTimezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Current time in selected timezone: <span className="font-medium">{getCurrentTime()}</span>
                  </p>
                  {!isValidTimezone(formData.timezone) && (
                    <p className="text-xs text-red-600 mt-1">
                      ⚠️ Invalid timezone selected
                    </p>
                  )}
                  <p className="text-xs text-blue-600 mt-1">
                    ⚠️ Important: Choose your correct timezone to see class schedules accurately
                  </p>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ 
                  email: '', 
                  password: '', 
                  name: '', 
                  role: 'parent',
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                });
              }}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {isLogin ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
            </button>
          </div>

          {/* Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
              Demo Accounts for Testing
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.slice(0, 4).map((account, index) => {
                const roleOption = roleOptions.find(r => r.value === account.role);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => fillDemoAccount(account)}
                    className="p-2 text-xs border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-center mb-1">
                      {roleOption && <roleOption.icon className={`h-4 w-4 ${roleOption.color}`} />}
                    </div>
                    <div className="font-medium">{roleOption?.label}</div>
                    <div className="text-gray-500 text-xs">{account.email}</div>
                  </button>
                );
              })}
            </div>
            
            {/* Super Admin Demo - Full width */}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => fillDemoAccount(demoAccounts[4])}
                className="w-full p-2 text-xs border border-red-200 rounded hover:bg-red-50 transition-colors"
              >
                <div className="flex items-center justify-center mb-1">
                  <Crown className="h-4 w-4 text-red-600" />
                </div>
                <div className="font-medium text-red-700">Super Admin</div>
                <div className="text-red-500 text-xs">superadmin@demo.com</div>
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              Click any account to auto-fill the form
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}