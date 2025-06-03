import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Mail, Shield, Lock, Eye, EyeOff } from "lucide-react";
import { AnimatedBackground } from '@/components/animated-background';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from '@/hooks/use-forgot-password';

interface ForgotPasswordFormData {
  email: string;
  verifyCode: string;
  newPassword: string;
  confirmPassword: string;
}

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const {
    getVerificationCode,
    verifyCode,
    resetPassword,
    isLoading,
    timeRemaining,
    isCodeExpired
  } = useForgotPassword();

  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
    verifyCode: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [step, setStep] = useState<number>(1);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handleInputChange = (field: keyof ForgotPasswordFormData, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStep1Submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!formData.email || !validateEmail(formData.email)) {
      return;
    }

    const success = await getVerificationCode(formData.email);
    if (success) {
      setStep(2);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!formData.verifyCode || formData.verifyCode.length !== 6) {
      return;
    }

    const success = await verifyCode(formData.email, formData.verifyCode);
    if (success) {
      setStep(3);
    }
  };

  const handleStep3Submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!formData.newPassword || 
        !validatePassword(formData.newPassword) || 
        formData.newPassword !== formData.confirmPassword) {
      return;
    }
    const token = localStorage.getItem('forgot-password-token');
    const success = await resetPassword(token, formData.newPassword);
    if (success) {
      setResetSuccess(true);
      setStep(4);
    }
  };

  const handleBackToLogin = (): void => {
    navigate('/signin');
  };

  const handleResendCode = async (): Promise<void> => {
    await getVerificationCode(formData.email);
  };

  // Step indicator component
  const StepIndicator = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {[
          { number: 1, title: 'Email', icon: <Mail className="h-4 w-4" /> },
          { number: 2, title: 'Verify', icon: <Shield className="h-4 w-4" /> },
          { number: 3, title: 'Reset', icon: <Lock className="h-4 w-4" /> },
          { number: 4, title: 'Complete', icon: <CheckCircle2 className="h-4 w-4" /> }
        ].map((stepInfo, index) => (
          <div key={stepInfo.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                stepInfo.number <= step ? 
                  'bg-primary text-primary-foreground' : 
                  'bg-muted text-muted-foreground'
              }`}>
                {stepInfo.number < step || (stepInfo.number === 4 && resetSuccess) ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  stepInfo.icon
                )}
              </div>
              <span className={`mt-1 text-xs font-medium transition-colors duration-300 ${
                stepInfo.number <= step ? 
                  'text-foreground' : 
                  'text-muted-foreground'
              }`}>
                {stepInfo.title}
              </span>
            </div>
            {index < 3 && (
              <div className={`flex-1 h-px mx-3 transition-all duration-500 ${
                stepInfo.number < step ? 
                  'bg-primary' : 
                  'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <AnimatedBackground />
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {resetSuccess ? "Password Reset Complete" : "Reset Password"}
          </CardTitle>
          <CardDescription className="text-center">
            {resetSuccess
              ? "Your password has been successfully reset."
              : "Follow the steps to reset your account password."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <StepIndicator />
          
          {resetSuccess ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="h-16 w-16 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Password Reset Successful!</h3>
                <p className="text-sm text-muted-foreground">
                  Your password has been updated successfully. You can now sign in with your new password.
                </p>
              </div>

              <Button onClick={handleBackToLogin} className="w-full">
                Back to Sign In
              </Button>
            </div>
          ) : (
            <div>
              {step === 1 && (
                <form onSubmit={handleStep1Submit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      We'll send a verification code to this email address.
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Verification Code"}
                  </Button>

                  <div className="text-center">
                    <Link to="/signin" className="text-sm text-primary hover:underline">
                      Back to Sign In
                    </Link>
                  </div>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleStep2Submit} className="space-y-4">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      We've sent a 6-digit verification code to
                    </p>
                    <p className="font-medium">{formData.email}</p>
                    {timeRemaining && (
                      <p className="text-xs text-muted-foreground">
                        Code expires in: <span className="font-mono font-semibold text-orange-600">{timeRemaining}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verifyCode">Verification Code</Label>
                    <Input
                      id="verifyCode"
                      type="text"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      value={formData.verifyCode}
                      onChange={(e) => handleInputChange('verifyCode', e.target.value.replace(/\D/g, ''))}
                      className="text-center font-mono text-lg"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading || isCodeExpired}>
                    {isLoading ? "Verifying..." : "Verify Code"}
                  </Button>

                  <div className="text-center space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Didn't receive the code?
                    </p>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={isLoading}
                      className="text-xs text-primary hover:underline"
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleStep3Submit} className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground">
                      Create a new password for your account
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          value={formData.newPassword}
                          onChange={(e) => handleInputChange('newPassword', e.target.value)}
                          className="pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className="pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Password must be at least 8 characters long.
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      "Resetting Password..."
                    ) : (
                      <span className="flex items-center gap-1">
                        Reset Password <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;