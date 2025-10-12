import React, { useState, useEffect } from 'react';
import { X, Edit, Loader } from 'lucide-react';
import { useData } from '../../../contexts/DataContext';

interface EditChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: any;
}

export default function EditChildModal({ isOpen, onClose, child }: EditChildModalProps) {
  const { updateChild, teachers } = useData();
  const [loading, setLoading] = useState(false);
  const [availableTeachers, setAvailableTeachers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    level: '',
    teacherId: '',
    teacherName: '',
    progress: 0
  });

  useEffect(() => {
    if (isOpen && child) {
      setFormData({
        name: child.name || '',
        age: child.age?.toString() || '',
        level: child.level || 'Beginner',
        teacherId: child.teacherId || '',
        teacherName: child.teacherName || '',
        progress: child.progress || 0
      });
      
      // تحديث قائمة المدرسين
      if (teachers) {
        const activeTeachers = teachers.filter(t => t.isActive !== false);
        console.log('Edit Modal - Available teachers:', activeTeachers);
        setAvailableTeachers(activeTeachers);
      }
    }
  }, [isOpen, child, teachers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!child?.id) {
      alert('Invalid child data');
      return;
    }

    if (!formData.name || !formData.age || !formData.teacherId) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const selectedTeacher = teachers.find(t => t.id === formData.teacherId);
      
      await updateChild(child.id, {
        name: formData.name,
        age: parseInt(formData.age),
        level: formData.level,
        teacherId: formData.teacherId,
        teacherName: selectedTeacher?.name || '',
        progress: formData.progress
      });

      alert('Child updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating child:', error);
      alert('Failed to update child. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherChange = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    setFormData({
      ...formData,
      teacherId,
      teacherName: teacher?.name || ''
    });
  };

  if (!isOpen || !child) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Edit className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Edit Child Information</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Child's Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter child's full name"
              required
              disabled={loading}
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter age"
              min="4"
              max="18"
              required
              disabled={loading}
            />
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Learning Level <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              disabled={loading}
            >
              <option value="Beginner">Beginner - Starting Journey</option>
              <option value="Short Surahs">Short Surahs - Juz Amma</option>
              <option value="Surah Yaseen">Surah Yaseen Level</option>
              <option value="Half Quran">Half Quran Memorized</option>
              <option value="Advanced">Advanced - Full Quran</option>
            </select>
          </div>

          {/* Progress */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Progress: {formData.progress}%
            </label>
            <input
              type="range"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              min="0"
              max="100"
              disabled={loading}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Teacher Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Teacher <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.teacherId}
              onChange={(e) => handleTeacherChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              disabled={loading}
            >
              <option value="">Choose a teacher...</option>
              {teachers.filter(t => t.isActive).map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} - {teacher.specialization}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="h-5 w-5" />
                  Update Child
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}