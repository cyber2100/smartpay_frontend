import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/api";
import { errorProcess } from "@/lib/utils";

// Types
export type User = {
  id: string;
  fullname: string;
  email: string;
  phone?: string;
  isAdmin?: boolean;
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
  resendVerification: (
    verification_type: "email" | "phone"
  ) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isAdminPanelView: boolean;
  setIsAdminPanelView: React.Dispatch<React.SetStateAction<boolean>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [isAdminPanelView, setIsAdminPanelView] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      try {
        const userData = await authService.getCurrentUser();

        setUser({
          id: userData.id,
          fullname: userData.fullname,
          email: userData.email,
          phone: userData.phone,
          isAdmin: userData.is_admin,
          isVerified: userData.is_verified,
        });
      } catch (error) {
        localStorage.removeItem("auth_token");
        errorProcess(
          error,
          toast,
          "Failed to load user data. Please sign in again.",
          "destructive"
        );
      }
    }
    setIsLoading(false);
  };

  /**
   * Signs in the user.
   * @param email - The email address of the user.
   * @param password - The password of the user.
   * @returns A promise that resolves to a boolean indicating success or failure.
   */
  const signin = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      await authService.signin(email, password);
      const userData = await authService.getCurrentUser();

      const appUser: User = {
        id: userData.id,
        fullname: userData.fullname,
        email: userData.email,
        phone: userData.phone,
        isAdmin: userData.is_admin,
        isVerified: userData.is_verified,
      };

      setUser(appUser);

      toast({
        title: "Signin successful",
        description: `Welcome back, ${appUser.fullname}!`,
      });

      return true;
    } catch (error: any) {
      const defaultDescription = "Failed to sign in.";
      errorProcess(error, toast, defaultDescription, "destructive");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Signs up a new user.
   * @param name - The name of the user.
   * @param phone - The phone number of the user.
   * @param email - The email address of the user.
   * @param password - The password for the user account.
   * @returns A promise that resolves to a boolean indicating success or failure.
   */
  const signup = async (
    fullname: string,
    phone: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      const userData = await authService.signup(
        fullname,
        phone,
        email,
        password
      );

      await authService.signin(email, password);

      const appUser: User = {
        id: userData.id,
        fullname: userData.fullname,
        email: userData.email,
        phone: userData.phone,
        isAdmin: userData.is_admin || false,
        isVerified: userData.is_verified,
      };

      setUser(appUser);

      toast({
        title: "Signup successful",
        description: "Please verify your account to continue.",
      });

      return true;
    } catch (error: any) {
      errorProcess(
        error,
        toast,
        "Failed to create an account. Please try again.",
        "destructive"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Signs out the user.
  const signout = () => {
    authService.signout();
    setUser(null);

    toast({
      title: "Signed out",
      description: "You have been logged out successfully.",
    });
  };

  // Find user function - used for password reset or account recovery
  const findUser = async (emailOrPhone: string): Promise<object | null> => {
    try {
      const result = await authService.findUser(emailOrPhone);
      return result;
    } catch (error) {
      const error_res = error.response?.data;
      toast({
        title: "Warning",
        description: error_res?.detail || "User not found",
        variant: "destructive",
      });
      return null;
    }
  };

  /**
   * Verifies the user's account.
   * @param code - The verification code sent to the user.
   * @param verification_type - The type of verification (email or phone).
   * @returns A promise that resolves to a boolean indicating success or failure.
   */
  const verifyAccount = async (
    code: string,
    verification_type: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      await authService.verifyAccount(code, verification_type);

      const updatedUser = { ...user, isVerified: true };
      setUser(updatedUser);

      toast({
        title: "Account verified",
        description: "Your account has been verified successfully.",
      });

      return true;
    } catch (error: any) {
      errorProcess(
        error,
        toast,
        "Invalid verification code. Please try again.",
        "destructive"
      );
      return false;
    }
  };

  /**
   * Resends the verification code to the user.
   * @param verification_type - The type of verification (email or phone).
   * @returns A promise that resolves to a boolean indicating success or failure.
   */
  const resendVerification = async (
    verification_type: "email" | "phone"
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
      await authService.resendVerification(verification_type);

      const verificationMethod =
        verification_type === "email" ? "email" : "phone number";

      toast({
        title: "Verification code sent",
        description: `A new verification code has been sent to your ${verificationMethod}.`,
      });

      return true;
    } catch (error: any) {
      const verificationMethod =
        verification_type === "email" ? "email" : "phone number";

      errorProcess(
        error,
        toast,
        `Failed to resend verification code to your ${verificationMethod}. Please try again.`,
        "destructive"
      );
      return false;
    }
  };

  /**
   * Refreshes the user data.
   * @returns A promise that resolves to void.
   */
  const refreshUser = async (): Promise<void> => {
    if (!user) return; // Early return if no user is logged in

    try {
      const userData = await authService.getCurrentUser();

      const updatedUser: User = {
        id: userData.id,
        fullname: userData.fullname,
        email: userData.email,
        phone: userData.phone,
        isAdmin: userData.is_admin,
        isVerified: userData.is_verified,
      };

      setUser(updatedUser);
    } catch (error: any) {
      console.error("Failed to refresh user:", error);

      // If the token is invalid, sign out the user
      if (error.response?.status === 401) {
        signout();
      } else {
        toast({
          title: "Failed to refresh user data",
          description: "Could not update your profile information.",
          variant: "destructive",
        });
      }
    }
  };

  const isAdmin = !!user?.isAdmin;

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signin,
    signup,
    signout,
    verifyAccount,
    resendVerification,
    findUser,
    refreshUser,
    isAdmin,
    isAdminPanelView,
    setIsAdminPanelView,
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
