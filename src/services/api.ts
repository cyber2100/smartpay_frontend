import axios from "axios";
import { PaymentCard } from '@/types/payment';

// Base API configuration
const API_URL = import.meta.env.VITE_API_URL; // Default to local API if not set

const api = axios.create({
  baseURL: API_URL, 
  headers: {
    "Content-Type": "application/json",
  },
});

// Refresh token endpoint
const refreshToken = async () => {
  try {
    const refresh_token = localStorage.getItem("refresh_token");
    const response = await api.post(`${API_URL}/auth/refresh-token`, {
      refresh_token,
    });

    const newAccessToken = response.data.access_token;
    localStorage.setItem("auth_token", newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    throw error;
  }
};

// Request Interceptor: Attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("refresh_token")
    ) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refreshToken();
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Optional: handle logout or redirection to signin here
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/signin";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication
export const authService = {
  /**
   * User sign-in
   * @param email - The email address of the user.
   * @param password - The password of the user.
   * @returns A promise that resolves to the response data.
   */
  signin: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append("username", email); // FastAPI OAuth expects 'username'
    formData.append("password", password);

    const response = await axios.post(`${API_URL}/auth/login`, formData);
    localStorage.setItem("auth_token", response.data.access_token);
    localStorage.setItem("refresh_token", response.data.refresh_token);

    return response.data;
  },

  /**
   * User sign-up
   * @param name - The name of the user.
   * @param phone - The phone number of the user.
   * @param email - The email address of the user.
   * @param password - The password of the user.
   * @returns A promise that resolves to the response data.
   */
  signup: async (
    fullname: string,
    phone: string,
    email: string,
    password: string
  ) => {
    const response = await api.post("/auth/register", {
      fullname,
      phone,
      email,
      password,
    });
    return response.data;
  },

  verifyAccount: async (code: string, verfication_type: string) => {
    const response = await api.post(`/auth/verify/${verfication_type}`, {
      code,
    });
    return response.data;
  },

  findUser: async (emailOrPhone: string) => {
    const response = await api.get(`/auth/${emailOrPhone}`);
    return response.data;
  },

  resendVerification: async (verification_type: "email" | "phone") => {
    const response = await api.post(
      `/auth/resend-verification/${verification_type}`
    );
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
  
  signout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
  },

  /**
   * Sends a password reset code to the user's email.
   * @param email - The email address of the user.
   * @returns A promise that resolves to the response data.
   */
  sendPasswordResetCode: async (email: string) => {
    try {
      const response = await api.post("/auth/forgot-password/send-code", {
        email
      });
      console.log("Send password reset code response:", response.data);
      return {
        success: true,
        message: response.data.message || "Verification code sent successfully",
      };
    } catch (error: any) {
      console.error("Send password reset code error:", error);
      return {
        success: false,
        message: error.response?.data?.detail || error.response?.data?.message || "Failed to send verification code"
      };
    }
  },

  /**
   * Verifies the password reset code sent to the user's email.
   * @param email - The email address of the user.
   * @param code - The verification code sent to the user's email.
   * @returns A promise that resolves to the response data.
   */
  verifyPasswordResetCode: async (email: string, code: string) => {
    try {
      const response = await api.post("/auth/forgot-password/verify-code", {
        email,
        verify_code: code
      });
      return {
        success: true,
        message: response.data.message || "Code verified successfully",
        ...response.data
      };
    } catch (error: any) {
      console.error("Verify password reset code error:", error);
      return {
        success: false,
        message: error.response?.data?.detail || "Invalid or expired verification code"
      };
    }
  },

  /**
   * Resets the user's password.
   * @param token - The password reset token.
   * @param newPassword - The new password for the user.
   * @returns A promise that resolves to the response data.
   */
  resetPassword: async (token: string, newPassword: string) => {
    try {
      const response = await api.post("/auth/forgot-password/reset-password", {
        token,
        newpassword: newPassword
      });
      return {
        success: true,
        message: response.data.message || "Password reset successfully",
      };
    } catch (error: any) {
      console.error("Reset password error:", error);
      return {
        success: false,
        message: error.response?.data?.detail || error.response?.data?.message || "Failed to reset password"
      };
    }
  },

  /**
   * Resets the user's password using email, code, and new password.
   * @param email - The email address of the user.
   * @param code - The verification code sent to the user's email.
   * @param newPassword - The new password for the user.
   * @returns A promise that resolves to the response data.
   */
  resetPasswordDirect: async (email: string, code: string, newPassword: string) => {
    try {
      const response = await api.put("/auth/reset-password", {
        email,
        verification_code: code,
        new_password: newPassword
      });
      return {
        success: true,
        message: response.data.message || "Password reset successfully",
        ...response.data
      };
    } catch (error: any) {
      console.error("Reset password direct error:", error);
      return {
        success: false,
        message: error.response?.data?.detail || error.response?.data?.message || "Failed to reset password"
      };
    }
  },

  /**
   * Checks if the email exists in the system.
   * @param email - The email address to check.
   * @returns A promise that resolves to an object containing the existence status and message.
   */
  checkEmailExists: async (email: string) => {
    try {
      const response = await api.post("/auth/check-email", {
        email
      });
      return {
        exists: response.data.exists || false,
        message: response.data.message
      };
    } catch (error: any) {
      console.error("Check email exists error:", error);
      return {
        exists: false,
        message: error.response?.data?.detail || "Could not verify email"
      };
    }
  },

  /**
   * Validates the password reset token.
   * @param token - The password reset token.
   * @returns A promise that resolves to the response data.
   */
  validateResetToken: async (token: string) => {
    try {
      const response = await api.get(`/auth/validate-reset-token/${token}`);
      return {
        valid: true,
        email: response.data.email,
        expires_at: response.data.expires_at
      };
    } catch (error: any) {
      console.error("Validate reset token error:", error);
      return {
        valid: false,
        message: error.response?.data?.detail || "Invalid or expired reset token"
      };
    }
  },
};

