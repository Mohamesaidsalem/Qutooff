import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Award, Video, Clock, Key, Eye, EyeOff, X, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { 
    children, 
    getClassesByStudent, 
    updateStudentPassword,
    teachers,
    loading: dataLoading
  } = useData();

  const [currentStudent, setCurrentStudent] = useState<any>(null);
  const [studentClasses, setStudentClasses] = useState<any[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Find the current student's data
  useEffect(() => {
    if (user && children.length > 0) {
      const student = children.find(child =>
        child.studentAccount?.email === user.email || child.id === user.id
      );
      
      if (student) {
        setCurrentStudent(student);
        
        // Get student's classes
        const classes = getClassesByStudent(student.id);
        setStudentClasses(classes);
        
        // Get upcoming classes
        const upcoming = classes
          .filter(cls => {
            const classDateTime = new Date(`${cls.date}T${cls.time}`);
            return classDateTime >= new Date() && cls.status === 'scheduled';
          })
          .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 3);
        
        setUpcomingClasses(upcoming);
      }
    }
  }, [user, children, getClassesByStudent]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentStudent?.studentAccount) {
      alert('No student account found.');
      return;
    }

    if (passwordData.currentPassword !== currentStudent.studentAccount.password) {
      alert('Current password is incorrect.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await updateStudentPassword(currentStudent.id, passwordData.newPassword);
      alert('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (dataLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentStudent) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Student Not Found</h1>
          <p className="text-gray-600 mb-4">
            We couldn't find your student profile. Please contact your parent or administrator.
          </p>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Need Help?</strong> Make sure you're using the correct email and password provided by your parent.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const completedClasses = studentClasses.filter(cls => cls.status === 'completed').length;
  const streak = 12; // Can be calculated based on consecutive days
  const teacher = teachers.find(t => t.id === currentStudent.teacherId);

  const achievements = [
    { name: 'First Surah Completed', description: 'You completed your first surah', date: '2 weeks ago', earned: currentStudent.progress >= 10 },
    { name: '7-Day Streak', description: 'Practiced for 7 consecutive days', date: '1 week ago', earned: streak >= 7 },
    { name: 'Perfect Recitation', description: 'Recited without mistakes', date: '3 days ago', earned: currentStudent.progress >= 50 },
  ];

  const stats = [
    { name: 'Current Progress', value: `${currentStudent.progress}%`, icon: BookOpen, color: 'bg-blue-500' },
    { name: 'Classes This Month', value: completedClasses.toString(), icon: Calendar, color: 'bg-green-500' },
    { name: 'Daily Streak', value: `${streak} days`, icon: Award, color: 'bg-yellow-500' },
    { name: 'Next Class', value: upcomingClasses.length > 0 ? 'Scheduled' : 'TBD', icon: Clock, color: 'bg-purple-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Learning Journey</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your Quran memorization progress and join your classes
          </p>
          <p className="mt-2 text-lg text-blue-600 font-medium">
            Welcome, {currentStudent.name}! 🌟
          </p>
        </div>
        {currentStudent.studentAccount && (
          <button
            onClick={() => setShowPasswordModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
          >
            <Key className="h-4 w-4" />
            Change Password
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className={`${item.color} p-3 rounded-xl`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <dt className="text-sm font-medium text-gray-500 mb-1">
                {item.name}
              </dt>
              <dd className="text-2xl font-bold text-gray-900">
                {item.value}
              </dd>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Progress */}
        <div className="lg:col-span-2 bg-white shadow-lg rounded-xl border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <h2 className="text-lg font-semibold text-gray-900">Current Progress</h2>
          </div>
          <div className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-blue-600">{currentStudent.level}</h3>
              <p className="text-gray-600">Teacher: {teacher?.name || currentStudent.teacherName}</p>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Memorization Progress</span>
                <span>{currentStudent.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${currentStudent.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{currentStudent.progress}%</div>
                <div className="text-sm text-gray-600">Completion</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{streak}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{completedClasses}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Classes */}
        <div className="bg-white shadow-lg rounded-xl border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Classes</h2>
          </div>
          <div className="p-6">
            {upcomingClasses.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No scheduled classes</p>
                <p className="text-sm text-gray-400 mt-1">You'll be notified when new classes are scheduled</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingClasses.map((classItem) => (
                  <div key={classItem.id} className="p-4 border-2 border-gray-200 rounded-xl hover:border-green-300 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{teacher?.name || 'Teacher'}</h3>
                        <p className="text-sm text-gray-500">{formatDate(classItem.date)} at {classItem.time}</p>
                        {classItem.notes && (
                          <p className="text-xs text-gray-400 mt-1 italic">"{classItem.notes}"</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => window.open(classItem.zoomLink, '_blank')}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 rounded-lg text-sm hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2 shadow-md"
                    >
                      <Video className="h-4 w-4" />
                      Join Class
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="mt-8 bg-white shadow-lg rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <h2 className="text-lg font-semibold text-gray-900">Recent Achievements</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <div 
                key={index} 
                className={`text-center p-6 rounded-xl transition-all ${
                  achievement.earned 
                    ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300' 
                    : 'bg-gray-50 border-2 border-gray-200 opacity-60'
                }`}
              >
                <Award className={`h-8 w-8 mx-auto mb-3 ${achievement.earned ? 'text-yellow-600' : 'text-gray-400'}`} />
                <h3 className={`font-medium mb-1 ${achievement.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                  {achievement.name}
                </h3>
                <p className={`text-sm mb-2 ${achievement.earned ? 'text-gray-600' : 'text-gray-400'}`}>
                  {achievement.description}
                </p>
                {achievement.earned && (
                  <span className="text-xs text-yellow-600 font-medium">{achievement.date}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Account Information */}
      {currentStudent.studentAccount && (
        <div className="mt-8 bg-white shadow-lg rounded-xl border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">Login Details</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Email:</strong> <span className="font-mono text-blue-600">{currentStudent.studentAccount.email}</span>
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Password:</strong> <span className="font-mono">••••••••</span>
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">Security Settings</h3>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm shadow-md"
                >
                  <Key className="h-4 w-4" />
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips for Progress */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">💡 Tips for Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="font-medium">Review daily</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <Calendar className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="font-medium">Attend all classes</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <Award className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <p className="font-medium">Practice regularly</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <Key className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Change Password</h2>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                disabled={loading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                    placeholder="Enter current password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Minimum 6 characters"
                  minLength={6}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Re-enter new password"
                  minLength={6}
                  required
                  disabled={loading}
                />
              </div>

              {/* Password Match Indicator */}
              {passwordData.newPassword && passwordData.confirmPassword && (
                <div className={`text-sm ${passwordData.newPassword === passwordData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordData.newPassword === passwordData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Key className="h-5 w-5" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}