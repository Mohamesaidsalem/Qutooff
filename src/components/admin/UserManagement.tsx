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
  Trash2,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  BookOpen
} from 'lucide-react';
import { ref, onValue, push, set, off, update } from 'firebase/database';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, database } from '../../firebase/config';
import TimezoneSelector from '../common/TimezoneSelector';
import { getUserTimezone } from '../../utils/timezone';

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [activeUserType, setActiveUserType] = useState('account');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  
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
    qualification: '',
    skypeId: '',
    gender: '',
    language: '',
    data: '',
    numberOfDays: '',
    regularCourse: '',
    teacher: '',
    additionalCourse: ''
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

  useEffect(() => {
    const coursesRef = ref(database, 'courses');
    const unsubscribe = onValue(coursesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const coursesArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setCourses(coursesArray);
      } else {
        setCourses([]);
      }
    });
    return () => off(coursesRef, 'value', unsubscribe);
  }, []);

  useEffect(() => {
    const teachersRef = ref(database, 'teachers');
    const unsubscribe = onValue(teachersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const teachersArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        const activeTeachers = teachersArray.filter(t => t.isActive !== false);
        setTeachers(activeTeachers);
        console.log('✅ [UserManagement] Teachers loaded:', activeTeachers.length);
        activeTeachers.forEach((t, i) => {
          console.log(`  ${i+1}. ${t.name} | ${t.email} | ${t.subject} | ID: ${t.id}`);
        });
      } else {
        setTeachers([]);
        console.log('⚠️ [UserManagement] No teachers in database');
      }
    });
    return () => off(teachersRef, 'value', unsubscribe);
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.name || !formData.email || !formData.password) {
        alert('❌ Please fill all required fields');
        return;
      }

      if (formData.role === 'teacher' && (!formData.subject || !formData.experience)) {
        alert('❌ Please select subject and enter experience');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const firebaseUser = userCredential.user;
      
      const userData = {
        email: formData.email,
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        address: formData.address,
        createdAt: new Date().toISOString(),
        isActive: true,
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

      if (formData.role === 'teacher') {
        const teacherData = {
          name: formData.name,
          email: formData.email,
          subject: formData.subject || 'General',
          specialization: formData.subject || 'General',
          experience: Number(formData.experience) || 0,
          qualification: formData.qualification || '',
          phone: formData.phone || '',
          address: formData.address || '',
          rating: 5.0,
          hourlyRate: 15,
          students: [],
          isActive: true,
          createdAt: new Date().toISOString()
        };
        
        await set(ref(database, `teachers/${firebaseUser.uid}`), teacherData);
        alert(`✅ Teacher "${formData.name}" created successfully!`);
      } else if (formData.role === 'student') {
        const studentData = {
          name: formData.name,
          email: formData.email,
          age: Number(formData.age) || 0,
          level: formData.level || 'Beginner',
          progress: 0,
          parentId: '',
          teacherId: '',
          teacherName: '',
          phone: formData.phone || '',
          address: formData.address || '',
          isActive: true,
          nextClass: 'Not scheduled',
          createdAt: new Date().toISOString()
        };
        await set(ref(database, `children/${firebaseUser.uid}`), studentData);
        alert(`✅ Student created successfully!`);
      } else {
        alert(`✅ Account created successfully!`);
      }

      setShowCreateModal(false);
      resetForm();
    } catch (error: any) {
      console.error('Error:', error);
      if (error.code === 'auth/email-already-in-use') {
        alert('❌ Email already registered');
      } else if (error.code === 'auth/weak-password') {
        alert('❌ Password too weak (min 6 chars)');
      } else {
        alert('❌ Error: ' + error.message);
      }
    }
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setFormData({
      ...formData,
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || '',
      phone: user.phone || '',
      address: user.address || '',
      age: user.age ? String(user.age) : '',
      level: user.level || '',
      subject: user.subject || '',
      experience: user.experience ? String(user.experience) : '',
      qualification: user.qualification || '',
      skypeId: user.skypeId || '',
      gender: user.gender || '',
      language: user.language || '',
      data: user.data || '',
      numberOfDays: user.numberOfDays ? String(user.numberOfDays) : '',
      regularCourse: user.regularCourse || '',
      teacher: user.teacher || '',
      additionalCourse: user.additionalCourse || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const updates = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        updatedAt: new Date().toISOString(),
        ...(formData.role === 'student' && {
          age: formData.age,
          level: formData.level
        }),
        ...(formData.role === 'teacher' && {
          subject: formData.subject,
          specialization: formData.subject,
          experience: formData.experience,
          qualification: formData.qualification
        })
      };

      const userRef = ref(database, `users/${selectedUser.id}`);
      await update(userRef, updates);

      if (formData.role === 'teacher') {
        const teacherRef = ref(database, `teachers/${selectedUser.id}`);
        await update(teacherRef, updates);
      } else if (formData.role === 'student') {
        const childRef = ref(database, `children/${selectedUser.id}`);
        await update(childRef, updates);
      }

      alert('✅ User updated!');
      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
    } catch (error: any) {
      alert('❌ Error: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`Delete ${userName}?`)) {
      try {
        const userRef = ref(database, `users/${userId}`);
        await update(userRef, { isActive: false });
        alert('User deactivated!');
      } catch (error: any) {
        alert('Error: ' + error.message);
      }
    }
  };

  const resetForm = () => {
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
      qualification: '',
      skypeId: '',
      gender: '',
      language: '',
      data: '',
      numberOfDays: '',
      regularCourse: '',
      teacher: '',
      additionalCourse: ''
    });
  };

  const getUsersByRole = (role: string) => users.filter(user => user.role === role && user.isActive !== false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const isActive = user.isActive !== false;
    return matchesSearch && matchesRole && isActive;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="mt-2 text-sm text-gray-600">Create and manage users</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveUserType('account');
              setFormData({ ...formData, role: 'student' });
              setShowCreateModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
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
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
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
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
          >
            <Users className="h-4 w-4 mr-2" />
            Add Parent
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Students</p>
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
              <p className="text-sm text-gray-600">Teachers</p>
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
              <p className="text-sm text-gray-600">Parents</p>
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
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.isActive !== false).length}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <UserPlus className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="parent">Parents</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
      </div>

      {teachers.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-green-800">
              ✅ {teachers.length} teachers in database
            </p>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">All Users ({filteredUsers.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.subject && (
                        <div className="text-xs text-green-600 mt-1">Subject: {user.subject}</div>
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
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span>{user.phone || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewUser(user)}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-50 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
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
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeUserType === 'teacher' ? 'Add Teacher' : 
                   activeUserType === 'parent' ? 'Add Parent' : 'Create Account'}
                </h2>
                <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                    minLength={6}
                  />
                </div>

                {activeUserType === 'account' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="parent">Parent</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                {(formData.role === 'student' || (activeUserType === 'account' && formData.role === 'student')) && (
                  <>
                    <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                      <h3 className="text-lg font-semibold text-teal-700 mb-4">Person Bio Data</h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                          <input
                            type="number"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                            min="5"
                            max="18"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Skype ID</label>
                          <input
                            type="text"
                            value={formData.skypeId}
                            onChange={(e) => setFormData({ ...formData, skypeId: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                          <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="">Select Gender</option>
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                          <select
                            value={formData.language}
                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="">Select Language</option>
                            <option value="English">English</option>
                            <option value="Arabic">Arabic</option>
                            <option value="Urdu">Urdu</option>
                            <option value="Turkish">Turkish</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                          <input
                            type="date"
                            value={formData.data}
                            onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                      <h3 className="text-lg font-semibold text-teal-700 mb-4">Course Details</h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Number of Days</label>
                          <select
                            value={formData.numberOfDays}
                            onChange={(e) => setFormData({ ...formData, numberOfDays: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="">Select Plan</option>
                            <option value="Plan A (2 Days)">Plan A (2 Days)</option>
                            <option value="Plan B (3 Days)">Plan B (3 Days)</option>
                            <option value="Plan C (4 Days)">Plan C (4 Days)</option>
                            <option value="Plan D (5 Days)">Plan D (5 Days)</option>
                            <option value="Plan E (6 Days)">Plan E (6 Days)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Regular Course*</label>
                          <select
                            value={formData.regularCourse}
                            onChange={(e) => setFormData({ ...formData, regularCourse: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="">Select Course</option>
                            <option value="Reading Quran">Reading Quran</option>
                            <option value="Quran Memorization">Quran Memorization</option>
                            <option value="Tajweed">Tajweed</option>
                            <option value="Islamic Studies">Islamic Studies</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Teacher*</label>
                          <select
                            value={formData.teacher}
                            onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="">Select Teacher</option>
                            {teachers.map(teacher => (
                              <option key={teacher.id} value={teacher.id}>
                                {teacher.name} - {teacher.subject}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Course*</label>
                          <select
                            value={formData.additionalCourse}
                            onChange={(e) => setFormData({ ...formData, additionalCourse: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="">Select Additional Course</option>
                            <option value="None">None</option>
                            <option value="Arabic Language">Arabic Language</option>
                            <option value="Islamic History">Islamic History</option>
                            <option value="Duas & Supplications">Duas & Supplications</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {(formData.role === 'teacher' || activeUserType === 'teacher') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Choose...</option>
                        {courses.map(course => (
                          <option key={course.id} value={course.title}>
                            {course.title} - {course.level}
                          </option>
                        ))}
                        <option value="Quran Memorization">Quran Memorization</option>
                        <option value="Tajweed">Tajweed</option>
                        <option value="Islamic Studies">Islamic Studies</option>
                        <option value="Arabic Language">Arabic Language</option>
                        <option value="General">General</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years) *</label>
                      <input
                        type="number"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications</label>
                      <textarea
                        value={formData.qualification}
                        onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>
                  </>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    {activeUserType === 'teacher' ? 'Add Teacher' : 
                     activeUserType === 'parent' ? 'Add Parent' : 'Create'}
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