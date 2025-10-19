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
      const emailLower = email.toLowerCase().trim();
      console.log('🔐 Attempting login for:', emailLower);
      
      // ✅ Method 1: Try Firebase Auth login first
      try {
        const userCredential = await signInWithEmailAndPassword(auth, emailLower, password);
        console.log('✅ Firebase Auth login successful');
        return true;
      } catch (authError: any) {
        console.log('⚠️ Firebase Auth failed:', authError.code);
        console.log('🔍 Checking student accounts in children collection...');
        
        // ✅ Method 2: Check children collection for student accounts
        const childrenRef = ref(database, 'children');
        const childrenSnapshot = await get(childrenRef);
        
        if (childrenSnapshot.exists()) {
          const children = childrenSnapshot.val();
          const childrenCount = Object.keys(children).length;
          console.log('📚 Total children in database:', childrenCount);
          
          if (childrenCount === 0) {
            console.log('❌ No children found in database!');
            return false;
          }
          
          // Search for student with matching email
          let foundCount = 0;
          for (const childId in children) {
            foundCount++;
            const childData = children[childId];
            
            // Skip inactive children
            if (childData.isActive === false) {
              continue;
            }
            
            // Get emails and normalize them
            const studentEmail = childData.studentAccount?.email?.toLowerCase().trim();
            const childEmail = childData.email?.toLowerCase().trim();
            
            console.log(`🔍 Checking child [${childId}]:`, {
              name: childData.name,
              childEmail: childEmail,
              studentEmail: studentEmail,
              hasStudentAccount: !!childData.studentAccount,
              hasPassword: !!childData.studentAccount?.password
            });
            
            // ✅ Check if email matches
            const emailMatch = studentEmail === emailLower || childEmail === emailLower;
            
            if (emailMatch) {
              console.log(`✅ Email match found for: ${childData.name}`);
              
              // Check if student account exists
              if (!childData.studentAccount) {
                console.log('❌ Student account not created yet');
                continue;
              }
              
              // Check if password exists
              if (!childData.studentAccount.password) {
                console.log('❌ No password set for student account');
                continue;
              }
              
              // Verify password
              if (childData.studentAccount.password === password) {
                console.log('✅ Password verified!');
                
                // ✅ Get complete user data
                const userRef = ref(database, `users/${childId}`);
                const userSnapshot = await get(userRef);
                
                let userData: User = {
                  id: childId,
                  email: emailLower,
                  role: 'student',
                  name: childData.name,
                  timezone: childData.timezone || 'UTC',
                  createdAt: childData.createdAt || new Date().toISOString()
                };

                // Merge with users collection data if exists
                if (userSnapshot.exists()) {
                  const userDbData = userSnapshot.val();
                  console.log('📝 User data from users collection:', userDbData);
                  userData = {
                    ...userData,
                    name: userDbData.name || userData.name,
                    timezone: userDbData.timezone || userData.timezone,
                  };
                }
                
                // ✅ Set user state
                setUser(userData);
                
                // ✅ Store in localStorage for persistence
                localStorage.setItem('studentSession', JSON.stringify(userData));
                
                console.log('✅ Student login successful!', userData);
                return true;
              } else {
                console.log('❌ Invalid password');
                console.log('Expected:', childData.studentAccount.password);
                console.log('Provided:', password);
                return false;
              }
            }
          }
          
          console.log('❌ No matching student account found');
        } else {
          console.log('❌ No children data in database');
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
      // Check if user is logged in via Firebase Auth
      if (auth.currentUser) {
        await signOut(auth);
      }
      
      // Clear student session
      localStorage.removeItem('studentSession');
      
      setUser(null);
      console.log('✅ Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }
  };

  // ✅ Check for student session on mount
  useEffect(() => {
    // Only run after initial Firebase Auth check
    if (!loading && !user && !auth.currentUser) {
      const studentSession = localStorage.getItem('studentSession');
      if (studentSession) {
        try {
          const userData = JSON.parse(studentSession);
          console.log('🔄 Restoring student session:', userData.name);
          setUser(userData);
        } catch (error) {
          console.error('Error restoring student session:', error);
          localStorage.removeItem('studentSession');
        }
      }
    }
  }, [loading, user]);

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