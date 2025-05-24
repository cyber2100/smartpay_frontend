import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/api";

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
  signup: (
    name: string,
    phone: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  signout: () => void;
  findUser: (emailOrPhone: string) => Promise<object | null>;
  verifyAccount: (code: string, verification_type: string) => Promise<boolean>;
  resendVerification: (verification_type: 'email' | 'phone') => Promise<boolean>;
  isAdmin: boolean;
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("auth_token");
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
            isVerified: userData.is_verified,
          });
        } catch (error) {
          localStorage.removeItem("auth_token");
          console.error("Failed to load user:", error);
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
        isVerified: userData.is_verified,
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
        description:
          error.response?.data?.detail || "Invalid email or password.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // signup function
  const signup = async (
    name: string,
    phone: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      const userData = await authService.signup(name, phone, email, password);

      // Transform API format to our app format
      const appUser: User = {
        id: userData.id,
        name: userData.fullname,
        email: userData.email,
        phone: userData.phone,
        isAdmin: userData.is_admin || false,
        balance: userData.balance,
        isVerified: userData.is_verified,
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
        variant: "destructive",
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
      title: "Signed out",
      description: "You have been logged out successfully.",
    });
  };

  const findUser = async (emailOrPhone: string): Promise<object | null> => {
    try {
      const result = await authService.findUser(emailOrPhone);
      return result;
    } catch (error) {
      const error_res = error.response?.data?.error;
      toast ({title: 'Warning', description: error_res.message});
      return null;
    }
  }

  // Verify account function
  const verifyAccount = async (
    code: string,
    verification_type: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      await authService.verifyAccount(code, verification_type);

      // Update local user state
      const updatedUser = { ...user, isVerified: true };
      setUser(updatedUser);

      toast({
        title: "Account verified",
        description: "Your account has been verified successfully.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description:
          error.response?.data?.detail || "Invalid verification code.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Resend verification function
  const resendVerification = async (
    verification_type: 'email' | 'phone'
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to resend verification.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const response = await authService.resendVerification(verification_type);
      
      const verificationMethod = verification_type === 'email' ? 'email' : 'phone number';
      
      toast({
        title: "Verification code sent",
        description: `A new verification code has been sent to your ${verificationMethod}.`,
      });

      // Optional: Log the mock code for development (remove in production)
      if (response?.code) {
        console.log(`Mock verification code: ${response.code}`);
      }

      return true;
    } catch (error: any) {
      const verificationMethod = verification_type === 'email' ? 'email' : 'phone number';
      
      toast({
        title: "Failed to resend verification",
        description:
          error.response?.data?.detail || 
          `Could not send verification code to your ${verificationMethod}. Please try again.`,
        variant: "destructive",
      });
      return false;
    }
  };

  // Determine admin status
  const isAdmin = !!user?.isAdmin;

  const value = {
    user,
    isAuthenticated: 
      // true, 
      !!user,
    isLoading,
    signin,
    signup,
    signout,
    verifyAccount,
    resendVerification,
    findUser,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};