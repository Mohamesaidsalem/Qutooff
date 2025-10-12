import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ref, set, get, push, remove, update, onValue, off } from 'firebase/database';
import { database } from '../firebase/config';
import { useAuth } from './AuthContext';

export interface Child {
  id: string;
  name: string;
  age: number;
  level: string;
  progress: number;
  teacherId: string;
  teacherName: string;
  nextClass: string;
  parentId: string;
  studentAccount?: {
    email: string;
    password: string;
    userId?: string;
  };
  createdAt: string;
  isActive: boolean;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  specialization: string;
  hourlyRate: number;
  students: string[];
  isActive: boolean;
}

export interface Class {
  id: string;
  studentId: string;
  studentName?: string;
  teacherId: string;
  teacherName?: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'absent';
  subject: string;
  zoomLink: string;
  notes?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  parentId: string;
  month: string;
  year: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  createdAt: string;
  children: {
    childId: string;
    childName: string;
    classesCount: number;
  }[];
}

interface DataContextType {
  children: Child[];
  teachers: Teacher[];
  classes: Class[];
  invoices: Invoice[];
  loading: boolean;
  
  // Children methods
  getChildrenByParent: (parentId: string) => Child[];
  addChild: (child: Omit<Child, 'id' | 'createdAt' | 'isActive'>) => Promise<string>;
  updateChild: (childId: string, updates: Partial<Child>) => Promise<void>;
  removeChild: (childId: string) => Promise<void>;
  
  // Student account methods
  createStudentAccount: (childId: string, email: string, password: string) => Promise<void>;
  updateStudentPassword: (childId: string, newPassword: string) => Promise<void>;
  
  // Teacher methods
  getStudentsByTeacher: (teacherId: string) => Child[];
  getTeacherById: (teacherId: string) => Teacher | undefined;
  
  // Class methods
  getClassesByStudent: (studentId: string) => Class[];
  getClassesByTeacher: (teacherId: string) => Class[];
  getUpcomingClasses: (userId: string, userType: 'parent' | 'teacher' | 'student') => Class[];
  getUpcomingClassesForParent: (parentId: string) => Class[];
  getTodayClasses: () => Class[];
  scheduleClass: (classData: Omit<Class, 'id' | 'createdAt'>) => Promise<string>;
  updateClass: (classId: string, updates: Partial<Class>) => Promise<void>;
  deleteClass: (classId: string) => Promise<void>;
  
  // Invoice methods
  getInvoicesForParent: (parentId: string) => Invoice[];
  createInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => Promise<string>;
  updateInvoice: (invoiceId: string, updates: Partial<Invoice>) => Promise<void>;
  markInvoiceAsPaid: (invoiceId: string, paymentMethod: string) => Promise<void>;
  
  // Statistics
  getParentStats: (parentId: string) => {
    totalChildren: number;
    averageProgress: number;
    classesThisMonth: number;
    monthlyFee: number;
    upcomingClasses: number;
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const { user } = useAuth();
  const [childrenData, setChildrenData] = useState<Child[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize default data
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check if teachers exist
        const teachersRef = ref(database, 'teachers');
        const teachersSnapshot = await get(teachersRef);
        
        if (!teachersSnapshot.exists()) {
          // Create default teachers
          const defaultTeachers = [
            {
              name: 'الشيخ أحمد محمد',
              email: 'ahmed@qutooff.com',
              specialization: 'تحفيظ القرآن الكريم',
              hourlyRate: 15,
              students: [],
              isActive: true
            },
            {
              name: 'الشيخة فاطمة علي',
              email: 'fatima@qutooff.com',
              specialization: 'تجويد وتحفيظ',
              hourlyRate: 15,
              students: [],
              isActive: true
            },
            {
              name: 'الشيخ محمد حسن',
              email: 'mohamed@qutooff.com',
              specialization: 'القراءات العشر',
              hourlyRate: 20,
              students: [],
              isActive: true
            }
          ];

          for (const teacher of defaultTeachers) {
            const newTeacherRef = push(teachersRef);
            await set(newTeacherRef, teacher);
          }
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();
  }, []);

  // Real-time listeners
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const childrenRef = ref(database, 'children');
    const teachersRef = ref(database, 'teachers');
    const classesRef = ref(database, 'classes');
    const invoicesRef = ref(database, 'invoices');

    // Listen to children changes
    const unsubscribeChildren = onValue(childrenRef, (snapshot: any) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const childrenArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setChildrenData(childrenArray.filter(child => child.isActive !== false));
      } else {
        setChildrenData([]);
      }
    });

    // Listen to teachers changes
    const unsubscribeTeachers = onValue(teachersRef, (snapshot: any) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const teachersArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setTeachers(teachersArray.filter(teacher => teacher.isActive !== false));
      } else {
        setTeachers([]);
      }
    });

    // Listen to classes changes
    const unsubscribeClasses = onValue(classesRef, (snapshot: any) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const classesArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setClasses(classesArray);
      } else {
        setClasses([]);
      }
    });

    // Listen to invoices changes
    const unsubscribeInvoices = onValue(invoicesRef, (snapshot: any) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const invoicesArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setInvoices(invoicesArray);
      } else {
        setInvoices([]);
      }
      setLoading(false);
    });

    return () => {
      off(childrenRef, 'value', unsubscribeChildren);
      off(teachersRef, 'value', unsubscribeTeachers);
      off(classesRef, 'value', unsubscribeClasses);
      off(invoicesRef, 'value', unsubscribeInvoices);
    };
  }, [user]);

  // ============================================
  // CHILDREN METHODS
  // ============================================

  const getChildrenByParent = (parentId: string): Child[] => {
    return childrenData.filter(child => child.parentId === parentId);
  };

  const addChild = async (child: Omit<Child, 'id' | 'createdAt' | 'isActive'>): Promise<string> => {
    try {
      const childrenRef = ref(database, 'children');
      const newChildRef = push(childrenRef);
      const newChild = {
        ...child,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      await set(newChildRef, newChild);
      return newChildRef.key || '';
    } catch (error) {
      console.error('Error adding child:', error);
      throw error;
    }
  };

  const updateChild = async (childId: string, updates: Partial<Child>): Promise<void> => {
    try {
      const childRef = ref(database, `children/${childId}`);
      await update(childRef, updates);
    } catch (error) {
      console.error('Error updating child:', error);
      throw error;
    }
  };

  const removeChild = async (childId: string): Promise<void> => {
    try {
      const childRef = ref(database, `children/${childId}`);
      await update(childRef, { isActive: false });
    } catch (error) {
      console.error('Error removing child:', error);
      throw error;
    }
  };

  // ============================================
  // STUDENT ACCOUNT METHODS
  // ============================================

  const createStudentAccount = async (childId: string, email: string, password: string): Promise<void> => {
    try {
      // 1. حفظ بيانات الحساب في children node
      const childRef = ref(database, `children/${childId}`);
      await update(childRef, {
        studentAccount: {
          email,
          password,
          createdAt: new Date().toISOString()
        }
      });

      // 2. إنشاء user في users node للطالب
      const child = childrenData.find((c: Child) => c.id === childId);
      if (child) {
        const userRef = ref(database, `users/${childId}`);
        await set(userRef, {
          email: email,
          role: 'student',
          name: child.name,
          timezone: 'UTC',
          createdAt: new Date().toISOString(),
          childId: childId,
          parentId: child.parentId
        });
      }

      console.log('✅ Student account created successfully!');
    } catch (error) {
      console.error('Error creating student account:', error);
      throw error;
    }
  };

  const updateStudentPassword = async (childId: string, newPassword: string): Promise<void> => {
    try {
      const childRef = ref(database, `children/${childId}/studentAccount`);
      await update(childRef, { password: newPassword });
    } catch (error) {
      console.error('Error updating student password:', error);
      throw error;
    }
  };

  // ============================================
  // TEACHER METHODS
  // ============================================

  const getStudentsByTeacher = (teacherId: string): Child[] => {
    return childrenData.filter(child => child.teacherId === teacherId);
  };

  const getTeacherById = (teacherId: string): Teacher | undefined => {
    return teachers.find(t => t.id === teacherId);
  };

  // ============================================
  // CLASS METHODS
  // ============================================

  const getClassesByStudent = (studentId: string): Class[] => {
    return classes.filter(cls => cls.studentId === studentId);
  };

  const getClassesByTeacher = (teacherId: string): Class[] => {
    return classes.filter(cls => cls.teacherId === teacherId);
  };

  const getUpcomingClasses = (userId: string, userType: 'parent' | 'teacher' | 'student'): Class[] => {
    let userClasses: Class[] = [];
    
    if (userType === 'parent') {
      const parentChildren = getChildrenByParent(userId);
      userClasses = classes.filter(cls => 
        parentChildren.some(child => child.id === cls.studentId)
      );
    } else if (userType === 'teacher') {
      userClasses = getClassesByTeacher(userId);
    } else if (userType === 'student') {
      userClasses = getClassesByStudent(userId);
    }

    const now = new Date();
    return userClasses
      .filter(cls => {
        const classDateTime = new Date(`${cls.date}T${cls.time}`);
        return classDateTime >= now && cls.status === 'scheduled';
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
  };

  const getUpcomingClassesForParent = (parentId: string): Class[] => {
    const parentChildren = getChildrenByParent(parentId);
    const now = new Date();
    
    return classes
      .filter(cls => {
        const isParentClass = parentChildren.some(child => child.id === cls.studentId);
        const classDateTime = new Date(`${cls.date}T${cls.time}`);
        return isParentClass && classDateTime >= now && cls.status === 'scheduled';
      })
      .map(cls => {
        const child = parentChildren.find(c => c.id === cls.studentId);
        const teacher = teachers.find(t => t.id === cls.teacherId);
        return {
          ...cls,
          studentName: child?.name || 'Unknown',
          teacherName: teacher?.name || 'Unknown'
        };
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
  };

  const getTodayClasses = (): Class[] => {
    const today = new Date().toISOString().split('T')[0];
    return classes.filter(cls => cls.date === today);
  };

  const scheduleClass = async (classData: Omit<Class, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const classesRef = ref(database, 'classes');
      const newClassRef = push(classesRef);
      const newClass = {
        ...classData,
        createdAt: new Date().toISOString()
      };
      await set(newClassRef, newClass);
      return newClassRef.key || '';
    } catch (error) {
      console.error('Error scheduling class:', error);
      throw error;
    }
  };

  const updateClass = async (classId: string, updates: Partial<Class>): Promise<void> => {
    try {
      const classRef = ref(database, `classes/${classId}`);
      await update(classRef, updates);
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  };

  const deleteClass = async (classId: string): Promise<void> => {
    try {
      const classRef = ref(database, `classes/${classId}`);
      await remove(classRef);
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  };

  // ============================================
  // INVOICE METHODS
  // ============================================

  const getInvoicesForParent = (parentId: string): Invoice[] => {
    return invoices
      .filter(inv => inv.parentId === parentId)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
  };

  const createInvoice = async (invoice: Omit<Invoice, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const invoicesRef = ref(database, 'invoices');
      const newInvoiceRef = push(invoicesRef);
      const newInvoice = {
        ...invoice,
        createdAt: new Date().toISOString()
      };
      await set(newInvoiceRef, newInvoice);
      return newInvoiceRef.key || '';
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  };

  const updateInvoice = async (invoiceId: string, updates: Partial<Invoice>): Promise<void> => {
    try {
      const invoiceRef = ref(database, `invoices/${invoiceId}`);
      await update(invoiceRef, updates);
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  };

  const markInvoiceAsPaid = async (invoiceId: string, paymentMethod: string): Promise<void> => {
    try {
      const invoiceRef = ref(database, `invoices/${invoiceId}`);
      await update(invoiceRef, {
        status: 'paid',
        paidDate: new Date().toISOString(),
        paymentMethod
      });
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      throw error;
    }
  };

  // ============================================
  // STATISTICS
  // ============================================

  const getParentStats = (parentId: string) => {
    const parentChildren = getChildrenByParent(parentId);
    const upcomingClasses = getUpcomingClassesForParent(parentId);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const classesThisMonth = classes.filter(cls => {
      const classDate = new Date(cls.date);
      return parentChildren.some(child => child.id === cls.studentId) &&
             classDate.getMonth() === currentMonth &&
             classDate.getFullYear() === currentYear;
    }).length;

    const averageProgress = parentChildren.length > 0
      ? Math.round(parentChildren.reduce((acc, child) => acc + child.progress, 0) / parentChildren.length)
      : 0;

    const monthlyFee = parentChildren.length * 60; // $60 per child

    return {
      totalChildren: parentChildren.length,
      averageProgress,
      classesThisMonth,
      monthlyFee,
      upcomingClasses: upcomingClasses.length
    };
  };

  const value = {
    children: childrenData,
    teachers,
    classes,
    invoices,
    loading,
    
    // Children methods
    getChildrenByParent,
    addChild,
    updateChild,
    removeChild,
    
    // Student account methods
    createStudentAccount,
    updateStudentPassword,
    
    // Teacher methods
    getStudentsByTeacher,
    getTeacherById,
    
    // Class methods
    getClassesByStudent,
    getClassesByTeacher,
    getUpcomingClasses,
    getUpcomingClassesForParent,
    getTodayClasses,
    scheduleClass,
    updateClass,
    deleteClass,
    
    // Invoice methods
    getInvoicesForParent,
    createInvoice,
    updateInvoice,
    markInvoiceAsPaid,
    
    // Statistics
    getParentStats
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}