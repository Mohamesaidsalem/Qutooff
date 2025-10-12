import { database } from './config';
import { ref, set, push, get, update, remove, query, orderByChild, equalTo } from 'firebase/database';

export interface Teacher {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  hourly_rate: number;
  is_active: boolean;
  created_at: string;
}

export interface Student {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  parent_phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface WeeklyClass {
  id: string;
  teacher_id: string;
  student_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject: string;
  is_active: boolean;
  created_at: string;
  teacher?: Teacher;
  student?: Student;
}

export interface PublicHoliday {
  id: string;
  name: string;
  date: string;
  created_at: string;
}

export interface AdvanceClass {
  id: string;
  teacher_id: string;
  student_id: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  subject: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  teacher?: Teacher;
  student?: Student;
}

export interface DailyClassLog {
  id: string;
  teacher_id: string;
  student_id: string;
  class_date: string;
  start_time: string;
  end_time: string;
  subject: string;
  duration_hours: number;
  is_from_weekly: boolean;
  weekly_class_id?: string;
  advance_class_id?: string;
  created_at: string;
  teacher?: Teacher;
  student?: Student;
}

export type DailyClass = DailyClassLog;

export interface SalaryReport {
  id: string;
  teacher_id: string;
  month: number;
  year: number;
  total_hours: number;
  total_classes: number;
  total_salary: number;
  created_at: string;
  teacher?: Teacher;
}

export const firebase = {
  teachers: {
    async getAll() {
      const snapshot = await get(ref(database, 'teachers'));
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      return Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));
    },
    async getActive() {
      const all = await this.getAll();
      return all.filter((t: Teacher) => t.is_active);
    },
    async create(teacher: Omit<Teacher, 'id' | 'created_at'>) {
      const newRef = push(ref(database, 'teachers'));
      const newTeacher = {
        ...teacher,
        created_at: new Date().toISOString(),
      };
      await set(newRef, newTeacher);
      return { id: newRef.key, ...newTeacher };
    },
    async update(id: string, updates: Partial<Teacher>) {
      await update(ref(database, `teachers/${id}`), updates);
    },
    async delete(id: string) {
      await update(ref(database, `teachers/${id}`), { is_active: false });
    }
  },

  students: {
    async getAll() {
      const snapshot = await get(ref(database, 'students'));
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      return Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));
    },
    async getActive() {
      const all = await this.getAll();
      return all.filter((s: Student) => s.is_active);
    },
    async create(student: Omit<Student, 'id' | 'created_at'>) {
      const newRef = push(ref(database, 'students'));
      const newStudent = {
        ...student,
        created_at: new Date().toISOString(),
      };
      await set(newRef, newStudent);
      return { id: newRef.key, ...newStudent };
    },
    async update(id: string, updates: Partial<Student>) {
      await update(ref(database, `students/${id}`), updates);
    },
    async delete(id: string) {
      await update(ref(database, `students/${id}`), { is_active: false });
    }
  },

  weeklyClasses: {
    async getAll() {
      const snapshot = await get(ref(database, 'weekly_classes'));
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      const classes = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));

      const teachers = await firebase.teachers.getAll();
      const students = await firebase.students.getAll();

      return classes.map((cls: any) => ({
        ...cls,
        teacher: teachers.find((t: Teacher) => t.id === cls.teacher_id),
        student: students.find((s: Student) => s.id === cls.student_id),
      }));
    },
    async getActive() {
      const all = await this.getAll();
      return all.filter((c: WeeklyClass) => c.is_active);
    },
    async create(weeklyClass: Omit<WeeklyClass, 'id' | 'created_at'>) {
      const newRef = push(ref(database, 'weekly_classes'));
      const newClass = {
        ...weeklyClass,
        created_at: new Date().toISOString(),
      };
      await set(newRef, newClass);
      return { id: newRef.key, ...newClass };
    },
    async update(id: string, updates: Partial<WeeklyClass>) {
      await update(ref(database, `weekly_classes/${id}`), updates);
    },
    async delete(id: string) {
      await update(ref(database, `weekly_classes/${id}`), { is_active: false });
    }
  },

  publicHolidays: {
    async getAll() {
      const snapshot = await get(ref(database, 'public_holidays'));
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      return Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));
    },
    async create(holiday: Omit<PublicHoliday, 'id' | 'created_at'>) {
      const newRef = push(ref(database, 'public_holidays'));
      const newHoliday = {
        ...holiday,
        created_at: new Date().toISOString(),
      };
      await set(newRef, newHoliday);
      return { id: newRef.key, ...newHoliday };
    },
    async update(id: string, updates: Partial<PublicHoliday>) {
      await update(ref(database, `public_holidays/${id}`), updates);
    },
    async delete(id: string) {
      await remove(ref(database, `public_holidays/${id}`));
    }
  },

  advanceClasses: {
    async getAll() {
      const snapshot = await get(ref(database, 'advance_classes'));
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      const classes = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));

      const teachers = await firebase.teachers.getAll();
      const students = await firebase.students.getAll();

      return classes.map((cls: any) => ({
        ...cls,
        teacher: teachers.find((t: Teacher) => t.id === cls.teacher_id),
        student: students.find((s: Student) => s.id === cls.student_id),
      }));
    },
    async getByDate(date: string) {
      const all = await this.getAll();
      return all.filter((c: AdvanceClass) => c.scheduled_date === date);
    },
    async create(advanceClass: Omit<AdvanceClass, 'id' | 'created_at'>) {
      const newRef = push(ref(database, 'advance_classes'));
      const newClass = {
        ...advanceClass,
        created_at: new Date().toISOString(),
      };
      await set(newRef, newClass);
      return { id: newRef.key, ...newClass };
    },
    async update(id: string, updates: Partial<AdvanceClass>) {
      await update(ref(database, `advance_classes/${id}`), updates);
    },
    async delete(id: string) {
      await remove(ref(database, `advance_classes/${id}`));
    }
  },

  dailyClasses: {
    async getAll() {
      const snapshot = await get(ref(database, 'daily_classes'));
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      const classes = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));

      const teachers = await firebase.teachers.getAll();
      const students = await firebase.students.getAll();

      return classes.map((cls: any) => ({
        ...cls,
        teacher: teachers.find((t: Teacher) => t.id === cls.teacher_id),
        student: students.find((s: Student) => s.id === cls.student_id),
      }));
    },
    async getByDate(date: string) {
      const all = await this.getAll();
      return all.filter((c: DailyClass) => c.class_date === date);
    },
    async create(dailyClass: Omit<DailyClass, 'id' | 'created_at'>) {
      const newRef = push(ref(database, 'daily_classes'));
      const newClass = {
        ...dailyClass,
        created_at: new Date().toISOString(),
      };
      await set(newRef, newClass);
      return { id: newRef.key, ...newClass };
    }
  },

  salaryReports: {
    async getAll() {
      const snapshot = await get(ref(database, 'salary_reports'));
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      const reports = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));

      const teachers = await firebase.teachers.getAll();

      return reports.map((report: any) => ({
        ...report,
        teacher: teachers.find((t: Teacher) => t.id === report.teacher_id),
      }));
    },
    async getByMonthYear(month: number, year: number) {
      const all = await this.getAll();
      return all.filter((r: SalaryReport) => r.month === month && r.year === year);
    },
    async create(report: Omit<SalaryReport, 'id' | 'created_at'>) {
      const newRef = push(ref(database, 'salary_reports'));
      const newReport = {
        ...report,
        created_at: new Date().toISOString(),
      };
      await set(newRef, newReport);
      return { id: newRef.key, ...newReport };
    }
  }
};
