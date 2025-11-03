import { useState } from 'react';
import { XCircle, Save, UserCog } from 'lucide-react';
import { ref, update } from 'firebase/database';
import { database } from '../../firebase/config';

export interface StudentData {
  id: string;
  name: string;
  age: string | number;
  skypeId: string;
  gender: string;
  language: string;
  data: string;
  numberOfDays: string;
  regularCourse: string;
  teacher: string;
  teacherId?: string;
  additionalCourse: string;
  remarksForParent: string;
  remarksForTeacher: string;
  status: 'active' | 'suspended' | 'on-hold' | 'inactive';
  level?: string;
  progress?: number;
  email?: string;
  phone?: string;
  timezone?: string;
  courseId?: string;
  courseName?: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface Course {
  id: string;
  name: string;
  duration: string;
}

interface EditStudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentData: StudentData;
  teachers?: Teacher[];
  courses?: Course[];
  onUpdate?: (studentId: string, data: Partial<StudentData>) => void | Promise<void>;
}

const LANGUAGES = [
  'Arabic', 'English', 'Urdu', 'French', 'Turkish', 'Bengali', 'Malay'
];

const GENDERS = ['Male', 'Female'];

const DAYS_PER_WEEK = [
  { value: '2', label: 'Plan A (2 Days)' },
  { value: '3', label: 'Plan B (3 Days)' },
  { value: '4', label: 'Plan C (4 Days)' },
  { value: '5', label: 'Plan D (5 Days)' },
  { value: '6', label: 'Plan E (6 Days)' },
  { value: '7', label: 'Plan F (7 Days)' }
];

const COURSES = [
  'Quran Ijaza',
  'Quran Recitation',
  'Quran Memorization (Hifz)',
  'Tajweed & Tarteel',
  'Islamic Studies',
  'Arabic Language',
  'Tafseer ul Quran',
  'Fiqh (Islamic Jurisprudence)',
  'Hadith Studies'
];

const TEACHERS_DEFAULT = [
  'Amna Rao',
  'Hafiza Ayesha',
  'Ustadh Ahmed',
  'Ustadha Fatima',
  'Sheikh Omar',
  'Fatima Mohammed'
];

const STATUS_OPTIONS: Array<'active' | 'suspended' | 'on-hold' | 'inactive'> = [
  'active', 
  'suspended', 
  'on-hold', 
  'inactive'
];

export default function EditStudentDetailsModal({
  isOpen,
  onClose,
  studentData,
  teachers = [],
  courses = [],
  onUpdate
}: EditStudentDetailsModalProps) {
  const [formData, setFormData] = useState({
    name: studentData.name || '',
    age: studentData.age?.toString() || '',
    skypeId: studentData.skypeId || '',
    gender: studentData.gender || 'Male',
    language: studentData.language || 'English',
    data: studentData.data || new Date().toISOString().split('T')[0],
    numberOfDays: studentData.numberOfDays || '2',
    regularCourse: studentData.regularCourse || '',
    teacher: studentData.teacher || '',
    teacherId: studentData.teacherId || '',
    additionalCourse: studentData.additionalCourse || '',
    remarksForParent: studentData.remarksForParent || '',
    remarksForTeacher: studentData.remarksForTeacher || '',
    status: (studentData.status || 'active') as 'active' | 'suspended' | 'on-hold' | 'inactive',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const childRef = ref(database, `children/${studentData.id}`);
      const updateData = {
        name: formData.name,
        age: parseInt(formData.age) || 0,
        skypeId: formData.skypeId,
        gender: formData.gender,
        language: formData.language,
        data: formData.data,
        numberOfDays: formData.numberOfDays,
        regularCourse: formData.regularCourse,
        teacher: formData.teacher,
        teacherId: formData.teacherId,
        additionalCourse: formData.additionalCourse,
        remarksForParent: formData.remarksForParent,
        remarksForTeacher: formData.remarksForTeacher,
        status: formData.status,
        updatedAt: new Date().toISOString()
      };
      
      await update(childRef, updateData);

      alert('✅ Student details updated successfully!');
      
      if (onUpdate) {
        await onUpdate(studentData.id, updateData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error updating student:', error);
      alert('❌ Failed to update student details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-white">✏️ Edit Student Details</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Person Bio Data Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
              <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                🧍 Person Bio Data
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Student Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Language <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Language</option>
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Gender</option>
                    {GENDERS.map((gender) => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Course Details Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-gray-50 to-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
              <h3 className="text-lg font-bold text-green-900 flex items-center gap-2">
                📚 Course Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Number of Days <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.numberOfDays}
                    onChange={(e) => setFormData({ ...formData, numberOfDays: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Plan</option>
                    {DAYS_PER_WEEK.map((plan) => (
                      <option key={plan.value} value={plan.value}>
                        {plan.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Teacher <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.teacher}
                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Teacher</option>
                    {teachers.length > 0 ? (
                      teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.name}>
                          {teacher.name}
                        </option>
                      ))
                    ) : (
                      TEACHERS_DEFAULT.map((teacher) => (
                        <option key={teacher} value={teacher}>
                          {teacher}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Regular Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.regularCourse}
                    onChange={(e) => setFormData({ ...formData, regularCourse: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.length > 0 ? (
                      courses.map((course) => (
                        <option key={course.id} value={course.name}>
                          {course.name}
                        </option>
                      ))
                    ) : (
                      COURSES.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Additional Course
                  </label>
                  <select
                    value={formData.additionalCourse}
                    onChange={(e) => setFormData({ ...formData, additionalCourse: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">No Additional Course</option>
                    {COURSES.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Trial Class Remarks Section */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-gray-50 to-purple-50 border-l-4 border-purple-500 p-4 mb-6 rounded-r-lg">
              <h3 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                💬 Trial Class Remarks
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Remarks for Parent
                </label>
                <textarea
                  value={formData.remarksForParent}
                  onChange={(e) => setFormData({ ...formData, remarksForParent: e.target.value })}
                  rows={4}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Enter remarks for parent..."
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
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Enter remarks for teacher..."
                />
              </div>
            </div>
          </div>

          {/* Account Management Section */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-gray-50 to-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
              <h3 className="text-lg font-bold text-red-900 flex items-center gap-2">
                <UserCog className="h-5 w-5" /> Account Management
              </h3>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Account Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as typeof formData.status })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status} className="capitalize">
                    {status.replace('-', ' ')}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                💡 Use <strong>'Suspended'</strong> or <strong>'On-hold'</strong> for students taking a break or vacation.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-bold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}