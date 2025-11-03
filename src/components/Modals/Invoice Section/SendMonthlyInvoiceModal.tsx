  import React, { useState, useEffect } from 'react';
  import { X, Send, Calendar, Users, Mail, CheckCircle, AlertCircle } from 'lucide-react';
  import { ref, onValue, off, push, set } from 'firebase/database';
  import { database } from '../../../firebase/config';

  interface SendMonthlyInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
  }

  interface Family {
    id: string;
    name: string;
    email: string;
    studentCount: number;
    monthlyFee: number;
  }

  const SendMonthlyInvoiceModal: React.FC<SendMonthlyInvoiceModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
  }) => {
    const [families, setFamilies] = useState<Family[]>([]);
    const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
      if (!isOpen) return;

      const familiesRef = ref(database, 'families');
      const unsubscribe = onValue(familiesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const familiesList: Family[] = Object.entries(data).map(([id, family]: [string, any]) => ({
            id,
            name: family.name || 'Unknown',
            email: family.email || '',
            studentCount: family.children?.length || 0,
            monthlyFee: family.monthlyFee || 60,
          }));
          setFamilies(familiesList);
        }
      });

      // Set default month and year
      const now = new Date();
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      setMonth(months[now.getMonth()]);
      setYear(now.getFullYear().toString());
      
      // Set default due date (15th of next month)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);
      setDueDate(nextMonth.toISOString().split('T')[0]);

      return () => {
        off(familiesRef);
      };
    }, [isOpen]);

    const handleSelectAll = () => {
      if (selectAll) {
        setSelectedFamilies([]);
      } else {
        setSelectedFamilies(families.map((f) => f.id));
      }
      setSelectAll(!selectAll);
    };

    const handleSelectFamily = (familyId: string) => {
      if (selectedFamilies.includes(familyId)) {
        setSelectedFamilies(selectedFamilies.filter((id) => id !== familyId));
      } else {
        setSelectedFamilies([...selectedFamilies, familyId]);
      }
    };

    const calculateTotal = () => {
      return families
        .filter((f) => selectedFamilies.includes(f.id))
        .reduce((sum, f) => sum + f.monthlyFee * f.studentCount, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (selectedFamilies.length === 0) {
        alert('Please select at least one family');
        return;
      }

      if (!month || !year || !dueDate) {
        alert('Please fill in all required fields');
        return;
      }

      setLoading(true);

      try {
        const invoicesData = selectedFamilies.map((familyId) => {
          const family = families.find((f) => f.id === familyId);
          return {
            familyId,
            familyName: family?.name || 'Unknown',
            familyEmail: family?.email || '',
            month,
            year,
            amount: (family?.monthlyFee || 60) * (family?.studentCount || 1),
            studentCount: family?.studentCount || 1,
            dueDate,
            status: 'pending',
            message,
            createdAt: new Date().toISOString(),
          };
        });

        // Save all invoices
        for (const invoice of invoicesData) {
          await onSubmit(invoice);
        }

        alert(`Successfully sent ${invoicesData.length} invoice(s)!`);
        handleClose();
      } catch (error) {
        console.error('Error sending invoices:', error);
        alert('Failed to send invoices. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const handleClose = () => {
      setSelectedFamilies([]);
      setMonth('');
      setYear('');
      setDueDate('');
      setMessage('');
      setSelectAll(false);
      onClose();
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Send className="h-6 w-6 text-white" />
              <h2 className="text-xl font-bold text-white">Send Monthly Invoice</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-emerald-800 rounded-full p-1 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Invoice Period */}
            <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Invoice Period
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Select Month</option>
                    {['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Optional Message */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-2" />
                Custom Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Add a custom message to the invoice email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Select Families */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Select Families ({selectedFamilies.length} selected)
                </h3>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  {selectAll ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                {families.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    No families found
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {families.map((family) => (
                      <label
                        key={family.id}
                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFamilies.includes(family.id)}
                          onChange={() => handleSelectFamily(family.id)}
                          className="h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">{family.name}</span>
                            <span className="text-sm font-semibold text-emerald-600">
                              ${(family.monthlyFee * family.studentCount).toFixed(2)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {family.studentCount} student(s) • {family.email}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            {selectedFamilies.length > 0 && (
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-emerald-700 font-medium">Total Invoice Amount</div>
                    <div className="text-xs text-emerald-600 mt-1">
                      {selectedFamilies.length} families selected
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-emerald-900">
                    ${calculateTotal().toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || selectedFamilies.length === 0}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invoices
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default SendMonthlyInvoiceModal;