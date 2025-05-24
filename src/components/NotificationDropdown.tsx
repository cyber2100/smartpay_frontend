import React, { useState } from "react";
import { User, Mail, Phone, Lock, CheckCircle, XCircle, Bell, ArrowLeft, Send } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
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

interface NotificationSettings {
  deliveryChannel: 'email' | 'phone' | 'both';
}

export const SettingPage: React.FC = () => {
  const { user } = useAuth();
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

  // Verification status - this would typically come from your auth context or API
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    email: true, // Assuming email is verified since they're logged in
    phone: user?.isVerified || false,
  });

  // Notification settings state - simplified to only delivery channel
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    deliveryChannel: 'both'
  });

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

  // Handle notification settings changes
  const handleNotificationChange = (value: 'email' | 'phone' | 'both'): void => {
    setNotificationSettings({
      deliveryChannel: value
    });
    setNotificationSaveStatus(null);
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
      setTimeout(() => {
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
      setTimeout(() => {
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
        }
      }, 1000);
    }
  };

  // Handle notification settings save
  const handleNotificationSave = (): void => {
    // Here you would call the API to save notification preferences
    // notificationService.updateDeliveryChannel(notificationSettings.deliveryChannel)
    setTimeout(() => {
      setNotificationSaveStatus({
        success: true,
        message: "Notification delivery channel updated successfully.",
      });
    }, 500);
  };

  // Handle phone verification
  const handleVerifyPhone = (): void => {
    setVerificationStatus({
      ...verificationStatus,
      phone: true,
    });
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
                    Configure notification delivery preferences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Choose how you want to receive notifications from us.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Profile settings view (original functionality)
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
                
                <div className="space-y-4">
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
                    <Button onClick={(e) => { e.preventDefault(); handlePhoneSubmit(e as any); }}>
                      Update Phone Number
                    </Button>
                    {!verificationStatus.phone && phoneChangeStatus?.success && (
                      <Button variant="outline" onClick={handleVerifyPhone}>
                        Verify Phone Number
                      </Button>
                    )}
                  </div>
                </div>
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
                <div className="space-y-4">
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
                  
                  <Button onClick={(e) => { e.preventDefault(); handlePasswordSubmit(e as any); }}>
                    Change Password
                  </Button>
                </div>
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
  }

  // Notification settings view - simplified to only delivery channel
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
              Notification Delivery Channel
            </CardTitle>
            <CardDescription>
              Choose how you want to receive notifications from us
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={notificationSettings.deliveryChannel} 
              onValueChange={(value: 'email' | 'phone' | 'both') => handleNotificationChange(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email-channel" />
                <Label htmlFor="email-channel" className="cursor-pointer">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-blue-600" />
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="phone-channel" />
                <Label htmlFor="phone-channel" className="cursor-pointer">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-green-600" />
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive notifications via SMS to your phone</p>
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both-channels" />
                <Label htmlFor="both-channels" className="cursor-pointer">
                  <div className="flex items-center">
                    <Bell className="h-4 w-4 mr-2 text-purple-600" />
                    <div>
                      <p className="font-medium">Both Email and SMS</p>
                      <p className="text-sm text-muted-foreground">Receive notifications via both email and SMS</p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Save Notification Settings */}
        <Card>
          <CardContent className="pt-6">
            {notificationSaveStatus && (
              <Alert variant={notificationSaveStatus.success ? "default" : "destructive"} className="mb-4">
                <AlertTitle>
                  {notificationSaveStatus.success ? "Success" : "Error"}
                </AlertTitle>
                <AlertDescription>
                  {notificationSaveStatus.message}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex space-x-4">
              <Button onClick={handleNotificationSave}>
                Save Notification Settings
              </Button>
              <Button variant="outline" onClick={() => setCurrentView('main')}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingPage;