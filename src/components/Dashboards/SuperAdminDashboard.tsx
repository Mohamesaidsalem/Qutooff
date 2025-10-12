import React, { useState, useEffect } from 'react';
import { Users, Shield, UserPlus, Settings, Crown, Search, Filter, X, Globe, Eye, EyeOff } from 'lucide-react';
import { ref, onValue, push, set, off } from 'firebase/database';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, database } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';

interface SuperAdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  timezone: string;
  lastLogin?: string;
}

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [allUsers, setAllUsers] = useState<SuperAdminUser[]>([]);
  const [admins, setAdmins] = useState<SuperAdminUser[]>([]);
  const [teachers, setTeachers] = useState<SuperAdminUser[]>([]);
  const [students, setStudents] = useState<SuperAdminUser[]>([]);
  const [parents, setParents] = useState<SuperAdminUser[]>([]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'admin' | 'teacher'>('admin');
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [showPassword, setShowPassword] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Load data from Firebase
  useEffect(() => {
    if (!user || user.role !== 'super_admin') return;

    const usersRef = ref(database, 'users');
    const teachersRef = ref(database, 'teachers');

    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const usersArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        
        setAllUsers(usersArray);
        setAdmins(usersArray.filter(u => u.role === 'admin'));
        setStudents(usersArray.filter(u => u.role === 'student'));
        setParents(usersArray.filter(u => u.role === 'parent'));
      }
      setLoading(false);
    });

    const unsubscribeTeachers = onValue(teachersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const teachersArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setTeachers(teachersArray);
      }
    });

    return () => {
      off(usersRef, 'value', unsubscribeUsers);
      off(teachersRef, 'value', unsubscribeTeachers);
    };
  }, [user]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const firebaseUser = userCredential.user;
      
      // Save to users collection
      const userData = {
        email: formData.email,
        name: formData.name,
        role: createType,
        timezone: formData.timezone,
        createdAt: new Date().toISOString(),
        createdBy: user?.id
      };
      
      await set(ref(database, `users/${firebaseUser.uid}`), userData);
      
      // If creating teacher, also add to teachers collection
      if (createType === 'teacher') {
        const teacherData = {
          name: formData.name,
          email: formData.email,
          timezone: formData.timezone,
          createdAt: new Date().toISOString(),
          createdBy: user?.id,
          userId: firebaseUser.uid
        };
        
        const teachersRef = ref(database, 'teachers');
        await push(teachersRef, teacherData);
      }
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      
      setShowCreateModal(false);
      alert(`${createType === 'admin' ? 'Admin' : 'Teacher'} created successfully!`);
      
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert('Error creating user: ' + error.message);
    }
  };

  const filteredUsers = allUsers.filter(userItem => {
    const matchesSearch = !searchTerm || 
      userItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterRole === 'all' || userItem.role === filterRole;
    
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { 
      name: 'Total Admins', 
      value: admins.length, 
      icon: Shield, 
      color: 'bg-purple-500',
      description: 'System administrators'
    },
    { 
      name: 'Total Teachers', 
      value: teachers.length, 
      icon: Users, 
      color: 'bg-blue-500',
      description: 'Active teachers'
    },
    { 
      name: 'Total Students', 
      value: students.length, 
      icon: Users, 
      color: 'bg-green-500',
      description: 'Enrolled students'
    },
    { 
      name: 'Total Parents', 
      value: parents.length, 
      icon: Users, 
      color: 'bg-orange-500',
      description: 'Parent accounts'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Super Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Super Admin access required</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Super Admin Overview', icon: Crown },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'system', name: 'System Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="h-8 w-8 text-red-600" />
                <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
              </div>
              <p className="text-gray-600">
                Highest level system administration and management
              </p>
              <div className="mt-2 flex items-center space-x-4 text-sm">
                <span className="flex items-center text-red-600">
                  <Shield className="h-4 w-4 mr-1" />
                  Super Admin: {user.name}
                </span>
                <span className="flex items-center text-gray-500">
                  <Globe className="h-4 w-4 mr-1" />
                  {user.timezone}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setCreateType('admin');
                  setShowCreateModal(true);
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center shadow-sm"
              >
                <Shield className="h-4 w-4 mr-2" />
                Add Admin
              </button>
              <button
                onClick={() => {
                  setCreateType('teacher');
                  setShowCreateModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Teacher
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                      activeTab === tab.id
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.name} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`p-3 rounded-lg ${stat.color}`}>
                          <stat.icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {stat.name}
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              {stat.value}
                            </div>
                          </dd>
                          <dt className="text-xs text-gray-400 mt-1">
                            {stat.description}
                          </dt>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admins</option>
                    <option value="teacher">Teachers</option>
                    <option value="parent">Parents</option>
                    <option value="student">Students</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">
                  All Users ({filteredUsers.length})
                </h3>
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
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((userItem) => (
                      <tr key={userItem.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              userItem.role === 'super_admin' ? 'bg-red-100' :
                              userItem.role === 'admin' ? 'bg-purple-100' :
                              userItem.role === 'teacher' ? 'bg-blue-100' :
                              userItem.role === 'parent' ? 'bg-green-100' :
                              'bg-orange-100'
                            }`}>
                              {userItem.role === 'super_admin' && <Crown className="h-4 w-4 text-red-600" />}
                              {userItem.role === 'admin' && <Shield className="h-4 w-4 text-purple-600" />}
                              {userItem.role === 'teacher' && <Users className="h-4 w-4 text-blue-600" />}
                              {(userItem.role === 'parent' || userItem.role === 'student') && <Users className="h-4 w-4 text-green-600" />}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{userItem.name}</p>
                              <p className="text-sm text-gray-500">{userItem.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            userItem.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                            userItem.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            userItem.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                            userItem.role === 'parent' ? 'bg-green-100 text-green-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {userItem.role === 'super_admin' ? 'Super Admin' :
                             userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(userItem.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                            onClick={() => {
                              alert('User management actions coming soon');
                            }}
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-sm">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">System Settings</h3>
            <p className="text-gray-500">Advanced system configuration coming soon...</p>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    {createType === 'admin' ? (
                      <Shield className="h-6 w-6 mr-2 text-purple-600" />
                    ) : (
                      <UserPlus className="h-6 w-6 mr-2 text-blue-600" />
                    )}
                    Create {createType === 'admin' ? 'Admin' : 'Teacher'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({
                        name: '',
                        email: '',
                        password: '',
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                      placeholder="Enter full name"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setFormData({
                          name: '',
                          email: '',
                          password: '',
                          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                        });
                      }}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`flex-1 py-2 px-4 rounded-lg text-white transition-colors ${
                        createType === 'admin' 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      Create {createType === 'admin' ? 'Admin' : 'Teacher'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}