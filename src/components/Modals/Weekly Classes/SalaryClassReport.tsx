import React, { useState, useEffect } from 'react';
import { DollarSign, Clock, Calendar, FileText, RefreshCw } from 'lucide-react';
import { ref, onValue, off, push } from 'firebase/database';
import { database } from '../../../firebase/config';

interface Teacher {
  id: string;
  name: string;
  email: string;
  hourlyRate: number;
  specialization?: string;
}

interface SalaryReport {
  id: string;
  teacherId: string;
  teacherName: string;
  month: number;
  year: number;
  totalClasses: number;
  completedClasses: number;
  totalHours: number;
  ratePerHour: number;
  totalSalary: number;
  createdAt: string;
}

interface DailyClass {
  id: string;
  teacherId: string;
  classDate: string;
  status: string;
  startTime: string;
  endTime: string;
}

export default function SalaryClassReport() {
  const [reports, setReports] = useState<SalaryReport[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [dailyClasses, setDailyClasses] = useState<DailyClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();

    return () => {
      const reportsRef = ref(database, 'salaryReports');
      const teachersRef = ref(database, 'employees');
      const classesRef = ref(database, 'dailyClasses');
      off(reportsRef);
      off(teachersRef);
      off(classesRef);
    };
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Teachers
      const teachersRef = ref(database, 'employees');
      onValue(teachersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const teachersList: Teacher[] = Object.entries(data)
            .filter(([_, emp]: [string, any]) => emp.role === 'teacher')
            .map(([id, teacher]: [string, any]) => ({
              id,
              name: teacher.name || 'Unknown',
              email: teacher.email || '',
              hourlyRate: teacher.hourlyRate || 15,
              specialization: teacher.specialization || '',
            }));
          setTeachers(teachersList);
        }
      });

      // Fetch Daily Classes
      const classesRef = ref(database, 'dailyClasses');
      onValue(classesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const classList: DailyClass[] = Object.entries(data).map(([id, cls]: [string, any]) => ({
            id,
            teacherId: cls.teacherId || '',
            classDate: cls.classDate || '',
            status: cls.status || '',
            startTime: cls.startTime || '',
            endTime: cls.endTime || '',
          }));
          setDailyClasses(classList);
        }
      });

      // Fetch Salary Reports
      const reportsRef = ref(database, 'salaryReports');
      onValue(reportsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const reportsList: SalaryReport[] = Object.entries(data)
            .filter(([_, report]: [string, any]) => 
              report.month === selectedMonth && report.year === selectedYear
            )
            .map(([id, report]: [string, any]) => ({
              id,
              teacherId: report.teacherId || '',
              teacherName: report.teacherName || 'Unknown',
              month: report.month || 0,
              year: report.year || 0,
              totalClasses: report.totalClasses || 0,
              completedClasses: report.completedClasses || 0,
              totalHours: report.totalHours || 0,
              ratePerHour: report.ratePerHour || 0,
              totalSalary: report.totalSalary || 0,
              createdAt: report.createdAt || new Date().toISOString(),
            }));
          setReports(reportsList);
        } else {
          setReports([]);
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const generateReports = async () => {
    if (!confirm(`Generate salary reports for ${selectedMonth}/${selectedYear}?`)) return;

    setGenerating(true);
    try {
      const firstDay = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      const lastDayStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${lastDay}`;

      for (const teacher of teachers) {
        const classes = dailyClasses.filter(c =>
          c.teacherId === teacher.id &&
          c.classDate >= firstDay &&
          c.classDate <= lastDayStr
        );

        const completedClasses = classes.filter(c => c.status === 'completed');
        const totalClasses = classes.length;
        
        // Calculate hours (assuming 1 hour per class by default)
        const totalHours = completedClasses.reduce((sum, cls) => {
          if (cls.startTime && cls.endTime) {
            const start = new Date(`2000-01-01 ${cls.startTime}`);
            const end = new Date(`2000-01-01 ${cls.endTime}`);
            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            return sum + hours;
          }
          return sum + 1; // Default 1 hour
        }, 0);

        const totalSalary = totalHours * teacher.hourlyRate;

        const reportData = {
          teacherId: teacher.id,
          teacherName: teacher.name,
          month: selectedMonth,
          year: selectedYear,
          totalClasses,
          completedClasses: completedClasses.length,
          totalHours,
          ratePerHour: teacher.hourlyRate,
          totalSalary,
          createdAt: new Date().toISOString(),
        };

        const reportsRef = ref(database, 'salaryReports');
        await push(reportsRef, reportData);
      }

      alert('Salary reports generated successfully!');
      fetchData();
    } catch (error) {
      console.error('Error generating reports:', error);
      alert('Failed to generate reports. Please try again.');
    }
    setGenerating(false);
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
          <h2 className="text-2xl font-bold text-gray-900">Salary Class Report</h2>
          <p className="text-gray-600 mt-1">Monthly salary reports for teachers</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>
                {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <button
            onClick={generateReports}
            disabled={generating}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generating...' : 'Generate Reports'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-md border">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No reports generated for this period</p>
            <p className="text-sm text-gray-400 mt-2">Click "Generate Reports" to create them</p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow-md border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{report.teacherName}</h3>
                  <p className="text-sm text-gray-500">Teacher</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    {new Date(2000, report.month - 1).toLocaleString('default', { month: 'short' })} {report.year}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Total Classes
                  </span>
                  <span className="font-semibold text-gray-900">{report.totalClasses}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">{report.completedClasses}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Total Hours
                  </span>
                  <span className="font-semibold text-gray-900">{Number(report.totalHours).toFixed(2)}h</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600">Rate/Hour</span>
                  <span className="font-semibold text-gray-900">${Number(report.ratePerHour).toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center py-3 bg-blue-50 rounded-lg px-3 mt-3">
                  <span className="text-sm font-medium text-blue-900 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Total Salary
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    ${Number(report.totalSalary).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}