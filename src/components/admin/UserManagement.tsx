import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  GraduationCap,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Globe,
  User,
  Home,
  X,
  Save,
  Key,
  Lock
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { ref, update } from 'firebase/database';
import { database, auth } from '../../firebase/config';
import { updatePassword } from 'firebase/auth';

// ============================================
// TYPES
// ============================================

interface BaseUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  type: string;
  createdAt?: string;
}

interface FamilyUser extends BaseUser {
  type: 'family';
  role: 'parent' | 'independent_student';
  familyName: string;
  timezone: string;
  studentsCount: number;
  status: 'active' | 'inactive';
}

interface StudentUser extends BaseUser {
  type: 'student';
  role: 'student';
  age: number;
  level: string;
  progress: number;
  teacherName: string;
  parentId: string;
}

interface TeacherUser extends BaseUser {
  type: 'teacher';
  role: 'teacher';
  specialization: string;
  experience?: number;
  rating?: number;
}

type AllUser = FamilyUser | StudentUser | TeacherUser;

// ============================================
// EDIT USER MODAL
// ============================================

interface EditUserModalProps {
  user: AllUser;
  onClose: () => void;
  onSave: (updatedUser: AllUser) => Promise<void>;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    ...(user.type === 'student' && {
      age: user.age,
      level: user.level
    }),
    ...(user.type === 'teacher' && {
      specialization: user.specialization,
      experience: user.experience
    }),
    ...(user.type === 'family' && {
      timezone: user.timezone
    })
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = { ...user, ...formData };
      await onSave(updatedUser);
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user changes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">Edit User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {user.type === 'student' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  min="5"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </>
          )}

          {user.type === 'teacher' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  min="0"
                />
              </div>
            </>
          )}

          {user.type === 'family' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Africa/Cairo">Africa/Cairo (GMT+2)</option>
                <option value="America/New_York">America/New_York (GMT-5)</option>
                <option value="Europe/London">Europe/London (GMT+0)</option>
                <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// RESET PASSWORD MODAL
// ============================================

interface ResetPasswordModalProps {
  user: AllUser;
  onClose: () => void;
  onReset: (userId: string, newPassword: string) => Promise<void>;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ user, onClose, onReset }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await onReset(user.id, newPassword);
      onClose();
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <h3 className="text-xl font-semibold">Reset Password</h3>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>User:</strong> {user.name} ({user.email})
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter new password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Confirm new password"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showPassword" className="ml-2 text-sm text-gray-700">
              Show passwords
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Key className="h-4 w-4" />
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// Main Component
// ============================================

const UserManagement = () => {
  const { families, children, teachers, updateChild, updateFamily } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [editingUser, setEditingUser] = useState<AllUser | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<AllUser | null>(null);

  const isIndependentAccount = (familyName: string, childrenCount: number): boolean => {
    return familyName?.includes("'s Account") || childrenCount === 1;
  };

  const allUsers = React.useMemo((): AllUser[] => {
    const familyUsers: FamilyUser[] = families.map(family => {
      const isIndependent = isIndependentAccount(family.name, family.children?.length || 0);
      
      return {
        id: family.id,
        name: family.parentName,
        email: family.parentEmail,
        phone: family.parentPhone,
        role: isIndependent ? 'independent_student' : 'parent',
        type: 'family' as const,
        familyName: family.name,
        timezone: family.timezone,
        studentsCount: family.children?.length || 0,
        createdAt: family.createdAt,
        status: family.status
      };
    });

    const studentUsers: StudentUser[] = children.map(child => ({
      id: child.id,
      name: child.name,
      email: child.email || child.studentAccount?.email || '',
      phone: child.phone || '',
      role: 'student' as const,
      type: 'student' as const,
      age: child.age,
      level: child.level,
      progress: child.progress,
      teacherName: child.teacherName,
      parentId: child.parentId,
      createdAt: child.createdAt
    }));

    const teacherUsers: TeacherUser[] = teachers.map(teacher => ({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || '',
      role: 'teacher' as const,
      type: 'teacher' as const,
      specialization: teacher.specialization,
      experience: 5,
      rating: 4.5,
      createdAt: new Date().toISOString()
    }));

    return [...familyUsers, ...studentUsers, ...teacherUsers];
  }, [families, children, teachers]);

  const handleSaveUser = async (updatedUser: AllUser) => {
    try {
      if (updatedUser.type === 'student') {
        await updateChild(updatedUser.id, {
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          age: updatedUser.age,
          level: updatedUser.level
        });
      } else if (updatedUser.type === 'family') {
        await updateFamily(updatedUser.id, {
          parentName: updatedUser.name,
          parentEmail: updatedUser.email,
          parentPhone: updatedUser.phone,
          timezone: updatedUser.timezone
        });
      } else if (updatedUser.type === 'teacher') {
        const teacherRef = ref(database, `teachers/${updatedUser.id}`);
        await update(teacherRef, {
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          specialization: updatedUser.specialization,
          experience: updatedUser.experience
        });
      }
      alert('✅ User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const handleResetPassword = async (userId: string, newPassword: string) => {
    try {
      const user = allUsers.find(u => u.id === userId);
      if (!user) throw new Error('User not found');

      if (user.type === 'student') {
        // Update in children node
        const childRef = ref(database, `children/${userId}`);
        await update(childRef, {
          password: newPassword,
          'studentAccount/password': newPassword
        });
        alert('✅ Password reset successfully for student!');
      } else if (user.type === 'family') {
        // Update in families node (for parent login)
        const familyRef = ref(database, `families/${userId}`);
        await update(familyRef, {
          password: newPassword
        });
        alert('✅ Password reset successfully for parent!');
      } else if (user.type === 'teacher') {
        const teacherRef = ref(database, `teachers/${userId}`);
        await update(teacherRef, {
          password: newPassword
        });
        alert('✅ Password reset successfully for teacher!');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      alert(`🗑️ Deleting ${userName} - Feature to be implemented`);
    }
  };

  const getUsersByRole = (role: string) => {
    if (role === 'parent') {
      return allUsers.filter(u => u.role === 'parent' || u.role === 'independent_student');
    }
    return allUsers.filter(u => u.role === role);
  };

  const filteredUsers = allUsers.filter(user => {
    const familyName = user.type === 'family' ? user.familyName : '';
    const teacherName = user.type === 'student' ? user.teacherName : '';
    
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || 
      (filterRole === 'parent' && (user.role === 'parent' || user.role === 'independent_student')) ||
      user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const stats = {
    totalStudents: getUsersByRole('student').length,
    totalTeachers: getUsersByRole('teacher').length,
    totalParents: getUsersByRole('parent').length,
    independentStudents: allUsers.filter(u => u.role === 'independent_student').length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="mt-2 text-sm text-gray-600">View and manage all users across the system</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            ℹ️ To add new users, go to <strong>Family Management</strong>
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Students</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
              <p className="text-xs text-gray-500 mt-1">All enrolled students</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Teachers</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalTeachers}</p>
              <p className="text-xs text-gray-500 mt-1">Active teachers</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Parents</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalParents}</p>
              <p className="text-xs text-gray-500 mt-1">Family accounts</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Home className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Independent</p>
              <p className="text-2xl font-bold text-gray-600">{stats.independentStudents}</p>
              <p className="text-xs text-gray-500 mt-1">Independent accounts</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <User className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="parent">Parents & Independent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">All Users ({filteredUsers.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={`${user.type}-${user.id}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
                      {user.type === 'family' && (
                        <div className="text-xs text-blue-600 mt-1">Family: {user.familyName}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'teacher' ? 'bg-green-100 text-green-800' :
                      user.role === 'student' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'independent_student' ? 'bg-gray-100 text-gray-800' :
                      user.role === 'parent' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'independent_student' ? 'Independent' : 
                       user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-sm text-gray-900">
                      {user.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      {user.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="truncate max-w-[200px]">{user.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.type === 'student' && (
                      <div className="space-y-1">
                        <div>Age: {user.age}, Level: {user.level}</div>
                        <div>Progress: {user.progress}%</div>
                      </div>
                    )}
                    {user.type === 'teacher' && (
                      <div className="space-y-1">
                        <div>{user.specialization}</div>
                        {user.experience && <div>{user.experience} years exp.</div>}
                      </div>
                    )}
                    {user.type === 'family' && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3 text-gray-400" />
                          <span>{user.timezone}</span>
                        </div>
                        <div>Students: {user.studentsCount}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setResetPasswordUser(user)}
                        className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded transition-colors"
                        title="Reset Password"
                      >
                        <Key className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveUser}
        />
      )}

      {resetPasswordUser && (
        <ResetPasswordModal
          user={resetPasswordUser}
          onClose={() => setResetPasswordUser(null)}
          onReset={handleResetPassword}
        />
      )}
    </div>
  );
};

export default UserManagement;