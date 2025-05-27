import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { useToast } from "@/hooks/use-toast";
import { notificationService, profileService } from '@/services/api';

// Types
export type DeliveryChannel = 'system' | 'email' | 'phone' | 'both';

export type NotificationSettings = {
  deliveryChannel: DeliveryChannel;
};

export type VerificationStatus = {
  isVerified: boolean;
};

export type SettingsContextType = {
  // Notification settings
  notificationSettings: NotificationSettings;
  updateDeliveryChannel: (channel: DeliveryChannel) => Promise<boolean>;
  
  // Profile settings
  verificationStatus: VerificationStatus;
  updatePhoneNumber: (phoneNumber: string) => Promise<boolean>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  
  // Loading states
  isLoading: boolean;
};

// Context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { toast } = useToast();
  
  // States
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    deliveryChannel: 'both'
  });
  
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    isVerified: false
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Initialize settings when user changes
  useEffect(() => {
    if(isAuthenticated){
      loadSettings();
    } else {
      setNotificationSettings({ deliveryChannel: 'both' });
      setVerificationStatus({ isVerified: false });
    }
  }, [isAuthenticated]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Load notification settings
      const notifSettings = await notificationService.getNotificationSettings();
      setNotificationSettings({
        deliveryChannel: notifSettings.notif_setting || 'both'
      });

      setVerificationStatus({
        isVerified: user.isVerified || false
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
  };

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

      // When phone number is updated, verification status changes to false
      setVerificationStatus({
        isVerified: false
      });

      // Refresh user data to get updated phone number
      if (refreshUser) {
        await refreshUser();
      }

      toast({
        title: "Phone updated",
        description: "Phone number updated successfully. Please verify your new phone number."
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

  // Context value
  const value: SettingsContextType = {
    notificationSettings,
    updateDeliveryChannel,
    verificationStatus,
    updatePhoneNumber,
    updatePassword,
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