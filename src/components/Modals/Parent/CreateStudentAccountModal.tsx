import React, { useState } from 'react';
import { X, UserPlus, Mail, Lock, Eye, EyeOff, Loader, CheckCircle } from 'lucide-react';
import { ref, update, get } from 'firebase/database';
import { database } from '../../../firebase/config';

interface CreateStudentAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: any;
}

export default function CreateStudentAccountModal({ isOpen, onClose, child }: CreateStudentAccountModalProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Creating student account for:', child);

      // ✅ Check if email already exists
      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);
      
      if (usersSnapshot.exists()) {
        const users = usersSnapshot.val();
        const emailExists = Object.values(users).some(
          (user: any) => user.email?.toLowerCase() === formData.email.toLowerCase()
        );
        
        if (emailExists) {
          alert('This email is already registered. Please use a different email.');
          setLoading(false);
          return;
        }
      }

      // ✅ Update child record with student account info
      const childRef = ref(database, `children/${child.id}`);
      await update(childRef, {
        studentAccount: {
          email: formData.email,
          password: formData.password,
          createdAt: new Date().toISOString()
        },
        email: formData.email,
        updatedAt: new Date().toISOString()
      });

      // ✅ Update or create user record in 'users' collection
      const userRef = ref(database, `users/${child.id}`);
      const userSnapshot = await get(userRef);
      
      // ✅ FIX: Prepare complete user data
      const userData: any = {
        name: child.name || '',
        email: formData.email,
        role: 'student',
        isActive: true,
        updatedAt: new Date().toISOString()
      };

      // Only add fields if they exist
      if (child.age) userData.age = child.age;
      if (child.level) userData.level = child.level;
      if (child.parentId) userData.parentId = child.parentId;
      if (child.teacherId) userData.teacherId = child.teacherId;
      if (typeof child.progress === 'number') userData.progress = child.progress;
      if (child.timezone) userData.timezone = child.timezone;

      if (userSnapshot.exists()) {
        // Update existing user
        console.log('📝 Updating existing user');
        await update(userRef, userData);
      } else {
        // Create new user
        console.log('➕ Creating new user');
        userData.createdAt = new Date().toISOString();
        userData.timezone = userData.timezone || 'UTC';
        await update(userRef, userData);
      }

      console.log('✅ Student account created successfully!');
      alert(`Student account created successfully!\n\nEmail: ${formData.email}\nPassword: ${formData.password}\n\nPlease save these credentials and share them with your child.`);
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        confirmPassword: ''
      });
      
      onClose();
    } catch (error: any) {
      console.error('❌ Error creating student account:', error);
      alert(`Failed to create student account: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const length = 8;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData({
      ...formData,
      password: password,
      confirmPassword: password
    });
  };

  if (!isOpen || !child) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Create Student Account</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Child Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">Creating account for:</p>
            <p className="text-lg font-bold text-blue-800">{child.name}</p>
            <p className="text-sm text-blue-700">Level: {child.level}</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="student@example.com"
                required
                disabled={loading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This email will be used for student login
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
              <span>
                Password <span className="text-red-500">*</span>
              </span>
              <button
                type="button"
                onClick={generatePassword}
                className="text-xs text-green-600 hover:text-green-700 font-medium"
                disabled={loading}
              >
                Generate Strong Password
              </button>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Minimum 6 characters"
                minLength={6}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Re-enter password"
                minLength={6}
                required
                disabled={loading}
              />
            </div>
            {formData.password && formData.confirmPassword && (
              <div className={`text-sm mt-2 flex items-center gap-1 ${
                formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'
              }`}>
                {formData.password === formData.confirmPassword ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Passwords match</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4" />
                    <span>Passwords do not match</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Important:</p>
            <ul className="text-xs text-yellow-800 space-y-1">
              <li>• Save these credentials in a safe place</li>
              <li>• Share the login details with your child</li>
              <li>• Your child can change the password later</li>
              <li>• This account allows your child to access their own dashboard</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading || formData.password !== formData.confirmPassword}
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  Create Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}