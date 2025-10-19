import { useState, useMemo, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, BookOpen, Calendar, Download, Filter, AlertCircle } from 'lucide-react';

// Import necessary context hooks and types
import { useAuth } from '../../contexts/AuthContext'; 
import { useData, Class, Child, Teacher } from '../../contexts/DataContext';

// Define the structure for overall class statistics
interface ClassStats {
  totalStudents: number;
  averageAttendance: number;
  averageGrade: number;
  assignmentCompletionRate: number;
}

// Student performance interface (inherits from Child but adds metrics)
interface StudentPerformance extends Child {
  attendancePercentage: number;
  averagePerformance: number;
  totalCompletedClasses: number;
  totalScheduledClasses: number;
}

interface EvaluationScores {
  performance: number;
  tajweed: number;
  attendanceStatus: string;
}

// Helper function to extract scores from the notes string
const parseEvaluationFromNotes = (notes: string | undefined): EvaluationScores | null => {
  if (!notes || !notes.includes('Evaluation Summary:')) return null;

  // Expected format: Evaluation Summary: Performance=X/5, Tajweed=Y/5, Attendance=Z. ...
  const summary = notes.split('Evaluation Summary:')[1];
  const performanceMatch = summary.match(/Performance=(\d+)\/5/);
  const tajweedMatch = summary.match(/Tajweed=(\d+)\/5/);
  const attendanceMatch = summary.match(/Attendance=([a-z-]+)\./i);

  if (performanceMatch && tajweedMatch && attendanceMatch) {
    return {
      performance: parseInt(performanceMatch[1]),
      tajweed: parseInt(tajweedMatch[1]),
      attendanceStatus: attendanceMatch[1].toLowerCase(),
    };
  }
  return null;
};

// Map student data with aggregated stats
type StudentStatsMap = Record<string, {
  student: Child;
  attended: number;
  missed: number;
  totalScheduled: number;
  performanceSum: number;
  evaluationCount: number;
}>;