// Wallet
export const walletService = {
  // Get user's current balance
  getBalance: async (): Promise<number> => {
    const response = await api.get('/wallet/balance');
    return response.data.balance;
  },

  // Top up wallet (existing function)
  withdraw: async (amount: number, cardId: string): Promise<{ balance: number }> => {
    const response = await api.post('/wallet/withdraw', {
      amount, 
      card_id: cardId
    });
    return response.data;
  },

  // Deposit money with card
  deposit: async (cardId: string, amount: number): Promise<{ balance: number; transaction_id: string }> => {
    const response = await api.post('/wallet/deposit', {
      card_id: cardId,
      amount
    });
    return response.data;
  },

  // Transfer money (existing function)
  transfer: async (recipientIdentifier: string, amount: number, description?: string): Promise<{ new_balance: number }> => {
    const response = await api.post('/wallet/transfer', {
      recipient_identifier: recipientIdentifier,
      amount,
      description
    });
    return response.data;
  },

  // Get wallet transactions
  getTransactions: async (): Promise<any[]> => {
    const response = await api.get('/wallet/transactions');
    return response.data;
  },

  // Get user's payment cards (optional - for loading real cards)
  getPaymentCards: async (): Promise<any[]> => {
    const response = await api.get('/wallet/cards');
    return response.data.cards;
  },

  // Add a new payment card (optional)
  addPaymentCard: async (cardData: {
    card_number: string;
    expiry_month: string;
    expiry_year: string;
    cvv: string;
    holder_name: string;
  }): Promise<any> => {
    const response = await api.post('/wallet/cards', cardData);
    return response.data;
  },

  // Delete a payment card (optional)
  deletePaymentCard: async (cardId: string): Promise<void> => {
    await api.delete(`/wallet/cards/${cardId}`);
  },

  // Set default payment card (optional)
  setDefaultCard: async (cardId: string): Promise<void> => {
    await api.patch(`/wallet/cards/${cardId}/default`);
  }
};

// Transactions
export const transactionService = {
  getUserTransactions: async () => {
    const response = await api.get("/transactions");
    return response.data;
  },

  getAllTransactions: async () => {
    const response = await api.get("/admin/transactions");
    return response.data;
  },
};

