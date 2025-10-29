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
  studentId?: string; // For student users
  parentId?: string; // For linking students to parents
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, role: string, name: string, timezone: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loginAsStudent: (email: string, password: string) => Promise<boolean>;
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

  // Check for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // First check users collection
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
              createdAt: userData.createdAt,
              studentId: userData.studentId,
              parentId: userData.parentId
            });
          } else {
            // If not in users, check if it's a student account
            const childrenRef = ref(database, 'children');
            const childrenSnapshot = await get(childrenRef);
            
            if (childrenSnapshot.exists()) {
              const children = childrenSnapshot.val();
              const studentEntry = Object.entries(children).find(
                ([_, child]: [string, any]) => 
                  child.studentAccount?.userId === firebaseUser.uid
              );
              
              if (studentEntry) {
                const [studentId, studentData]: [string, any] = studentEntry;
                setUser({
                  id: firebaseUser.uid,
                  email: firebaseUser.email || '',
                  role: 'student',
                  name: studentData.name,
                  timezone: studentData.timezone || 'UTC',
                  createdAt: studentData.createdAt || new Date().toISOString(),
                  studentId: studentId,
                  parentId: studentData.parentId
                });
              } else {
                await signOut(auth);
                setUser(null);
              }
            } else {
              await signOut(auth);
              setUser(null);
            }
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

  // Check for student session on mount
  useEffect(() => {
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const emailLower = email.toLowerCase().trim();
      console.log('🔐 Attempting login for:', emailLower);
      
      // Try Firebase Auth login first
      const userCredential = await signInWithEmailAndPassword(auth, emailLower, password);
      console.log('✅ Firebase Auth login successful');
      
      // Check if user exists in users collection
      const userRef = ref(database, `users/${userCredential.user.uid}`);
      const userSnapshot = await get(userRef);
      
      if (userSnapshot.exists()) {
        // Regular user (parent, teacher, admin)
        return true;
      }
      
      // Check if it's a student account
      const childrenRef = ref(database, 'children');
      const childrenSnapshot = await get(childrenRef);
      
      if (childrenSnapshot.exists()) {
        const children = childrenSnapshot.val();
        const studentEntry = Object.entries(children).find(
          ([_, child]: [string, any]) => 
            child.studentAccount?.userId === userCredential.user.uid
        );
        
        if (studentEntry) {
          const [studentId, studentData]: [string, any] = studentEntry;
          
          const userData: User = {
            id: userCredential.user.uid,
            email: emailLower,
            role: 'student',
            name: studentData.name,
            timezone: studentData.timezone || 'UTC',
            createdAt: studentData.createdAt || new Date().toISOString(),
            studentId: studentId,
            parentId: studentData.parentId
          };
          
          setUser(userData);
          localStorage.setItem('studentSession', JSON.stringify(userData));
          console.log('✅ Student login successful!');
          return true;
        }
      }
      
      // If we get here, the user exists in Auth but not in our database
      await signOut(auth);
      console.log('❌ User not found in database');
      return false;
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // If Firebase Auth fails, try direct student login
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        return await loginAsStudent(email, password);
      }
      
      return false;
    }
  };

  const loginAsStudent = async (email: string, password: string): Promise<boolean> => {
    try {
      const emailLower = email.toLowerCase().trim();
      console.log('🔍 Checking student accounts...');
      
      const childrenRef = ref(database, 'children');
      const childrenSnapshot = await get(childrenRef);
      
      if (childrenSnapshot.exists()) {
        const children = childrenSnapshot.val();
        
        // Search for student with matching credentials
        for (const childId in children) {
          const childData = children[childId];
          
          // Skip inactive children
          if (childData.isActive === false) continue;
          
          const studentEmail = childData.studentAccount?.email?.toLowerCase().trim() || 
                             childData.email?.toLowerCase().trim();
          
          if (studentEmail === emailLower) {
            // Check password
            if (childData.studentAccount?.password === password || 
                childData.password === password) {
              
              console.log('✅ Student credentials verified!');
              
              // Create user session
              const userData: User = {
                id: childId,
                email: emailLower,
                role: 'student',
                name: childData.name,
                timezone: childData.timezone || 'UTC',
                createdAt: childData.createdAt || new Date().toISOString(),
                studentId: childId,
                parentId: childData.parentId
              };
              
              setUser(userData);
              localStorage.setItem('studentSession', JSON.stringify(userData));
              
              // Try to create Firebase Auth account if doesn't exist
              try {
                await createUserWithEmailAndPassword(auth, emailLower, password);
                console.log('✅ Firebase Auth account created for student');
                
                // Update student record with auth user ID
                const updateRef = ref(database, `children/${childId}/studentAccount`);
                await set(updateRef, {
                  ...childData.studentAccount,
                  userId: auth.currentUser?.uid
                });
              } catch (authError: any) {
                if (authError.code === 'auth/email-already-in-use') {
                  console.log('⚠️ Firebase Auth account already exists');
                } else {
                  console.log('⚠️ Could not create Firebase Auth account:', authError.message);
                }
              }
              
              return true;
            }
          }
        }
      }
      
      console.log('❌ No matching student account found');
      return false;
      
    } catch (error) {
      console.error('❌ Student login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, role: string, name: string, timezone: string): Promise<boolean> => {
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
      // Clear student session
      localStorage.removeItem('studentSession');
      
      // Sign out from Firebase Auth if logged in
      if (auth.currentUser) {
        await signOut(auth);
      }
      
      setUser(null);
      console.log('✅ Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    loginAsStudent
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}