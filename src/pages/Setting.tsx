import React, { useState } from "react";
import { User, Mail, Phone, Lock, CheckCircle, XCircle, Bell, ArrowLeft, Send, Smartphone } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

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

export const SettingPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    notificationSettings, 
    updateDeliveryChannel, 
    verificationStatus, 
    updatePhoneNumber, 
    updatePassword, 
    isLoading 
  } = useSettings();
  
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'main' | 'profile' | 'notification'>('main');
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

  // Notification save status
  const [notificationSaveStatus, setNotificationSaveStatus] = useState<StatusMessage | null>(null);

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
  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (validatePasswordForm()) {
      const success = await updatePassword(passwordFormData.currentPassword, passwordFormData.newPassword);
      
      if (success) {
        setPasswordChangeStatus({
          success: true,
          message: "Password changed successfully.",
        });
        setPasswordFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setPasswordChangeStatus({
          success: false,
          message: "Failed to change password. Please check your current password.",
        });
      }
    }
  };

  // Handle phone form submission
  const handlePhoneSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (validatePhoneForm()) {
      const success = await updatePhoneNumber(phoneFormData.phoneNumber);
      
      if (success) {
        setPhoneChangeStatus({
          success: true,
          message: "Phone number updated successfully. Please verify your new phone number.",
        });
      } else {
        setPhoneChangeStatus({
          success: false,
          message: "Failed to update phone number. Please try again.",
        });
      }
    }
  };

  // Handle notification delivery channel change
  const handleDeliveryChannelChange = async (value: 'system' | 'email' | 'phone' | 'both'): Promise<void> => {
    const success = await updateDeliveryChannel(value);
    
    if (success) {
      setNotificationSaveStatus({
        success: true,
        message: "Notification settings updated successfully.",
      });
    } else {
      setNotificationSaveStatus({
        success: false,
        message: "Failed to update notification settings.",
      });
    }
  };

  // Handle phone verification redirect
  const handleVerifyPhone = (): void => {
    navigate("/verify");
  };

  // Handle tab change
  const handleTabChange = (value: string): void => {
    setActiveTab(value);
  };

  // Main settings view with Profile and Notification tabs
  if (currentView === 'main') {
    return (
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('profile')}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Manage your account information and security
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Update your personal information, change password, and manage account verification.
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('notification')}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Configure how you receive notifications
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Choose your preferred notification delivery method.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Profile settings view
  if (currentView === 'profile') {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => setCurrentView('main')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
        </div>
        
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
                    <Label htmlFor="phoneNumber">Phone Number</Label>
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
                  
                  <Button type="submit" disabled={isLoading}>
                    Update Phone Number
                  </Button>
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
                  
                  <Button type="submit" disabled={isLoading}>
                    Change Password
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Account Verification</CardTitle>
                <CardDescription>
                  Your account verification status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    <div>
                      <p className="font-medium">Account Status</p>
                      <p className="text-sm text-muted-foreground">Overall verification status</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {verificationStatus.isVerified ? (
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
                  <p>Verifying your account helps secure your information and enables additional features.</p>
                </div>
              </CardContent>
              <CardFooter>
                {!verificationStatus.isVerified && phoneFormData.phoneNumber && (
                  <Button variant="outline" onClick={handleVerifyPhone} disabled={isLoading}>
                    Complete Verification
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Notification settings view (simplified)
  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => setCurrentView('main')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Notification Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Delivery Channel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="h-5 w-5 mr-2" />
              Delivery Channel
            </CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={notificationSettings.deliveryChannel} 
              onValueChange={(value: 'system' | 'email' | 'phone' | 'both') => handleDeliveryChannelChange(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="email" className="cursor-pointer">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-blue-600" />
                    <div>
                      <p className="font-medium">System</p>
                      <p className="text-sm text-muted-foreground">Receive notifications via this system</p>
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="cursor-pointer">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-blue-600" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="phone" />
                <Label htmlFor="phone" className="cursor-pointer">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-green-600" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="cursor-pointer">
                  <div className="flex items-center">
                    <Smartphone className="h-4 w-4 mr-2 text-purple-600" />
                    <div>
                      <p className="font-medium">Both</p>
                      <p className="text-sm text-muted-foreground">Receive notifications via both email and SMS</p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Status Message */}
        {notificationSaveStatus && (
          <Alert variant={notificationSaveStatus.success ? "default" : "destructive"}>
            <AlertTitle>
              {notificationSaveStatus.success ? "Success" : "Error"}
            </AlertTitle>
            <AlertDescription>
              {notificationSaveStatus.message}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default SettingPage;