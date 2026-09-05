import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  name: string;
  email: string;
  merchantName: string;
  merchantId: string;
}

export interface RegisteredUser extends User {
  password: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, merchantName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper to retrieve the current list of registered users
  const getRegisteredUsers = (): RegisteredUser[] => {
    const list = localStorage.getItem('recoverai_registered_users');
    if (!list) {
      // Default admin account seed
      const defaultList: RegisteredUser[] = [
        {
          name: 'Admin',
          email: 'admin@recoverai.com',
          password: 'password123',
          merchantName: 'Apex Retail Hub',
          merchantId: '#MER-9821'
        }
      ];
      localStorage.setItem('recoverai_registered_users', JSON.stringify(defaultList));
      return defaultList;
    }
    try {
      return JSON.parse(list);
    } catch (e) {
      return [];
    }
  };

  useEffect(() => {
    // Check localStorage on mount
    const savedUser = localStorage.getItem('recoverai_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('recoverai_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const users = getRegisteredUsers();
    const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!matchedUser) {
      throw new Error('This email is not registered. Please create an account.');
    }
    if (matchedUser.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    const activeUser: User = {
      name: matchedUser.name,
      email: matchedUser.email,
      merchantName: matchedUser.merchantName,
      merchantId: matchedUser.merchantId
    };
    setUser(activeUser);
    localStorage.setItem('recoverai_user', JSON.stringify(activeUser));
  };

  const signup = async (name: string, email: string, password: string, merchantName: string): Promise<void> => {
    if (!name.trim()) throw new Error('Full name is required.');
    if (!email.includes('@')) throw new Error('Invalid email address.');
    if (password.length < 6) throw new Error('Password must be at least 6 characters.');
    if (!merchantName.trim()) throw new Error('Merchant name is required.');

    const users = getRegisteredUsers();
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      throw new Error('This email is already registered. Please sign in instead.');
    }

    const newUser: RegisteredUser = {
      name: name,
      email: email,
      password: password,
      merchantName: merchantName,
      merchantId: `#MER-${Math.floor(1000 + Math.random() * 9000)}`
    };

    // Save to local user table
    users.push(newUser);
    localStorage.setItem('recoverai_registered_users', JSON.stringify(users));

    // Set as active session
    const activeUser: User = {
      name: newUser.name,
      email: newUser.email,
      merchantName: newUser.merchantName,
      merchantId: newUser.merchantId
    };
    setUser(activeUser);
    localStorage.setItem('recoverai_user', JSON.stringify(activeUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('recoverai_user');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs font-mono text-indigo-400">
        Authenticating...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
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
