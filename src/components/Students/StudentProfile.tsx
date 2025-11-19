import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Globe, Calendar,
  Edit, ArrowLeft, GraduationCap, BookOpen,
  Clock, TrendingUp, AlertCircle, CheckCircle,
  XCircle, Coffee, Award, BarChart, FileText,
  Video, MessageSquare
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue, off, update } from 'firebase/database';
import { database } from '../../firebase/config';

// Modals
import EditStudentDetailsModal from '../Students/EditStudentDetailsModal';
import ManageStudentStatusModal from '../Students/ManageStudentStatusModal';

interface Student {
  id: string;
  name: string;
  age: number | string;
  email: string;
  phone?: string;
  level?: string;
  progress?: number;
  teacherId?: string;
  teacherName?: string;
  courseId?: string;
  courseName?: string;
  status: 'active' | 'suspended' | 'leave' | 'break' | 'on-hold' | 'inactive';
  timezone?: string;
  parentId?: string;
  parentName?: string;
  parentEmail?: string;
  nextClass?: string;
  totalClasses?: number;
  completedClasses?: number;
  attendanceRate?: number;
  createdAt: string;
  studentImage?: string;

  // الحقول المطلوبة في EditStudentDetailsModal
  skypeId?: string;
  gender?: string;
  language?: string;
  data?: string;
  numberOfDays?: string;
  regularCourse?: string;
  teacher?: string;
  additionalCourse?: string;
  remarksForParent?: string;
  remarksForTeacher?: string;
}

interface Class {
  id: string;
  studentId: string;
  teacherId: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'absent';
  notes?: string;
}

interface Report {
  id: string;
  studentId: string;
  teacherId: string;
  date: string;
  progress: number;
  strengths: string[];
  improvements: string[];
  nextGoals: string[];
  teacherNotes: string;
}

