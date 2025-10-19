import React, { useState, useEffect } from 'react';
import { X, Users, Loader } from 'lucide-react';
import { ref, push, set, onValue, off } from 'firebase/database';
import { database } from '../../../firebase/config';
import { useAuth } from '../../../contexts/AuthContext';

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddChildModal({ isOpen, onClose }: AddChildModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    level: '',
    teacherId: '',
    teacherName: '',
    progress: 0
  });

  // Load teachers
  useEffect(() => {
    if (!isOpen) return;

    const teachersRef = ref(database, 'teachers');
    const unsubscribe = onValue(teachersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const teachersArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setTeachers(teachersArray.filter(t => t.isActive !== false));
      } else {
        setTeachers([]);
      }
    });

    return () => off(teachersRef, 'value', unsubscribe);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('User not authenticated');
      return;
    }

    setLoading(true);
    try {
      const selectedTeacher = teachers.find(t => t.id === formData.teacherId);
      
      // ✅ Child data
      const childData = {
        name: formData.name,
        age: Number(formData.age),
        level: formData.level,
        teacherId: formData.teacherId,
        teacherName: selectedTeacher?.name || '',
        parentId: user.id,
        progress: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        nextClass: 'Not scheduled'
      };

      // ✅ Save to 'children' collection
      const childrenRef = ref(database, 'children');
      const newChildRef = push(childrenRef);
      await set(newChildRef, childData);

      // ✅ Save to 'users' collection (for system-wide user management)
      const userRef = ref(database, `users/${newChildRef.key}`);
      await set(userRef, {
        name: childData.name,
        email: '', // Will be set when student account is created
        role: 'student',
        age: childData.age,
        level: childData.level,
        parentId: user.id,
        teacherId: childData.teacherId,
        progress: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        timezone: user.timezone || 'UTC'
      });

      console.log('✅ Child added successfully:', newChildRef.key);
      alert('Child added successfully!');
      
      // Reset form
      setFormData({
        name: '',
        age: '',
        level: '',
        teacherId: '',
        teacherName: '',
        progress: 0
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding child:', error);
      alert('Failed to add child. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex justify-between items-center rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Add New Child</h2>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Child's Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter child's full name"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter age"
              min="5"
              max="18"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Level <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              disabled={loading}
            >
              <option value="">Select Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Elementary">Elementary</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assign Teacher <span className="text-red-500">*</span>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              disabled={loading}
            >
              <option value="">Select Teacher</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} - {teacher.subject || teacher.specialization || 'General'}
                </option>
              ))}
            </select>
            {teachers.length === 0 && (
              <p className="text-xs text-yellow-600 mt-1">No teachers available. Please contact admin.</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> After adding your child, you can create a student account for them to access their own dashboard.
            </p>
          </div>

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
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Users className="h-5 w-5" />
                  Add Child
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}