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

// ============================================
// CONSTANTS
// ============================================

export const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Riyadh',
  'Asia/Kuwait',
  'Asia/Cairo',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Pacific/Auckland'
];

export const STUDENT_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced'
];

export const DEFAULT_TIMEZONE = 'Asia/Riyadh';

// ============================================
// HELPER FUNCTIONS
// ============================================

export const isIndependentAccount = (family: Family): boolean => {
  return family.name?.includes("'s Account") || 
         (family.children?.length === 1 && !family.parentId);
};

export const getFamilyChildren = (family: Family, allChildren: Child[]): Child[] => {
  if (!family?.children) return [];
  return allChildren.filter(child => family.children.includes(child.id));
};

export const calculateFamilyStats = (
  regularFamilies: Family[],
  independentAccounts: Family[],
  independentStudents: Child[],
  allChildren: Child[]
) => {
  const familyStudents = regularFamilies.reduce((sum, fam) =>
    sum + (fam.children?.length || 0), 0
  );
  
  const totalStudents = familyStudents + independentStudents.length;

  const allStudents = [
    ...allChildren.filter(child => 
      regularFamilies.some(fam => fam.children?.includes(child.id))
    ),
    ...independentStudents
  ];

  const averageProgress = allStudents.length > 0
    ? Math.round(allStudents.reduce((sum, child) => 
        sum + (child.progress || 0), 0) / allStudents.length)
    : 0;

  return {
    totalFamilies: regularFamilies.length,
    totalStudents,
    totalParents: regularFamilies.length,
    independentStudents: independentAccounts.length + independentStudents.length,
    averageProgress,
  };
};

export const filterFamilies = (
  families: Family[],
  searchTerm: string
): Family[] => {
  if (!searchTerm.trim()) return families;
  
  const search = searchTerm.toLowerCase();
  return families.filter(family =>
    family.name?.toLowerCase().includes(search) ||
    family.parentName?.toLowerCase().includes(search) ||
    family.parentEmail?.toLowerCase().includes(search) ||
    family.timezone?.toLowerCase().includes(search)
  );
};

export const filterStudents = (
  students: Child[],
  searchTerm: string
): Child[] => {
  if (!searchTerm.trim()) return students;
  
  const search = searchTerm.toLowerCase();
  return students.filter(student =>
    student.name?.toLowerCase().includes(search) ||
    student.email?.toLowerCase().includes(search) ||
    student.timezone?.toLowerCase().includes(search)
  );
};