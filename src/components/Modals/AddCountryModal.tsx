import React, { useState } from 'react';
import { X, Globe, MapPin, Clock } from 'lucide-react';

interface AddCountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (countryData: any) => Promise<void>;
}

export default function AddCountryModal({ isOpen, onClose, onSubmit }: AddCountryModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    countryName: '',
    countryCode: '',
    timezone: '',
    currency: '',
    language: '',
    active: true
  });

  const handleSubmit = async () => {
    if (!formData.countryName || !formData.countryCode) {
      alert('Please fill in country name and code');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        createdAt: new Date().toISOString()
      });
      
      setFormData({
        countryName: '',
        countryCode: '',
        timezone: '',
        currency: '',
        language: '',
        active: true
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding country:', error);
      alert('Failed to add country. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg">
              <Globe className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-white">Add New Country</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-purple-800 p-2 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country Name *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.countryName}
                onChange={(e) => setFormData({ ...formData, countryName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., United States"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country Code *
            </label>
            <input
              type="text"
              maxLength={3}
              value={formData.countryCode}
              onChange={(e) => setFormData({ ...formData, countryCode: e.target.value.toUpperCase() })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
              placeholder="e.g., USA"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select Timezone</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Dubai">Dubai (GST)</option>
                <option value="Asia/Riyadh">Riyadh (AST)</option>
                <option value="Australia/Sydney">Sydney (AEDT)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <input
              type="text"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., USD, EUR, GBP"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Language
            </label>
            <input
              type="text"
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., English, Arabic"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">
              Active Country
            </label>
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
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4" />
                  <span>Add Country</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}