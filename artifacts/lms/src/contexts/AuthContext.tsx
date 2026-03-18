import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types/library';
import { users } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  selectedDepartment: string | null;
  setSelectedDepartment: (id: string | null) => void;
  selectedLibrary: string | null;
  setSelectedLibrary: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state from localStorage
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(() => {
    return localStorage.getItem('selectedDepartment');
  });
  
  const [selectedLibrary, setSelectedLibrary] = useState<string | null>(() => {
    return localStorage.getItem('selectedLibrary');
  });

  const login = (email: string, password: string, role: UserRole): boolean => {
    // Find user by email, password, and role
    const foundUser = users.find(
      u => u.email === email && u.password === password && u.role === role
    );

    if (foundUser) {
      // Set user without password
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword as User);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));

      // For librarians, auto-select their assigned library
      if (foundUser.role === 'librarian' && foundUser.libraryId) {
        setSelectedLibrary(foundUser.libraryId);
        localStorage.setItem('selectedLibrary', foundUser.libraryId);
      }

      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    setSelectedDepartment(null);
    setSelectedLibrary(null);
    localStorage.removeItem('user');
    localStorage.removeItem('selectedDepartment');
    localStorage.removeItem('selectedLibrary');
  };

  const handleSetSelectedDepartment = (id: string | null) => {
    setSelectedDepartment(id);
    if (id) {
      localStorage.setItem('selectedDepartment', id);
    } else {
      localStorage.removeItem('selectedDepartment');
    }
  };

  const handleSetSelectedLibrary = (id: string | null) => {
    setSelectedLibrary(id);
    if (id) {
      localStorage.setItem('selectedLibrary', id);
    } else {
      localStorage.removeItem('selectedLibrary');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      selectedDepartment,
      setSelectedDepartment: handleSetSelectedDepartment,
      selectedLibrary,
      setSelectedLibrary: handleSetSelectedLibrary,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
