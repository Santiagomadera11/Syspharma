import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'empleado' | 'cliente';
  avatar?: string;
  active: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuarios mock para demo
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin Principal',
    email: 'admin@syspharma.com',
    role: 'admin',
    active: true,
  },
  {
    id: '2',
    name: 'Empleado Demo',
    email: 'empleado@syspharma.com',
    role: 'empleado',
    active: true,
  },
  {
    id: '3',
    name: 'Cliente Demo',
    email: 'cliente@syspharma.com',
    role: 'cliente',
    active: true,
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Cargar usuario desde localStorage
    const storedUser = localStorage.getItem('syspharma_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simular llamada API
    await new Promise(resolve => setTimeout(resolve, 500));

    const foundUser = MOCK_USERS.find(u => u.email === email);
    
    if (!foundUser) {
      throw new Error('Email no registrado');
    }

    if (!foundUser.active) {
      throw new Error('Usuario inactivo');
    }

    // En producción, verificar contraseña
    // Por ahora cualquier contraseña funciona para demo
    if (password.length < 8) {
      throw new Error('Contraseña incorrecta');
    }

    setUser(foundUser);
    localStorage.setItem('syspharma_user', JSON.stringify(foundUser));
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    // Simular llamada API
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verificar si el email ya existe
    const existingUser = MOCK_USERS.find(u => u.email === email);
    if (existingUser) {
      throw new Error('Este email ya está registrado');
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role: role as 'admin' | 'empleado' | 'cliente',
      active: true,
    };

    MOCK_USERS.push(newUser);
    setUser(newUser);
    localStorage.setItem('syspharma_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('syspharma_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
