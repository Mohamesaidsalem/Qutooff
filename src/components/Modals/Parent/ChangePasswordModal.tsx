import React, { useState } from 'react';
import { X, Key, Loader, Eye, EyeOff } from 'lucide-react';
import { useData } from '../../../contexts/DataContext';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: any;
}

export default function ChangePasswordModal({ isOpen, onClose, child }: ChangePasswordModalProps) {
  const { updateStudentPassword } = useData();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!child?.id) {
      alert('Invalid child data');
      return;
    }

    if (!formData.newPassword || !formData.confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await updateStudentPassword(child.id, formData.newPassword);
      alert('Password updated successfully!');
      onClose();
      // Reset form
      setFormData({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !child) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex justify-between items-center rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Key className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Change Password</h2>
              <p className="text-sm text-purple-100">for {child.name}</p>
            </div>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Security:</strong> Make sure to use a strong password and keep it safe. The student will need this to log in.
            </p>
          </div>

          {/* Current Account Info */}
          {child.studentAccount && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Current Email:</strong> {child.studentAccount.email}
              </p>
            </div>
          )}

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12"
                placeholder="Minimum 6 characters"
                minLength={6}
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

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Re-enter new password"
              minLength={6}
              required
              disabled={loading}
            />
          </div>

          {/* Password Match Indicator */}
          {formData.newPassword && formData.confirmPassword && (
            <div className={`text-sm ${formData.newPassword === formData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
              {formData.newPassword === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
            </div>
          )}

          {/* Action Buttons */}
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
  );
}