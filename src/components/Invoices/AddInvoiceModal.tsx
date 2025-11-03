import { useState } from 'react';
import { X, DollarSign, Calendar, CreditCard, Plus } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface AddInvoiceModalProps {
  parentId: string;
  familyId: string;
  onClose: () => void;
}

export default function AddInvoiceModal({
  parentId,
  familyId,
  onClose
}: AddInvoiceModalProps) {
  const { children, createInvoice } = useData();
  
  const parentChildren = children.filter(c => c.parentId === familyId);
  
  const currentDate = new Date();
  const [formData, setFormData] = useState({
    month: currentDate.toLocaleString('default', { month: 'long' }),
    year: currentDate.getFullYear().toString(),
    amount: 0,
    dueDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1).toISOString().split('T')[0],
    status: 'pending' as 'paid' | 'pending' | 'overdue'
  });
  
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChildToggle = (childId: string) => {
    setSelectedChildren(prev => 
      prev.includes(childId)
        ? prev.filter(id => id !== childId)
        : [...prev, childId]
    );
  };

  const calculateTotal = () => {
    return selectedChildren.length * 60;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedChildren.length === 0) {
      alert('Please select at least one student');
      return;
    }

    setLoading(true);
    try {
      const invoiceChildren = selectedChildren.map(childId => {
        const child = children.find(c => c.id === childId);
        return {
          childId,
          childName: child?.name || 'Unknown',
          classesCount: 8
        };
      });

      await createInvoice({
        parentId: familyId,
        month: formData.month,
        year: formData.year,
        amount: calculateTotal(),
        status: formData.status,
        dueDate: formData.dueDate,
        children: invoiceChildren
      });

      alert('✅ Invoice created successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('❌ Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-green-600 text-white p-6 flex justify-between items-center rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <DollarSign className="h-6 w-6" />
            <div>
              <h2 className="text-2xl font-bold">Create Invoice</h2>
              <p className="text-sm text-emerald-100">Generate monthly invoice for family</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Invoice Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Month <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              >
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
                min="2020"
                max="2030"
              />
            </div>
          </div>

          {/* Due Date */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>

          {/* Select Students */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Select Students <span className="text-red-500">*</span>
            </label>
            
            {parentChildren.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <p className="text-gray-500">No students found for this family</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto border-2 border-gray-200 rounded-xl p-4">
                {parentChildren.map((child) => (
                  <label
                    key={child.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedChildren.includes(child.id)
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedChildren.includes(child.id)}
                        onChange={() => handleChildToggle(child.id)}
                        className="h-5 w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{child.name}</p>
                        <p className="text-sm text-gray-600">
                          {child.level} - {child.teacherName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">$60</p>
                      <p className="text-xs text-gray-500">per month</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Total Amount */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${calculateTotal()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedChildren.length} student{selectedChildren.length !== 1 ? 's' : ''} × $60
                </p>
              </div>
              <DollarSign className="h-16 w-16 text-emerald-600 opacity-20" />
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <CreditCard className="inline h-4 w-4 mr-1" />
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedChildren.length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Create Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}