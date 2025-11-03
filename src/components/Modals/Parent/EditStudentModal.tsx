import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Globe, BookOpen, Users, MessageSquare, AlertCircle } from 'lucide-react';

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

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    name: string;
    age: string;
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
    status?: string;
    level?: string;
    progress?: number;
    courseId?: string;
    courseName?: string;
  };
  teachers?: Teacher[];
  courses?: Course[];
  onSave: (updatedStudent: any) => void;
}

const EditStudentModal: React.FC<EditStudentModalProps> = ({ 
  isOpen, 
  onClose, 
  student, 
  teachers = [],
  courses = [],
  onSave 
}) => {
  const [formData, setFormData] = useState(student);
  const [activeSection, setActiveSection] = useState<'bio' | 'course' | 'remarks'>('bio');

  useEffect(() => {
    if (isOpen) {
      setFormData(student);
    }
  }, [isOpen, student]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleCancel = () => {
    setFormData(student);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 flex justify-between items-center rounded-t-2xl z-10 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Edit Student Details</h2>
              <p className="text-sm text-indigo-100">Update student information and course details</p>
            </div>
          </div>
          <button 
            onClick={handleCancel} 
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Section Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-2 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveSection('bio')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                activeSection === 'bio' 
                  ? 'bg-white text-indigo-600 shadow-md' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Personal Bio</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('course')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                activeSection === 'course' 
                  ? 'bg-white text-green-600 shadow-md' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Course Details</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('remarks')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                activeSection === 'remarks' 
                  ? 'bg-white text-purple-600 shadow-md' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Trial Remarks</span>
            </button>
          </div>

          {/* Person Bio Data Section */}
          {activeSection === 'bio' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-indigo-500">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Person Bio Data</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Student Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Skype ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="skypeId"
                    value={formData.skypeId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Language <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  >
                    <option value="">Select Language</option>
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
                    Student Status
                  </label>
                  <select
                    name="status"
                    value={formData.status || 'active'}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  >
                    <option value="active">✅ Active</option>
                    <option value="suspended">⛔ Suspended</option>
                    <option value="on-leave">🏖️ On Leave</option>
                    <option value="break">☕ Break</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Current Level
                  </label>
                  <select
                    name="level"
                    value={formData.level || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  >
                    <option value="">Select Level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Elementary">Elementary</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Additional Data / Notes
                  </label>
                  <input
                    type="text"
                    name="data"
                    value={formData.data}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Any additional information..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Course Details Section */}
          {activeSection === 'course' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-green-500">
                <div className="bg-green-100 p-2 rounded-lg">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Course Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Number of Days Per Week <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="numberOfDays"
                    value={formData.numberOfDays}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  >
                    <option value="">Select Days</option>
                    <option value="2">2 Days / Week</option>
                    <option value="3">3 Days / Week</option>
                    <option value="4">4 Days / Week</option>
                    <option value="5">5 Days / Week</option>
                    <option value="6">6 Days / Week</option>
                    <option value="7">7 Days / Week</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Assigned Teacher <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="teacherId"
                    value={formData.teacherId || formData.teacher}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.length > 0 ? (
                      teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name} ({teacher.email})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="teacher1">Amna Rao</option>
                        <option value="teacher2">Hafiza Ayesha</option>
                        <option value="teacher3">Ustadh Ahmed</option>
                        <option value="teacher4">Ustadha Fatima</option>
                        <option value="teacher5">Sheikh Omar</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Regular Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="regularCourse"
                    value={formData.regularCourse}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  >
                    <option value="">Select Course</option>
                    {courses.length > 0 ? (
                      courses.map(course => (
                        <option key={course.id} value={course.name}>
                          {course.name} - {course.duration}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Quran Recitation">Quran Recitation</option>
                        <option value="Quran Memorization">Quran Memorization (Hifz)</option>
                        <option value="Tajweed">Tajweed & Tarteel</option>
                        <option value="Islamic Studies">Islamic Studies</option>
                        <option value="Arabic Language">Arabic Language</option>
                        <option value="Tafseer">Tafseer ul Quran</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Additional Course (Optional)
                  </label>
                  <select
                    name="additionalCourse"
                    value={formData.additionalCourse}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  >
                    <option value="">No Additional Course</option>
                    <option value="Quran Recitation">Quran Recitation</option>
                    <option value="Quran Memorization">Quran Memorization (Hifz)</option>
                    <option value="Tajweed">Tajweed & Tarteel</option>
                    <option value="Islamic Studies">Islamic Studies</option>
                    <option value="Arabic Language">Arabic Language</option>
                    <option value="Tafseer">Tafseer ul Quran</option>
                    <option value="Fiqh">Fiqh (Islamic Jurisprudence)</option>
                    <option value="Hadith">Hadith Studies</option>
                  </select>
                </div>

                <div className="md:col-span-2 bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Current Progress: {formData.progress || 0}%
                  </label>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${formData.progress || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Progress is automatically updated based on completed classes and evaluations
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Trial Class Remarks Section */}
          {activeSection === 'remarks' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-purple-500">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Trial Class Remarks</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Remarks for Parent
                  </label>
                  <textarea
                    name="remarksForParent"
                    value={formData.remarksForParent}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition"
                    placeholder="Enter feedback and remarks for the parent..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    This will be visible to the parent in their dashboard
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Remarks for Teacher
                  </label>
                  <textarea
                    name="remarksForTeacher"
                    value={formData.remarksForTeacher}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition"
                    placeholder="Enter internal notes for the teacher..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Private notes only visible to teachers and admin
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900 mb-1">About Trial Class Remarks</h4>
                    <p className="text-sm text-blue-800">
                      Trial class remarks help track student performance during the trial period. 
                      Remarks for parents provide feedback on progress, while teacher remarks help 
                      with internal tracking and planning future lessons.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 mt-8 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-8 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition font-bold shadow-md"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition font-bold shadow-lg"
            >
              💾 Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditStudentModal;