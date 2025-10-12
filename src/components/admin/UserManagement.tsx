import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  X, 
  Search, 
  Filter, 
  UserPlus,
  GraduationCap,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ref, onValue, push, set, off } from 'firebase/database';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, database } from '../../firebase/config';

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeUserType, setActiveUserType] = useState('account');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    phone: '',
    address: '',
    age: '',
    level: '',
    subject: '',
    experience: '',
    qualification: ''
  });

  useEffect(() => {
    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const usersArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setUsers(usersArray);
      } else {
        setUsers([]);
      }
    });

    return () => off(usersRef, 'value', unsubscribe);
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // إنشاء المستخدم في Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const firebaseUser = userCredential.user;
      
      // حفظ بيانات المستخدم في قاعدة البيانات
      const userData = {
        email: formData.email,
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        address: formData.address,
        createdAt: new Date().toISOString(),
        ...(formData.role === 'student' && {
          age: formData.age,
          level: formData.level,
          progress: 0
        }),
        ...(formData.role === 'teacher' && {
          subject: formData.subject,
          experience: formData.experience,
          qualification: formData.qualification,
          rating: 5.0
        })
      };
      
      await set(ref(database, `users/${firebaseUser.uid}`), userData);

      // إضافة في الجداول المختصة
      if (formData.role === 'teacher') {
        await set(ref(database, `teachers/${firebaseUser.uid}`), userData);
      } else if (formData.role === 'student') {
        await set(ref(database, `children/${firebaseUser.uid}`), userData);
      }

      alert(`${formData.role === 'teacher' ? 'Teacher' : formData.role === 'parent' ? 'Parent' : 'Account'} created successfully!`);
      setShowCreateModal(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'student',
        phone: '',
        address: '',
        age: '',
        level: '',
        subject: '',
        experience: '',
        qualification: ''
      });
    } catch (error: any) {
      console.error('Error creating account:', error);
      alert('Error creating account: ' + error.message);
    }
  };

  const getUsersByRole = (role: string) => users.filter(user => user.role === role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage user accounts, teachers, and parents
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveUserType('account');
              setFormData({ ...formData, role: 'student' });
              setShowCreateModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Create Account
          </button>
          <button
            onClick={() => {
              setActiveUserType('teacher');
              setFormData({ ...formData, role: 'teacher' });
              setShowCreateModal(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <GraduationCap className="h-4 w-4 mr-2" />
            Add Teacher
          </button>
          <button
            onClick={() => {
              setActiveUserType('parent');
              setFormData({ ...formData, role: 'parent' });
              setShowCreateModal(true);
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <Users className="h-4 w-4 mr-2" />
            Add Parent
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-blue-600">{getUsersByRole('student').length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Teachers</p>
              <p className="text-2xl font-bold text-green-600">{getUsersByRole('teacher').length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Parents</p>
              <p className="text-2xl font-bold text-purple-600">{getUsersByRole('parent').length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <UserPlus className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.level && (
                        <div className="text-xs text-blue-600">Level: {user.level}</div>
                      )}
                      {user.subject && (
                        <div className="text-xs text-green-600">Subject: {user.subject}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'teacher' ? 'bg-green-100 text-green-800' :
                      user.role === 'student' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'parent' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>{user.phone || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{user.address || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm">Start by creating your first user account</p>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeUserType === 'teacher' ? 'Add New Teacher' : 
                   activeUserType === 'parent' ? 'Add New Parent' : 'Create New Account'}
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-4">
                {/* Basic Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {activeUserType === 'account' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="parent">Parent</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                {/* Student-specific fields */}
                {(formData.role === 'student' || activeUserType === 'account') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age
                      </label>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="5"
                        max="18"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Level
                      </label>
                      <select
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Level</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Elementary">Elementary</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Teacher-specific fields */}
                {(formData.role === 'teacher' || activeUserType === 'teacher') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject Specialization *
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., English, Mathematics, Science"
                        required={formData.role === 'teacher'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Qualifications
                      </label>
                      <textarea
                        value={formData.qualification}
                        onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        placeholder="e.g., B.A. in English, TEFL Certificate"
                      />
                    </div>
                  </>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {activeUserType === 'teacher' ? 'Add Teacher' : 
                     activeUserType === 'parent' ? 'Add Parent' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;