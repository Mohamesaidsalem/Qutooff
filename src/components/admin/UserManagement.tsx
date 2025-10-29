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
  Home
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';

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
// Helper Functions
// ============================================

const isIndependentAccount = (familyName: string, childrenCount: number): boolean => {
  return familyName?.includes("'s Account") || childrenCount === 1;
};

// ============================================
// Main Component
// ============================================

const UserManagement = () => {
  const { families, children, teachers } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // دمج كل البيانات في مكان واحد
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
      email: child.email || '',
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
      experience: 5, // قيمة افتراضية أو يمكن إضافتها للـ Teacher type
      rating: 4.5, // قيمة افتراضية أو يمكن إضافتها للـ Teacher type
      createdAt: new Date().toISOString() // قيمة افتراضية
    }));

    return [...familyUsers, ...studentUsers, ...teacherUsers];
  }, [families, children, teachers]);

  const handleViewUser = (user: AllUser) => {
    console.log('Viewing user:', user);
    alert(`Viewing ${user.name} - ${user.role}`);
  };

  const handleEditUser = (user: AllUser) => {
    console.log('Editing user:', user);
    alert(`Editing ${user.name}`);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Delete ${userName}?`)) {
      alert(`Deleting ${userName} - Feature to be implemented`);
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

      {/* Enhanced Statistics */}
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

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
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
              <option value="parent">Parents & Independent</option>
            </select>
          </div>
        </div>
      </div>

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={`${user.type}-${user.id}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
                      {user.type === 'family' && (
                        <div className="text-xs text-blue-600 mt-1">Family: {user.familyName}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="space-y-1">
                      {user.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      {user.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.type === 'student' && (
                      <div>
                        <div>Age: {user.age}, Level: {user.level}</div>
                        <div>Progress: {user.progress}%</div>
                        <div>Teacher: {user.teacherName}</div>
                      </div>
                    )}
                    {user.type === 'teacher' && (
                      <div>
                        <div>Specialization: {user.specialization}</div>
                        {user.experience && <div>Experience: {user.experience} years</div>}
                        {user.rating && <div>Rating: {user.rating}/5</div>}
                      </div>
                    )}
                    {user.type === 'family' && (
                      <div>
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3 text-gray-400" />
                          <span>{user.timezone}</span>
                        </div>
                        <div>Students: {user.studentsCount}</div>
                        {user.role === 'independent_student' && (
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                            Independent Account
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                        title="View User"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-50 rounded"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
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
    </div>
  );
};

export default UserManagement;