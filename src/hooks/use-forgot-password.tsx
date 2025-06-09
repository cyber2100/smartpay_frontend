/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/api";
import { errorProcess } from "@/lib/utils";

interface UseForgotPasswordReturn {
  getVerificationCode: (email: string) => Promise<boolean>;
  verifyCode: (email: string, code: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  resendCode: (email: string) => Promise<boolean>;
  isLoading: boolean;
  timeRemaining: string;
  isCodeExpired: boolean;
}

export const useForgotPassword = (): UseForgotPasswordReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [codeExpireTime, setCodeExpireTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isCodeExpired, setIsCodeExpired] = useState(false);
  const { toast } = useToast();

  // Timer for verification code expiry
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (codeExpireTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const remaining = codeExpireTime - now;

        if (remaining <= 0) {
          setTimeRemaining("Expired");
          setIsCodeExpired(true);
          clearInterval(interval);
        } else {
          const minutes = Math.floor(remaining / 60000);
          const seconds = Math.floor((remaining % 60000) / 1000);
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`);
          setIsCodeExpired(false);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [codeExpireTime]);

  // Function to get verification code for email
  const getVerificationCode = useCallback(
    async (email: string): Promise<boolean> => {
      if (!email) {
        toast({
          title: "Email required",
          description: "Please enter your email address.",
          variant: "destructive",
        });
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return false;
      }

      setIsLoading(true);

      try {
        const response = await authService.sendPasswordResetCode(email);

        if (response.success) {
          // Set expiration time (typically 1 minute from now)
          const expireTime = Date.now() + 1 * 60 * 1000;
          setCodeExpireTime(expireTime);

          toast({
            title: "Verification email sent",
            description: "Please check your email for the verification code.",
          });

          return true;
        } else {
          toast({
            title: "Failed to send email",
            description: response.message || "Please try again.",
            variant: "destructive",
          });
          return false;
        }
      } catch (error: any) {
        errorProcess(
          error,
          toast,
          "There was an error sending the verification email. Please try again.",
          "destructive"
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Function to verify the code
  const verifyCode = useCallback(
    async (email: string, code: string): Promise<boolean> => {
      if (!code) {
        toast({
          title: "Verification code required",
          description: "Please enter the verification code from your email.",
          variant: "destructive",
        });
        return false;
      }

      if (code.length !== 6) {
        toast({
          title: "Invalid code format",
          description: "Verification code must be 6 digits.",
          variant: "destructive",
        });
        return false;
      }

      if (isCodeExpired) {
        toast({
          title: "Code expired",
          description:
            "The verification code has expired. Please request a new one.",
          variant: "destructive",
        });
        return false;
      }

      setIsLoading(true);

      try {
        const response = await authService.verifyPasswordResetCode(email, code);

        localStorage.setItem("forgot-password-token", response.token); // Store token for reseting paswsword

        if (response.success) {
          toast({
            title: "Code verified",
            description: "Please enter your new password.",
          });
          return true;
        } else {
          toast({
            title: "Verification failed",
            description: response.message || "Invalid verification code.",
            variant: "destructive",
          });
          return false;
        }
      } catch (error: any) {
        errorProcess(
          error,
          toast,
          "There was an error verifying your code. Please try again.",
          "destructive"
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [toast, isCodeExpired]
  );

  // Function to reset password
  const resetPassword = useCallback(
    async (token: string, newPassword: string): Promise<boolean> => {
      if (!newPassword) {
        toast({
          title: "Password required",
          description: "Please enter a new password.",
          variant: "destructive",
        });
        return false;
      }

      if (newPassword.length < 8) {
        toast({
          title: "Password too weak",
          description: "Password must be at least 8 characters long.",
          variant: "destructive",
        });
        return false;
      }

      setIsLoading(true);

      try {
        const response = await authService.resetPassword(token, newPassword);

        if (response.success) {
          toast({
            title: "Password reset successful",
            description: "Your password has been updated successfully.",
          });

          // Clear the timer
          setCodeExpireTime(null);
          setTimeRemaining("");
          setIsCodeExpired(false);
          localStorage.removeItem("forgot-password-token"); // Clear stored token

          return true;
        } else {
          toast({
            title: "Password reset failed",
            description: response.message || "Please try again.",
            variant: "destructive",
          });
          return false;
        }
      } catch (error: any) {
        errorProcess(
          error,
          toast,
          "There was an error resetting your password. Please try again.",
          "destructive"
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const resendCode = useCallback(
    async (email: string): Promise<boolean> => {
      return await getVerificationCode(email);
    },
    [getVerificationCode]
  );

  return {
    getVerificationCode,
    verifyCode,
    resetPassword,
    resendCode,
    isLoading,
    timeRemaining,
    isCodeExpired,
  };
};
