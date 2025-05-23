import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatedBackground } from "@/components/animated-background";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/use-auth";

type VerificationType = "email" | "phone";

const Verify: React.FC = () => {
  const [code, setCode] = useState<string>("");
  const [verificationType, setVerificationType] =
    useState<VerificationType>("email");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const { verifyAccount, user, isAuthenticated, resendVerification } = useAuth();
  const navigate = useNavigate();

  // If user is already verified or not logged in, redirect
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
    } else if (user?.isVerified) {
      navigate("/dashboard");
    }
    resendCode();
  }, [isAuthenticated, user, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Pass verification_type to the API call
      const success = await verifyAccount(code, verificationType);
      if (success) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Verification error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendCode = async (): Promise<void> => {
    // In a real app, this would trigger an API call to send a new code
    // Include verification_type in the resend request
    await resendVerification(verificationType);
    setTimeLeft(60);
    console.log(`New code sent via ${verificationType}: 123456`);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCode(e.target.value);
  };

  const handleVerificationTypeChange = (value: VerificationType): void => {
    setVerificationType(value);
    setCode(""); // Clear code when switching verification method
  };

  const getVerificationTarget = (): string => {
    if (verificationType === "email") {
      return user?.email
        ? `your email (${user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")})`
        : "your email";
    } else {
      return user?.phone
        ? `your phone (***-***-${user.phone.slice(-4)})`
        : "your phone";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <AnimatedBackground />

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            Verify your account
          </CardTitle>
          <CardDescription className="text-center">
            Choose your verification method and enter the 6-digit code
          </CardDescription>
          <div className="mt-2 p-2 bg-muted rounded-md text-center text-sm">
            <strong className="block">Demo code:</strong>
            Use "123456" for verification
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Verification method</Label>
              <RadioGroup
                value={verificationType}
                onValueChange={handleVerificationTypeChange}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email" />
                  <Label htmlFor="email" className="cursor-pointer">
                    Email verification
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phone" id="phone" />
                  <Label htmlFor="phone" className="cursor-pointer">
                    SMS verification
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-sm text-muted-foreground">
                Code will be sent to {getVerificationTarget()}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Verification code</Label>
              <Input
                id="code"
                placeholder="123456"
                value={code}
                onChange={handleCodeChange}
                required
                className="text-center text-lg tracking-widest"
                maxLength={6}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || code.length !== 6}
            >
              {isSubmitting ? "Verifying..." : "Verify account"}
            </Button>

            <div className="mt-4 text-sm text-center">
              Didn't receive a code?{" "}
              {timeLeft > 0 ? (
                <span className="text-muted-foreground">
                  Resend in {timeLeft}s
                </span>
              ) : (
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={resendCode}
                  type="button"
                >
                  Resend code
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Verify;