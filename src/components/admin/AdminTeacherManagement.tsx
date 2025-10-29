import React, { useState, useEffect, useMemo } from 'react';
import { Users, Search, Plus, Edit, Trash2, X, Calendar, BookOpen, Award, Star, ChevronLeft, ChevronRight, UserPlus, Mail, Phone, Briefcase, CheckCircle, AlertCircle, Eye, User, MapPin, DollarSign, Save } from 'lucide-react';
import { ref, push, set, onValue, off, update } from 'firebase/database';
import { database } from '../../firebase/config';

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  hourlyRate: number;
  country: string;
  city: string;
  timezone: string;
  qualifications: string;
  experience: string;
  bio: string;
  availableDays: string[];
  startTime: string;
  endTime: string;
  students: string[];
  isActive: boolean;
  createdAt: string;
}

export default function AdminTeacherManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const teachersPerPage = 10;

  const [teacherForm, setTeacherForm] = useState({
    name: '', email: '', phone: '', specialization: '',
    hourlyRate: 15, country: 'Egypt', city: '', timezone: 'Africa/Cairo',
    qualifications: '', experience: '', bio: '', availableDays: [] as string[],
    startTime: '09:00', endTime: '17:00',
  });
  const [teacherErrors, setTeacherErrors] = useState<any>({});

  // Get specializations from courses
  const specializations = courses.length > 0 
    ? courses.map(course => course.title || course.name).filter(Boolean)
    : ['Quran Memorization', 'Tajweed & Recitation', 'Islamic Studies'];
  const countries = ['Egypt', 'Saudi Arabia', 'UAE', 'Jordan', 'Palestine', 'Morocco', 'Tunisia', 'Algeria', 'Libya', 'Sudan', 'Other'];
  const timezones = [
    { value: 'Africa/Cairo', label: 'Cairo (GMT+2)' },
    { value: 'Asia/Riyadh', label: 'Riyadh (GMT+3)' },
    { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
    { value: 'America/New_York', label: 'New York (GMT-5)' },
    { value: 'Europe/London', label: 'London (GMT+0)' },
  ];
  const weekDays = [
    { id: 'sunday', label: 'Sun' }, { id: 'monday', label: 'Mon' },
    { id: 'tuesday', label: 'Tue' }, { id: 'wednesday', label: 'Wed' },
    { id: 'thursday', label: 'Thu' }, { id: 'friday', label: 'Fri' }, { id: 'saturday', label: 'Sat' }
  ];

  useEffect(() => {
    const teachersRef = ref(database, 'teachers');
    const coursesRef = ref(database, 'courses');
    
    // Load Teachers
    const unsubscribeTeachers = onValue(teachersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const teachersArray = Object.keys(data).map(key => ({ 
          id: key, 
          ...data[key] 
        }));
        console.log('✅ Teachers loaded from Firebase:', teachersArray.length);
        console.log('📋 Teachers data:', teachersArray);
        setTeachers(teachersArray);
      } else {
        console.log('⚠️ No teachers found in database');
        setTeachers([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('❌ Error loading teachers:', error);
      setLoading(false);
    });

    // Load Courses
    const unsubscribeCourses = onValue(coursesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const coursesArray = Object.keys(data).map(key => ({ 
          id: key, 
          ...data[key] 
        }));
        console.log('✅ Courses loaded from Firebase:', coursesArray.length);
        console.log('📚 Courses data:', coursesArray);
        setCourses(coursesArray);
      } else {
        console.log('⚠️ No courses found in database');
        setCourses([]);
      }
    }, (error) => {
      console.error('❌ Error loading courses:', error);
    });

    return () => {
      off(teachersRef, 'value', unsubscribeTeachers);
      off(coursesRef, 'value', unsubscribeCourses);
    };
  }, []);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && teacher.isActive !== false) ||
                           (filterStatus === 'inactive' && teacher.isActive === false);
      return matchesSearch && matchesStatus;
    });
  }, [teachers, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredTeachers.length / teachersPerPage);
  const startIndex = (currentPage - 1) * teachersPerPage;
  const endIndex = startIndex + teachersPerPage;
  const currentTeachers = filteredTeachers.slice(startIndex, endIndex);

  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.isActive !== false).length,
    avgRate: teachers.length > 0 
      ? Math.round(teachers.reduce((acc, t) => acc + (Number(t.hourlyRate) || 0), 0) / teachers.length)
      : 0,
  };

  const handleTeacherFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTeacherForm(prev => ({ ...prev, [name]: value }));
    if (teacherErrors[name]) setTeacherErrors((prev: any) => ({ ...prev, [name]: '' }));
  };

  const toggleDay = (dayId: string) => {
    setTeacherForm(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(dayId)
        ? prev.availableDays.filter(d => d !== dayId)
        : [...prev.availableDays, dayId]
    }));
  };

  const validateTeacherForm = () => {
    const errors: any = {};
    if (!teacherForm.name.trim()) errors.name = 'Name required';
    if (!teacherForm.email.trim()) errors.email = 'Email required';
    if (!teacherForm.phone.trim()) errors.phone = 'Phone required';
    if (!teacherForm.city.trim()) errors.city = 'City required';
    if (!teacherForm.specialization) errors.specialization = 'Specialization required';
    if (teacherForm.hourlyRate < 5) errors.hourlyRate = 'Min $5';
    if (teacherForm.availableDays.length === 0) errors.availableDays = 'Select days';
    setTeacherErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setTeacherForm({
      name: '', email: '', phone: '', 
      specialization: specializations.length > 0 ? specializations[0] : '',
      hourlyRate: 15, country: 'Egypt', city: '', timezone: 'Africa/Cairo',
      qualifications: '', experience: '', bio: '', availableDays: [],
      startTime: '09:00', endTime: '17:00',
    });
    setTeacherErrors({});
  };

  const handleAddTeacher = async () => {
    if (validateTeacherForm()) {
      try {
        console.log('📝 Adding new teacher:', teacherForm);
        const teachersRef = ref(database, 'teachers');
        const newTeacherRef = push(teachersRef);
        const newTeacher = {
          ...teacherForm,
          students: [],
          isActive: true,
          createdAt: new Date().toISOString()
        };
        await set(newTeacherRef, newTeacher);
        console.log('✅ Teacher added successfully with ID:', newTeacherRef.key);
        alert('✅ Teacher added successfully!');
        setShowAddModal(false);
        resetForm();
      } catch (error) {
        console.error('❌ Error adding teacher:', error);
        alert('❌ Error adding teacher: ' + error);
      }
    } else {
      console.log('❌ Validation failed:', teacherErrors);
    }
  };

  const handleEditTeacher = async () => {
    if (selectedTeacher && validateTeacherForm()) {
      try {
        console.log('📝 Updating teacher:', selectedTeacher.id, teacherForm);
        const teacherRef = ref(database, `teachers/${selectedTeacher.id}`);
        const updates = {
          ...teacherForm,
          updatedAt: new Date().toISOString()
        };
        await update(teacherRef, updates);
        console.log('✅ Teacher updated successfully');
        alert('✅ Teacher updated successfully!');
        setShowEditModal(false);
        setSelectedTeacher(null);
        resetForm();
      } catch (error) {
        console.error('❌ Error updating teacher:', error);
        alert('❌ Error updating teacher: ' + error);
      }
    } else {
      console.log('❌ Validation failed:', teacherErrors);
    }
  };

  const handleDeleteTeacher = async () => {
    if (selectedTeacher) {
      try {
        console.log('🗑️ Deactivating teacher:', selectedTeacher.id);
        const teacherRef = ref(database, `teachers/${selectedTeacher.id}`);
        await update(teacherRef, { 
          isActive: false,
          deactivatedAt: new Date().toISOString()
        });
        console.log('✅ Teacher deactivated successfully');
        alert('⚠️ Teacher deactivated!');
        setShowDeleteModal(false);
        setSelectedTeacher(null);
      } catch (error) {
        console.error('❌ Error deactivating teacher:', error);
        alert('❌ Error deactivating teacher: ' + error);
      }
    }
  };

  const openEditModal = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setTeacherForm({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      specialization: teacher.specialization,
      hourlyRate: teacher.hourlyRate,
      country: teacher.country || 'Egypt',
      city: teacher.city || '',
      timezone: teacher.timezone || 'Africa/Cairo',
      qualifications: teacher.qualifications || '',
      experience: teacher.experience || '',
      bio: teacher.bio || '',
      availableDays: teacher.availableDays || [],
      startTime: teacher.startTime || '09:00',
      endTime: teacher.endTime || '17:00',
    });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teacher Management</h2>
          <p className="mt-1 text-sm text-gray-600">Manage all teachers and their information</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Teacher
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Teachers</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
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

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Courses</p>
              <p className="text-2xl font-bold text-purple-600">{courses.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Rate</p>
              <p className="text-2xl font-bold text-amber-600">${stats.avgRate}/hr</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
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
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
      {currentTeachers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600">No teachers found</p>
          <p className="text-sm text-gray-500 mt-2">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Click "Add New Teacher" to get started'}
          </p>
        </div>
      ) : (
        currentTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                        {teacher.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium">{teacher.name}</div>
                        <div className="text-sm text-gray-500">{teacher.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {teacher.specialization}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{teacher.city || 'N/A'}, {teacher.country || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{teacher.timezone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">${teacher.hourlyRate || 0}/hr</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      teacher.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {teacher.isActive !== false ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedTeacher(teacher);
                          setShowViewModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(teacher)}
                        className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTeacher(teacher);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredTeachers.length)} of {filteredTeachers.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded border hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="px-3 py-1">{currentPage} / {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded border hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{showAddModal ? 'Add New Teacher' : 'Edit Teacher'}</h2>
                <button onClick={() => {
                  showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                  resetForm();
                  setSelectedTeacher(null);
                }} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <User className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold">Personal Information</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={teacherForm.name}
                      onChange={handleTeacherFormChange}
                      className={`w-full px-3 py-2 border rounded-lg ${teacherErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {teacherErrors.name && <p className="text-xs text-red-600 mt-1">{teacherErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={teacherForm.email}
                      onChange={handleTeacherFormChange}
                      className={`w-full px-3 py-2 border rounded-lg ${teacherErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {teacherErrors.email && <p className="text-xs text-red-600 mt-1">{teacherErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={teacherForm.phone}
                      onChange={handleTeacherFormChange}
                      className={`w-full px-3 py-2 border rounded-lg ${teacherErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {teacherErrors.phone && <p className="text-xs text-red-600 mt-1">{teacherErrors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Specialization *</label>
                    <select 
                      name="specialization" 
                      value={teacherForm.specialization} 
                      onChange={handleTeacherFormChange} 
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Select Specialization</option>
                      {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {courses.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1">
                        ⚠️ No courses found. Using default specializations.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <MapPin className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-semibold">Location & Payment</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <select name="country" value={teacherForm.country} onChange={handleTeacherFormChange} className="w-full px-3 py-2 border rounded-lg">
                      {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City *</label>
                    <input type="text" name="city" value={teacherForm.city} onChange={handleTeacherFormChange} className={`w-full px-3 py-2 border rounded-lg ${teacherErrors.city ? 'border-red-500' : 'border-gray-300'}`} />
                    {teacherErrors.city && <p className="text-xs text-red-600 mt-1">{teacherErrors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Timezone</label>
                    <select name="timezone" value={teacherForm.timezone} onChange={handleTeacherFormChange} className="w-full px-3 py-2 border rounded-lg">
                      {timezones.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Hourly Rate (USD) *</label>
                    <input type="number" name="hourlyRate" value={teacherForm.hourlyRate} onChange={handleTeacherFormChange} min="5" className={`w-full px-3 py-2 border rounded-lg ${teacherErrors.hourlyRate ? 'border-red-500' : 'border-gray-300'}`} />
                    {teacherErrors.hourlyRate && <p className="text-xs text-red-600 mt-1">{teacherErrors.hourlyRate}</p>}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="font-semibold">Availability</h3>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Available Days *</label>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                    {weekDays.map(day => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay(day.id)}
                        className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          teacherForm.availableDays.includes(day.id)
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  {teacherErrors.availableDays && <p className="text-xs text-red-600 mt-1">{teacherErrors.availableDays}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Time</label>
                    <input type="time" name="startTime" value={teacherForm.startTime} onChange={handleTeacherFormChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Time</label>
                    <input type="time" name="endTime" value={teacherForm.endTime} onChange={handleTeacherFormChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-4">Additional Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Qualifications</label>
                    <textarea name="qualifications" value={teacherForm.qualifications} onChange={handleTeacherFormChange} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder="Degrees, certificates..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Experience</label>
                    <textarea name="experience" value={teacherForm.experience} onChange={handleTeacherFormChange} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder="Teaching experience..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Biography</label>
                    <textarea name="bio" value={teacherForm.bio} onChange={handleTeacherFormChange} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="Brief introduction..." />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
              <button onClick={() => {
                showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                resetForm();
                setSelectedTeacher(null);
              }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                Cancel
              </button>
              <button onClick={showAddModal ? handleAddTeacher : handleEditTeacher} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                <Save className="h-4 w-4 mr-2" />
                {showAddModal ? 'Add Teacher' : 'Update Teacher'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-3xl">
                  {selectedTeacher.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900">{selectedTeacher.name}</h4>
                  <p className="text-gray-600">{selectedTeacher.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {selectedTeacher.specialization}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedTeacher.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedTeacher.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl text-center">
                  <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">${selectedTeacher.hourlyRate}</p>
                  <p className="text-sm text-gray-600">Per Hour</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl text-center">
                  <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-gray-900">{selectedTeacher.city}</p>
                  <p className="text-sm text-gray-600">{selectedTeacher.country}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl text-center">
                  <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-gray-900">{selectedTeacher.availableDays.length}</p>
                  <p className="text-sm text-gray-600">Days Available</p>
                </div>
              </div>

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
                    <span className="text-gray-600">Timezone:</span>
                    <span className="font-semibold text-gray-900">{selectedTeacher.timezone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Hours:</span>
                    <span className="font-semibold text-gray-900">{selectedTeacher.startTime} - {selectedTeacher.endTime}</span>
                  </div>
                </div>
              </div>

              {selectedTeacher.availableDays.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-xl">
                  <h5 className="font-bold text-gray-900 mb-2">Available Days</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeacher.availableDays.map(day => (
                      <span key={day} className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm capitalize">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedTeacher.qualifications && (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h5 className="font-bold text-gray-900 mb-2">Qualifications</h5>
                  <p className="text-gray-700">{selectedTeacher.qualifications}</p>
                </div>
              )}

              {selectedTeacher.experience && (
                <div className="bg-green-50 p-4 rounded-xl">
                  <h5 className="font-bold text-gray-900 mb-2">Experience</h5>
                  <p className="text-gray-700">{selectedTeacher.experience}</p>
                </div>
              )}

              {selectedTeacher.bio && (
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <h5 className="font-bold text-gray-900 mb-2">Biography</h5>
                  <p className="text-gray-700">{selectedTeacher.bio}</p>
                </div>
              )}

              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedTeacher(null);
                }}
                className="w-full bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg"
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
                  This will deactivate {selectedTeacher.name}'s account. The data will be preserved but the teacher won't be able to access the system.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600 mb-2">Teacher Details:</p>
                <p className="font-semibold text-gray-900">{selectedTeacher.name}</p>
                <p className="text-sm text-gray-600">{selectedTeacher.email}</p>
                <p className="text-sm text-gray-600">{selectedTeacher.phone}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedTeacher(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTeacher}
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};