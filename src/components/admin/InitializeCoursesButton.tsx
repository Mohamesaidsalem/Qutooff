// ✅ InitializeCoursesButton.tsx
// ضعه في: src/components/admin/InitializeCoursesButton.tsx

import React, { useState } from 'react';
import { BookOpen, Loader } from 'lucide-react';
import { ref, set, push, get } from 'firebase/database';
import { database } from '../../firebase/config';

export default function InitializeCoursesButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const initializeCourses = async () => {
    setLoading(true);
    setMessage('');

    try {
      // ✅ Get all teachers first
      const teachersRef = ref(database, 'teachers');
      const teachersSnapshot = await get(teachersRef);
      
      if (!teachersSnapshot.exists()) {
        setMessage('❌ No teachers found! Please add teachers first.');
        setLoading(false);
        return;
      }

      const teachers = teachersSnapshot.val();
      const teachersArray = Object.keys(teachers).map(key => ({
        id: key,
        ...teachers[key]
      }));

      if (teachersArray.length === 0) {
        setMessage('❌ No teachers available!');
        setLoading(false);
        return;
      }

      // ✅ Sample courses with real teacher IDs
      const sampleCourses = [
        {
          title: "Quran Memorization - Beginner",
          description: "Complete Quran memorization course for beginners starting from Juz Amma",
          level: "Beginner",
          price: 100,
          duration: 12,
          maxStudents: 10,
          currentStudents: 0,
          status: "active",
          startDate: "2025-11-01",
          endDate: "2026-01-31",
          schedule: "Mon/Wed/Fri 4:00 PM",
          teacherId: teachersArray[0].id,
          teacherName: teachersArray[0].name,
          createdAt: new Date().toISOString()
        },
        {
          title: "Tajweed Mastery Course",
          description: "Advanced Tajweed rules and application with practical exercises",
          level: "Intermediate",
          price: 150,
          duration: 16,
          maxStudents: 8,
          currentStudents: 0,
          status: "active",
          startDate: "2025-11-15",
          endDate: "2026-03-15",
          schedule: "Tue/Thu 3:00 PM",
          teacherId: teachersArray[1]?.id || teachersArray[0].id,
          teacherName: teachersArray[1]?.name || teachersArray[0].name,
          createdAt: new Date().toISOString()
        },
        {
          title: "Quran Reading with Correct Pronunciation",
          description: "Learn to read Quran with proper Makharij and Tajweed rules",
          level: "Elementary",
          price: 120,
          duration: 10,
          maxStudents: 12,
          currentStudents: 0,
          status: "active",
          startDate: "2025-12-01",
          endDate: "2026-02-28",
          schedule: "Sat/Sun 5:00 PM",
          teacherId: teachersArray[2]?.id || teachersArray[0].id,
          teacherName: teachersArray[2]?.name || teachersArray[0].name,
          createdAt: new Date().toISOString()
        },
        {
          title: "Quran Translation and Tafseer",
          description: "Understanding Quran meanings and interpretations in depth",
          level: "Advanced",
          price: 180,
          duration: 20,
          maxStudents: 6,
          currentStudents: 0,
          status: "active",
          startDate: "2025-11-20",
          endDate: "2026-04-20",
          schedule: "Mon/Wed 6:00 PM",
          teacherId: teachersArray[3]?.id || teachersArray[0].id,
          teacherName: teachersArray[3]?.name || teachersArray[0].name,
          createdAt: new Date().toISOString()
        },
        {
          title: "Islamic Studies for Kids",
          description: "Basic Islamic knowledge and stories for children",
          level: "Beginner",
          price: 80,
          duration: 8,
          maxStudents: 15,
          currentStudents: 0,
          status: "active",
          startDate: "2025-12-05",
          endDate: "2026-01-30",
          schedule: "Fri/Sat 2:00 PM",
          teacherId: teachersArray[4]?.id || teachersArray[0].id,
          teacherName: teachersArray[4]?.name || teachersArray[0].name,
          createdAt: new Date().toISOString()
        },
        {
          title: "Hifz Program - Full Quran",
          description: "Complete Quran memorization program with regular revision",
          level: "Advanced",
          price: 250,
          duration: 52,
          maxStudents: 5,
          currentStudents: 0,
          status: "active",
          startDate: "2025-11-10",
          endDate: "2026-11-10",
          schedule: "Daily 4:00 PM",
          teacherId: teachersArray[0].id,
          teacherName: teachersArray[0].name,
          createdAt: new Date().toISOString()
        }
      ];

      const coursesRef = ref(database, 'courses');
      
      // ✅ Add each course
      let successCount = 0;
      for (const course of sampleCourses) {
        const newCourseRef = push(coursesRef);
        await set(newCourseRef, course);
        successCount++;
      }

      setMessage(`✅ Successfully created ${successCount} courses!`);
      console.log('✅ Courses initialized successfully!');
      
    } catch (error: any) {
      console.error('❌ Error initializing courses:', error);
      setMessage(`❌ Error: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-3 mb-4">
        <BookOpen className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Initialize Sample Courses</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        This will create 6 sample courses in Firebase with real teacher assignments.
      </p>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <button
        onClick={initializeCourses}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            Initializing...
          </>
        ) : (
          <>
            <BookOpen className="h-5 w-5" />
            Initialize Courses
          </>
        )}
      </button>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>Note:</strong> This will create courses with real teacher IDs from your database.
        </p>
      </div>
    </div>
  );
}