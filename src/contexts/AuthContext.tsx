import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '../types';
import { usersStorage, currentUserStorage, initializeLocalStorage } from '../utils/localStorage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Inicializar localStorage con datos de demostración
    initializeLocalStorage();
    
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = currentUserStorage.get();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = usersStorage.getAll();
    const foundUser = users.find(
      u => u.email === email && u.password === password && u.activo
    );

    if (foundUser) {
      const userWithoutPassword = { ...foundUser };
      delete userWithoutPassword.password;
      setUser(userWithoutPassword);
      currentUserStorage.set(userWithoutPassword);
      return true;
    }
    return false;
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<boolean> => {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verificar si el email ya existe
    const users = usersStorage.getAll();
    const emailExists = users.some(u => u.email === userData.email);
    if (emailExists) {
      return false;
    }

    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      rol: 'Cliente', // Por defecto registra como cliente
    };

    // Guardar en localStorage
    usersStorage.add(newUser);
    
    // Auto-login después de registro
    const userWithoutPassword = { ...newUser };
    delete userWithoutPassword.password;
    setUser(userWithoutPassword);
    currentUserStorage.set(userWithoutPassword);
    
    return true;
  };

  const logout = () => {
    setUser(null);
    currentUserStorage.clear();
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};