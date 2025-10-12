import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, X, Edit, Trash2, Users, DollarSign, Clock, Star } from 'lucide-react';
import { ref, push, set, onValue, off, update, remove } from 'firebase/database';
import { database } from '../../firebase/config';

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  price: number;
  duration: number; // in weeks
  teacherId: string;
  maxStudents: number;
  currentStudents: number;
  status: 'active' | 'inactive' | 'completed';
  startDate: string;
  endDate: string;
  schedule: string;
  createdAt: string;
}

interface CourseManagementProps {
  teachers: any[];
  children: any[];
}

export default function CourseManagement({ teachers, children }: CourseManagementProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: '',
    price: '',
    duration: '',
    teacherId: '',
    maxStudents: '',
    schedule: '',
    startDate: '',
    endDate: ''
  });

  // Load courses from Firebase
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
      setLoading(false);
    });

    return () => off(coursesRef, 'value', unsubscribe);
  }, []);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const courseData = {
        title: formData.title,
        description: formData.description,
        level: formData.level,
        price: Number(formData.price),
        duration: Number(formData.duration),
        teacherId: formData.teacherId,
        maxStudents: Number(formData.maxStudents),
        currentStudents: 0,
        status: 'active' as const,
        startDate: formData.startDate,
        endDate: formData.endDate,
        schedule: formData.schedule,
        createdAt: new Date().toISOString()
      };

      const coursesRef = ref(database, 'courses');
      const newCourseRef = push(coursesRef);
      await set(newCourseRef, courseData);

      alert('Course created successfully!');
      setShowAddCourseModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Error creating course. Please try again.');
    }
  };

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    try {
      const courseRef = ref(database, `courses/${editingCourse.id}`);
      const updates = {
        title: formData.title,
        description: formData.description,
        level: formData.level,
        price: Number(formData.price),
        duration: Number(formData.duration),
        teacherId: formData.teacherId,
        maxStudents: Number(formData.maxStudents),
        startDate: formData.startDate,
        endDate: formData.endDate,
        schedule: formData.schedule,
        updatedAt: new Date().toISOString()
      };

      await update(courseRef, updates);
      alert('Course updated successfully!');
      setEditingCourse(null);
      resetForm();
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Error updating course. Please try again.');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      try {
        const courseRef = ref(database, `courses/${courseId}`);
        await remove(courseRef);
        alert('Course deleted successfully!');
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('Error deleting course. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      level: '',
      price: '',
      duration: '',
      teacherId: '',
      maxStudents: '',
      schedule: '',
      startDate: '',
      endDate: ''
    });
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      level: course.level,
      price: course.price.toString(),
      duration: course.duration.toString(),
      teacherId: course.teacherId,
      maxStudents: course.maxStudents.toString(),
      schedule: course.schedule,
      startDate: course.startDate,
      endDate: course.endDate
    });
  };

  const stats = [
    { name: 'Total Courses', value: courses.length, icon: BookOpen, color: 'bg-blue-500' },
    { name: 'Active Courses', value: courses.filter(c => c.status === 'active').length, icon: Star, color: 'bg-green-500' },
    { name: 'Total Revenue', value: `$${courses.reduce((acc, course) => acc + (course.price * course.currentStudents), 0)}`, icon: DollarSign, color: 'bg-emerald-500' },
    { name: 'Enrolled Students', value: courses.reduce((acc, course) => acc + course.currentStudents, 0), icon: Users, color: 'bg-purple-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage educational courses and content
          </p>
        </div>
        <button
          onClick={() => setShowAddCourseModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Course
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-lg ${item.color}`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {item.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const teacher = teachers.find(t => t.id === course.teacherId);
          return (
            <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => openEditModal(course)}
                      className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-100 rounded transition-colors"
                      title="Edit course"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-red-600 hover:text-red-800 p-1 hover:bg-red-100 rounded transition-colors"
                      title="Delete course"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-medium">{course.level}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium text-green-600">${course.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{course.duration} weeks</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Teacher:</span>
                    <span className="font-medium">{teacher?.name || 'Not assigned'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Students:</span>
                    <span className="font-medium">{course.currentStudents}/{course.maxStudents}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    course.status === 'active' ? 'bg-green-100 text-green-800' :
                    course.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {course.status}
                  </span>
                  <div className="text-xs text-gray-500">
                    {course.startDate} - {course.endDate}
                  </div>
                </div>

                {course.schedule && (
                  <div className="mt-3 text-xs text-gray-600 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {course.schedule}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium">No courses created yet</p>
          <p className="text-sm">Create your first course to get started</p>
        </div>
      )}

      {/* Add/Edit Course Modal */}
      {(showAddCourseModal || editingCourse) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingCourse ? 'Edit Course' : 'Add New Course'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddCourseModal(false);
                    setEditingCourse(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={editingCourse ? handleEditCourse : handleAddCourse} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      placeholder="e.g., Advanced Mathematics"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      required
                      placeholder="Course description and objectives..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Level *
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Elementary">Elementary</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (weeks) *
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Students *
                    </label>
                    <input
                      type="number"
                      value={formData.maxStudents}
                      onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign Teacher *
                    </label>
                    <select
                      value={formData.teacherId}
                      onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Teacher</option>
                      {teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name} - {teacher.specialization}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Schedule
                    </label>
                    <input
                      type="text"
                      value={formData.schedule}
                      onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Mon/Wed/Fri 3:00-4:00 PM"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCourseModal(false);
                      setEditingCourse(null);
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
                    {editingCourse ? 'Update Course' : 'Create Course'}
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