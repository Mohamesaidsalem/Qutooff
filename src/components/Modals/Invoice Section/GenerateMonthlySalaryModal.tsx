import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Users, CheckCircle, Calculator, TrendingUp } from 'lucide-react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../../../firebase/config';

interface GenerateMonthlySalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  hourlyRate: number;
  totalClasses: number;
  totalHours: number;
  bonus: number;
  deductions: number;
  salary: number;
}

const GenerateMonthlySalaryModal: React.FC<GenerateMonthlySalaryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Set default month and year
    const now = new Date();
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    setMonth(months[now.getMonth()]);
    setYear(now.getFullYear().toString());

    loadTeachersData();

    return () => {
      const teachersRef = ref(database, 'employees');
      off(teachersRef);
    };
  }, [isOpen]);

  const loadTeachersData = () => {
    setCalculating(true);
    const teachersRef = ref(database, 'employees');

    onValue(teachersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const teachersList: Teacher[] = Object.entries(data)
          .filter(([_, emp]: [string, any]) => emp.role === 'teacher')
          .map(([id, teacher]: [string, any]) => {
            // Calculate salary based on classes taught
            const totalClasses = teacher.classesTaught || 0;
            const totalHours = totalClasses * 1; // Assuming 1 hour per class
            const hourlyRate = teacher.hourlyRate || 15;
            const baseSalary = totalHours * hourlyRate;
            const bonus = teacher.bonus || 0;
            const deductions = teacher.deductions || 0;
            const finalSalary = baseSalary + bonus - deductions;

            return {
              id,
              name: teacher.name || 'Unknown',
              email: teacher.email || '',
              hourlyRate,
              totalClasses,
              totalHours,
              bonus,
              deductions,
              salary: finalSalary,
            };
          });
        setTeachers(teachersList);
      }
      setCalculating(false);
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTeachers([]);
    } else {
      setSelectedTeachers(teachers.map((t) => t.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectTeacher = (teacherId: string) => {
    if (selectedTeachers.includes(teacherId)) {
      setSelectedTeachers(selectedTeachers.filter((id) => id !== teacherId));
    } else {
      setSelectedTeachers([...selectedTeachers, teacherId]);
    }
  };

  const handleBonusChange = (teacherId: string, value: number) => {
    setTeachers(
      teachers.map((t) =>
        t.id === teacherId
          ? { ...t, bonus: value, salary: t.totalHours * t.hourlyRate + value - t.deductions }
          : t
      )
    );
  };

  const handleDeductionsChange = (teacherId: string, value: number) => {
    setTeachers(
      teachers.map((t) =>
        t.id === teacherId
          ? { ...t, deductions: value, salary: t.totalHours * t.hourlyRate + t.bonus - value }
          : t
      )
    );
  };

  const calculateTotal = () => {
    return teachers
      .filter((t) => selectedTeachers.includes(t.id))
      .reduce((sum, t) => sum + t.salary, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTeachers.length === 0) {
      alert('Please select at least one teacher');
      return;
    }

    if (!month || !year) {
      alert('Please select month and year');
      return;
    }

    setLoading(true);

    try {
      const salariesData = selectedTeachers.map((teacherId) => {
        const teacher = teachers.find((t) => t.id === teacherId);
        return {
          teacherId,
          teacherName: teacher?.name || 'Unknown',
          teacherEmail: teacher?.email || '',
          month,
          year,
          hourlyRate: teacher?.hourlyRate || 0,
          totalClasses: teacher?.totalClasses || 0,
          totalHours: teacher?.totalHours || 0,
          bonus: teacher?.bonus || 0,
          deductions: teacher?.deductions || 0,
          totalSalary: teacher?.salary || 0,
          status: 'pending',
          generatedAt: new Date().toISOString(),
        };
      });

      // Save all salaries
      for (const salary of salariesData) {
        await onSubmit(salary);
      }

      alert(`Successfully generated ${salariesData.length} salary report(s)!`);
      handleClose();
    } catch (error) {
      console.error('Error generating salaries:', error);
      alert('Failed to generate salaries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedTeachers([]);
    setSelectAll(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">Generate Monthly Salary</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-purple-800 rounded-full p-1 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Period Selection */}
          <div className="mb-6 bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Salary Period
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month <span className="text-red-500">*</span>
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Teachers List */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Select Teachers ({selectedTeachers.length} selected)
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={loadTeachersData}
                  disabled={calculating}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center"
                >
                  <Calculator className="h-4 w-4 mr-1" />
                  {calculating ? 'Calculating...' : 'Recalculate'}
                </button>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  {selectAll ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>

            {calculating ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 text-sm">Calculating salaries...</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            className="h-4 w-4 text-purple-600 rounded"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Teacher
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Classes
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Hours
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Rate/Hr
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Bonus
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Deductions
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teachers.map((teacher) => (
                        <tr key={teacher.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedTeachers.includes(teacher.id)}
                              onChange={() => handleSelectTeacher(teacher.id)}
                              className="h-4 w-4 text-purple-600 rounded"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium text-gray-900">{teacher.name}</div>
                            <div className="text-xs text-gray-500">{teacher.email}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{teacher.totalClasses}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{teacher.totalHours}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">${teacher.hourlyRate}</td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={teacher.bonus}
                              onChange={(e) => handleBonusChange(teacher.id, Number(e.target.value))}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                              min="0"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={teacher.deductions}
                              onChange={(e) => handleDeductionsChange(teacher.id, Number(e.target.value))}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                              min="0"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-purple-900">
                            ${teacher.salary.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          {selectedTeachers.length > 0 && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-purple-700 font-medium">Total Salary Payout</div>
                  <div className="text-xs text-purple-600 mt-1">
                    {selectedTeachers.length} teacher(s) selected
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-900">
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
            type="submit"
            disabled={loading || selectedTeachers.length === 0 || calculating}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Generate Salaries
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateMonthlySalaryModal;