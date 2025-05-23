import React, { useState } from "react";
import { User, Mail, Phone, Lock, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

// Define interfaces for form data and status
interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordFormErrors {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PhoneFormData {
  phoneNumber: string;
}

interface PhoneFormErrors {
  phoneNumber: string;
}

interface StatusMessage {
  success: boolean;
  message: string;
}

interface VerificationStatus {
  email: boolean;
  phone: boolean;
}

export const SettingPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("account");

  // Password change state
  const [passwordFormData, setPasswordFormData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordFormErrors, setPasswordFormErrors] = useState<PasswordFormErrors>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<StatusMessage | null>(null);

  // Contact info state
  const [phoneFormData, setPhoneFormData] = useState<PhoneFormData>({
    phoneNumber: user?.phone || "",
  });
  const [phoneFormErrors, setPhoneFormErrors] = useState<PhoneFormErrors>({
    phoneNumber: "",
  });
  const [phoneChangeStatus, setPhoneChangeStatus] = useState<StatusMessage | null>(null);

  // Verification status - this would typically come from your auth context or API
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    email: true, // Assuming email is verified since they're logged in
    phone: user?.isVerified || false,
  });

  // Handle password form input changes
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setPasswordFormData({
      ...passwordFormData,
      [name]: value,
    });
    // Clear error when user types
    setPasswordFormErrors({
      ...passwordFormErrors,
      [name]: "",
    });
    // Clear status when user makes changes
    setPasswordChangeStatus(null);
  };

  // Handle phone form input changes
  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setPhoneFormData({
      ...phoneFormData,
      [name]: value,
    });
    // Clear error when user types
    setPhoneFormErrors({
      ...phoneFormErrors,
      [name]: "",
    });
    // Clear status when user makes changes
    setPhoneChangeStatus(null);
  };

  // Validate password form
  const validatePasswordForm = (): boolean => {
    let isValid = true;
    const errors: PasswordFormErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!passwordFormData.currentPassword) {
      errors.currentPassword = "Current password is required";
      isValid = false;
    }

    if (!passwordFormData.newPassword) {
      errors.newPassword = "New password is required";
      isValid = false;
    } else if (passwordFormData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
      isValid = false;
    }

    if (!passwordFormData.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
      isValid = false;
    } else if (passwordFormData.confirmPassword !== passwordFormData.newPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setPasswordFormErrors(errors);
    return isValid;
  };

  // Validate phone form
  const validatePhoneForm = (): boolean => {
    let isValid = true;
    const errors: PhoneFormErrors = {
      phoneNumber: "",
    };

    if (!phoneFormData.phoneNumber) {
      errors.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (!/^\+?[0-9]{10,15}$/.test(phoneFormData.phoneNumber)) {
      errors.phoneNumber = "Please enter a valid phone number";
      isValid = false;
    }

    setPhoneFormErrors(errors);
    return isValid;
  };

  // Handle password form submission
  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    if (validatePasswordForm()) {
      // Simulating API call for password change
      // In a real app, you would call your auth service here
      setTimeout(() => {
        // For demo purposes sometimes show success, sometimes failure
        if (passwordFormData.currentPassword === "wrongpassword") {
          setPasswordChangeStatus({
            success: false,
            message: "Current password is incorrect. Please try again.",
          });
        } else {
          setPasswordChangeStatus({
            success: true,
            message: "Password changed successfully.",
          });
          // Reset form on success
          setPasswordFormData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        }
      }, 1000);
    }
  };

  // Handle phone form submission
  const handlePhoneSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    if (validatePhoneForm()) {
      // Simulating API call for phone change
      // In a real app, you would call your auth service here
      setTimeout(() => {
        // For demo purposes sometimes show success, sometimes failure
        if (phoneFormData.phoneNumber === "+12345678900") {
          setPhoneChangeStatus({
            success: false,
            message: "This phone number is already in use. Please try a different one.",
          });
        } else {
          setPhoneChangeStatus({
            success: true,
            message: "Phone number updated successfully. A verification code has been sent to your phone.",
          });
          // We'd typically send a verification code here and prompt the user to verify
        }
      }, 1000);
    }
  };

  // Handle phone verification
  const handleVerifyPhone = (): void => {
    // In a real app, this would open a modal for verification code
    // For demo purposes, we'll just set it to verified
    setVerificationStatus({
      ...verificationStatus,
      phone: true,
    });
  };

  // Handle tab change
  const handleTabChange = (value: string): void => {
    setActiveTab(value);
  };

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs 
        defaultValue="account" 
        value={activeTab}
        onValueChange={handleTabChange} 
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="account">Account Information</TabsTrigger>
          <TabsTrigger value="security">Security & Verification</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Manage your personal account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-muted-foreground">
                      <User className="h-4 w-4" />
                    </div>
                    <Input 
                      id="fullName" 
                      className="pl-10" 
                      value={user?.name || ""} 
                      disabled 
                      readOnly
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                    </div>
                    <Input 
                      id="email" 
                      className="pl-10" 
                      value={user?.email || ""} 
                      disabled 
                      readOnly
                    />
                  </div>
                </div>
              </div>
              
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">
                    Phone Number
                    {verificationStatus.phone ? (
                      <span className="ml-2 inline-flex items-center text-sm text-green-500">
                        <CheckCircle className="h-4 w-4 mr-1" /> Verified
                      </span>
                    ) : (
                      <span className="ml-2 inline-flex items-center text-sm text-amber-500">
                        <XCircle className="h-4 w-4 mr-1" /> Unverified
                      </span>
                    )}
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                    </div>
                    <Input 
                      id="phoneNumber"
                      name="phoneNumber"
                      className="pl-10" 
                      placeholder="+1 (234) 567-8901"
                      value={phoneFormData.phoneNumber}
                      onChange={handlePhoneInputChange}
                      type="tel"
                    />
                  </div>
                  {phoneFormErrors.phoneNumber && (
                    <p className="text-sm text-destructive">{phoneFormErrors.phoneNumber}</p>
                  )}
                </div>
                
                {phoneChangeStatus && (
                  <Alert variant={phoneChangeStatus.success ? "default" : "destructive"}>
                    <AlertTitle>
                      {phoneChangeStatus.success ? "Success" : "Error"}
                    </AlertTitle>
                    <AlertDescription>
                      {phoneChangeStatus.message}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex space-x-2">
                  <Button type="submit">
                    Update Phone Number
                  </Button>
                  {!verificationStatus.phone && phoneChangeStatus?.success && (
                    <Button type="button" variant="outline" onClick={handleVerifyPhone}>
                      Verify Phone Number
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input 
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      className="pl-10" 
                      value={passwordFormData.currentPassword}
                      onChange={handlePasswordInputChange}
                      autoComplete="current-password"
                    />
                  </div>
                  {passwordFormErrors.currentPassword && (
                    <p className="text-sm text-destructive">{passwordFormErrors.currentPassword}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input 
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      className="pl-10" 
                      value={passwordFormData.newPassword}
                      onChange={handlePasswordInputChange}
                      autoComplete="new-password"
                    />
                  </div>
                  {passwordFormErrors.newPassword && (
                    <p className="text-sm text-destructive">{passwordFormErrors.newPassword}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input 
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      className="pl-10" 
                      value={passwordFormData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      autoComplete="new-password"
                    />
                  </div>
                  {passwordFormErrors.confirmPassword && (
                    <p className="text-sm text-destructive">{passwordFormErrors.confirmPassword}</p>
                  )}
                </div>
                
                {passwordChangeStatus && (
                  <Alert variant={passwordChangeStatus.success ? "default" : "destructive"}>
                    <AlertTitle>
                      {passwordChangeStatus.success ? "Success" : "Error"}
                    </AlertTitle>
                    <AlertDescription>
                      {passwordChangeStatus.message}
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button type="submit">
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Verification</CardTitle>
              <CardDescription>
                Verification status of your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  <div>
                    <p className="font-medium">Email Address</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {verificationStatus.email ? (
                    <div className="flex items-center text-green-500">
                      <CheckCircle className="h-5 w-5 mr-1" />
                      <span>Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-500">
                      <XCircle className="h-5 w-5 mr-1" />
                      <span>Unverified</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  <div>
                    <p className="font-medium">Phone Number</p>
                    <p className="text-sm text-muted-foreground">{phoneFormData.phoneNumber || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {verificationStatus.phone ? (
                    <div className="flex items-center text-green-500">
                      <CheckCircle className="h-5 w-5 mr-1" />
                      <span>Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-500">
                      <XCircle className="h-5 w-5 mr-1" />
                      <span>Unverified</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Verifying your contact information helps secure your account and enables additional features like transaction notifications.</p>
              </div>
            </CardContent>
            <CardFooter>
              {!verificationStatus.phone && phoneFormData.phoneNumber && (
                <Button variant="outline" onClick={handleVerifyPhone}>
                  Verify Phone Number
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingPage;