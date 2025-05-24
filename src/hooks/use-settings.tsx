import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { useToast } from "@/hooks/use-toast";
import { notificationService, profileService } from '@/services/api';

// Types
export type DeliveryChannel = 'email' | 'phone' | 'both';

export type NotificationSettings = {
  deliveryChannel: DeliveryChannel;
};

export type VerificationStatus = {
  isVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
};

export type SettingsContextType = {
  // Notification settings
  notificationSettings: NotificationSettings;
  updateDeliveryChannel: (channel: DeliveryChannel) => Promise<boolean>;
  
  // Profile settings
  verificationStatus: VerificationStatus;
  updatePhoneNumber: (phoneNumber: string) => Promise<boolean>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  verifyPhone: () => Promise<boolean>;
  
  // Loading states
  isLoading: boolean;
};

// Context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // States
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    deliveryChannel: 'both'
  });
  
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    isVerified: false,
    emailVerified: false,
    phoneVerified: false
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Initialize settings when user changes
  useEffect(() => {
    const loadSettings = async () => {
      if (isAuthenticated && user) {
        setIsLoading(true);
        try {
          // Load notification settings
          const notifSettings = await notificationService.getNotificationSettings();
          setNotificationSettings({
            deliveryChannel: notifSettings.delivery_channel || 'both'
          });
          
          // Load verification status
          const verifyStatus = await notificationService.getVerificationStatus();
          setVerificationStatus({
            isVerified: verifyStatus.is_verified || false,
            emailVerified: verifyStatus.email_verified || false,
            phoneVerified: verifyStatus.phone_verified || false
          });
          
        } catch (error) {
          console.error('Error loading settings:', error);
          toast({
            title: "Error",
            description: "Failed to load settings",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        // Reset settings when not authenticated
        setNotificationSettings({ deliveryChannel: 'both' });
        setVerificationStatus({ isVerified: false, emailVerified: false, phoneVerified: false });
      }
    };
    
    loadSettings();
  }, [isAuthenticated, user, toast]);

  // Update delivery channel
  const updateDeliveryChannel = async (channel: DeliveryChannel): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;
    
    try {
      await notificationService.updateDeliveryChannel(channel);
      
      setNotificationSettings(prev => ({
        ...prev,
        deliveryChannel: channel
      }));
      
      toast({
        title: "Settings updated",
        description: "Notification delivery channel updated successfully."
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.response?.data?.detail || "Failed to update notification settings.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Update phone number
  const updatePhoneNumber = async (phoneNumber: string): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;
    
    try {
      await profileService.updatePhoneNumber(phoneNumber);
      
      toast({
        title: "Phone updated",
        description: "Phone number updated successfully. A verification code has been sent."
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.response?.data?.detail || "Failed to update phone number.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Update password
  const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;
    
    try {
      await profileService.updatePassword(currentPassword, newPassword);
      
      toast({
        title: "Password updated",
        description: "Password changed successfully."
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.response?.data?.detail || "Failed to update password.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Verify phone
  const verifyPhone = async (): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;
    
    try {
      await profileService.verifyPhone();
      
      setVerificationStatus(prev => ({
        ...prev,
        phoneVerified: true,
        isVerified: true
      }));
      
      toast({
        title: "Phone verified",
        description: "Phone number verified successfully."
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.response?.data?.detail || "Failed to verify phone number.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Context value
  const value: SettingsContextType = {
    notificationSettings,
    updateDeliveryChannel,
    verificationStatus,
    updatePhoneNumber,
    updatePassword,
    verifyPhone,
    isLoading
  };
  
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};