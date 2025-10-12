// src/types.ts

export interface ClassSession {
  id: string;
  studentId: string;
  teacherId: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  zoomLink: string;
  notes?: string;
  rating?: number;
  feedback?: string;
  attendance?: boolean;
  homework?: string;
  nextTopics?: string[];
}

export interface Teacher {
  id: string;
  email: string;
  name: string;
  level: string;
}

export interface Student {
  id: string;
  email: string;
  name: string;
  level: string;
  age: number;
  progress: number;
  teacher: string;
}