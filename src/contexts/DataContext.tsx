import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ref, set, get, push, remove, update, onValue, off } from 'firebase/database';
import { database } from '../firebase/config';
import { useAuth } from './AuthContext';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface StudentAccount {
  email: string;
  password: string;
  userId?: string;
  createdAt?: string;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  level: string;
  progress: number;
  teacherId: string;
  teacherName: string;
  courseId?: string; // ✅ Added
  courseName?: string; // ✅ Added
  nextClass: string;
  parentId: string;
  phone?: string;
  email?: string;
  password?: string;
  timezone?: string;
  image?: string;
  studentAccount?: StudentAccount;
  createdAt: string;
  isActive: boolean;
  
  status: 'active' | 'suspended' | 'on-hold' | 'inactive';
  skypeId?: string;
  gender?: string;
  language?: string;
  data?: string;
  numberOfDays?: string;
  regularCourse?: string;
  additionalCourse?: string;
  remarksForParent?: string;
  remarksForTeacher?: string;
 
  
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization: string;
  hourlyRate: number;
  students: string[];
  isActive: boolean;
}

export interface Class {
  courseName: any;
  courseId: any;
  id: string;
  studentId: string;
  studentName?: string;
  teacherId: string;
  teacherName?: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'running'| 'cancelled' | 'absent';
  subject: string;
  zoomLink: string;
  notes?: string;
  createdAt: string;
  onlineTime?: string;
  updatedAt?: string;
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

export interface Family {
  id: string;
  name: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentImage?: string;
  timezone: string;
  address?: string;
  children: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

// 🔥 Course Interface
export interface Course {
  title: string;
  id: string;
  name: string;
  description?: string;
  level: string;
  duration: number; // بالدقائق
  price: number;
  teacherId?: string;
  maxStudents?: number;
  currentStudents?: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface DataContextType {
  children: Child[];
  teachers: Teacher[];
  classes: Class[];
  invoices: Invoice[];
  families: Family[];
  courses: Course[]; // 🔥 Added courses
  loading: boolean;
  
  // Children methods
  getChildrenByParent: (parentId: string) => Child[];
  addChild: (child: Omit<Child, 'id' | 'createdAt' | 'isActive'>) => Promise<string>;
  updateChild: (childId: string, updates: Partial<Child>) => Promise<void>;
  removeChild: (childId: string) => Promise<void>;
  
  // Student account methods
  createStudentAccount: (childId: string, email: string, password: string) => Promise<void>;
  updateStudentPassword: (childId: string, newPassword: string) => Promise<void>;
  setupStudentFirebaseAuth: (childId: string) => Promise<void>;
  
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
  
  // Family methods
  getFamiliesByParent: (parentId: string) => Family[];
  getAllFamilies: () => Family[];
  getFamilyById: (familyId: string) => Family | undefined;
  addFamily: (family: Omit<Family, 'id' | 'createdAt'>) => Promise<string>;
  updateFamily: (familyId: string, updates: Partial<Family>) => Promise<void>;
  removeFamily: (familyId: string) => Promise<void>;
  addChildToFamily: (familyId: string, childId: string) => Promise<void>;
  removeChildFromFamily: (familyId: string, childId: string) => Promise<void>;
  
  // 🔥 Course methods
  getCourses: () => Course[];
  getCourseById: (courseId: string) => Course | undefined;
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => Promise<string>;
  updateCourse: (courseId: string, updates: Partial<Course>) => Promise<void>;
  removeCourse: (courseId: string) => Promise<void>;
  
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
  const [families, setFamilies] = useState<Family[]>([]);
  const [courses, setCourses] = useState<Course[]>([]); // 🔥 Added courses state
  const [loading, setLoading] = useState(true);

  // Initialize default data
  useEffect(() => {
  // 🔐 انتظر حتى يسجل المستخدم دخوله
  if (!user) {
    console.log('⏳ Waiting for user authentication...');
    return;
  }

  const initializeData = async () => {
    try {
      console.log('🔐 Auth state:', auth.currentUser?.uid);
      console.log('👤 User role:', user?.role);

      // Initialize Teachers
      const teachersRef = ref(database, 'teachers');
      const teachersSnapshot = await get(teachersRef);
      
      if (!teachersSnapshot.exists()) {
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
        console.log('✅ Default teachers initialized');
      }

      // 🔥 Initialize Courses
      const coursesRef = ref(database, 'courses');
      const coursesSnapshot = await get(coursesRef);
      
      if (!coursesSnapshot.exists()) {
        const defaultCourses = [
          {
            name: 'حفظ جزء عم',
            description: 'برنامج حفظ جزء عم كاملاً مع التجويد',
            level: 'مبتدئ',
            duration: 30,
            price: 50,
            maxStudents: 10,
            currentStudents: 0,
            status: 'active',
            createdAt: new Date().toISOString()
          },
          {
            name: 'حفظ جزء تبارك',
            description: 'برنامج حفظ جزء تبارك مع أحكام التجويد',
            level: 'متوسط',
            duration: 30,
            price: 60,
            maxStudents: 8,
            currentStudents: 0,
            status: 'active',
            createdAt: new Date().toISOString()
          },
          {
            name: 'التجويد المتقدم',
            description: 'دراسة أحكام التجويد المتقدمة والقراءات',
            level: 'متقدم',
            duration: 45,
            price: 80,
            maxStudents: 5,
            currentStudents: 0,
            status: 'active',
            createdAt: new Date().toISOString()
          },
          {
            name: 'المراجعة الشاملة',
            description: 'برنامج مراجعة القرآن الكريم كاملاً',
            level: 'متقدم',
            duration: 60,
            price: 100,
            maxStudents: 3,
            currentStudents: 0,
            status: 'active',
            createdAt: new Date().toISOString()
          },
          {
            name: 'القاعدة النورانية',
            description: 'تعليم القراءة الصحيحة من البداية',
            level: 'مبتدئ',
            duration: 30,
            price: 40,
            maxStudents: 15,
            currentStudents: 0,
            status: 'active',
            createdAt: new Date().toISOString()
          }
        ];

        for (const course of defaultCourses) {
          const newCourseRef = push(coursesRef);
          await set(newCourseRef, course);
        }
        console.log('✅ Default courses initialized');
      }
    } catch (error: any) {
      console.error('❌ Error initializing data:', {
        message: error.message,
        code: error.code,
        userId: user?.id,
        userRole: user?.role
      });
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
     const classesRef = ref(database, 'daily_classes');
    const invoicesRef = ref(database, 'invoices');
    const familiesRef = ref(database, 'families');
    const coursesRef = ref(database, 'courses'); // 🔥 Added courses ref

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
     // ✅ هنا التغيير الرئيسي
const unsubscribeClasses = onValue(classesRef, (snapshot: any) => {
  if (snapshot.exists()) {
    const data = snapshot.val();
    const classesArray = Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));
    console.log('✅ Daily classes updated from Firebase:', classesArray.length);  // للتأكد
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
    });

    // Listen to families changes
    const unsubscribeFamilies = onValue(familiesRef, (snapshot: any) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const familiesArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setFamilies(familiesArray.filter(family => family.status === 'active'));
      } else {
        setFamilies([]);
      }
    });

    // 🔥 Listen to courses changes
    const unsubscribeCourses = onValue(coursesRef, (snapshot: any) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const coursesArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setCourses(coursesArray.filter(course => course.status === 'active'));
      } else {
        setCourses([]);
      }
      setLoading(false);
    });

    return () => {
      off(childrenRef, 'value', unsubscribeChildren);
      off(teachersRef, 'value', unsubscribeTeachers);
      off(classesRef, 'value', unsubscribeClasses);
      off(invoicesRef, 'value', unsubscribeInvoices);
      off(familiesRef, 'value', unsubscribeFamilies);
      off(coursesRef, 'value', unsubscribeCourses); // 🔥 Added cleanup
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
      const childId = newChildRef.key || '';
      
      const newChild = {
        ...child,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
      // If student account info is provided, create the account
      if (child.email && child.password) {
        newChild.studentAccount = {
          email: child.email,
          password: child.password,
          createdAt: new Date().toISOString()
        };
        
        // Try to create Firebase Auth account
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, child.email, child.password);
          newChild.studentAccount.userId = userCredential.user.uid;
          
          // Save to users collection
          const userRef = ref(database, `users/${userCredential.user.uid}`);
          await set(userRef, {
            email: child.email,
            role: 'student',
            name: child.name,
            timezone: child.timezone || 'UTC',
            createdAt: new Date().toISOString(),
            studentId: childId,
            parentId: child.parentId
          });
          
          console.log('✅ Firebase Auth account created for student');
        } catch (authError: any) {
          if (authError.code === 'auth/email-already-in-use') {
            console.log('⚠️ Email already in use, saving without Firebase Auth');
          } else {
            console.error('Error creating Firebase Auth account:', authError);
          }
        }
      }
      
