import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AnimatedBackground } from '@/components/animated-background';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/hooks/use-auth';
import { Eye, EyeOff } from 'lucide-react';

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [error, setError] = useState('');
  
  const { signin } = useAuth();
  const navigate = useNavigate();

  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 60; // 60 seconds

  // Load attempt data from localStorage on component mount
  useEffect(() => {
    const storedData = localStorage.getItem('signin_attempts');
    if (storedData) {
      const { count, timestamp } = JSON.parse(storedData);
      const now = Date.now();
      const timeDiff = (now - timestamp) / 1000;

      if (count >= MAX_ATTEMPTS && timeDiff < LOCKOUT_DURATION) {
        setAttemptCount(count);
        setIsRateLimited(true);
        setRemainingTime(Math.ceil(LOCKOUT_DURATION - timeDiff));
      } else if (timeDiff >= LOCKOUT_DURATION) {
        localStorage.removeItem('signin_attempts');
        setAttemptCount(0);
      } else {
        setAttemptCount(count);
      }
    }
  }, []);

  // Countdown timer for rate limiting
  useEffect(() => {
    let timer;
    if (isRateLimited && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            setIsRateLimited(false);
            setAttemptCount(0);
            localStorage.removeItem('signin_attempts');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRateLimited, remainingTime]);

  const updateAttemptCount = (newCount) => {
    const timestamp = Date.now();
    localStorage.setItem('signin_attempts', JSON.stringify({ 
      count: newCount, 
      timestamp 
    }));
    setAttemptCount(newCount);

    if (newCount >= MAX_ATTEMPTS) {
      setIsRateLimited(true);
      setRemainingTime(LOCKOUT_DURATION);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRateLimited) {
      setError(`Too many attempts. Please wait ${remainingTime} seconds.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await signin(email, password);
      if (success) {
        localStorage.removeItem('signin_attempts');
        setAttemptCount(0);
        navigate('/dashboard');
      } else {
        const newCount = attemptCount + 1;
        updateAttemptCount(newCount);
        setError('Invalid email or password');
      }
    } catch (error) {
      const newCount = attemptCount + 1;
      updateAttemptCount(newCount);
      setError('An error occurred during signin. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground />
      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign in to your account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={isRateLimited}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isRateLimited}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  disabled={isRateLimited}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            {attemptCount > 0 && attemptCount < MAX_ATTEMPTS && !isRateLimited && (
              <div className="text-yellow-600 text-sm text-center">
                Warning: {attemptCount}/{MAX_ATTEMPTS} failed attempts. 
                Account will be temporarily locked after {MAX_ATTEMPTS} attempts.
              </div>
            )}
            {isRateLimited && (
              <div className="text-red-500 text-sm text-center font-medium">
                Too many failed attempts. Please wait {formatTime(remainingTime)} before trying again.
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || isRateLimited}
            >
              {isSubmitting 
                ? "Signing in..." 
                : isRateLimited 
                  ? `Wait ${formatTime(remainingTime)}` 
                  : "Sign in"
              }
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-gray-600 w-full">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signin;