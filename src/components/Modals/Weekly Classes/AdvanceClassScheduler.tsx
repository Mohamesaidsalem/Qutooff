import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Plus, CheckCircle, XCircle } from 'lucide-react';
import { ref, onValue, off, push, set, update } from 'firebase/database';
import { database } from '../../../firebase/config';

interface AdvanceClass {
  id: string;
  weeklyClassId: string;
  scheduledDate: string;
  scheduledTime: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  teacherName: string;
  studentName: string;
  subject: string;
  createdAt: string;
}

interface WeeklyClass {
  id: string;
  teacherName: string;
  studentName: string;
  dayOfWeek: string;
  startTime: string;
  subject: string;
  isActive: boolean;
}

export default function AdvanceClassScheduler() {
  const [advanceClasses, setAdvanceClasses] = useState<AdvanceClass[]>([]);
  const [weeklyClasses, setWeeklyClasses] = useState<WeeklyClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    weeklyClassId: '',
    scheduledDate: '',
    scheduledTime: '',
    reason: '',
  });

  useEffect(() => {
    fetchData();

    return () => {
      const advanceRef = ref(database, 'advanceClasses');
      const weeklyRef = ref(database, 'weeklyClasses');
      off(advanceRef);
      off(weeklyRef);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Advance Classes
      const advanceRef = ref(database, 'advanceClasses');
      onValue(advanceRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const classList: AdvanceClass[] = Object.entries(data).map(([id, cls]: [string, any]) => ({
            id,
            weeklyClassId: cls.weeklyClassId || '',
            scheduledDate: cls.scheduledDate || '',
            scheduledTime: cls.scheduledTime || '',
            reason: cls.reason || '',
            status: cls.status || 'scheduled',
            teacherName: cls.teacherName || 'N/A',
            studentName: cls.studentName || 'N/A',
            subject: cls.subject || 'N/A',
            createdAt: cls.createdAt || new Date().toISOString(),
          }));
          setAdvanceClasses(classList.sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate)));
        } else {
          setAdvanceClasses([]);
        }
        setLoading(false);
      });

      // Fetch Weekly Classes
      const weeklyRef = ref(database, 'weeklyClasses');
      onValue(weeklyRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const classList: WeeklyClass[] = Object.entries(data)
            .filter(([_, cls]: [string, any]) => cls.isActive)
            .map(([id, cls]: [string, any]) => ({
              id,
              teacherName: cls.teacherName || 'Unknown',
              studentName: cls.studentName || 'Unknown',
              dayOfWeek: cls.dayOfWeek || '',
              startTime: cls.startTime || '',
              subject: cls.subject || '',
              isActive: cls.isActive !== undefined ? cls.isActive : true,
            }));
          setWeeklyClasses(classList);
        }
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.weeklyClassId) {
      alert('Please select a weekly class');
      return;
    }

    try {
      const selectedClass = weeklyClasses.find(c => c.id === formData.weeklyClassId);

      const classData = {
        weeklyClassId: formData.weeklyClassId,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        reason: formData.reason,
        status: 'scheduled',
        teacherName: selectedClass?.teacherName || 'N/A',
        studentName: selectedClass?.studentName || 'N/A',
        subject: selectedClass?.subject || 'N/A',
        createdAt: new Date().toISOString(),
      };

      const advanceRef = ref(database, 'advanceClasses');
      await push(advanceRef, classData);

      alert('Advance class scheduled successfully!');
      setShowModal(false);
      setFormData({
        weeklyClassId: '',
        scheduledDate: '',
        scheduledTime: '',
        reason: '',
      });
    } catch (error) {
      console.error('Error scheduling advance class:', error);
      alert('Failed to schedule advance class. Please try again.');
    }
  };

  const updateStatus = async (id: string, status: 'completed' | 'cancelled') => {
    try {
      const classRef = ref(database, `advanceClasses/${id}`);
      await update(classRef, { 
        status,
        updatedAt: new Date().toISOString(),
      });
      alert(`Class marked as ${status}!`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
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
          <h2 className="text-2xl font-bold text-gray-900">Schedule Advance Class</h2>
          <p className="text-gray-600 mt-1">Schedule classes in advance or make up missed classes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Schedule Advance Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {advanceClasses.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-md border">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No advance classes scheduled</p>
          </div>
        ) : (
          advanceClasses.map((cls) => (
            <div key={cls.id} className="bg-white rounded-lg shadow-md border p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">{cls.scheduledDate}</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  cls.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                  cls.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {cls.status}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="h-4 w-4" />
                  <span>{cls.scheduledTime}</span>
                </div>
                <div className="text-gray-600">
                  <div className="font-medium">{cls.subject}</div>
                  <div>Teacher: {cls.teacherName}</div>
                  <div>Student: {cls.studentName}</div>
                </div>
                {cls.reason && (
                  <div className="text-gray-600 text-xs mt-2 p-2 bg-gray-50 rounded">
                    <span className="font-medium">Reason:</span> {cls.reason}
                  </div>
                )}
              </div>

              {cls.status === 'scheduled' && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => updateStatus(cls.id, 'completed')}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded hover:bg-green-100 text-sm"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Complete
                  </button>
                  <button
                    onClick={() => updateStatus(cls.id, 'cancelled')}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100 text-sm"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Schedule Advance Class</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Class</label>
                <select
                  value={formData.weeklyClassId}
                  onChange={(e) => setFormData({ ...formData, weeklyClassId: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Class</option>
                  {weeklyClasses.map((wc) => (
                    <option key={wc.id} value={wc.id}>
                      {wc.dayOfWeek} - {wc.startTime} - {wc.subject} - {wc.teacherName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Time</label>
                <input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g., Makeup class, Extra session"
                  rows={3}
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
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}