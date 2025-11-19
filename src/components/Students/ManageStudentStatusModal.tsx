import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Coffee, Clock, AlertCircle } from 'lucide-react';

interface ManageStudentStatusModalProps {
  student: {
    id: string;
    name: string;
  };
  currentStatus: 'active' | 'suspended' | 'leave' | 'break' | 'on-hold' | 'inactive';
  onClose: () => void;
  onStatusChange: (newStatus: 'active' | 'suspended' | 'leave' | 'break') => Promise<void>;
}

export default function ManageStudentStatusModal({
  student,
  currentStatus,
  onClose,
  onStatusChange
}: ManageStudentStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    {
      value: 'active',
      label: 'Active',
      icon: CheckCircle,
      color: 'green',
      description: 'Student is actively attending classes'
    },
    {
      value: 'suspended',
      label: 'Suspended',
      icon: XCircle,
      color: 'red',
      description: 'Student is temporarily suspended from classes'
    },
    {
      value: 'leave',
      label: 'On Leave',
      icon: Coffee,
      color: 'blue',
      description: 'Student is on temporary leave'
    },
    {
      value: 'break',
      label: 'Break',
      icon: Clock,
      color: 'yellow',
      description: 'Student is taking a break from classes'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedStatus === currentStatus) {
      alert('Please select a different status');
      return;
    }

    setLoading(true);
    try {
      await onStatusChange(selectedStatus as any);
      onClose();
    } catch (error) {
      console.error('Error changing status:', error);
      alert('Failed to change status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold">Change Student Status</h2>
            <p className="text-sm text-purple-100 mt-1">{student.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Current Status */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <AlertCircle className="h-4 w-4" />
              Current Status
            </div>
            <p className="text-lg font-bold text-gray-900 capitalize">{currentStatus}</p>
          </div>

          {/* Status Options */}
          <div className="space-y-3 mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Select New Status <span className="text-red-500">*</span>
            </label>
            
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedStatus(option.value as any)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedStatus === option.value
                    ? `border-${option.color}-500 bg-${option.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-${option.color}-100`}>
                    <option.icon className={`h-5 w-5 text-${option.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{option.label}</h3>
                      {selectedStatus === option.value && (
                        <div className={`h-2 w-2 rounded-full bg-${option.color}-500`}></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Reason */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Enter reason for status change..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedStatus === currentStatus}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}