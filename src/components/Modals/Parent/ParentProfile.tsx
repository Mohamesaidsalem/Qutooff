import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Globe, MapPin, DollarSign, Calendar,
  Edit, UserPlus, FileText, ClipboardList, CheckCircle, 
  XCircle, Coffee, Clock, Trash2, MessageSquare, Plus, 
  Download, ArrowLeft, Eye, Award, Key, Lock, Bell, Send, 
  CheckSquare, History, FileCheck, Loader
} from 'lucide-react';
import { ref, onValue, update, get } from 'firebase/database';
import { database } from '../../../firebase/config';

// ============================================
// COMPLETE TIMEZONES LIST
// ============================================
const COMPLETE_TIMEZONES = [
  // Africa
  'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos', 'Africa/Nairobi',
  'Africa/Algiers', 'Africa/Casablanca', 'Africa/Tunis',
  
  // Americas
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Toronto', 'America/Vancouver', 'America/Mexico_City',
  'America/Sao_Paulo', 'America/Buenos_Aires', 'America/Lima',
  'America/Bogota', 'America/Santiago', 'America/Caracas',
  
  // Asia
  'Asia/Dubai', 'Asia/Riyadh', 'Asia/Kuwait', 'Asia/Doha', 'Asia/Muscat',
  'Asia/Baghdad', 'Asia/Tehran', 'Asia/Karachi', 'Asia/Kabul',
  'Asia/Tashkent', 'Asia/Kolkata', 'Asia/Dhaka', 'Asia/Kathmandu',
  'Asia/Colombo', 'Asia/Bangkok', 'Asia/Jakarta', 'Asia/Singapore',
  'Asia/Manila', 'Asia/Kuala_Lumpur', 'Asia/Hong_Kong', 'Asia/Shanghai',
  'Asia/Taipei', 'Asia/Tokyo', 'Asia/Seoul', 'Asia/Pyongyang',
  'Asia/Ulaanbaatar', 'Asia/Istanbul', 'Asia/Jerusalem', 'Asia/Beirut',
  'Asia/Damascus', 'Asia/Amman', 'Asia/Baku', 'Asia/Yerevan',
  
  // Europe
  'Europe/London', 'Europe/Dublin', 'Europe/Lisbon',
  'Europe/Paris', 'Europe/Berlin', 'Europe/Rome', 'Europe/Madrid',
  'Europe/Amsterdam', 'Europe/Brussels', 'Europe/Vienna',
  'Europe/Stockholm', 'Europe/Copenhagen', 'Europe/Oslo',
  'Europe/Helsinki', 'Europe/Warsaw', 'Europe/Prague',
  'Europe/Budapest', 'Europe/Bucharest', 'Europe/Athens',
  'Europe/Istanbul', 'Europe/Moscow', 'Europe/Kiev',
  
  // Australia & Pacific
  'Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane',
  'Australia/Perth', 'Australia/Adelaide', 'Australia/Darwin',
  'Pacific/Auckland', 'Pacific/Fiji', 'Pacific/Guam',
  'Pacific/Honolulu', 'Pacific/Samoa', 'Pacific/Tahiti'
];

// ============================================
// EDIT STUDENT MODAL (Connected to Firebase)
// ============================================
interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  teachers: any[];
  courses: any[];
  onSave: (studentId: string, updates: any) => Promise<void>;
}

