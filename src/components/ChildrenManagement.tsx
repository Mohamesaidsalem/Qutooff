import React, { useState } from 'react';
import { Plus, Edit, Trash2, User, UserPlus, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFirebaseData, Child, Parent } from '../contexts/FirebaseDataContext';

export default function ChildrenManagement() {
  const { user } = useAuth();
  const { 
    children, 
    parents, 
    teachers,
    addChild, 
    updateChild, 
    removeChild,
    createStudentAccount,
    updateStudentPassword 
  } = useFirebaseData();
  
  const [showModal, setShowModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    level: '',
    parentId: '',
    teacherId: '',
    progress: '0'
  });
  const [accountData, setAccountData] = useState({
    email: '',
    password: ''
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const levels = [
    'Short Surahs',
    'Surah Yaseen',
    'Surah Al-Mulk',
    'Surah Al-Baqarah',
    'Advanced Level'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingChild) {
        await updateChild(editingChild.id, {
          name: formData.name,
          age: parseInt(formData.age),
          level: formData.level,
          parentId: formData.parentId,
          teacherId: formData.teacherId || undefined,
          progress: parseInt(formData.progress)
        });
        alert('Child updated successfully!');
      } else {
        await addChild({
          name: formData.name,
          age: parseInt(formData.age),
          level: formData.level,
          parentId: formData.parentId,
          teacherId: formData.teacherId || undefined,
          progress: parseInt(formData.progress),
          isActive: true
        });
        alert('Child added successfully!');
      }
      
      setShowModal(false);
      setEditingChild(null);
      setFormData({ name: '', age: '', level: '', parentId: '', teacherId: '', progress: '0' });
    } catch (error) {
      console.error('Error saving child:', error);
      alert('Failed to save child');
    }
  };

  const handleEdit = (child: Child) => {
    setEditingChild(child);
    setFormData({
      name: child.name,
      age: child.age.toString(),
      level: child.level,
      parentId: child.parentId,
      teacherId: child.teacherId || '',
      progress: child.progress.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (childId: string) => {
    if (!confirm('Are you sure you want to delete this child? This action cannot be undone.')) {
      return;
    }
    
    try {
      await removeChild(childId);
      alert('Child deleted successfully!');
    } catch (error) {
      console.error('Error deleting child:', error);
      alert('Failed to delete child');
    }
  };

  const handleCreateAccount = (child: Child) => {
    setSelectedChild(child);
    setAccountData({
      email: `${child.name.toLowerCase().replace(/\s+/g, '.')}@student.academy.com`,
      password: `${child.name.toLowerCase().replace(/\s+/g, '')}123`
    });
    setShowAccountModal(true);
  };

  const handleSubmitAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChild) return;
    
    try {
      await createStudentAccount(selectedChild.id, accountData.email, accountData.password);
      alert(`Student account created successfully!\n\nEmail: ${accountData.email}\nPassword: ${accountData.password}\n\nThe student can now log in with these credentials.`);
      setShowAccountModal(false);
      setSelectedChild(null);
      setAccountData({ email: '', password: '' });
    } catch (error) {
      console.error('Error creating student account:', error);
      alert('Failed to create student account');
    }
  };

  const handleChangePassword = (child: Child) => {
    if (!child.studentAccount) {
      alert('No student account exists for this child');
      return;
    }
    setSelectedChild(child);
    setPasswordData({ newPassword: '', confirmPassword: '' });
    setShowPasswordModal(true);
  };

  const handleSubmitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChild) return;
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    
    try {
      await updateStudentPassword(selectedChild.id, passwordData.newPassword);
      alert('Password changed successfully!');
      setShowPasswordModal(false);
      setSelectedChild(null);
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Children Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage student accounts and progress
          </p>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            setEditingChild(null);
            setFormData({ name: '', age: '', level: '', parentId: '', teacherId: '', progress: '0' });
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Child
        </button>
      </div>

      {/* Children Table */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">All Students</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level & Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {children.map((child) => {
                const parent = parents.find(p => p.id === child.parentId);
                const teacher = teachers.find(t => t.id === child.teacherId);
                
                return (
                  <tr key={child.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-600 font-medium">
                              {child.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{child.name}</div>
                          <div className="text-sm text-gray-500">Age: {child.age}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{parent?.name || 'No parent assigned'}</div>
                      <div className="text-sm text-gray-500">{parent?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{child.level}</div>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
                          <div 
                            className="bg-primary-600 h-2 rounded-full" 
                            style={{ width: `${child.progress}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-900">{child.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{teacher?.name || 'Not assigned'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {child.studentAccount ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          ✅ Has Account
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          ❌ No Account
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(child)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                          title="Edit Child"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {!child.studentAccount && (
                          <button
                            onClick={() => handleCreateAccount(child)}
                            className="text-green-600 hover:text-green-900 flex items-center"
                            title="Create Student Account"
                          >
                            <UserPlus className="h-4 w-4" />
                          </button>
                        )}
                        {child.studentAccount && (
                          <button
                            onClick={() => handleChangePassword(child)}
                            className="text-purple-600 hover:text-purple-900 flex items-center"
                            title="Change Password"
                          >
                            <Key className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(child.id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          title="Delete Child"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingChild ? 'Edit Child' : 'Add New Child'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Child Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="18"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent *
                  </label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select Parent</option>
                    {parents.map(parent => (
                      <option key={parent.id} value={parent.id}>{parent.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Level *
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select Level</option>
                    {levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teacher
                  </label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.filter(t => t.isActive).map(teacher => (
                      <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Progress (%) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    {editingChild ? 'Update Child' : 'Add Child'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      {showAccountModal && selectedChild && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Create Student Account for {selectedChild.name}
                </h2>
                <button
                  onClick={() => setShowAccountModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={accountData.email}
                    onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={accountData.password}
                    onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAccountModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && selectedChild && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Change Password for {selectedChild.name}
                </h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitPasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    minLength={6}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    minLength={6}
                    required
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}