import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, database } from '../../firebase/config';

export interface User {
  id: string;
  email: string;
  role: 'parent' | 'teacher' | 'student' | 'admin';
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean; // Corrected: Renamed 'loading' to 'isLoading' to match the LoginForm component
  login: (email: string, password: string) => Promise<boolean>; // Corrected: Changed return type to boolean
  
  register: (email: string, password: string, role: string, name: string) => Promise<boolean>; // Corrected: Changed return type to boolean
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
  const [isLoading, setIsLoading] = useState(true); // Corrected: Renamed state variable to 'isLoading'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Get user data from Realtime Database
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
              createdAt: userData.createdAt
            });
          } else {
            // If user data doesn't exist in database, sign out
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
      setIsLoading(false); // Corrected
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, role: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Save user data to Realtime Database
      const userData = {
        email: firebaseUser.email,
        role: role,
        name: name,
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
    isLoading, // Corrected: Passed 'isLoading' here
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