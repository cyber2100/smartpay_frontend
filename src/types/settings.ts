export type DeliveryChannel = 'system' | 'email' | 'phone' | 'both';

export type NotificationSettings = {
  deliveryChannel: DeliveryChannel;
};

export type VerificationStatus = {
  isVerified: boolean;
};

/**
 * SettingsContextType defines the structure of the settings context.
 * It includes notification settings, profile verification status, and methods to update them.
 * It also includes a loading state to indicate if settings are being loaded or updated.
 * * @property notificationSettings - Current notification settings.
 * @property updateDeliveryChannel - Function to update the notification delivery channel.
 * @property verificationStatus - Current verification status of the user.
 * @property updatePhoneNumber - Function to update the user's phone number.
 * @property updatePassword - Function to update the user's password.
 * @property isLoading - Boolean indicating if settings are currently being loaded or updated.
 * @returns SettingsContextType
 */
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