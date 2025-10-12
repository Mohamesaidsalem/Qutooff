import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, User, Award, TrendingUp, Download, Filter, Search } from 'lucide-react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../../../firebase/config';

interface TestReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TestReport {
  id: string;
  studentId: string;
  studentName: string;
  testName: string;
  subject: string;
  date: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  teacherName: string;
  feedback: string;
}

const TestReportsModal: React.FC<TestReportsModalProps> = ({ isOpen, onClose }) => {
  const [reports, setReports] = useState<TestReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<TestReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<TestReport | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    const reportsRef = ref(database, 'testReports');

    const unsubscribe = onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const reportsList: TestReport[] = Object.entries(data).map(([id, report]: [string, any]) => {
          const percentage = (report.score / report.maxScore) * 100;
          return {
            id,
            studentId: report.studentId || '',
            studentName: report.studentName || 'Unknown',
            testName: report.testName || 'Untitled Test',
            subject: report.subject || 'General',
            date: report.date || new Date().toISOString().split('T')[0],
            score: report.score || 0,
            maxScore: report.maxScore || 100,
            percentage,
            grade: getGrade(percentage),
            teacherName: report.teacherName || 'Unknown',
            feedback: report.feedback || '',
          };
        });
        setReports(reportsList);
        setFilteredReports(reportsList);
      } else {
        setReports([]);
        setFilteredReports([]);
      }
      setLoading(false);
    });

    return () => {
      off(reportsRef);
    };
  }, [isOpen]);

  useEffect(() => {
    let filtered = reports;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.testName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by subject
    if (subjectFilter !== 'all') {
      filtered = filtered.filter((report) => report.subject === subjectFilter);
    }

    // Filter by grade
    if (gradeFilter !== 'all') {
      filtered = filtered.filter((report) => report.grade === gradeFilter);
    }

    setFilteredReports(filtered);
  }, [searchTerm, subjectFilter, gradeFilter, reports]);

  const getGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'B+';
    if (percentage >= 75) return 'B';
    if (percentage >= 70) return 'C+';
    if (percentage >= 65) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const getGradeColor = (grade: string): string => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
    if (grade.startsWith('D')) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getPercentageColor = (percentage: number): string => {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const subjects = Array.from(new Set(reports.map((r) => r.subject)));
  const grades = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];

  const calculateStats = () => {
    if (filteredReports.length === 0) {
      return { average: 0, highest: 0, lowest: 0, passRate: 0 };
    }

    const percentages = filteredReports.map((r) => r.percentage);
    const average = percentages.reduce((a, b) => a + b, 0) / percentages.length;
    const highest = Math.max(...percentages);
    const lowest = Math.min(...percentages);
    const passRate = (filteredReports.filter((r) => r.percentage >= 60).length / filteredReports.length) * 100;

    return { average, highest, lowest, passRate };
  };

  const stats = calculateStats();

  const handleDownloadReport = (report: TestReport) => {
    console.log('Downloading report:', report.id);
    alert(`Downloading report for ${report.studentName}...`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">Test Reports</h2>
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
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search student or test name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

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

            {/* Grade Filter */}
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Grades</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  Grade {grade}
                </option>
              ))}
            </select>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Average Score
              </div>
              <div className="text-2xl font-bold text-blue-900 mt-2">{stats.average.toFixed(1)}%</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Highest Score
              </div>
              <div className="text-2xl font-bold text-green-900 mt-2">{stats.highest.toFixed(1)}%</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="text-sm text-orange-600 font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Lowest Score
              </div>
              <div className="text-2xl font-bold text-orange-900 mt-2">{stats.lowest.toFixed(1)}%</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-600 font-medium flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Pass Rate
              </div>
              <div className="text-2xl font-bold text-purple-900 mt-2">{stats.passRate.toFixed(1)}%</div>
            </div>
          </div>

          {/* Reports Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading test reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No test reports found</p>
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
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Score
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Grade
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Teacher
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="font-medium">{report.studentName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{report.testName}</td>
                      <td className="px-4 py-4 text-sm">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                          {report.subject}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {report.date}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="font-semibold text-gray-900">
                          {report.score}/{report.maxScore}
                        </div>
                        <div className={`text-xs font-medium ${getPercentageColor(report.percentage)}`}>
                          {report.percentage.toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(
                            report.grade
                          )}`}
                        >
                          {report.grade}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{report.teacherName}</td>
                      <td className="px-4 py-4 text-sm">
                        <button
                          onClick={() => handleDownloadReport(report)}
                          className="text-indigo-600 hover:text-indigo-800 transition-colors"
                          title="Download Report"
                        >
                          <Download className="h-5 w-5" />
                        </button>
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
            Showing {filteredReports.length} of {reports.length} reports
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

export default TestReportsModal;