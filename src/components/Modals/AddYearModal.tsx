import React, { useState } from 'react';
import { X, Calendar, Check } from 'lucide-react';

interface AddYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (yearData: any) => Promise<void>;
}

export default function AddYearModal({ isOpen, onClose, onSubmit }: AddYearModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    yearName: '',
    startDate: '',
    endDate: '',
    isActive: false,
    description: ''
  });

  const handleSubmit = async () => {
    if (!formData.yearName || !formData.startDate || !formData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      alert('End date must be after start date');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        createdAt: new Date().toISOString()
      });
      
      setFormData({
        yearName: '',
        startDate: '',
        endDate: '',
        isActive: false,
        description: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding year:', error);
      alert('Failed to add year. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-teal-600" />
            </div>
            <h2 className="text-xl font-bold text-white">Add New Academic Year</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-teal-800 p-2 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year Name *
            </label>
            <input
              type="text"
              value={formData.yearName}
              onChange={(e) => setFormData({ ...formData, yearName: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., 2024-2025"
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: 2024-2025 or Academic Year 2024
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              rows={3}
              placeholder="Additional notes about this academic year..."
            />
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <div>
                <label htmlFor="isActive" className="block text-sm font-medium text-teal-900 cursor-pointer">
                  Set as Active Year
                </label>
                <p className="text-xs text-teal-700 mt-1">
                  Only one academic year can be active at a time. Setting this as active will deactivate other years.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Add Year</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}