// Admin - Updated with user management functions
export const adminService = {
  // Get all users
  getAllUsers: async () => {     
    const response = await api.get("/admin/users");    
    return response.data;
  },

  // Get specific user details
  getUser: async (userId: string) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  // Update user activation status
  updateUserActivation: async (userId: string, isActive: boolean) => {
    const response = await api.patch(`/admin/users/${userId}/activate`);
    return response.data;
  },

  // Reset user password
  resetUserPassword: async (userId: string, newPassword: string) => {
    const response = await api.patch(`/admin/users/${userId}/password`, {
      new_password: newPassword
    });
    return response.data;
  },

  // Delete user
  deleteUser: async (userId: string) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Update user details (general purpose)
  updateUser: async (userId: string, updateData: {
    name?: string;
    email?: string;
    phone?: string;
    is_admin?: boolean;
    is_verified?: boolean;
  }) => {
    const response = await api.patch(`/admin/users/${userId}`, updateData);
    return response.data;
  },

  // Get user's wallet balance (admin only)
  getUserBalance: async (userId: string) => {
    const response = await api.get(`/admin/users/${userId}/balance`);
    return response.data;
  },

  // Update user's wallet balance (admin only)
  updateUserBalance: async (userId: string, amount: number, operation: 'add' | 'subtract' | 'set') => {
    const response = await api.patch(`/admin/users/${userId}/balance`, {
      amount,
      operation
    });
    return response.data;
  },

  // Get all transactions for admin dashboard
  getAllTransactions: async () => {
    const response = await api.get("/admin/transactions");
    return response.data;
  },

  // Get user's transactions (admin only)
  getUserTransactions: async (userId: string) => {
    const response = await api.get(`/admin/users/${userId}/transactions`);
    return response.data;
  },

  // Get platform statistics
  getTransactionStatistics: async () => {
    const response = await api.get("/admin/transactions/summary");
    return response.data;
  },

  // Get balance statistics
  getBalanceStatistics: async () => {
    const response = await api.get("/admin/balances/summary");
    return response.data;
  },

  // Create notification for specific user (admin only)
  createUserNotification: async (userId: string, notificationData: {
    type: string;
    title: string;
    message: string;
    amount?: number;
    transaction_id?: string;
  }) => {
    const response = await api.post(`/admin/users/${userId}/notifications`, notificationData);
    return response.data;
  },

  // Suspend/Unsuspend user account
  updateUserStatus: async (userId: string, isSuspended: boolean) => {
    const response = await api.patch(`/admin/users/${userId}/status`, {
      is_suspended: isSuspended
    });
    return response.data;
  },

  // Bulk operations
  bulkUpdateUsers: async (userIds: string[], updateData: {
    is_verified?: boolean;
    is_suspended?: boolean;
  }) => {
    const response = await api.patch("/admin/users/bulk", {
      user_ids: userIds,
      ...updateData
    });
    return response.data;
  },

  // Export users data
  exportUsers: async (format: 'csv' | 'excel' = 'csv') => {
    const response = await api.get(`/admin/users/export?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // System health check
  getSystemHealth: async () => {
    const response = await api.get("/admin/system/health");
    return response.data;
  }
};

// Payment Card Service
export const cardService = {
  // Get all cards
  getCards: async (): Promise<PaymentCard[]> => {
    const response = await api.get('/payment-cards/');
    return response.data;
  },

  // Add new card
  addCard: async (cardData: Omit<PaymentCard, 'id'>): Promise<string> => {
    const response = await api.post('/payment-cards/', cardData);
    return response.data.id;
  },

  // Update card (set as default)
  updateCard: async (cardId: string, updateData: Partial<PaymentCard>): Promise<PaymentCard> => {
    const response = await api.put(`/payment-cards/${cardId}`, updateData);
    return response.data;
  },

  // Set card as default
  setDefaultCard: async (cardId: string): Promise<void> => {
    await api.patch(`/payment-cards/${cardId}/default`);
  },

  // Delete card
  deleteCard: async (cardId: string): Promise<void> => {
    await api.delete(`/payment-cards/${cardId}`);
  },

  // Get card details (including sensitive info)
  getCardDetails: async (cardId: string): Promise<PaymentCard> => {
    const response = await api.get(`/payment-cards/${cardId}/details`);
    return response.data;
  },
};

// Notification Settings Service
export const notificationService = {
  // Get user's notification preferences
  getNotificationSettings: async () => {
    const response = await api.get('/auth/notif-setting');
    return response.data;
  },

  // Update notification delivery channel
  updateDeliveryChannel: async (channel: 'system' | 'email' | 'phone' | 'both') => {
    const response = await api.put('/auth/notif-setting', {
      notif_setting: channel
    });
    return response.data;
  },

  // Get user verification status (simplified)
  getVerificationStatus: async () => {
    const response = await api.get('/user/verification-status');
    return response.data;
  },

  // NEW: Get all notifications for the current user
  getNotifications: async () => {
    const response = await api.get('/notification/');
    return response.data;
  },

  // NEW: Mark a specific notification as read
  markAsRead: async (notificationId: string) => {
    const response = await api.post(`/notification/${notificationId}/read`);
    return response.data;
  },

  // NEW: Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.post('/notification/mark-all-read');
    return response.data;
  },

  // NEW: Delete a specific notification
  deleteNotification: async (notificationId: string) => {
    const response = await api.delete(`/notification/${notificationId}`);
    return response.data;
  },

  // NEW: Get unread notification count
  getUnreadCount: async () => {
    const response = await api.get('/notification/unread-count');
    return response.data.count;
  },

  // NEW: Create a notification (usually called by system)
  createNotification: async (notificationData: {
    user_id: string;
    type: string;
    title: string;
    message: string;
    amount?: number;
    transaction_id?: string;
  }) => {
    const response = await api.post('/notification', notificationData);
    return response.data;
  },
};

// Profile Service
export const profileService = {
  // Update phone number - returns updated verification status
  updatePhoneNumber: async (phoneNumber: string) => {
    const response = await api.put('/profile/phone', {
      phone: phoneNumber
    });
    return response.data; // Should return { phone: string, is_verified: false }
  },

  // Update password
  updatePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/profile/password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export const statisticsService = {
  getStatistics: async () => {
    const response = await api.get('/profile/monthly-summary');
    return response.data;
  }
}