export default function StudentProfile() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'reports'>('overview');

  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Load Student Data
  useEffect(() => {
    if (!studentId) return;

    const studentRef = ref(database, `children/${studentId}`);
    const unsubscribe = onValue(studentRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setStudent({
          id: studentId,
          name: data.name || '',
          age: data.age || 0,
          email: data.email || '',
          phone: data.phone,
          level: data.level,
          progress: data.progress,
          teacherId: data.teacherId,
          teacherName: data.teacherName,
          courseId: data.courseId,
          courseName: data.courseName,
          status: data.status || 'active',
          timezone: data.timezone,
          parentId: data.parentId,
          parentName: data.parentName,
          parentEmail: data.parentEmail,
          nextClass: data.nextClass,
          totalClasses: data.totalClasses,
          completedClasses: data.completedClasses,
          attendanceRate: data.attendanceRate,
          createdAt: data.createdAt || new Date().toISOString(),
          studentImage: data.studentImage,

          // الحقول المطلوبة في المودال
          skypeId: data.skypeId || '',
          gender: data.gender || 'Male',
          language: data.language || 'English',
          data: data.data || (data.createdAt ? data.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
          numberOfDays: data.numberOfDays || '2',
          regularCourse: data.regularCourse || data.courseName || '',
          teacher: data.teacher || data.teacherName || '',
          additionalCourse: data.additionalCourse || '',
          remarksForParent: data.remarksForParent || '',
          remarksForTeacher: data.remarksForTeacher || '',
        });
      }
      setLoading(false);
    });

    return () => off(studentRef, 'value', unsubscribe);
  }, [studentId]);

  // Load Classes History
  useEffect(() => {
    if (!studentId) return;

    const classesRef = ref(database, 'daily_classes');
    const unsubscribe = onValue(classesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const allClasses = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter((cls: any) => cls.studentId === studentId)
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setClasses(allClasses);
      }
    });

    return () => off(classesRef, 'value', unsubscribe);
  }, [studentId]);

  // Load Reports
  useEffect(() => {
    if (!studentId) return;

    const reportsRef = ref(database, 'student_reports');
    const unsubscribe = onValue(reportsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const allReports = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter((report: any) => report.studentId === studentId)
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setReports(allReports);
      }
    });

    return () => off(reportsRef, 'value', unsubscribe);
  }, [studentId]);

  const handleStatusChange = async (newStatus: Student['status']) => {
    if (!studentId) return;

    try {
      const studentRef = ref(database, `children/${studentId}`);
      await update(studentRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      setStudent(prev => prev ? { ...prev, status: newStatus } : null);
      alert(`✅ Status changed to ${newStatus}!`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'suspended': return 'bg-red-500';
      case 'leave': return 'bg-blue-500';
      case 'break': return 'bg-yellow-500';
      case 'on-hold': return 'bg-purple-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-5 w-5" />;
      case 'suspended': return <XCircle className="h-5 w-5" />;
      case 'leave': return <Coffee className="h-5 w-5" />;
      case 'break': return <Clock className="h-5 w-5" />;
      default: return <AlertCircle className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Student Not Found</h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const completedClasses = classes.filter(c => c.status === 'completed').length;
  const attendanceRate = classes.length > 0
    ? Math.round((completedClasses / classes.length) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back</span>
      </button>

      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-lg border p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <img
              src={student.studentImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random&size=128`}
              alt={student.name}
              className="h-32 w-32 rounded-lg object-cover border-4 border-blue-200"
            />

            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                  ID: {student.id.slice(-6)}
                </span>
              </div>

              <p className="text-gray-600 mb-3">
                Parent: <span className="font-semibold text-gray-900">{student.parentName || 'N/A'}</span>
              </p>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className={`px-4 py-2 rounded-lg text-white font-semibold text-sm flex items-center gap-2 ${getStatusColor(student.status)}`}>
                  {getStatusIcon(student.status)}
                  {student.status?.toUpperCase() || 'UNKNOWN'}
                </span>

                <button
                  onClick={() => setShowStatusModal(true)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm font-semibold"
                >
                  Change Status
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowEditModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Current Level</p>
                <p className="text-lg font-bold text-gray-900">{student.level || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-lg font-bold text-gray-900">{student.progress || 0}%</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <Video className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Classes</p>
                <p className="text-lg font-bold text-gray-900">{classes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center gap-3">
              <BarChart className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Attendance</p>
                <p className="text-lg font-bold text-gray-900">{attendanceRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Info Grid */}
        <div className="bg-gray-50 rounded-lg p-5 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Student Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Age</p>
                <p className="font-semibold text-gray-900">{student.age} years</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-semibold text-gray-900">{student.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-semibold text-gray-900">{student.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Teacher</p>
                <p className="font-semibold text-gray-900">{student.teacherName || 'Not Assigned'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Course</p>
                <p className="font-semibold text-gray-900">{student.courseName || 'Not Assigned'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Timezone</p>
                <p className="font-semibold text-gray-900">{student.timezone || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Next Class</p>
                <p className="font-semibold text-gray-900">{student.nextClass || 'Not Scheduled'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Joined</p>
                <p className="font-semibold text-gray-900">
                  {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-semibold border-b-2 ${activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600'
                }`}
            >
              📊 Overview
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-4 text-sm font-semibold border-b-2 ${activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600'
                }`}
            >
              📅 Class History ({classes.length})
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-4 text-sm font-semibold border-b-2 ${activeTab === 'reports'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600'
                }`}
            >
              📈 Reports ({reports.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Progress Chart */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Learning Progress
                  </h3>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                          Progress
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-blue-600">
                          {student.progress || 0}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-blue-200">
                      <div
                        style={{ width: `${student.progress || 0}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Keep up the great work! You're making excellent progress.
                  </p>
                </div>

                {/* Attendance */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Attendance Rate
                  </h3>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-green-600 mb-2">
                        {attendanceRate}%
                      </div>
                      <p className="text-sm text-gray-600">
                        {completedClasses} of {classes.length} classes attended
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 p-6 rounded-xl border">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  Recent Activity
                </h3>
                {classes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No classes yet</p>
                ) : (
                  <div className="space-y-3">
                    {classes.slice(0, 5).map((cls) => (
                      <div key={cls.id} className="flex items-center justify-between bg-white p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Video className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {new Date(cls.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">{cls.time} - {cls.duration} min</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls.status === 'completed' ? 'bg-green-100 text-green-800' :
                            cls.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              cls.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                          }`}>
                          {cls.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Class History</h3>
              {classes.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No classes found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Time</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Duration</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {classes.map((cls) => (
                        <tr key={cls.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            {new Date(cls.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-gray-700">{cls.time}</td>
                          <td className="px-4 py-3 text-gray-700">{cls.duration} min</td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${cls.status === 'completed' ? 'bg-green-100 text-green-800' :
                                cls.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                  cls.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                              }`}>
                              {cls.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {cls.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Progress Reports</h3>
              {reports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No reports yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="bg-gray-50 p-6 rounded-lg border">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-gray-900">
                            Report - {new Date(report.date).toLocaleDateString()}
                          </h4>
                          <p className="text-sm text-gray-600">Progress: {report.progress}%</p>
                        </div>
                        <Award className="h-8 w-8 text-yellow-500" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <h5 className="font-semibold text-green-700 mb-2">✅ Strengths:</h5>
                          <ul className="list-disc list-inside text-sm text-gray-700">
                            {report.strengths.map((strength, idx) => (
                              <li key={idx}>{strength}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-semibold text-orange-700 mb-2">📈 Areas to Improve:</h5>
                          <ul className="list-disc list-inside text-sm text-gray-700">
                            {report.improvements.map((improvement, idx) => (
                              <li key={idx}>{improvement}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-semibold text-blue-700 mb-2">🎯 Next Goals:</h5>
                          <ul className="list-disc list-inside text-sm text-gray-700">
                            {report.nextGoals.map((goal, idx) => (
                              <li key={idx}>{goal}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded border">
                        <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Teacher Notes:
                        </h5>
                        <p className="text-sm text-gray-700">{report.teacherNotes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showEditModal && student && (
        <EditStudentDetailsModal
          studentData={student}
          onClose={() => setShowEditModal(false)}
          onUpdate={async (id, updatedData) => {
            setStudent(prev => prev ? { ...prev, ...updatedData } : null);
            setShowEditModal(false);
          }}
        />
      )}

      {showStatusModal && student && (
        <ManageStudentStatusModal
          student={student}
          currentStatus={student.status}
          onClose={() => setShowStatusModal(false)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}