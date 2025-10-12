import React, { useState } from 'react';
import { X, Users, Mail, Phone, MapPin, User, Calendar } from 'lucide-react';

interface AddFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (familyData: any) => Promise<void>;
}

export default function AddFamilyModal({ isOpen, onClose, onSubmit }: AddFamilyModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    address: '',
    country: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    numberOfChildren: '1',
    children: [{ name: '', age: '', level: 'Beginner' }]
  });

  const handleSubmit = async () => {
    if (!formData.parentName || !formData.parentEmail || !formData.parentPhone) {
      alert('Please fill in all required parent information');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        numberOfChildren: parseInt(formData.numberOfChildren),
        createdAt: new Date().toISOString()
      });
      
      setFormData({
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        address: '',
        country: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        numberOfChildren: '1',
        children: [{ name: '', age: '', level: 'Beginner' }]
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding family:', error);
      alert('Failed to add family. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateNumberOfChildren = (num: string) => {
    const count = parseInt(num) || 1;
    const children = Array(count).fill(null).map((_, i) => 
      formData.children[i] || { name: '', age: '', level: 'Beginner' }
    );
    setFormData({ ...formData, numberOfChildren: num, children });
  };

  const updateChild = (index: number, field: string, value: string) => {
    const updatedChildren = [...formData.children];
    updatedChildren[index] = { ...updatedChildren[index], [field]: value };
    setFormData({ ...formData, children: updatedChildren });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-white">Add New Family</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 p-2 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Parent Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent/Guardian Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter parent name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="parent@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <input
                  type="text"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Auto-detected"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Enter full address"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Children Information
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Children
              </label>
              <select
                value={formData.numberOfChildren}
                onChange={(e) => updateNumberOfChildren(e.target.value)}
                className="w-full md:w-48 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              {formData.children.map((child, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Child {index + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={child.name}
                        onChange={(e) => updateChild(index, 'name', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Child name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="18"
                        value={child.age}
                        onChange={(e) => updateChild(index, 'age', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Age"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Level
                      </label>
                      <select
                        value={child.level}
                        onChange={(e) => updateChild(index, 'level', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Users className="h-4 w-4" />
                  <span>Add Family</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}