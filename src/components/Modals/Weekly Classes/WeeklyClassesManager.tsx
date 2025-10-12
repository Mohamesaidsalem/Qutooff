import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, BookOpen, Plus, Trash2, Edit3, Search, Filter } from 'lucide-react';
import { ref, onValue, off, push, set, update, remove, get } from 'firebase/database';
import { database } from '../../../firebase/config';

interface WeeklyClass {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subject: string;
  isActive: boolean;
  createdAt: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  specialization?: string;
}

interface Student {
  id: string;
  name: string;
  email?: string;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WeeklyClassesManager: React.FC = () => {
  const [weeklyClasses, setWeeklyClasses] = useState<WeeklyClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<WeeklyClass | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDay, setFilterDay] = useState<string>('all');

  const [formData, setFormData] = useState({
    teacherId: '',
    studentId: '',
    dayOfWeek: 'Monday',
    startTime: '',
    endTime: '',
    subject: '',
  });

  useEffect(() => {
    fetchData();

    return () => {
      const classesRef = ref(database, 'weeklyClasses');
      const teachersRef = ref(database, 'teachers');
      const studentsRef = ref(database, 'children');
      off(classesRef);
      off(teachersRef);
      off(studentsRef);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // ✅ Fetch Teachers من teachers node
      const teachersRef = ref(database, 'teachers');
      const teachersSnapshot = await get(teachersRef);
      
      if (teachersSnapshot.exists()) {
        const data = teachersSnapshot.val();
        const teachersList: Teacher[] = Object.entries(data)
          .filter(([_, teacher]: [string, any]) => teacher.isActive !== false)
          .map(([id, teacher]: [string, any]) => ({
            id,
            name: teacher.name || 'Unknown',
            email: teacher.email || '',
            specialization: teacher.specialization || ''
          }));
        setTeachers(teachersList);
        console.log('✅ Teachers loaded:', teachersList.length);
      } else {
        console.log('⚠️ No teachers found in database');
        setTeachers([]);
      }

      // ✅ Fetch Students من children node
      const studentsRef = ref(database, 'children');
      const studentsSnapshot = await get(studentsRef);
      
      if (studentsSnapshot.exists()) {
        const data = studentsSnapshot.val();
        const studentsList: Student[] = Object.entries(data)
          .filter(([_, child]: [string, any]) => child.isActive !== false)
          .map(([id, child]: [string, any]) => ({
            id,
            name: child.name || 'Unknown',
            email: child.email || ''
          }));
        setStudents(studentsList);
        console.log('✅ Students loaded:', studentsList.length);
      } else {
        console.log('⚠️ No students found in database');
        setStudents([]);
      }

      // ✅ Fetch Weekly Classes
      const classesRef = ref(database, 'weeklyClasses');
      onValue(classesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const classesList: WeeklyClass[] = Object.entries(data).map(([id, cls]: [string, any]) => ({
            id,
            teacherId: cls.teacherId || '',
            teacherName: cls.teacherName || 'Unknown',
            studentId: cls.studentId || '',
            studentName: cls.studentName || 'Unknown',
            dayOfWeek: cls.dayOfWeek || 'Monday',
            startTime: cls.startTime || '',
            endTime: cls.endTime || '',
            subject: cls.subject || '',
            isActive: cls.isActive !== undefined ? cls.isActive : true,
            createdAt: cls.createdAt || new Date().toISOString(),
          }));
          setWeeklyClasses(classesList.filter(c => c.isActive));
        } else {
          setWeeklyClasses([]);
        }
        setLoading(false);
      });

    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.teacherId || !formData.studentId) {
      alert('Please select teacher and student');
      return;
    }

