
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { authService } from '@/services/api';

// Types
export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isAdmin?: boolean;
  balance: number;
  isVerified: boolean;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signin: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, phone: string, email: string, password: string) => Promise<boolean>;
  signout: () => void;
  verifyAccount: (code: string) => Promise<boolean>;
  isAdmin: boolean;
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          // Transform API format to our app format
          setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            isAdmin: userData.is_admin,
            balance: userData.balance,
            isVerified: userData.is_verified
          });
        } catch (error) {
          localStorage.removeItem('auth_token');
          console.error('Failed to load user:', error);
        }
      }
      setIsLoading(false);
    };
    
    loadUser();
  }, []);

  // Signin function
  const signin = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      await authService.signin(email, password);
      const userData = await authService.getCurrentUser();
      
      // Transform API format to our app format
      const appUser: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        isAdmin: userData.is_admin,
        balance: userData.balance,
        isVerified: userData.is_verified
      };
      
      setUser(appUser);
      
      toast({
        title: "Signin successful",
        description: `Welcome back, ${appUser.name}!`,
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Signin failed",
        description: error.response?.data?.detail || "Invalid email or password.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // signup function
  const signup = async (name: string, phone: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const userData = await authService.signup(name, phone, email, password);
      
      // Transform API format to our app format
      const appUser: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        isAdmin: userData.is_admin || false,
        balance: userData.balance,
        isVerified: userData.is_verified
      };
      
      setUser(appUser);
      
      // After registration, signin to get the token
      await authService.signin(email, password);
      
      toast({
        title: "Registration successful",
        description: "Please verify your account to continue.",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.detail || "Email already in use.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Signout function
  const signout = () => {
    authService.signout();
    setUser(null);
    toast({
      title: "Signged out",
      description: "You have been logged out successfully."
    });
  };

  // Verify account function
  const verifyAccount = async (code: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      await authService.verifyAccount(code);
      
      // Update local user state
      const updatedUser = { ...user, isVerified: true };
      setUser(updatedUser);
      
      toast({
        title: "Account verified",
        description: "Your account has been verified successfully."
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.response?.data?.detail || "Invalid verification code.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Determine admin status
  const isAdmin = !!user?.isAdmin;

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signin,
    signup,
    signout,
    verifyAccount,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
