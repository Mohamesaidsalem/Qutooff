import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Play } from 'lucide-react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../../../firebase/config';

interface DailyClass {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  classDate: string;
  startTime: string;
  endTime: string;
  subject: string;
  status: 'completed' | 'running' | 'scheduled' | 'absent' | 'cancelled';
  attendanceNotes?: string;
  createdAt: string;
}

const getStatusIcon = (status: string) => {
  switch(status) {
    case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'running': return <Play className="h-4 w-4 text-blue-600" />;
    case 'scheduled': return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'absent': return <XCircle className="h-4 w-4 text-red-600" />;
    case 'cancelled': return <AlertCircle className="h-4 w-4 text-gray-600" />;
    default: return null;
  }
};

const getStatusColor = (status: string) => {
  switch(status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'running': return 'bg-blue-100 text-blue-800';
    case 'scheduled': return 'bg-yellow-100 text-yellow-800';
    case 'absent': return 'bg-red-100 text-red-800';
    case 'cancelled': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function DailyClassReport() {
  const [dailyClasses, setDailyClasses] = useState<DailyClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchDailyClasses();

    return () => {
      const classesRef = ref(database, 'dailyClasses');
      off(classesRef);
    };
  }, [selectedDate]);

  const fetchDailyClasses = async () => {
    setLoading(true);
    try {
      const classesRef = ref(database, 'dailyClasses');
      onValue(classesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const classList: DailyClass[] = Object.entries(data)
            .filter(([_, cls]: [string, any]) => cls.classDate === selectedDate)
            .map(([id, cls]: [string, any]) => ({
              id,
              teacherId: cls.teacherId || '',
              teacherName: cls.teacherName || 'Unknown',
              studentId: cls.studentId || '',
              studentName: cls.studentName || 'Unknown',
              classDate: cls.classDate || '',
              startTime: cls.startTime || '',
              endTime: cls.endTime || '',
              subject: cls.subject || '',
              status: cls.status || 'scheduled',
              attendanceNotes: cls.attendanceNotes || '',
              createdAt: cls.createdAt || new Date().toISOString(),
            }));
          
          classList.sort((a, b) => a.startTime.localeCompare(b.startTime));
          setDailyClasses(classList);
        } else {
          setDailyClasses([]);
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Error fetching daily classes:', error);
      setLoading(false);
    }
  };

  const stats = {
    total: dailyClasses.length,
    completed: dailyClasses.filter(c => c.status === 'completed').length,
    running: dailyClasses.filter(c => c.status === 'running').length,
    scheduled: dailyClasses.filter(c => c.status === 'scheduled').length,
    absent: dailyClasses.filter(c => c.status === 'absent').length,
    cancelled: dailyClasses.filter(c => c.status === 'cancelled').length,
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daily Class Report</h2>
          <p className="text-gray-600 mt-1">View all classes for a specific date</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-md border p-4">
          <div className="text-center">
            <Calendar className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Classes</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border p-4">
          <div className="text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border p-4">
          <div className="text-center">
            <Play className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
            <div className="text-sm text-gray-600">Running</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border p-4">
          <div className="text-center">
            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">{stats.scheduled}</div>
            <div className="text-sm text-gray-600">Scheduled</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border p-4">
          <div className="text-center">
            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            <div className="text-sm text-gray-600">Absent</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border p-4">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-600">{stats.cancelled}</div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dailyClasses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    No classes scheduled for this date
                  </td>
                </tr>
              ) : (
                dailyClasses.map((cls) => (
                  <tr key={cls.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <Clock className="h-4 w-4 text-blue-600" />
                        {cls.startTime} - {cls.endTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{cls.subject}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{cls.teacherName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{cls.studentName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(cls.status)}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(cls.status)}`}>
                          {cls.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{cls.attendanceNotes || '-'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}