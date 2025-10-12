import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types & Interfaces
export interface Parent {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Child {
  id: string;
  parentId: string;
  name: string;
  age: number;
  level: string;
  progress: number;
  teacherId?: string;
  isActive: boolean;
  studentAccount?: {
    email: string;
    password: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  specialization: string[];
  experience: number;
  rating: number;
  totalHours: number;
  hourlyRate: number;
  availability: {
    [key: string]: string[]; // day: ['09:00', '10:00', ...]
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  childId: string;
  teacherId: string;
  date: string;
  time: string;
  duration: number; // in minutes
  type: 'memorization' | 'review' | 'test';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  zoomLink?: string;
  notes?: string;
  beforeSession?: {
    verses: string;
    mistakes: number;
  };
  afterSession?: {
    versesMemorized: string;
    mistakes: number;
    rating: number; // 1-5
    notes: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  sessionId: string;
  childId: string;
  teacherId: string;
  parentId: string;
  type: 'parent-to-teacher' | 'teacher-to-parent' | 'student-progress';
  rating: number;
  comment: string;
  improvements?: string[];
  strengths?: string[];
  createdAt: string;
}

interface DataContextType {
  // State
  loading: boolean;
  
  // Parents
  parents: Parent[];
  addParent: (parentData: Omit<Parent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateParent: (id: string, updates: Partial<Parent>) => Promise<void>;
  removeParent: (id: string) => Promise<void>;
  getParentByUserId: (userId: string) => Parent | null;
  
  // Children
  children: Child[];
  addChild: (childData: Omit<Child, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateChild: (id: string, updates: Partial<Child>) => Promise<void>;
  removeChild: (id: string) => Promise<void>;
  getChildrenByParent: (parentId: string) => Child[];
  getChildrenByTeacher: (teacherId: string) => Child[];
  createStudentAccount: (childId: string, email: string, password: string) => Promise<void>;
  updateStudentPassword: (childId: string, newPassword: string) => Promise<void>; }