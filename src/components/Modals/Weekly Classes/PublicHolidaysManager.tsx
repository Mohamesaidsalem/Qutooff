import React, { useState, useEffect } from 'react';
import { X, Calendar, Plus, Trash2, Edit2 } from 'lucide-react';
import { ref, onValue, off, push, update, remove } from 'firebase/database';
import { database } from '../../../firebase/config';

interface PublicHoliday {
  id: string;
  name: string;
  date: string;
  createdAt: string;
}

export default function PublicHolidaysManager() {
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<PublicHoliday | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    date: '',
  });

  useEffect(() => {
    fetchHolidays();

    return () => {
      const holidaysRef = ref(database, 'publicHolidays');
      off(holidaysRef);
    };
  }, []);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const holidaysRef = ref(database, 'publicHolidays');
      onValue(holidaysRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const holidaysList: PublicHoliday[] = Object.entries(data).map(([id, holiday]: [string, any]) => ({
            id,
            name: holiday.name || '',
            date: holiday.date || '',
            createdAt: holiday.createdAt || new Date().toISOString(),
          }));
          setHolidays(holidaysList.sort((a, b) => a.date.localeCompare(b.date)));
        } else {
          setHolidays([]);
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Error fetching holidays:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.date) {
      alert('Please fill in all fields');
      return;
    }

    try {
      if (editingHoliday) {
        const holidayRef = ref(database, `publicHolidays/${editingHoliday.id}`);
        await update(holidayRef, {
          name: formData.name,
          date: formData.date,
          updatedAt: new Date().toISOString(),
        });
        alert('Holiday updated successfully!');
      } else {
        const holidaysRef = ref(database, 'publicHolidays');
        await push(holidaysRef, {
          name: formData.name,
          date: formData.date,
          createdAt: new Date().toISOString(),
        });
        alert('Holiday added successfully!');
      }

      setShowModal(false);
      setEditingHoliday(null);
      setFormData({ name: '', date: '' });
    } catch (error) {
      console.error('Error saving holiday:', error);
      alert('Failed to save holiday. Please try again.');
    }
  };

  const handleEdit = (holiday: PublicHoliday) => {
    setEditingHoliday(holiday);
    setFormData({
      name: holiday.name,
      date: holiday.date,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this holiday?')) return;

    try {
      const holidayRef = ref(database, `publicHolidays/${id}`);
      await remove(holidayRef);
      alert('Holiday deleted successfully!');
    } catch (error) {
      console.error('Error deleting holiday:', error);
      alert('Failed to delete holiday. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Public Holidays</h2>
          <p className="text-gray-600 mt-1">Manage public holidays and non-working days</p>
        </div>
        <button
          onClick={() => {
            setEditingHoliday(null);
            setFormData({ name: '', date: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Holiday
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Holiday Name</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {holidays.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p>No holidays added yet</p>
                </td>
              </tr>
            ) : (
              holidays.map((holiday) => (
                <tr key={holiday.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">{holiday.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{holiday.name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleEdit(holiday)}
                      className="inline-flex items-center p-2 text-blue-600 hover:bg-blue-50 rounded mr-2"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(holiday.id)}
                      className="inline-flex items-center p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                {editingHoliday ? 'Update Holiday' : 'Add Holiday'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Eid Al-Fitr, Christmas"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingHoliday ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}