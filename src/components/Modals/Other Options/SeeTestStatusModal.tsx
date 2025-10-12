import React, { useState, useEffect } from 'react';
import { X, ClipboardCheck, User, Calendar, Award, Clock, Filter, Search, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { ref, onValue, off, update } from 'firebase/database';
import { database } from '../../../firebase/config';

interface SeeTestStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TestStatus {
  id: string;
  studentId: string;
  studentName: string;
  testName: string;
  subject: string;
  scheduledDate: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'graded' | 'cancelled';
  teacherName: string;
  duration: number; // in minutes
  score?: number;
  maxScore?: number;
  grade?: string;
  submittedAt?: string;
  gradedAt?: string;
  feedback?: string;
}

const SeeTestStatusModal: React.FC<SeeTestStatusModalProps> = ({ isOpen, onClose }) => {
  const [tests, setTests] = useState<TestStatus[]>([]);
  const [filteredTests, setFilteredTests] = useState<TestStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    const testsRef = ref(database, 'testStatus');

    const unsubscribe = onValue(testsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const testsList: TestStatus[] = Object.entries(data).map(([id, test]: [string, any]) => ({
          id,
          ...test,
        }));
        // Sort by date (newest first)
        testsList.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
        setTests(testsList);
        setFilteredTests(testsList);
      } else {
        setTests([]);
        setFilteredTests([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error loading test status:', error);
      setLoading(false);
    });

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      off(testsRef);
      clearTimeout(timeout);
    };
  }, [isOpen]);

  useEffect(() => {
    let filtered = tests;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (test) =>
          test.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((test) => test.status === statusFilter);
    }

    // Filter by subject
    if (subjectFilter !== 'all') {
      filtered = filtered.filter((test) => test.subject === subjectFilter);
    }

    setFilteredTests(filtered);
  }, [searchTerm, statusFilter, subjectFilter, tests]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'graded': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <TrendingUp className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'graded': return <Award className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <ClipboardCheck className="h-4 w-4" />;
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade?.startsWith('A')) return 'text-green-600';
    if (grade?.startsWith('B')) return 'text-blue-600';
    if (grade?.startsWith('C')) return 'text-yellow-600';
    if (grade?.startsWith('D')) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleUpdateStatus = async (testId: string, newStatus: TestStatus['status']) => {
    try {
      const testRef = ref(database, `testStatus/${testId}`);
      const updates: any = {
        status: newStatus,
      };

      if (newStatus === 'in_progress') {
        updates.startedAt = new Date().toISOString();
      } else if (newStatus === 'completed') {
        updates.submittedAt = new Date().toISOString();
      }

      await update(testRef, updates);
      alert(`Test status updated to ${newStatus}!`);
    } catch (error) {
      console.error('Error updating test status:', error);
      alert('Failed to update test status. Please try again.');
    }
  };

  const calculateStats = () => {
    return {
      total: tests.length,
      scheduled: tests.filter((t) => t.status === 'scheduled').length,
      inProgress: tests.filter((t) => t.status === 'in_progress').length,
      completed: tests.filter((t) => t.status === 'completed').length,
      graded: tests.filter((t) => t.status === 'graded').length,
    };
  };

  const subjects = Array.from(new Set(tests.map((t) => t.subject)));
  const stats = calculateStats();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <ClipboardCheck className="h-6 w-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">See Test Status</h2>
              <p className="text-indigo-100 text-sm">Monitor all scheduled and ongoing tests</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-indigo-800 rounded-full p-1 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 font-medium">Total Tests</div>
              <div className="text-2xl font-bold text-blue-900 mt-2">{stats.total}</div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <div className="text-sm text-indigo-600 font-medium">Scheduled</div>
              <div className="text-2xl font-bold text-indigo-900 mt-2">{stats.scheduled}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-sm text-yellow-600 font-medium">In Progress</div>
              <div className="text-2xl font-bold text-yellow-900 mt-2">{stats.inProgress}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-600 font-medium">Completed</div>
              <div className="text-2xl font-bold text-purple-900 mt-2">{stats.completed}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium">Graded</div>
              <div className="text-2xl font-bold text-green-900 mt-2">{stats.graded}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search student, test, or teacher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="graded">Graded</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Subject Filter */}
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {/* Tests List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading tests...</p>
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <ClipboardCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No tests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Test Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Subject
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Scheduled Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Score
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTests.map((test) => (
                    <tr key={test.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="font-medium text-gray-900">{test.studentName}</div>
                            <div className="text-xs text-gray-500">Teacher: {test.teacherName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{test.testName}</td>
                      <td className="px-4 py-4 text-sm">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                          {test.subject}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {new Date(test.scheduledDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          {test.duration} min
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center w-fit ${getStatusColor(
                            test.status
                          )}`}
                        >
                          {getStatusIcon(test.status)}
                          <span className="ml-1">{test.status.replace('_', ' ').toUpperCase()}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {test.score !== undefined && test.maxScore !== undefined ? (
                          <div>
                            <div className="font-semibold text-gray-900">
                              {test.score}/{test.maxScore}
                            </div>
                            {test.grade && (
                              <div className={`text-xs font-bold ${getGradeColor(test.grade)}`}>
                                Grade: {test.grade}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Not graded</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex items-center space-x-2">
                          {test.status === 'scheduled' && (
                            <button
                              onClick={() => handleUpdateStatus(test.id, 'in_progress')}
                              className="text-yellow-600 hover:text-yellow-800 text-xs font-medium"
                              title="Start Test"
                            >
                              Start
                            </button>
                          )}
                          {test.status === 'in_progress' && (
                            <button
                              onClick={() => handleUpdateStatus(test.id, 'completed')}
                              className="text-purple-600 hover:text-purple-800 text-xs font-medium"
                              title="Mark as Completed"
                            >
                              Complete
                            </button>
                          )}
                          {test.status === 'completed' && (
                            <span className="text-green-600 text-xs font-medium">
                              ✓ Done
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
          <div className="text-sm text-gray-600">
            Showing {filteredTests.length} of {tests.length} tests
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeeTestStatusModal;