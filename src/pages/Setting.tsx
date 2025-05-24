import React, { useState } from "react";
import { User, Mail, Phone, Lock, CheckCircle, XCircle, Bell, ArrowLeft, Settings, Eye, Send, Smartphone, Monitor, Volume2, VolumeX } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
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
  contentVisibility: 'only-me' | 'all-changes';
  deliveryChannel: 'site-only' | 'email-only' | 'both';
  emailNotifications: {
    accountChanges: boolean;
    securityAlerts: boolean;
    systemUpdates: boolean;
    promotions: boolean;
  };
  pushNotifications: {
    enabled: boolean;
    accountActivity: boolean;
    securityAlerts: boolean;
    systemMessages: boolean;
  };
  frequency: 'instant' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
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

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    contentVisibility: 'only-me',
    deliveryChannel: 'both',
    emailNotifications: {
      accountChanges: true,
      securityAlerts: true,
      systemUpdates: false,
      promotions: false,
    },
    pushNotifications: {
      enabled: true,
      accountActivity: true,
      securityAlerts: true,
      systemMessages: false,
    },
    frequency: 'instant',
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
    },
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
  const handleNotificationChange = (key: keyof NotificationSettings, value: any): void => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: value,
    });
    setNotificationSaveStatus(null);
  };

  const handleNestedNotificationChange = (section: 'emailNotifications' | 'pushNotifications' | 'quietHours', key: string, value: any): void => {
    setNotificationSettings({
      ...notificationSettings,
      [section]: {
        ...notificationSettings[section],
        [key]: value,
      },
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
    setTimeout(() => {
      setNotificationSaveStatus({
        success: true,
        message: "Notification settings saved successfully.",
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
                    Configure how and when you receive notifications
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Control notification preferences, delivery channels, and privacy settings.
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
  }

  // Notification settings view
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
        {/* Content Visibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Content Visibility
            </CardTitle>
            <CardDescription>
              Choose what content to show in your notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={notificationSettings.contentVisibility} 
              onValueChange={(value: 'only-me' | 'all-changes') => handleNotificationChange('contentVisibility', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="only-me" id="only-me" />
                <Label htmlFor="only-me" className="cursor-pointer">
                  <div>
                    <p className="font-medium">Only show for me</p>
                    <p className="text-sm text-muted-foreground">Show only notifications related to my account and activities</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all-changes" id="all-changes" />
                <Label htmlFor="all-changes" className="cursor-pointer">
                  <div>
                    <p className="font-medium">All changes in server</p>
                    <p className="text-sm text-muted-foreground">Show all system-wide updates and changes</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

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
              onValueChange={(value: 'site-only' | 'email-only' | 'both') => handleNotificationChange('deliveryChannel', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="site-only" id="site-only" />
                <Label htmlFor="site-only" className="cursor-pointer">
                  <div className="flex items-center">
                    <Monitor className="h-4 w-4 mr-2" />
                    <div>
                      <p className="font-medium">Only on this site</p>
                      <p className="text-sm text-muted-foreground">Receive notifications only when using the website</p>
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email-only" id="email-only" />
                <Label htmlFor="email-only" className="cursor-pointer">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <div>
                      <p className="font-medium">Only on email system</p>
                      <p className="text-sm text-muted-foreground">Receive notifications via email only</p>
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="cursor-pointer">
                  <div>
                    <p className="font-medium">Both of the above</p>
                    <p className="text-sm text-muted-foreground">Receive notifications on both website and email</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Email Notifications
            </CardTitle>
            <CardDescription>
              Configure which email notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Account Changes</Label>
                <p className="text-sm text-muted-foreground">Profile updates, password changes, etc.</p>
              </div>
              <Switch 
                checked={notificationSettings.emailNotifications.accountChanges}
                onCheckedChange={(checked) => handleNestedNotificationChange('emailNotifications', 'accountChanges', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Security Alerts</Label>
                <p className="text-sm text-muted-foreground">Login attempts, suspicious activity</p>
              </div>
              <Switch 
                checked={notificationSettings.emailNotifications.securityAlerts}
                onCheckedChange={(checked) => handleNestedNotificationChange('emailNotifications', 'securityAlerts', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">System Updates</Label>
                <p className="text-sm text-muted-foreground">New features, maintenance notices</p>
              </div>
              <Switch 
                checked={notificationSettings.emailNotifications.systemUpdates}
                onCheckedChange={(checked) => handleNestedNotificationChange('emailNotifications', 'systemUpdates', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Promotions & News</Label>
                <p className="text-sm text-muted-foreground">Product updates, special offers</p>
              </div>
              <Switch 
                checked={notificationSettings.emailNotifications.promotions}
                onCheckedChange={(checked) => handleNestedNotificationChange('emailNotifications', 'promotions', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="h-5 w-5 mr-2" />
              Push Notifications
            </CardTitle>
            <CardDescription>
              Configure browser and mobile push notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Enable Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Allow notifications to be sent to your device</p>
              </div>
              <Switch 
                checked={notificationSettings.pushNotifications.enabled}
                onCheckedChange={(checked) => handleNestedNotificationChange('pushNotifications', 'enabled', checked)}
              />
            </div>
            
            {notificationSettings.pushNotifications.enabled && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Account Activity</Label>
                    <p className="text-sm text-muted-foreground">Login, logout, profile changes</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.pushNotifications.accountActivity}
                    onCheckedChange={(checked) => handleNestedNotificationChange('pushNotifications', 'accountActivity', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">Important security notifications</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.pushNotifications.securityAlerts}
                    onCheckedChange={(checked) => handleNestedNotificationChange('pushNotifications', 'securityAlerts', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">System Messages</Label>
                    <p className="text-sm text-muted-foreground">Platform updates and announcements</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.pushNotifications.systemMessages}
                    onCheckedChange={(checked) => handleNestedNotificationChange('pushNotifications', 'systemMessages', checked)}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notification Frequency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Notification Frequency
            </CardTitle>
            <CardDescription>
              Control how often you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={notificationSettings.frequency} 
              onValueChange={(value: 'instant' | 'daily' | 'weekly') => handleNotificationChange('frequency', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="instant" id="instant" />
                <Label htmlFor="instant" className="cursor-pointer">
                  <div>
                    <p className="font-medium">Instant</p>
                    <p className="text-sm text-muted-foreground">Receive notifications immediately as they occur</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily" className="cursor-pointer">
                  <div>
                    <p className="font-medium">Daily Digest</p>
                    <p className="text-sm text-muted-foreground">Receive a summary of notifications once per day</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly" className="cursor-pointer">
                  <div>
                    <p className="font-medium">Weekly Summary</p>
                    <p className="text-sm text-muted-foreground">Receive a weekly summary of all notifications</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {notificationSettings.quietHours.enabled ? (
                <VolumeX className="h-5 w-5 mr-2" />
              ) : (
                <Volume2 className="h-5 w-5 mr-2" />
              )}
              Quiet Hours
            </CardTitle>
            <CardDescription>
              Set specific times when you don't want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Enable Quiet Hours</Label>
                <p className="text-sm text-muted-foreground">Pause notifications during specified hours</p>
              </div>
              <Switch 
                checked={notificationSettings.quietHours.enabled}
                onCheckedChange={(checked) => handleNestedNotificationChange('quietHours', 'enabled', checked)}
              />
            </div>
            
            {notificationSettings.quietHours.enabled && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input 
                      id="startTime"
                      type="time"
                      value={notificationSettings.quietHours.startTime}
                      onChange={(e) => handleNestedNotificationChange('quietHours', 'startTime', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input 
                      id="endTime"
                      type="time"
                      value={notificationSettings.quietHours.endTime}
                      onChange={(e) => handleNestedNotificationChange('quietHours', 'endTime', e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  During quiet hours, only critical security alerts will be delivered.
                </p>
              </>
            )}
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