import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, database } from '../firebase/config';

export interface User {
  id: string;
  email: string;
  role: 'parent' | 'teacher' | 'student' | 'admin' | 'super_admin';
  name: string;
  timezone: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>; 
  register: (email: string, password: string, role: string, name: string, timezone: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userRef = ref(database, `users/${firebaseUser.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              role: userData.role,
              name: userData.name,
              timezone: userData.timezone || 'UTC',
              createdAt: userData.createdAt
            });
          } else {
            await signOut(auth);
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting login for:', email);
      
      // 1️⃣ محاولة تسجيل الدخول عبر Firebase Auth
      try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ Firebase Auth login successful');
        return true;
      } catch (authError: any) {
        console.log('⚠️ Firebase Auth failed, checking student accounts...');
        
        // 2️⃣ إذا فشل Firebase Auth، نبحث في Student Accounts
        const usersRef = ref(database, 'users');
        const usersSnapshot = await get(usersRef);
        
        if (usersSnapshot.exists()) {
          const users = usersSnapshot.val();
          
          // البحث عن المستخدم بنفس الإيميل
          for (const userId in users) {
            const userData = users[userId];
            
            if (userData.email === email && userData.role === 'student') {
              console.log('👤 Found student user:', userData.name);
              
              // التحقق من الباسورد من children node
              const childRef = ref(database, `children/${userData.childId}`);
              const childSnapshot = await get(childRef);
              
              if (childSnapshot.exists()) {
                const childData = childSnapshot.val();
                
                if (childData.studentAccount?.password === password) {
                  console.log('✅ Student password verified!');
                  
                  // تسجيل دخول الطالب
                  setUser({
                    id: userId,
                    email: email,
                    role: 'student',
                    name: userData.name,
                    timezone: userData.timezone || 'UTC',
                    createdAt: userData.createdAt
                  });
                  
                  return true;
                }
              }
            }
          }
        }
        
        console.log('❌ Login failed: Invalid credentials');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, role: string, name: string, timezone: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const userData = {
        email: firebaseUser.email,
        role: role,
        name: name,
        timezone: timezone,
        createdAt: new Date().toISOString()
      };
      
      await set(ref(database, `users/${firebaseUser.uid}`), userData);
      
      return true;
    } catch (error: any) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}