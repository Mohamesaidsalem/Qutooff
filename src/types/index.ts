export interface User {
  id: string;
  email: string;
  name: string;
  role: 'parent' | 'teacher' | 'student' | 'admin';
  timezone: string;
  avatar?: string;
  createdAt: string;
}

export interface Class {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  teacherName: string;
  date: string; // UTC date string
  time: string; // UTC time string
  duration: number; // minutes
  maxStudents: number;
  enrolledStudents: string[];
  subject: string;
  level: string;
  meetingLink?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

export interface Course {
  id: string;
  title: string;
  description: string;
  subject: string;
  level: string;
  duration: number; // weeks
  price: number;
  teacherId: string;
  teacherName: string;
  thumbnail?: string;
  enrolledStudents: number;
  maxStudents: number;
  startDate: string;
  endDate: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  parentId: string;
  age: number;
  grade: string;
  enrolledCourses: string[];
  timezone: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'parent' | 'teacher' | 'student';
  timezone?: string;
}