import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types/library';
import * as api from '@/lib/api';
import {
  recordFailedAttempt, isLockedOut, clearAttempts,
  sanitizeInput, isValidEmail,
} from '@/lib/security';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string; waitSeconds?: number }>;
  logout: () => Promise<void>;
  selectedDepartment: string | null;
  setSelectedDepartment: (id: string | null) => void;
  selectedLibrary: string | null;
  setSelectedLibrary: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function deserializeUser(raw: string): User | null {
  try {
    const p = JSON.parse(raw);
    if (typeof p.id === 'string' && typeof p.email === 'string' && ['admin','librarian','citizen'].includes(p.role)) return p as User;
    return null;
  } catch { return null; }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('lms_user');
    return raw ? deserializeUser(raw) : null;
  });

  const [selectedDepartment, setSelectedDepartmentState] = useState<string | null>(() => localStorage.getItem('lms_dept'));
  const [selectedLibrary, setSelectedLibraryState] = useState<string | null>(() => localStorage.getItem('lms_lib'));

  // Restore user from /me on mount (validates token is still good)
  useEffect(() => {
    if (api.getAccessToken()) {
      api.auth.me().then(u => {
        setUser(u);
        localStorage.setItem('lms_user', JSON.stringify(u));
        if (u.role === 'librarian' && u.libraryId) {
          setSelectedLibraryState(u.libraryId);
          localStorage.setItem('lms_lib', u.libraryId);
        }
      }).catch(() => {
        // Token invalid — clear everything
        api.clearTokens();
        localStorage.removeItem('lms_user');
        setUser(null);
      });
    }
  }, []);

  const login = async (rawEmail: string, rawPassword: string, role: UserRole) => {
    const email = sanitizeInput(rawEmail).toLowerCase();
    const password = sanitizeInput(rawPassword);

    if (!email || !password) return { success: false, error: 'Please enter your email and password.' };
    if (!isValidEmail(email)) return { success: false, error: 'Please enter a valid email address.' };

    const lockStatus = isLockedOut(email);
    if (lockStatus.locked) return { success: false, error: `Too many failed attempts. Try again in ${lockStatus.waitSeconds}s.`, waitSeconds: lockStatus.waitSeconds };

    try {
      const data = await api.auth.login(email, password, role);
      clearAttempts(email);
      api.setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      localStorage.setItem('lms_user', JSON.stringify(data.user));
      if (data.user.role === 'librarian' && data.user.libraryId) {
        setSelectedLibraryState(data.user.libraryId);
        localStorage.setItem('lms_lib', data.user.libraryId);
      }
      return { success: true };
    } catch (err: any) {
      const result = recordFailedAttempt(email);
      if (result.locked) return { success: false, error: `Too many failed attempts. Try again in ${result.waitSeconds}s.`, waitSeconds: result.waitSeconds };
      return { success: false, error: err.message ?? 'Invalid credentials. Please try again.' };
    }
  };

  const logout = async () => {
    try { await api.auth.logout(); } catch {}
    api.clearTokens();
    setUser(null);
    setSelectedDepartmentState(null);
    setSelectedLibraryState(null);
    localStorage.removeItem('lms_user');
    localStorage.removeItem('lms_dept');
    localStorage.removeItem('lms_lib');
  };

  const setSelectedDepartment = (id: string | null) => {
    setSelectedDepartmentState(id);
    if (id) localStorage.setItem('lms_dept', id); else localStorage.removeItem('lms_dept');
  };

  const setSelectedLibrary = (id: string | null) => {
    setSelectedLibraryState(id);
    if (id) localStorage.setItem('lms_lib', id); else localStorage.removeItem('lms_lib');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, selectedDepartment, setSelectedDepartment, selectedLibrary, setSelectedLibrary }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
