import React, { useState, useMemo } from 'react';
import { Users, Search, Plus, Edit, Trash2, X, Calendar, BookOpen, Award, Clock, Star, ChevronLeft, ChevronRight, UserPlus, Mail, Phone, Briefcase, CheckCircle, AlertCircle, Eye } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  specialization: string;
  experience: number;
  qualification: string;
  phone: string;
  hourlyRate: number;
  rating: number;
  isActive: boolean;
  createdAt: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  level: string;
  teacherId?: string;
  teacherName?: string;
}

export default function AdminTeacherManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const teachersPerPage = 10;

  // Mock data - replace with real data from Firebase
  const allTeachers: Teacher[] = [
    { id: '1', name: 'Sheikh Ahmed Mohamed', email: 'ahmed@qutooff.com', subject: 'Quran Memorization', specialization: 'Tajweed', experience: 10, qualification: 'PhD in Islamic Studies', phone: '+20 123 456 789', hourlyRate: 20, rating: 4.8, isActive: true, createdAt: '2024-01-15' },
    { id: '2', name: 'Ustadha Fatima Ali', email: 'fatima@qutooff.com', subject: 'Tajweed', specialization: 'Quranic Recitation', experience: 8, qualification: 'Masters in Quranic Studies', phone: '+20 123 456 790', hourlyRate: 18, rating: 4.9, isActive: true, createdAt: '2024-02-10' },
    { id: '3', name: 'Sheikh Mohamed Hassan', email: 'mohamed@qutooff.com', subject: 'Islamic Studies', specialization: 'Hadith', experience: 15, qualification: 'PhD in Hadith Sciences', phone: '+20 123 456 791', hourlyRate: 25, rating: 4.7, isActive: true, createdAt: '2023-11-20' },
    { id: '4', name: 'Ustadha Sarah Ibrahim', email: 'sarah@qutooff.com', subject: 'Arabic Language', specialization: 'Grammar', experience: 6, qualification: 'BA in Arabic Literature', phone: '+20 123 456 792', hourlyRate: 15, rating: 4.5, isActive: true, createdAt: '2024-03-05' },
    { id: '5', name: 'Sheikh Omar Abdullah', email: 'omar@qutooff.com', subject: 'Quran Memorization', specialization: 'Hifz', experience: 12, qualification: 'Certified Hafiz & Qari', phone: '+20 123 456 793', hourlyRate: 22, rating: 4.9, isActive: false, createdAt: '2023-12-01' },
  ];

  const allStudents: Student[] = [
    { id: '1', name: 'Mohamed Ali', email: 'mohamed@email.com', level: 'Intermediate', teacherId: '1', teacherName: 'Sheikh Ahmed Mohamed' },
    { id: '2', name: 'Fatima Ahmed', email: 'fatima@email.com', level: 'Beginner', teacherId: '2', teacherName: 'Ustadha Fatima Ali' },
    { id: '3', name: 'Ahmed Khaled', email: 'ahmed@email.com', level: 'Advanced', teacherId: '1', teacherName: 'Sheikh Ahmed Mohamed' },
    { id: '4', name: 'Sarah Mahmoud', email: 'sarah@email.com', level: 'Intermediate' },
    { id: '5', name: 'Omar Hassan', email: 'omar@email.com', level: 'Beginner' },
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    specialization: '',
    experience: '',
    qualification: '',
    phone: '',
    hourlyRate: '15'
  });

  // Filter teachers
  const filteredTeachers = useMemo(() => {
    return allTeachers.filter(teacher => {
      const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = filterSubject === 'all' || teacher.subject === filterSubject;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && teacher.isActive) ||
                           (filterStatus === 'inactive' && !teacher.isActive);
      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [searchTerm, filterSubject, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredTeachers.length / teachersPerPage);
  const startIndex = (currentPage - 1) * teachersPerPage;
  const endIndex = startIndex + teachersPerPage;
  const currentTeachers = filteredTeachers.slice(startIndex, endIndex);

  // Get unique subjects
  const subjects = ['all', ...Array.from(new Set(allTeachers.map(t => t.subject)))];

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      subject: '',
      specialization: '',
      experience: '',
      qualification: '',
      phone: '',
      hourlyRate: '15'
    });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding teacher:', formData);
    alert('Teacher added successfully! ✅');
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Updating teacher:', selectedTeacher?.id, formData);
    alert('Teacher updated successfully! ✅');
    setShowEditModal(false);
    setSelectedTeacher(null);
    resetForm();
  };

  const handleDelete = () => {
    console.log('Deleting teacher:', selectedTeacher?.id);
    alert('Teacher deactivated successfully! ⚠️');
    setShowDeleteModal(false);
    setSelectedTeacher(null);
  };

  const handleAssignStudents = () => {
    console.log('Assigning students to teacher:', selectedTeacher?.id);
    alert('Students assigned successfully! ✅');
    setShowAssignModal(false);
    setSelectedTeacher(null);
  };

  const openEditModal = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      subject: teacher.subject,
      specialization: teacher.specialization,
      experience: teacher.experience.toString(),
      qualification: teacher.qualification,
      phone: teacher.phone,
      hourlyRate: teacher.hourlyRate.toString()
    });
    setShowEditModal(true);
  };

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      'Quran Memorization': 'bg-green-100 text-green-800',
      'Tajweed': 'bg-blue-100 text-blue-800',
      'Islamic Studies': 'bg-purple-100 text-purple-800',
      'Arabic Language': 'bg-orange-100 text-orange-800',
    };
    return colors[subject] || 'bg-gray-100 text-gray-800';
  };

  // Stats
  const stats = {
    total: allTeachers.length,
    active: allTeachers.filter(t => t.isActive).length,
    avgRating: (allTeachers.reduce((acc, t) => acc + t.rating, 0) / allTeachers.length).toFixed(1),
    totalStudents: allStudents.filter(s => s.teacherId).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teacher Management</h2>
          <p className="mt-1 text-sm text-gray-600">Manage all teachers and their assignments</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
        >
          <Plus className="h-4 w-4" />
          Add New Teacher
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Teachers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Teachers</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.avgRating}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Assigned Students</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalStudents}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterSubject}
            onChange={(e) => {
              setFilterSubject(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {subjects.map(subject => (
              <option key={subject} value={subject}>
                {subject === 'all' ? 'All Subjects' : subject}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                        {teacher.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                        <div className="text-sm text-gray-500">{teacher.email}</div>
                        <div className="text-xs text-gray-400">{teacher.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${getSubjectColor(teacher.subject)}`}>
                      {teacher.subject}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">{teacher.specialization}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{teacher.experience} years</div>
                    <div className="text-xs text-gray-500">${teacher.hourlyRate}/hr</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <span className="ml-1 text-sm font-semibold text-gray-900">{teacher.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      teacher.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {teacher.isActive ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedTeacher(teacher);
                          setShowViewModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(teacher)}
                        className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded transition-colors"
                        title="Edit Teacher"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTeacher(teacher);
                          setShowAssignModal(true);
                        }}
                        className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded transition-colors"
                        title="Assign Students"
                      >
                        <UserPlus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTeacher(teacher);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors"
                        title="Delete Teacher"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredTeachers.length)} of {filteredTeachers.length} teachers
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded-lg font-medium ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">
                {showAddModal ? 'Add New Teacher' : 'Edit Teacher'}
              </h3>
              <button
                onClick={() => {
                  showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                  resetForm();
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={showAddModal ? handleAdd : handleEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Subject</option>
                    <option value="Quran Memorization">Quran Memorization</option>
                    <option value="Tajweed">Tajweed</option>
                    <option value="Islamic Studies">Islamic Studies</option>
                    <option value="Arabic Language">Arabic Language</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years) *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate ($) *</label>
                  <input
                    type="number"
                    min="10"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications</label>
                <textarea
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="e.g., PhD in Islamic Studies, Certified Hafiz..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {showAddModal ? 'Add Teacher' : 'Update Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">Teacher Details</h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedTeacher(null);
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Teacher Info */}
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-3xl">
                  {selectedTeacher.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900">{selectedTeacher.name}</h4>
                  <p className="text-gray-600">{selectedTeacher.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSubjectColor(selectedTeacher.subject)}`}>
                      {selectedTeacher.subject}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedTeacher.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedTeacher.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl text-center">
                  <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{selectedTeacher.experience}</p>
                  <p className="text-sm text-gray-600">Years Exp.</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl text-center">
                  <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{selectedTeacher.rating}</p>
                  <p className="text-sm text-gray-600">Rating</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl text-center">
                  <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {allStudents.filter(s => s.teacherId === selectedTeacher.id).length}
                  </p>
                  <p className="text-sm text-gray-600">Students</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl text-center">
                  <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">${selectedTeacher.hourlyRate}</p>
                  <p className="text-sm text-gray-600">Per Hour</p>
                </div>
              </div>

              {/* Details */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                <h5 className="font-bold text-gray-900 mb-3">Contact & Details</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold text-gray-900">{selectedTeacher.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-semibold text-gray-900">{selectedTeacher.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Specialization:</span>
                    <span className="font-semibold text-gray-900">{selectedTeacher.specialization}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Joined:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(selectedTeacher.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Qualifications */}
              {selectedTeacher.qualification && (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h5 className="font-bold text-gray-900 mb-2">Qualifications</h5>
                  <p className="text-gray-700">{selectedTeacher.qualification}</p>
                </div>
              )}

              {/* Assigned Students */}
              <div>
                <h5 className="font-bold text-gray-900 mb-3">Assigned Students</h5>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allStudents.filter(s => s.teacherId === selectedTeacher.id).length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No students assigned yet</p>
                  ) : (
                    allStudents.filter(s => s.teacherId === selectedTeacher.id).map(student => (
                      <div key={student.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-600">{student.level}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{student.email}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedTeacher(null);
                }}
                className="w-full bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">Deactivate Teacher</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTeacher(null);
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center text-red-800 mb-2">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">Are you sure?</span>
                </div>
                <p className="text-sm text-red-700">
                  This will deactivate {selectedTeacher.name}'s account. They won't be able to access the system, but their data will be preserved.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600 mb-2">Teacher Details:</p>
                <p className="font-semibold text-gray-900">{selectedTeacher.name}</p>
                <p className="text-sm text-gray-600">{selectedTeacher.email}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {allStudents.filter(s => s.teacherId === selectedTeacher.id).length} students currently assigned
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedTeacher(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Students Modal */}
      {showAssignModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">Assign Students to {selectedTeacher.name}</h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedTeacher(null);
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  Select students to assign to this teacher. Already assigned students are highlighted.
                </p>
              </div>

              {/* Currently Assigned */}
              <div className="mb-6">
                <h5 className="font-bold text-gray-900 mb-3">Currently Assigned ({allStudents.filter(s => s.teacherId === selectedTeacher.id).length})</h5>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {allStudents.filter(s => s.teacherId === selectedTeacher.id).map(student => (
                    <div key={student.id} className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.level}</p>
                        </div>
                      </div>
                      <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Students */}
              <div>
                <h5 className="font-bold text-gray-900 mb-3">Available Students ({allStudents.filter(s => !s.teacherId).length})</h5>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allStudents.filter(s => !s.teacherId).length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No unassigned students available</p>
                  ) : (
                    allStudents.filter(s => !s.teacherId).map(student => (
                      <div key={student.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-600">{student.level}</p>
                          </div>
                        </div>
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                          Assign
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedTeacher(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleAssignStudents}
                  className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}