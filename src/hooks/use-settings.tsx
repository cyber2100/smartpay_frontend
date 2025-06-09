/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useAuth } from "./use-auth";
import { useToast } from "@/hooks/use-toast";
import { notificationService, profileService } from "@/services/api";
import {
  NotificationSettings,
  VerificationStatus,
  DeliveryChannel,
  SettingsContextType,
} from "@/types/settings";
import { errorProcess } from "@/lib/utils";

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      deliveryChannel: "both",
    });

  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>({
      isVerified: false,
    });

  const [isLoading, setIsLoading] = useState(false);

  // Load settings when user is authenticated
  // or when the component mounts
  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
    } else {
      setNotificationSettings({ deliveryChannel: "both" });
      setVerificationStatus({ isVerified: false });
    }
  }, [isAuthenticated, user?.isVerified]);

  // Load settings from API
  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const notifSettings = await notificationService.getNotificationSettings();
      setNotificationSettings({
        deliveryChannel: notifSettings.notif_setting || "both",
      });

      setVerificationStatus({
        isVerified: user.isVerified || false,
      });
    } catch (error) {
      errorProcess(error, toast, "Failed to load settings", "destructive");
    } finally {
      setIsLoading(false);
    }
  };

  // Update delivery channel
  const updateDeliveryChannel = async (
    channel: DeliveryChannel
  ): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;

    try {
      await notificationService.updateDeliveryChannel(channel);

      setNotificationSettings((prev) => ({
        ...prev,
        deliveryChannel: channel,
      }));

      toast({
        title: "Settings updated",
        description: "Notification delivery channel updated successfully.",
      });

      return true;
    } catch (error: any) {
      errorProcess(
        error,
        toast,
        "Failed to update notification settings.",
        "destructive"
      );
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
        description: "Phone number updated successfully.",
      });
      return true;
    } catch (error: any) {
      errorProcess(
        error,
        toast,
        "Failed to update phone number.",
        "destructive"
      );
      return false;
    }
  };

  // Update password
  const updatePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;

    try {
      await profileService.updatePassword(currentPassword, newPassword);

      toast({
        title: "Password updated",
        description: "Password changed successfully.",
      });

      return true;
    } catch (error: any) {
      errorProcess(error, toast, "Failed to update password.", "destructive");
      return false;
    }
  };

  // Memoize context value to avoid unnecessary re-renders
  const value: SettingsContextType = {
    notificationSettings,
    updateDeliveryChannel,
    verificationStatus,
    updatePhoneNumber,
    updatePassword,
    isLoading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