export default function TeacherReportsAnalytics() {
  const { user } = useAuth();
  const { loading: dataLoading, getClassesByTeacher, getStudentsByTeacher } = useData();

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'semester'>('month');
  const [selectedClass, setSelectedClass] = useState<string>('all'); 

  // --- Core Data Calculation Logic ---
  const { 
    classStats, 
    topPerformers, 
    needsAttention 
  } = useMemo(() => {
    // Return empty state if loading or no teacher user
    if (dataLoading || !user || user.role !== 'teacher') {
      return {
        classStats: { totalStudents: 0, averageAttendance: 0, averageGrade: 0, assignmentCompletionRate: 0 } as ClassStats,
        topPerformers: [],
        needsAttention: [],
      };
    }

    const teacherId = user.id;
    const allClasses = getClassesByTeacher(teacherId);
    const teacherStudents = getStudentsByTeacher(teacherId);

    // [REPORTS DEBUG] 1. Initial Data Check
    console.log('[REPORTS DEBUG] 1. Raw Data: Students Count:', teacherStudents.length, '| Classes Count:', allClasses.length);
    if (teacherStudents.length === 0 || allClasses.length === 0) {
        console.warn('[REPORTS DEBUG] Aborting calculation: No students or classes found for this teacher.');
        return {
             classStats: { totalStudents: teacherStudents.length, averageAttendance: 0, averageGrade: 0, assignmentCompletionRate: 0 },
             topPerformers: [],
             needsAttention: [],
        };
    }
    
    // --- 1. Date Filtering Logic (Kept permissive for testing) ---
    let filterDate = new Date(0); 
    if (selectedPeriod === 'week') filterDate.setDate(filterDate.getDate() - 7);
    else if (selectedPeriod === 'month') filterDate.setMonth(filterDate.getMonth() - 1);
    else if (selectedPeriod === 'semester') filterDate.setMonth(filterDate.getMonth() - 6);

    const relevantClasses = allClasses.filter(cls => {
      const classDate = new Date(cls.date);
      // Filter by date and status (only completed classes have evaluation data)
      return cls.status === 'completed' && !isNaN(classDate.getTime()) && classDate >= filterDate;
    });

    console.log(`[REPORTS DEBUG] 2. Filtered for ${selectedPeriod}: Completed Classes Count: ${relevantClasses.length}`);


    // --- 2. Aggregate data per student ---
    const studentStats: StudentStatsMap = teacherStudents.reduce((acc, student) => {
      acc[student.id] = { 
        student, 
        attended: 0, 
        missed: 0, 
        totalScheduled: 0,
        performanceSum: 0, 
        evaluationCount: 0 
      };
      return acc;
    }, {} as StudentStatsMap);

    let totalAttendance = 0;
    let totalScheduledClasses = 0;
    let totalPerformanceScore = 0;
    let totalEvaluations = 0;
    let missingEvaluations = 0;
    
    relevantClasses.forEach(cls => {
      const stats = studentStats[cls.studentId];
      if (!stats) return;

      stats.totalScheduled += 1;
      totalScheduledClasses += 1;

      const evaluation = parseEvaluationFromNotes(cls.notes);
      
      if (evaluation) {
        // Attendance
        if (evaluation.attendanceStatus === 'present' || evaluation.attendanceStatus === 'late') {
          stats.attended += 1;
          totalAttendance += 1;
        } else if (evaluation.attendanceStatus === 'absent') {
          stats.missed += 1;
        }
        
        // Performance/Grade
        stats.performanceSum += evaluation.performance;
        stats.evaluationCount += 1;
        totalPerformanceScore += evaluation.performance;
        totalEvaluations += 1;
      } else {
        missingEvaluations += 1;
        // IMPORTANT DEBUG: Log the class ID and notes of missing evaluation
        console.warn(`[REPORTS DEBUG] 3. Failed to Parse Evaluation: Class ID ${cls.id} for Student ${stats.student.name}. Notes: "${cls.notes}"`);
      }
    });

    console.log(`[REPORTS DEBUG] 4. Evaluation Metrics: Total Evaluated: ${totalEvaluations} | Missing/Malformed: ${missingEvaluations}`);


    // --- 3. Calculate Final Student Metrics ---
    const studentMetrics: StudentPerformance[] = Object.values(studentStats)
      .filter(s => s.totalScheduled > 0)
      .map(s => {
        const attendancePercentage = (s.attended / s.totalScheduled) * 100 || 0;
        const averagePerformance = s.evaluationCount > 0 
            ? (s.performanceSum / s.evaluationCount) * 20 
            : 0; // Scale 1-5 to 20-100
        
        return {
          ...(s.student),
          attendancePercentage: Math.round(attendancePercentage),
          averagePerformance: Math.round(averagePerformance),
          totalCompletedClasses: s.evaluationCount, 
          totalScheduledClasses: s.totalScheduled, 
        } as StudentPerformance;
      });

    // --- 4. Calculate Overall Class Stats ---
    const finalClassStats: ClassStats = {
      totalStudents: teacherStudents.length,
      averageAttendance: totalScheduledClasses > 0 
        ? Math.round((totalAttendance / totalScheduledClasses) * 100) 
        : 0,
      averageGrade: totalEvaluations > 0 
        ? Math.round((totalPerformanceScore / totalEvaluations) * 20)
        : 0,
      assignmentCompletionRate: totalEvaluations > 0 ? 100 : 0, 
    };

    console.log('[REPORTS DEBUG] 5. Final Calculated Stats:', finalClassStats);


    // --- 5. Determine Top Performers and Needs Attention ---
    // Sort students by performance (grade then attendance)
    studentMetrics.sort((a, b) => {
        if (b.averagePerformance !== a.averagePerformance) {
            return b.averagePerformance - a.averagePerformance;
        }
        return b.attendancePercentage - a.attendancePercentage;
    });

    // We only consider students who have completed at least 1 class for reporting
    const MIN_CLASSES_FOR_REPORT = 1; 
    
    const trackedStudents = studentMetrics.filter(s => s.totalCompletedClasses >= MIN_CLASSES_FOR_REPORT);
    
    // Top performers: highest average grade AND decent attendance (>= 85%)
    const finalTopPerformers = trackedStudents
        .filter(s => s.averagePerformance >= 90 && s.attendancePercentage >= 85)
        .slice(0, 3);
        
    // Needs Attention: Low grade (< 70%) OR very low attendance (< 75%)
    const finalNeedsAttention = trackedStudents
        .filter(s => s.averagePerformance < 70 || s.attendancePercentage < 75)
        .slice(0, 3);

    console.log(`[REPORTS DEBUG] 6. Top Performers found: ${finalTopPerformers.length}`);
    console.log(`[REPORTS DEBUG] 7. Needs Attention found: ${finalNeedsAttention.length}`);


    return {
      classStats: finalClassStats,
      topPerformers: finalTopPerformers,
      needsAttention: finalNeedsAttention,
    };

  }, [user, dataLoading, getClassesByTeacher, getStudentsByTeacher, selectedPeriod, selectedClass]);
  // --- End of Core Data Calculation Logic ---
  
  const handleExportReport = () => {
    alert('Report export functionality is not yet implemented.');
  };

  // 6. Loading Screen and UI (Kept in English)
  if (dataLoading || !user || user.role !== 'teacher') {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white rounded-xl shadow-lg">
        <div className="text-center p-8">
          <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-700 font-medium">Loading reports data...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <BarChart3 className="text-blue-600" size={40} />
            Reports and Analytics
          </h1>
          <p className="text-slate-600 text-lg">Comprehensive analysis of student performance and attendance</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-slate-200">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <Filter className="text-slate-500" size={20} />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'semester')}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="semester">This Semester</option>
              </select>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Classes</option>
                <option value="class1">Class 1</option>
                <option value="class2">Class 2</option>
                <option value="class3">Class 3</option>
              </select>
            </div>

            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <Download size={18} />
              Export Report
            </button>
          </div>
        </div>

        {/* Warning if no data is available for the period */}
        {(classStats.totalStudents === 0 || classStats.averageAttendance === 0) && (
          <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-700 p-4 mb-6 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">
              No student or evaluated class data found for the selected period.
            </p>
          </div>
        )}

        {/* Stats Cards (Data will now reflect 0% if no data is found) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Students */}
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <h3 className="text-slate-600 text-sm mb-1">Total Students</h3>
            <p className="text-3xl font-bold text-slate-800">{classStats.totalStudents}</p>
          </div>

          {/* Average Attendance */}
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="text-green-600" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <h3 className="text-slate-600 text-sm mb-1">Average Attendance</h3>
            <p className="text-3xl font-bold text-slate-800">{classStats.averageAttendance}%</p>
          </div>

          {/* Average Grade */}
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-amber-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <BarChart3 className="text-amber-600" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <h3 className="text-slate-600 text-sm mb-1">Average Grade</h3>
            <p className="text-3xl font-bold text-slate-800">{classStats.averageGrade}%</p>
          </div>

          {/* Assignment Completion */}
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-purple-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BookOpen className="text-purple-600" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <h3 className="text-slate-600 text-sm mb-1">Assignment Completion</h3>
            <p className="text-3xl font-bold text-slate-800">{classStats.assignmentCompletionRate}%</p>
          </div>
        </div>

        {/* Performance Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Performers */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp className="text-green-600" size={28} />
              Top Performers
            </h2>
            <div className="space-y-4">
              {topPerformers.length === 0 ? (
                <p className="text-slate-500 text-center py-4">
                    No top performers found based on criteria (Grade ≥ 90%, Attendance ≥ 85%).
                </p>
              ) : (
                topPerformers.map((student, index) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-transparent rounded-lg border border-green-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-green-600 text-white font-bold rounded-full">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">{student.name}</h3>
                      <div className="flex gap-4 mt-2 text-sm text-slate-600">
                        <span>Attendance: {student.attendancePercentage}%</span>
                        <span>Grade: {student.averagePerformance}%</span>
                        <span>Classes: {student.totalCompletedClasses}/{student.totalScheduledClasses}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Needs Attention */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Users className="text-amber-600" size={28} />
              Needs Attention
            </h2>
            <div className="space-y-4">
              {needsAttention.length === 0 ? (
                 <p className="text-slate-500 text-center py-4">
                     All tracked students are performing well!
                 </p>
              ) : (
                needsAttention.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-transparent rounded-lg border border-amber-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-amber-500 text-white font-bold rounded-full">
                      !
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">{student.name}</h3>
                      <div className="flex gap-4 mt-2 text-sm text-slate-600">
                        <span>Attendance: {student.attendancePercentage}%</span>
                        <span>Grade: {student.averagePerformance}%</span>
                        <span>Classes: {student.totalCompletedClasses}/{student.totalScheduledClasses}</span>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors">
                      Take Action
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}