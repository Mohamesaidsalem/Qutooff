import React, { useState, useEffect } from 'react';
import { 
  BarChart, TrendingUp, Users, DollarSign, BookOpen, 
  Calendar, Download, Filter, Clock, Award, Target,
  CheckCircle, XCircle, AlertCircle, PieChart, Activity,
  FileText, Printer
} from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase/config';
import { LineChart, Line, BarChart as RechartsBar, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Define Types
interface Child {
  id: string;
  name?: string;
  email?: string;
  isActive?: boolean;
  createdAt?: string;
  teacherId?: string;
  teacherName?: string;
  courseId?: string;
}

interface Teacher {
  id: string;
  name?: string;
  email?: string;
  isActive?: boolean;
  rating?: number;
  subject?: string;
}

interface Class {
  id: string;
  appointmentDate?: string;
  status?: string;
  teacherId?: string;
  teacherName?: string;
  studentId?: string;
  studentName?: string;
}

interface Course {
  id: string;
  name?: string;
}

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  
  // Data States with proper types
  const [children, setChildren] = useState<Child[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [dailyClasses, setDailyClasses] = useState<Class[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const childrenRef = ref(database, 'children');
    const teachersRef = ref(database, 'teachers');
    const classesRef = ref(database, 'classes');
    const dailyClassesRef = ref(database, 'daily_classes');
    const coursesRef = ref(database, 'courses');

    const unsubChildren = onValue(childrenRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const arr: Child[] = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setChildren(arr);
      } else {
        setChildren([]);
      }
    });

    const unsubTeachers = onValue(teachersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const arr: Teacher[] = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setTeachers(arr);
      } else {
        setTeachers([]);
      }
    });

    const unsubClasses = onValue(classesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const arr: Class[] = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setClasses(arr);
      } else {
        setClasses([]);
      }
    });

    const unsubDailyClasses = onValue(dailyClassesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const arr: Class[] = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setDailyClasses(arr);
      } else {
        setDailyClasses([]);
      }
      setLoading(false);
    });

    const unsubCourses = onValue(coursesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const arr: Course[] = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setCourses(arr);
      } else {
        setCourses([]);
      }
    });

    return () => {
      unsubChildren();
      unsubTeachers();
      unsubClasses();
      unsubDailyClasses();
      unsubCourses();
    };
  }, []);

  // Analytics Calculations
  const calculateAnalytics = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Student Analytics
    const activeStudents = children.filter(c => c.isActive !== false).length;
    const totalStudents = children.length;
    const newStudentsThisMonth = children.filter(c => {
      if (!c.createdAt) return false;
      const date = new Date(c.createdAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;

    // Teacher Analytics
    const activeTeachers = teachers.filter(t => t.isActive !== false).length;
    const teacherWorkload = teachers.map(teacher => {
      const teacherClasses = dailyClasses.filter(c => c.teacherId === teacher.id);
      return {
        name: teacher.name || 'Unknown',
        totalClasses: teacherClasses.length,
        completedClasses: teacherClasses.filter(c => c.status === 'taken').length,
        rating: teacher.rating || 4.5
      };
    });

    // Class Analytics
    const totalClasses = dailyClasses.length;
    const completedClasses = dailyClasses.filter(c => c.status === 'taken').length;
    const scheduledClasses = dailyClasses.filter(c => c.status === 'scheduled').length;
    const cancelledClasses = dailyClasses.filter(c => c.status === 'absent').length;
    const completionRate = totalClasses > 0 ? ((completedClasses / totalClasses) * 100).toFixed(1) : '0';

    // Financial Analytics
    const revenuePerStudent = 60;
    const totalRevenue = activeStudents * revenuePerStudent;
    const projectedRevenue = totalStudents * revenuePerStudent;

    // Monthly Trend
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(currentYear, currentMonth - (5 - i), 1);
      const monthClasses = dailyClasses.filter(c => {
        if (!c.appointmentDate) return false;
        const classDate = new Date(c.appointmentDate);
        return classDate.getMonth() === date.getMonth() && classDate.getFullYear() === date.getFullYear();
      });
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        classes: monthClasses.length,
        completed: monthClasses.filter(c => c.status === 'taken').length,
        revenue: monthClasses.filter(c => c.status === 'taken').length * 60
      };
    });

    // Status Distribution
    const statusData = [
      { name: 'Completed', value: completedClasses },
      { name: 'Scheduled', value: scheduledClasses },
      { name: 'Cancelled', value: cancelledClasses },
      { name: 'Running', value: dailyClasses.filter(c => c.status === 'running').length }
    ];

    // Course Performance
    const coursePerformance = courses.map(course => {
      const courseStudents = children.filter(c => c.courseId === course.id);
      return {
        name: course.name || 'Unknown',
        students: courseStudents.length,
        revenue: courseStudents.length * 60
      };
    });

    return {
      students: { active: activeStudents, total: totalStudents, new: newStudentsThisMonth },
      teachers: { active: activeTeachers, total: teachers.length, workload: teacherWorkload },
      classes: { total: totalClasses, completed: completedClasses, scheduled: scheduledClasses, cancelled: cancelledClasses, completionRate },
      financial: { total: totalRevenue, projected: projectedRevenue },
      trends: { monthly: last6Months },
      status: statusData,
      courses: coursePerformance
    };
  };

  const analytics = calculateAnalytics();

  // PDF Generation Function
  const generatePDF = (section: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate PDF');
      return;
    }
    
    const data = analytics;
    
    let content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${section} Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #3b82f6; color: white; }
          .stat-card { display: inline-block; padding: 20px; margin: 10px; background: #f3f4f6; border-radius: 8px; min-width: 200px; }
          .stat-value { font-size: 32px; font-weight: bold; color: #1e40af; }
          .stat-label { color: #6b7280; margin-top: 5px; }
          .header { text-align: center; margin-bottom: 40px; }
          .footer { margin-top: 40px; text-align: center; color: #6b7280; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 ${section} Analytics Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
    `;

    if (section === 'Overview') {
      content += `
        <h2>📈 Key Metrics</h2>
        <div>
          <div class="stat-card">
            <div class="stat-value">${data.students.active}</div>
            <div class="stat-label">Active Students</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.teachers.active}</div>
            <div class="stat-label">Active Teachers</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">$${data.financial.total}</div>
            <div class="stat-label">Monthly Revenue</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.classes.completed}</div>
            <div class="stat-label">Completed Classes</div>
          </div>
        </div>
        
        <h2>📊 Class Status Distribution</h2>
        <table>
          <tr><th>Status</th><th>Count</th><th>Percentage</th></tr>
          ${data.status.map(s => `
            <tr>
              <td>${s.name}</td>
              <td>${s.value}</td>
              <td>${((s.value / data.classes.total) * 100).toFixed(1)}%</td>
            </tr>
          `).join('')}
        </table>
      `;
    } else if (section === 'Students') {
      content += `
        <h2>👥 Student Statistics</h2>
        <div>
          <div class="stat-card">
            <div class="stat-value">${data.students.total}</div>
            <div class="stat-label">Total Students</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.students.active}</div>
            <div class="stat-label">Active Students</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.students.new}</div>
            <div class="stat-label">New This Month</div>
          </div>
        </div>
        
        <h2>📋 Student Details</h2>
        <table>
          <tr><th>Name</th><th>Email</th><th>Status</th><th>Teacher</th></tr>
          ${children.map(student => `
            <tr>
              <td>${student.name || 'N/A'}</td>
              <td>${student.email || 'N/A'}</td>
              <td>${student.isActive !== false ? '✅ Active' : '❌ Inactive'}</td>
              <td>${student.teacherName || 'Not Assigned'}</td>
            </tr>
          `).join('')}
        </table>
      `;
    } else if (section === 'Teachers') {
      content += `
        <h2>👨‍🏫 Teacher Performance</h2>
        <table>
          <tr><th>Teacher</th><th>Total Classes</th><th>Completed</th><th>Completion Rate</th></tr>
          ${data.teachers.workload.map(teacher => `
            <tr>
              <td>${teacher.name}</td>
              <td>${teacher.totalClasses}</td>
              <td>${teacher.completedClasses}</td>
              <td>${teacher.totalClasses > 0 ? ((teacher.completedClasses / teacher.totalClasses) * 100).toFixed(1) : 0}%</td>
            </tr>
          `).join('')}
        </table>
      `;
    } else if (section === 'Financial') {
      content += `
        <h2>💰 Financial Overview</h2>
        <div>
          <div class="stat-card">
            <div class="stat-value">$${data.financial.total}</div>
            <div class="stat-label">Current Revenue</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">$${data.financial.projected}</div>
            <div class="stat-label">Projected Revenue</div>
          </div>
        </div>
        
        <h2>📈 Monthly Revenue Trend</h2>
        <table>
          <tr><th>Month</th><th>Classes</th><th>Revenue</th></tr>
          ${data.trends.monthly.map(month => `
            <tr>
              <td>${month.month}</td>
              <td>${month.completed}</td>
              <td>$${month.revenue}</td>
            </tr>
          `).join('')}
        </table>
      `;
    }

    content += `
        <div class="footer">
          <p>© 2025 Qutooff Education Platform | Generated by Analytics Dashboard</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const sections = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'students', name: 'Students', icon: Users },
    { id: 'teachers', name: 'Teachers', icon: BookOpen },
    { id: 'financial', name: 'Financial', icon: DollarSign },
    { id: 'classes', name: 'Classes', icon: Calendar }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Comprehensive insights and reports</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button 
            onClick={() => generatePDF(activeSection.charAt(0).toUpperCase() + activeSection.slice(1))}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeSection === section.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <section.icon className="h-5 w-5" />
            {section.name}
          </button>
        ))}
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Users className="h-8 w-8" />
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="text-3xl font-bold">{analytics.students.active}</div>
              <div className="text-blue-100 mt-1">Active Students</div>
              <div className="mt-3 text-sm">+{analytics.students.new} new this month</div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <BookOpen className="h-8 w-8" />
                <Award className="h-5 w-5" />
              </div>
              <div className="text-3xl font-bold">{analytics.teachers.active}</div>
              <div className="text-green-100 mt-1">Active Teachers</div>
              <div className="mt-3 text-sm">{analytics.teachers.total} total</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="h-8 w-8" />
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="text-3xl font-bold">${analytics.financial.total}</div>
              <div className="text-purple-100 mt-1">Monthly Revenue</div>
              <div className="mt-3 text-sm">Projected: ${analytics.financial.projected}</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="h-8 w-8" />
                <Target className="h-5 w-5" />
              </div>
              <div className="text-3xl font-bold">{analytics.classes.completionRate}%</div>
              <div className="text-orange-100 mt-1">Completion Rate</div>
              <div className="mt-3 text-sm">{analytics.classes.completed} completed</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.trends.monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="completed" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Completed Classes" />
                  <Area type="monotone" dataKey="classes" stroke="#10b981" fill="#10b981" fillOpacity={0.4} name="Total Classes" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Status Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={analytics.status}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name}: ${((entry.percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.status.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Course Performance */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBar data={analytics.courses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#3b82f6" name="Students" />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue ($)" />
              </RechartsBar>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Students Section */}
      {activeSection === 'students' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.students.total}</p>
                </div>
                <Users className="h-12 w-12 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Students</p>
                  <p className="text-3xl font-bold text-green-600">{analytics.students.active}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">New This Month</p>
                  <p className="text-3xl font-bold text-purple-600">{analytics.students.new}</p>
                </div>
                <TrendingUp className="h-12 w-12 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Student List</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {children.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{student.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.email || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {student.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.teacherName || 'Not Assigned'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Teachers Section */}
      {activeSection === 'teachers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analytics.teachers.workload.map((teacher, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{teacher.name}</h4>
                    <div className="flex items-center mt-1">
                      <Award className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-gray-600">Rating: {teacher.rating}</span>
                    </div>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-500" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Classes</p>
                    <p className="text-2xl font-bold text-gray-900">{teacher.totalClasses}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{teacher.completedClasses}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Completion Rate</span>
                    <span>{teacher.totalClasses > 0 ? ((teacher.completedClasses / teacher.totalClasses) * 100).toFixed(1) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all" 
                      style={{ width: `${teacher.totalClasses > 0 ? (teacher.completedClasses / teacher.totalClasses) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financial Section */}
      {activeSection === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-8 text-white shadow-lg">
              <DollarSign className="h-12 w-12 mb-4" />
              <p className="text-green-100 mb-2">Current Revenue</p>
              <p className="text-4xl font-bold">${analytics.financial.total}</p>
              <p className="mt-4 text-sm text-green-100">From {analytics.students.active} active students</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-8 text-white shadow-lg">
              <Target className="h-12 w-12 mb-4" />
              <p className="text-blue-100 mb-2">Projected Revenue</p>
              <p className="text-4xl font-bold">${analytics.financial.projected}</p>
              <p className="mt-4 text-sm text-blue-100">From {analytics.students.total} total students</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={analytics.trends.monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="Revenue ($)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Classes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analytics.trends.monthly.map((month, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{month.month}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{month.classes}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{month.completed}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">${month.revenue}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-6 py-4 text-sm text-gray-900">Total</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {analytics.trends.monthly.reduce((sum, m) => sum + m.classes, 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {analytics.trends.monthly.reduce((sum, m) => sum + m.completed, 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600">
                      ${analytics.trends.monthly.reduce((sum, m) => sum + m.revenue, 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Classes Section */}
      {activeSection === 'classes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="h-8 w-8 text-blue-500" />
                <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">Total</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{analytics.classes.total}</p>
              <p className="text-sm text-gray-600 mt-1">All Classes</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">Done</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{analytics.classes.completed}</p>
              <p className="text-sm text-gray-600 mt-1">Completed Classes</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-8 w-8 text-yellow-500" />
                <span className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-1 rounded">Pending</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{analytics.classes.scheduled}</p>
              <p className="text-sm text-gray-600 mt-1">Scheduled Classes</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="h-8 w-8 text-red-500" />
                <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded">Missed</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{analytics.classes.cancelled}</p>
              <p className="text-sm text-gray-600 mt-1">Cancelled/Absent</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Class Completion Rate</h3>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">{analytics.classes.completionRate}%</p>
                <p className="text-sm text-gray-600">Success Rate</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all flex items-center justify-end pr-2" 
                style={{ width: `${analytics.classes.completionRate}%` }}
              >
                <span className="text-xs text-white font-semibold">{analytics.classes.completionRate}%</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-bold text-green-600">{analytics.classes.completed}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-xl font-bold text-yellow-600">{analytics.classes.scheduled}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-xl font-bold text-red-600">{analytics.classes.cancelled}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Class Trend</h3>
            <ResponsiveContainer width="100%" height={350}>
              <RechartsBar data={analytics.trends.monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="classes" fill="#3b82f6" name="Total Classes" radius={[8, 8, 0, 0]} />
                <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[8, 8, 0, 0]} />
              </RechartsBar>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Classes</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dailyClasses.slice(0, 10).map((cls) => (
                    <tr key={cls.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{cls.appointmentDate || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{cls.studentName || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{cls.teacherName || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          cls.status === 'taken' ? 'bg-green-100 text-green-800' :
                          cls.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          cls.status === 'running' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {cls.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-xl p-8 text-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-80" />
            <p className="text-3xl font-bold">{analytics.students.active}</p>
            <p className="text-blue-100 text-sm mt-1">Active Students</p>
          </div>
          <div className="text-center">
            <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-80" />
            <p className="text-3xl font-bold">{analytics.teachers.active}</p>
            <p className="text-blue-100 text-sm mt-1">Active Teachers</p>
          </div>
          <div className="text-center">
            <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-80" />
            <p className="text-3xl font-bold">{analytics.classes.completed}</p>
            <p className="text-blue-100 text-sm mt-1">Classes Completed</p>
          </div>
          <div className="text-center">
            <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-80" />
            <p className="text-3xl font-bold">${analytics.financial.total}</p>
            <p className="text-blue-100 text-sm mt-1">Total Revenue</p>
          </div>
        </div>
      </div>
    </div>
  );
}