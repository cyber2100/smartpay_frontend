import axios from "axios";
import { PaymentCard } from '@/types/payment';

// Base API configuration
const API_URL = "http://146.19.215.133:8000/api/v1";
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
    const response = await axios.post(`${API_URL}/auth/token/refresh`, {
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

    // If 401 and we haven’t already tried to refresh
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
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication
export const authService = {
  signin: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append("username", email); // FastAPI OAuth expects 'username'
    formData.append("password", password);

    const response = await axios.post(`${API_URL}/auth/login`, formData);
    localStorage.setItem("auth_token", response.data.access_token);
    localStorage.setItem("refresh_token", response.data.refresh_token);
    return response.data;
  },

  signup: async (
    name: string,
    phone: string,
    email: string,
    password: string
  ) => {
    const response = await api.post("/auth/register", {
      name,
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
    return response.data; // Should return { code: "182712" }
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  signout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
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
  topUp: async (amount: number): Promise<{ new_balance: number }> => {
    const response = await api.post('/wallet/topup', {
      amount
    });
    return response.data;
  },

  // Deposit money with card
  deposit: async (cardId: string, amount: number): Promise<{ new_balance: number; transaction_id: string }> => {
    const response = await api.post('/wallet/deposit', {
      card_id: cardId,
      amount
    });
    return response.data;
  },

  // Transfer money (existing function)
  transfer: async (recipientIdentifier: string, amount: number, description?: string): Promise<{ new_balance: number }> => {
    const response = await api.post('/wallet/transfer', {
      recipient: recipientIdentifier,
      amount,
      description
    });
    return response.data;
  },

  // Get wallet transactions
  getTransactions: async (): Promise<any[]> => {
    const response = await api.get('/wallet/transactions');
    return response.data.transactions;
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

// Admin
export const adminService = {
  getAllUsers: async () => {
    const response = await api.get("/admin/users");
    return response.data;
  },
};

//Card
export const cardService = {
  // Get all cards
  getCards: async (): Promise<PaymentCard[]> => {
    try {
      const response = await api.get('/payment-cards');
      return response.data;
    } catch (error) {
      console.error('Error fetching cards:', error);
      throw error;
    }
  },

  // Add new card
  addCard: async (cardData: Omit<PaymentCard, 'id'>): Promise<string> => {
    try {
      const response = await api.post('/payment-cards', cardData);
      return response.data.id;
    } catch (error) {
      console.error('Error adding card:', error);
      throw error;
    }
  },

  // Update card (set as default)
  updateCard: async (cardId: string, updateData: Partial<PaymentCard>): Promise<PaymentCard> => {
    try {
      const response = await api.put(`/payment-cards/${cardId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  },

  // Set card as default
  setDefaultCard: async (cardId: string): Promise<void> => {
    try {
      await api.patch(`/payment-cards/${cardId}/default`);
    } catch (error) {
      console.error('Error setting default card:', error);
      throw error;
    }
  },

  // Delete card
  deleteCard: async (cardId: string): Promise<void> => {
    try {
      await api.delete(`/payment-cards/${cardId}`);
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  },

  // Get card details (including sensitive info)
  getCardDetails: async (cardId: string): Promise<PaymentCard> => {
    try {
      const response = await api.get(`/payment-cards/${cardId}/details`);
      return response.data;
    } catch (error) {
      console.error('Error fetching card details:', error);
      throw error;
    }
  },
};