      await set(newChildRef, newChild);
      return childId;
    } catch (error) {
      console.error('Error adding child:', error);
      throw error;
    }
  };

  const updateChild = async (childId: string, updates: Partial<Child>): Promise<void> => {
    try {
      const childRef = ref(database, `children/${childId}`);
      
      // If updating student account credentials
      if (updates.email || updates.password) {
        const currentChild = childrenData.find(c => c.id === childId);
        if (currentChild) {
          const email = updates.email ?? currentChild.studentAccount?.email ?? currentChild.email;
          const password = updates.password ?? currentChild.studentAccount?.password ?? currentChild.password;
          
          // Only set studentAccount when both email and password are available (strings)
          if (email && password) {
            const studentAccount: StudentAccount = {
              ...currentChild.studentAccount,
              email,
              password,
            };
            updates.studentAccount = studentAccount;
          } else {
            console.warn('Skipping studentAccount update because email or password is missing');
          }
        }
      }
      
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
      const childRef = ref(database, `children/${childId}`);
      const studentAccount: StudentAccount = {
        email,
        password,
        createdAt: new Date().toISOString()
      };
      
      // Try to create Firebase Auth account
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        studentAccount.userId = userCredential.user.uid;
        
        // Save to users collection
        const child = childrenData.find((c: Child) => c.id === childId);
        if (child) {
          const userRef = ref(database, `users/${userCredential.user.uid}`);
          await set(userRef, {
            email: email,
            role: 'student',
            name: child.name,
            timezone: child.timezone || 'UTC',
            createdAt: new Date().toISOString(),
            studentId: childId,
            parentId: child.parentId
          });
        }
        
        console.log('✅ Firebase Auth account created for student');
      } catch (authError: any) {
        if (authError.code === 'auth/email-already-in-use') {
          console.log('⚠️ Email already in use');
        } else {
          console.error('Error creating Firebase Auth account:', authError);
        }
      }
      
      await update(childRef, { studentAccount });
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

  const setupStudentFirebaseAuth = async (childId: string): Promise<void> => {
    try {
      const child = childrenData.find(c => c.id === childId);
      if (!child) throw new Error('Child not found');
      
      const email = child.studentAccount?.email || child.email;
      const password = child.studentAccount?.password || child.password;
      
      if (!email || !password) {
        throw new Error('Email and password required');
      }
      
      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update student account with auth user ID
      const childRef = ref(database, `children/${childId}/studentAccount`);
      await update(childRef, { userId: userCredential.user.uid });
      
      // Save to users collection
      const userRef = ref(database, `users/${userCredential.user.uid}`);
      await set(userRef, {
        email: email,
        role: 'student',
        name: child.name,
        timezone: child.timezone || 'UTC',
        createdAt: new Date().toISOString(),
        studentId: childId,
        parentId: child.parentId
      });
      
      console.log('✅ Firebase Auth account setup complete');
    } catch (error: any) {
      console.error('Error setting up Firebase Auth:', error);
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
      const classesRef = ref(database, 'daily_classes');
      const newClassRef = push(classesRef);
      const newClass = {
        ...classData,
        createdAt: new Date().toISOString()
      };
      await set(newClassRef, newClass);
      console.log('✅ Class scheduled in daily_classes:', newClassRef.key);
      return newClassRef.key || '';
    } catch (error) {
      console.error('Error scheduling class:', error);
      throw error;
    }
  };

  const updateClass = async (classId: string, updates: Partial<Class>): Promise<void> => {
    try {
      const classRef = ref(database, `daily_classes/${classId}`);
      await update(classRef, updates);
      console.log('✅ Class updated in daily_classes:', classId);
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
  // FAMILY METHODS
  // ============================================

  const getFamiliesByParent = (parentId: string): Family[] => {
    return families.filter(family => family.parentId === parentId);
  };

  const getAllFamilies = (): Family[] => {
    return families;
  };

  const getFamilyById = (familyId: string): Family | undefined => {
    return families.find(f => f.id === familyId);
  };

  const addFamily = async (family: Omit<Family, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const familiesRef = ref(database, 'families');
      const newFamilyRef = push(familiesRef);
      const newFamily = {
        ...family,
        children: family.children || [],
        createdAt: new Date().toISOString()
      };
      await set(newFamilyRef, newFamily);
      console.log('✅ Family added:', newFamilyRef.key);
      return newFamilyRef.key || '';
    } catch (error) {
      console.error('Error adding family:', error);
      throw error;
    }
  };

  const updateFamily = async (familyId: string, updates: Partial<Family>): Promise<void> => {
    try {
      const familyRef = ref(database, `families/${familyId}`);
      await update(familyRef, updates);
      console.log('✅ Family updated:', familyId);
    } catch (error) {
      console.error('Error updating family:', error);
      throw error;
    }
  };

  const removeFamily = async (familyId: string): Promise<void> => {
    try {
      const familyRef = ref(database, `families/${familyId}`);
      await update(familyRef, { status: 'inactive' });
      console.log('✅ Family removed:', familyId);
    } catch (error) {
      console.error('Error removing family:', error);
      throw error;
    }
  };

  const addChildToFamily = async (familyId: string, childId: string): Promise<void> => {
    try {
      const family = families.find(f => f.id === familyId);
      if (!family) throw new Error('Family not found');
      
      const updatedChildren = [...(family.children || []), childId];
      await updateFamily(familyId, { children: updatedChildren });
      
      // Update child's parentId
      await updateChild(childId, { parentId: family.parentId });
      console.log('✅ Child added to family:', childId);
    } catch (error) {
      console.error('Error adding child to family:', error);
      throw error;
    }
  };

  const removeChildFromFamily = async (familyId: string, childId: string): Promise<void> => {
    try {
      const family = families.find(f => f.id === familyId);
      if (!family) throw new Error('Family not found');
      
      const updatedChildren = (family.children || []).filter(id => id !== childId);
      await updateFamily(familyId, { children: updatedChildren });
      console.log('✅ Child removed from family:', childId);
    } catch (error) {
      console.error('Error removing child from family:', error);
      throw error;
    }
  };

  // ============================================
  // 🔥 COURSE METHODS
  // ============================================

  const getCourses = (): Course[] => {
    return courses;
  };

  const getCourseById = (courseId: string): Course | undefined => {
    return courses.find(c => c.id === courseId);
  };

  const addCourse = async (course: Omit<Course, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const coursesRef = ref(database, 'courses');
      const newCourseRef = push(coursesRef);
      const newCourse = {
        ...course,
        createdAt: new Date().toISOString()
      };
      await set(newCourseRef, newCourse);
      console.log('✅ Course added:', newCourseRef.key);
      return newCourseRef.key || '';
    } catch (error) {
      console.error('Error adding course:', error);
      throw error;
    }
  };

  const updateCourse = async (courseId: string, updates: Partial<Course>): Promise<void> => {
    try {
      const courseRef = ref(database, `courses/${courseId}`);
      await update(courseRef, updates);
      console.log('✅ Course updated:', courseId);
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  };

  const removeCourse = async (courseId: string): Promise<void> => {
    try {
      const courseRef = ref(database, `courses/${courseId}`);
      await update(courseRef, { status: 'inactive' });
      console.log('✅ Course removed:', courseId);
    } catch (error) {
      console.error('Error removing course:', error);
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

    const monthlyFee = parentChildren.length * 60;

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
    families,
    courses, // 🔥 Added courses
    loading,
    
    // Children methods
    getChildrenByParent,
    addChild,
    updateChild,
    removeChild,
    
    // Student account methods
    createStudentAccount,
    updateStudentPassword,
    setupStudentFirebaseAuth,
    
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
    
    // Family methods
    getFamiliesByParent,
    getAllFamilies,
    getFamilyById,
    addFamily,
    updateFamily,
    removeFamily,
    addChildToFamily,
    removeChildFromFamily,
    
    // 🔥 Course methods
    getCourses,
    getCourseById,
    addCourse,
    updateCourse,
    removeCourse,
    
    // Statistics
    getParentStats
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}