const EditStudentModal: React.FC<EditStudentModalProps> = ({ 
  isOpen, 
  onClose, 
  student, 
  teachers,
  courses,
  onSave 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    skypeId: '',
    gender: 'Male',
    language: 'English',
    data: '',
    numberOfDays: '2',
    regularCourse: '',
    teacherId: '',
    teacherName: '',
    courseId: '',
    courseName: '',
    additionalCourse: '',
    remarksForParent: '',
    remarksForTeacher: '',
    status: 'active',
    level: 'Beginner',
    progress: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && student) {
      setFormData({
        name: student.name || '',
        age: student.age?.toString() || '',
        skypeId: student.skypeId || '',
        gender: student.gender || 'Male',
        language: student.language || 'English',
        data: student.data || new Date().toISOString().split('T')[0],
        numberOfDays: student.numberOfDays || '2',
        regularCourse: student.regularCourse || student.level || '',
        teacherId: student.teacherId || '',
        teacherName: student.teacherName || '',
        courseId: student.courseId || '',
        courseName: student.courseName || '',
        additionalCourse: student.additionalCourse || '',
        remarksForParent: student.remarksForParent || '',
        remarksForTeacher: student.remarksForTeacher || '',
        status: student.status || 'active',
        level: student.level || 'Beginner',
        progress: student.progress || 0
      });
    }
  }, [isOpen, student]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const selectedTeacher = teachers.find(t => t.id === formData.teacherId);
      const selectedCourse = courses.find(c => c.id === formData.courseId);
      
      const updates = {
        ...formData,
        teacherName: selectedTeacher?.name || formData.teacherName,
        courseName: selectedCourse?.name || formData.courseName,
        age: parseInt(formData.age),
      };
      
      await onSave(student.id, updates);
      alert('✅ Student updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating student:', error);
      alert('❌ Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex justify-between items-center rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Edit Student Details</h2>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Bio */}
          <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-4">Personal Bio Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Skype ID
                </label>
                <input
                  type="text"
                  value={formData.skypeId}
                  onChange={(e) => setFormData({ ...formData, skypeId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Language <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="Arabic">Arabic</option>
                  <option value="English">English</option>
                  <option value="Urdu">Urdu</option>
                  <option value="French">French</option>
                  <option value="Turkish">Turkish</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Malay">Malay</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="active">✅ Active</option>
                  <option value="suspended">⛔ Suspended</option>
                  <option value="on-hold">🖖 On Hold</option>
                  <option value="inactive">❌ Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Level
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Elementary">Elementary</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>
          </div>

          {/* Course Details */}
          <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
            <h3 className="text-lg font-bold text-green-900 mb-4">Course Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Days Per Week <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.numberOfDays}
                  onChange={(e) => setFormData({ ...formData, numberOfDays: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  {[2,3,4,5,6,7].map(num => (
                    <option key={num} value={num.toString()}>{num} Days / Week</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Assigned Teacher <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.teacherId}
                  onChange={(e) => {
                    const teacher = teachers.find(t => t.id === e.target.value);
                    setFormData({ 
                      ...formData, 
                      teacherId: e.target.value,
                      teacherName: teacher?.name || ''
                    });
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} {teacher.email && `(${teacher.email})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Regular Course <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) => {
                    const course = courses.find(c => c.id === e.target.value);
                    setFormData({ 
                      ...formData, 
                      courseId: e.target.value,
                      courseName: course?.name || '',
                      regularCourse: course?.name || ''
                    });
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name} - {course.duration} min
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Additional Course (Optional)
                </label>
                <select
                  value={formData.additionalCourse}
                  onChange={(e) => setFormData({ ...formData, additionalCourse: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">No Additional Course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.name}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
            <h3 className="text-lg font-bold text-purple-900 mb-4">Trial Class Remarks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Remarks for Parent
                </label>
                <textarea
                  value={formData.remarksForParent}
                  onChange={(e) => setFormData({ ...formData, remarksForParent: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Feedback for parent..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Remarks for Teacher
                </label>
                <textarea
                  value={formData.remarksForTeacher}
                  onChange={(e) => setFormData({ ...formData, remarksForTeacher: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Internal notes for teacher..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                '💾 Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// MAIN PARENT PROFILE COMPONENT
// ============================================
export default function EnhancedParentProfile() {
  const parentId = 'parent123'; // في التطبيق الحقيقي يجي من useParams أو props
  
  const [parentData, setParentData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'invoice' | 'kids' | 'manager-notes' | 'teacher-notes' | 'tasks'>('kids');
  
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Load all data from Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load Parent/Family data
        const familiesRef = ref(database, 'families');
        onValue(familiesRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const family = Object.values(data).find((f: any) => f.parentId === parentId);
            if (family) setParentData(family);
          }
        });

        // Load Students
        const childrenRef = ref(database, 'children');
        onValue(childrenRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const childrenArray = Object.keys(data)
              .map(key => ({ id: key, ...data[key] }))
              .filter(child => child.parentId === parentId && child.isActive !== false);
            setStudents(childrenArray);
          }
        });

        // Load Invoices
        const invoicesRef = ref(database, 'invoices');
        onValue(invoicesRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const invoicesArray = Object.keys(data)
              .map(key => ({ id: key, ...data[key] }))
              .filter(inv => inv.parentId === parentId);
            setInvoices(invoicesArray);
          }
        });

        // Load Teachers
        const teachersRef = ref(database, 'teachers');
        onValue(teachersRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const teachersArray = Object.keys(data)
              .map(key => ({ id: key, ...data[key] }))
              .filter(teacher => teacher.isActive !== false);
            setTeachers(teachersArray);
          }
        });

        // Load Courses
        const coursesRef = ref(database, 'courses');
        onValue(coursesRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const coursesArray = Object.keys(data)
              .map(key => ({ id: key, ...data[key] }))
              .filter(course => course.status === 'active');
            setCourses(coursesArray);
          }
        });

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [parentId]);

  const handleUpdateStudent = async (studentId: string, updates: any) => {
    try {
      const studentRef = ref(database, `children/${studentId}`);
      await update(studentRef, updates);
      console.log('✅ Student updated in Firebase');
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'inactive') => {
    if (!parentData) return;
    
    try {
      const familyRef = ref(database, `families/${parentData.id}`);
      await update(familyRef, { status: newStatus });
      alert(`✅ Status changed to ${newStatus}!`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading parent profile...</p>
        </div>
      </div>
    );
  }

  if (!parentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Parent Not Found</h2>
          <p className="text-gray-600">The requested parent profile could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Back Button */}
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 bg-white px-4 py-2 rounded-lg shadow-sm">
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl border p-6 mb-6">
          
          <div className="flex flex-col md:flex-row items-start gap-6 mb-6 pb-6 border-b">
            <img
              src={parentData.parentImage || 'https://i.pravatar.cc/150?img=1'}
              alt={parentData.parentName}
              className="h-32 w-32 rounded-2xl object-cover border-4 border-blue-200 shadow-lg"
            />
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">{parentData.parentName}</h1>
                <span className={`px-4 py-1.5 rounded-full text-white font-bold text-sm ${
                  parentData.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {(parentData.status || 'active').toUpperCase()}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {parentData.status === 'active' ? (
                  <button
                    onClick={() => handleStatusChange('inactive')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm font-semibold"
                  >
                    <XCircle className="h-4 w-4" />
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange('active')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm font-semibold"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Activate
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bio Data */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Personal Bio Data
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900 text-sm truncate">{parentData.parentEmail}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-semibold text-gray-900 text-sm">{parentData.parentPhone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                <Globe className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Timezone</p>
                  <p className="font-semibold text-gray-900 text-sm">{parentData.timezone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                <DollarSign className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Total Fee</p>
                  <p className="font-semibold text-gray-900 text-sm">${parentData.fee || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
          
          {/* Tab Navigation */}
          <div className="border-b bg-gray-50">
            <div className="flex overflow-x-auto">
              {[
                { id: 'invoice', label: '📋 Invoice Details', count: invoices.length },
                { id: 'kids', label: '👶 List of Kids', count: students.length },
                { id: 'manager-notes', label: '📝 Manager Notes', count: 0 },
                { id: 'teacher-notes', label: '👨‍🏫 Teacher Notes', count: 0 },
                { id: 'tasks', label: '✅ Tasks', count: 0 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab.label} {tab.count > 0 && `(${tab.count})`}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Invoice Tab */}
            {activeTab === 'invoice' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Invoice History</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold shadow-md">
                    <Plus className="h-4 w-4" />
                    New Invoice
                  </button>
                </div>
                
                {invoices.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No invoices yet</p>
                    <p className="text-sm text-gray-400 mt-2">Create your first invoice</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">#</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Period</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Due Date</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {invoices.map((invoice, index) => (
                          <tr key={invoice.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-semibold text-gray-900">{index + 1}</td>
                            <td className="px-4 py-3 font-semibold text-gray-900">
                              {invoice.month} {invoice.year}
                            </td>
                            <td className="px-4 py-3 font-bold text-gray-900 text-lg">
                              ${invoice.amount}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {invoice.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(invoice.dueDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Kids Tab */}
            {activeTab === 'kids' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Students ({students.length})</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold shadow-md">
                    <Plus className="h-4 w-4" />
                    Add Student
                  </button>
                </div>
                
                {students.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No students yet</p>
                    <p className="text-sm text-gray-400 mt-2">Add your first student</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">#</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Age</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Level</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Teacher</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Course</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Progress</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {students.map((student, index) => (
                          <tr key={student.id} className="hover:bg-blue-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-gray-900">{index + 1}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                                  {student.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">{student.name}</p>
                                  <p className="text-xs text-gray-600">{student.gender || 'N/A'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-900">{student.age}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                                {student.level}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-purple-600" />
                                <span className="font-semibold text-gray-900">{student.teacherName || 'Not Assigned'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-700">{student.courseName || student.regularCourse || 'Not Set'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
                                  <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{ width: `${student.progress || 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-bold text-gray-700">{student.progress || 0}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                student.status === 'active' ? 'bg-green-100 text-green-800' :
                                student.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                                student.status === 'on-hold' ? 'bg-gray-200 text-gray-700' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {(student.status || 'active').toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedStudent(student);
                                    setShowEditStudentModal(true);
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                  title="Edit Student"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                  title="View Profile"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                  title="Delete"
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
                )}
              </div>
            )}

            {/* Manager Notes Tab */}
            {activeTab === 'manager-notes' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Manager Notes</h3>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 font-semibold shadow-md">
                    <Plus className="h-4 w-4" />
                    Add Note
                  </button>
                </div>
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No manager notes yet</p>
                  <p className="text-sm text-gray-400 mt-2">Add notes to track parent communications</p>
                </div>
              </div>
            )}

            {/* Teacher Notes Tab */}
            {activeTab === 'teacher-notes' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Teacher Notes</h3>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-semibold shadow-md">
                    <Plus className="h-4 w-4" />
                    Add Note
                  </button>
                </div>
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No teacher notes yet</p>
                  <p className="text-sm text-gray-400 mt-2">Teacher feedback and observations will appear here</p>
                </div>
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Tasks</h3>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 font-semibold shadow-md">
                    <Plus className="h-4 w-4" />
                    Add Task
                  </button>
                </div>
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No tasks assigned yet</p>
                  <p className="text-sm text-gray-400 mt-2">Create tasks to track follow-ups and actions</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Student Modal */}
        {showEditStudentModal && selectedStudent && (
          <EditStudentModal
            isOpen={showEditStudentModal}
            onClose={() => {
              setShowEditStudentModal(false);
              setSelectedStudent(null);
            }}
            student={selectedStudent}
            teachers={teachers}
            courses={courses}
            onSave={handleUpdateStudent}
          />
        )}
      </div>
    </div>
  );
}