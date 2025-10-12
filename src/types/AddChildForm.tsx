import React, { useState } from 'react';
import { X, User, Calendar, BookOpen, UserCheck } from 'lucide-react';

export interface AddChildFormData {
  name: string;
  age: number;
  level: string;
  teacher: string;
}

interface AddChildFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddChildFormData) => void;
}

export default function AddChildForm({ isOpen, onClose, onSubmit }: AddChildFormProps) {
  const [formData, setFormData] = useState<AddChildFormData>({
    name: '',
    age: 8,
    level: '',
    teacher: ''
  });
  const [errors, setErrors] = useState<Partial<AddChildFormData>>({});

  const levels = [
    'Quran Basics',
    'Short Surahs',
    'Surah Yaseen',
    'Surah Al-Mulk',
    'Surah Al-Baqarah',
    'Juz Amma',
    'Full Quran'
  ];

  const teachers = [
    'Dr. Fatima Ali',
    'Ustaz Ahmed',
    'Sister Aisha',
    'Sheikh Mohammed',
    'Sister Khadijah',
    'Ustaz Omar'
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<AddChildFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (formData.age < 5 || formData.age > 18) {
      newErrors.age = 'Age must be between 5 and 18';
    }

    if (!formData.level) {
      newErrors.level = 'Please select a level';
    }

    if (!formData.teacher) {
      newErrors.teacher = 'Please select a teacher';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData({ name: '', age: 8, level: '', teacher: '' });
      setErrors({});
      onClose();
    }
  };

  const handleInputChange = (field: keyof AddChildFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-primary-600" />
              Add New Child
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Child's Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter child's full name"
                />
                <User className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="age"
                  min="5"
                  max="18"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value, 10))}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.age ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
            </div>

            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                Starting Level
              </label>
              <div className="relative">
                <select
                  id="level"
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.level ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select starting level</option>
                  {levels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <BookOpen className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.level && <p className="mt-1 text-sm text-red-600">{errors.level}</p>}
            </div>

            <div>
              <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 mb-1">
                Assign Teacher
              </label>
              <div className="relative">
                <select
                  id="teacher"
                  value={formData.teacher}
                  onChange={(e) => handleInputChange('teacher', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.teacher ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher} value={teacher}>{teacher}</option>
                  ))}
                </select>
                <UserCheck className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.teacher && <p className="mt-1 text-sm text-red-600">{errors.teacher}</p>}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              >
                Add Child
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}