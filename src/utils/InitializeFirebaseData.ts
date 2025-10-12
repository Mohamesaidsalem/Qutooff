import { ref, set, get } from 'firebase/database';
import { database } from '../firebase/config';

/**
 * Initialize Firebase with default teachers, sample children, classes, and invoices
 * Run this once to populate your database
 */
export async function initializeFirebaseData() {
  console.log('🔥 Starting Firebase initialization...');

  try {
    // ============================================
    // 1. CREATE DEFAULT TEACHERS
    // ============================================
    const teachersRef = ref(database, 'teachers');
    const teachersSnapshot = await get(teachersRef);

    if (!teachersSnapshot.exists()) {
      console.log('📚 Creating default teachers...');
      
      const defaultTeachers = [
        {
          id: 'teacher-001',
          name: 'الشيخ أحمد محمد',
          email: 'ahmed.teacher@qutooff.com',
          specialization: 'تحفيظ القرآن الكريم',
          hourlyRate: 15,
          students: [],
          isActive: true
        },
        {
          id: 'teacher-002',
          name: 'الشيخة فاطمة علي',
          email: 'fatima.teacher@qutooff.com',
          specialization: 'تجويد وتحفيظ',
          hourlyRate: 15,
          students: [],
          isActive: true
        },
        {
          id: 'teacher-003',
          name: 'الشيخ محمد حسن',
          email: 'mohamed.teacher@qutooff.com',
          specialization: 'القراءات العشر',
          hourlyRate: 20,
          students: [],
          isActive: true
        }
      ];

      for (const teacher of defaultTeachers) {
        await set(ref(database, `teachers/${teacher.id}`), teacher);
        console.log(`✅ Created teacher: ${teacher.name}`);
      }
    } else {
      console.log('✅ Teachers already exist');
    }

    // ============================================
    // 2. CREATE SAMPLE CHILDREN (for testing)
    // ============================================
    console.log('👶 Creating sample children...');
    
    const sampleChildren = [
      {
        id: 'child-001',
        name: 'محمد أحمد',
        age: 10,
        level: 'Surah Yaseen',
        progress: 75,
        teacherId: 'teacher-001',
        teacherName: 'الشيخ أحمد محمد',
        nextClass: 'Tomorrow at 3:00 PM',
        parentId: 'parent-test-001', // Replace with actual parent ID
        isActive: true,
        createdAt: new Date().toISOString(),
        studentAccount: {
          email: 'mohamed.student@test.com',
          password: 'student123',
          createdAt: new Date().toISOString()
        }
      },
      {
        id: 'child-002',
        name: 'فاطمة أحمد',
        age: 8,
        level: 'Short Surahs',
        progress: 45,
        teacherId: 'teacher-002',
        teacherName: 'الشيخة فاطمة علي',
        nextClass: 'Today at 5:00 PM',
        parentId: 'parent-test-001', // Replace with actual parent ID
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    for (const child of sampleChildren) {
      const childRef = ref(database, `children/${child.id}`);
      const childSnapshot = await get(childRef);
      
      if (!childSnapshot.exists()) {
        await set(childRef, child);
        console.log(`✅ Created child: ${child.name}`);
      }
    }

    // ============================================
    // 3. CREATE SAMPLE CLASSES
    // ============================================
    console.log('📅 Creating sample classes...');
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const sampleClasses = [
      {
        id: 'class-001',
        studentId: 'child-001',
        studentName: 'محمد أحمد',
        teacherId: 'teacher-001',
        teacherName: 'الشيخ أحمد محمد',
        date: today.toISOString().split('T')[0],
        time: '15:00',
        duration: 60,
        status: 'scheduled',
        subject: 'Quran Memorization',
        zoomLink: 'https://zoom.us/j/123456789',
        notes: 'Review Surah Yaseen',
        createdAt: new Date().toISOString()
      },
      {
        id: 'class-002',
        studentId: 'child-002',
        studentName: 'فاطمة أحمد',
        teacherId: 'teacher-002',
        teacherName: 'الشيخة فاطمة علي',
        date: today.toISOString().split('T')[0],
        time: '17:00',
        duration: 60,
        status: 'scheduled',
        subject: 'Quran Basics',
        zoomLink: 'https://zoom.us/j/987654321',
        notes: 'Practice Tajweed',
        createdAt: new Date().toISOString()
      },
      {
        id: 'class-003',
        studentId: 'child-001',
        studentName: 'محمد أحمد',
        teacherId: 'teacher-001',
        teacherName: 'الشيخ أحمد محمد',
        date: tomorrow.toISOString().split('T')[0],
        time: '15:00',
        duration: 60,
        status: 'scheduled',
        subject: 'Quran Memorization',
        zoomLink: 'https://zoom.us/j/123456789',
        createdAt: new Date().toISOString()
      }
    ];

    for (const classItem of sampleClasses) {
      const classRef = ref(database, `classes/${classItem.id}`);
      const classSnapshot = await get(classRef);
      
      if (!classSnapshot.exists()) {
        await set(classRef, classItem);
        console.log(`✅ Created class: ${classItem.subject} on ${classItem.date}`);
      }
    }

    // ============================================
    // 4. CREATE SAMPLE INVOICES
    // ============================================
    console.log('💰 Creating sample invoices...');
    
    const currentMonth = new Date().toLocaleString('en', { month: 'long' });
    const currentYear = new Date().getFullYear().toString();
    const lastMonth = new Date(today.setMonth(today.getMonth() - 1)).toLocaleString('en', { month: 'long' });

    const sampleInvoices = [
      {
        id: 'invoice-001',
        parentId: 'parent-test-001', // Replace with actual parent ID
        month: lastMonth,
        year: currentYear,
        amount: 120,
        status: 'paid',
        dueDate: new Date(today.setDate(15)).toISOString().split('T')[0],
        paidDate: new Date(today.setDate(10)).toISOString().split('T')[0],
        paymentMethod: 'PayPal',
        createdAt: new Date().toISOString(),
        children: [
          {
            childId: 'child-001',
            childName: 'محمد أحمد',
            classesCount: 8
          },
          {
            childId: 'child-002',
            childName: 'فاطمة أحمد',
            classesCount: 8
          }
        ]
      },
      {
        id: 'invoice-002',
        parentId: 'parent-test-001', // Replace with actual parent ID
        month: currentMonth,
        year: currentYear,
        amount: 120,
        status: 'pending',
        dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1, 15)).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        children: [
          {
            childId: 'child-001',
            childName: 'محمد أحمد',
            classesCount: 8
          },
          {
            childId: 'child-002',
            childName: 'فاطمة أحمد',
            classesCount: 8
          }
        ]
      }
    ];

    for (const invoice of sampleInvoices) {
      const invoiceRef = ref(database, `invoices/${invoice.id}`);
      const invoiceSnapshot = await get(invoiceRef);
      
      if (!invoiceSnapshot.exists()) {
        await set(invoiceRef, invoice);
        console.log(`✅ Created invoice: ${invoice.month} ${invoice.year} - ${invoice.status}`);
      }
    }

    console.log('');
    console.log('🎉 Firebase initialization completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   ✅ 3 Teachers created');
    console.log('   ✅ 2 Sample children created');
    console.log('   ✅ 3 Sample classes created');
    console.log('   ✅ 2 Sample invoices created');
    console.log('');
    console.log('🔐 Test Credentials:');
    console.log('   Student: mohamed.student@test.com / student123');
    console.log('   Parent ID for testing: parent-test-001');
    console.log('');
    console.log('⚠️  IMPORTANT: Replace "parent-test-001" with actual parent IDs after user registration!');

  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    throw error;
  }
}

// Call this function once to initialize your database
// You can run it from a component's useEffect or create a separate initialization page
export default initializeFirebaseData;