import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, apiConfig } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (requiredRoles: string[]) => boolean;
  isConfigured: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const config = apiConfig.get();
      
      // Check if API is configured
      if (!config.baseUrl) {
        setIsLoading(false);
        return;
      }

      // Check if user has token
      if (!config.token) {
        setIsLoading(false);
        return;
      }

      try {
        // Verify token and get user profile
        const response = await api.getProfile();
        setUser(response.user as User);
      } catch (error) {
        console.error('Auth verification failed:', error);
        // Clear invalid token
        apiConfig.setToken(undefined);
        toast({
          title: "Session expired",
          description: "Please log in again",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [toast]);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);
      apiConfig.setToken(response.token);
      setUser(response.user as User);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${response.user.name}`,
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    apiConfig.setToken(undefined);
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const hasPermission = (requiredRoles: string[]) => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  const isConfigured = () => {
    return apiConfig.isConfigured();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasPermission, isConfigured }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}