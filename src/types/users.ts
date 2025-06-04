/**
 * Payment-related types and interfaces for a financial application.
 * This includes definitions for payment cards, transactions, and financial data.
 * @module types/payment
 */
export interface User {
  id: string;
  fullname: string;
  email: string;
  phone?: string | null;
  isVerified: boolean;
  isActive: boolean;
  isAdmin: boolean;
}