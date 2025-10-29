// src/types.ts

// ============================================
// CLASS SESSION INTERFACE
// ============================================
export interface ClassSession {
  id: string;
  studentId: string;
  teacherId: string;
  
  // ✅ Date & Time fields (support both formats)
  date: string;
  appointmentDate?: string;
  time: string;
  appointmentTime?: string;
  duration: number;
  
  // ✅ Status with all possible values
  status: 
    | 'scheduled' 
    | 'in-progress' 
    | 'completed' 
    | 'cancelled' 
    | 'absent'
    | 'taken'        
    | 'running'      
    | 'leave'       
    | 'declined'     
    | 'suspended'    
    | 'trial'        
    | 'advance'      
    | 'rescheduled'  
    | 'refused';
  
  // ✅ Class details
  zoomLink: string;
  notes?: string;
  rating?: number;
  feedback?: string;
  attendance?: boolean;
  homework?: string;
  nextTopics?: string[];
  
  // ✅ Course information
  courseId?: string;
  courseName?: string;
  
  // ✅ History & tracking
  history?: string[];
  createdAt?: string;
  updatedAt?: string;
  
  // ✅ Time tracking (5 times)
  adminTime?: string;
  teacherTime?: string;
  studentTime?: string;
  onlineTime?: string;
  completedAt?: string;
  
  // ✅ Action reasons
  rescheduleReason?: string;
  rescheduledBy?: string;
  cancelReason?: string;
  cancelledBy?: string;
  ratedAt?: string;
}

// ✅ Alias for compatibility
export type Class = ClassSession;

// ============================================
// TEACHER INTERFACE
// ============================================
export interface Teacher {
  id: string;
  email: string;
  password?: string;
  name: string;
  level: string;
  specialization?: string;
  phone?: string;
  timezone?: string;
  image?: string;
  status?: 'active' | 'inactive';
  createdAt?: Date;
  subject?: string; // ✅ Add for compatibility
}

// ============================================
// STUDENT INTERFACE
// ============================================
export interface Student {
  id: string;
  email: string;
  password?: string;
  name: string;
  level: string;
  age: number;
  progress: number;
  teacher: string;
  teacherId?: string;
  teacherName?: string;
  parentId?: string;
  phone?: string;
  timezone?: string;
  nextClass?: string;
  createdAt?: Date;
}

// ============================================
// FAMILY INTERFACE
// ============================================
export interface Family {
  id: string;
  name: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentImage?: string;
  password?: string;
  timezone: string;
  address?: string;
  children: string[];
  status: 'active' | 'inactive';
  createdAt: Date;
}

// ============================================
// CHILD INTERFACE
// ============================================
export interface Child {
  id: string;
  name: string;
  age: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  progress: number;
  teacherId: string;
  teacherName: string;
  nextClass: string;
  parentId: string;
  email?: string;
  phone?: string;
  timezone?: string;
  password?: string;
  image?: string;
  createdAt?: Date;
}

// ============================================
// USER INTERFACE
// ============================================
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin' | 'teacher' | 'parent' | 'student';
  image?: string;
  phone?: string;
  timezone?: string;
  createdAt?: Date;
}

// ============================================
// COURSE INTERFACE (إضافة جديدة)
// ============================================
export interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  price: number;
  duration: number;
  teacherId: string;
  teacherName?: string;
  maxStudents: number;
  currentStudents: number;
  enrolledStudents?: string[];
  status: 'active' | 'inactive' | 'completed';
  startDate: string;
  endDate: string;
  schedule: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================
// HELPER TYPES
// ============================================
export type UserRole = 'admin' | 'super_admin' | 'teacher' | 'parent' | 'student';
export type StudentLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type FamilyStatus = 'active' | 'inactive';
export type ClassStatus = 
  | 'scheduled' 
  | 'in-progress' 
  | 'completed' 
  | 'cancelled'
  | 'absent'
  | 'taken'
  | 'running'
  | 'leave'
  | 'declined'
  | 'suspended'
  | 'trial'
  | 'advance'
  | 'rescheduled'
  | 'refused';

// ============================================
// DAILY CLASS INTERFACE (للتوافق مع DailyClassesManagement)
// ============================================
export interface DailyClass extends ClassSession {
  // ✅ كل الحقول موروثة من ClassSession
  // يمكن إضافة حقول إضافية هنا إذا لزم الأمر
  originalTeacherId?: string;
  shiftHistory?: Array<{
    from: string;
    to: string;
    fromName: string;
    toName: string;
    reason: string;
    shiftedAt: string;
    shiftedBy: string;
  }>;
}