    try {
      const teacher = teachers.find(t => t.id === formData.teacherId);
      const student = students.find(s => s.id === formData.studentId);

      const classData = {
        teacherId: formData.teacherId,
        teacherName: teacher?.name || 'Unknown',
        studentId: formData.studentId,
        studentName: student?.name || 'Unknown',
        dayOfWeek: formData.dayOfWeek,
        startTime: formData.startTime,
        endTime: formData.endTime,
        subject: formData.subject,
        isActive: true,
        createdAt: editingClass?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingClass) {
        const classRef = ref(database, `weeklyClasses/${editingClass.id}`);
        await update(classRef, classData);
        alert('Class updated successfully!');
      } else {
        const classesRef = ref(database, 'weeklyClasses');
        await push(classesRef, classData);
        alert('Class created successfully!');
      }

      setShowModal(false);
      setEditingClass(null);
      resetForm();
    } catch (error) {
      console.error('Error saving class:', error);
      alert('Failed to save class. Please try again.');
    }
  };

  const handleEdit = (weeklyClass: WeeklyClass) => {
    setEditingClass(weeklyClass);
    setFormData({
      teacherId: weeklyClass.teacherId,
      studentId: weeklyClass.studentId,
      dayOfWeek: weeklyClass.dayOfWeek,
      startTime: weeklyClass.startTime,
      endTime: weeklyClass.endTime,
      subject: weeklyClass.subject,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
      const classRef = ref(database, `weeklyClasses/${id}`);
      await update(classRef, { isActive: false });
      alert('Class deleted successfully!');
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Failed to delete class. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      teacherId: '',
      studentId: '',
      dayOfWeek: 'Monday',
      startTime: '',
      endTime: '',
      subject: '',
    });
  };

  const filteredClasses = weeklyClasses.filter(cls => {
    const matchesSearch = 
      cls.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.teacherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDay = filterDay === 'all' || cls.dayOfWeek === filterDay;
    
    return matchesSearch && matchesDay;
  });

  const groupedClasses = DAYS_OF_WEEK.map(day => ({
    day,
    classes: filteredClasses.filter(c => c.dayOfWeek === day),
  }));

  const stats = {
    total: weeklyClasses.length,
    teachers: new Set(weeklyClasses.map(c => c.teacherId)).size,
    students: new Set(weeklyClasses.map(c => c.studentId)).size,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Weekly Schedule</h1>
              <p className="text-gray-600">Manage recurring weekly class schedules</p>
            </div>
            <button
              onClick={() => {
                setEditingClass(null);
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5" />
              Create Class
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Classes</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-xl">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Teachers</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.teachers}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-xl">
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.students}</p>
              </div>
              <div className="bg-purple-100 p-4 rounded-xl">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by subject, teacher, or student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative min-w-[200px]">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Days</option>
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {groupedClasses.map(({ day, classes }) => (
            <div key={day} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <Calendar className="h-6 w-6" />
                  {day}
                  <span className="ml-auto bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                    {classes.length}
                  </span>
                </h3>
              </div>
              <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                {classes.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No classes scheduled</p>
                ) : (
                  classes.map((cls) => (
                    <div key={cls.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2 text-blue-600 font-semibold">
                          <Clock className="h-4 w-4" />
                          {cls.startTime} - {cls.endTime}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(cls)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cls.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{cls.subject}</span>
                        </div>
                        <div className="text-sm text-gray-600 ml-6">
                          <div>👨‍🏫 {cls.teacherName}</div>
                          <div>👤 {cls.studentName}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingClass ? 'Update Class' : 'Create New Class'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Teacher</label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} {teacher.specialization && `- ${teacher.specialization}`}
                      </option>
                    ))}
                  </select>
                  {teachers.length === 0 && (
                    <p className="text-sm text-red-500 mt-2">
                      ⚠️ No teachers available! Please initialize the database.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Student</label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>{student.name}</option>
                    ))}
                  </select>
                  {students.length === 0 && (
                    <p className="text-sm text-red-500 mt-2">
                      ⚠️ No students available!
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Day of Week</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    placeholder="e.g., Quran, Arabic, Math"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                  >
                    {editingClass ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyClassesManager;