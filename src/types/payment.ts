/**
 * Payment-related types and interfaces for a financial application.
 * This includes definitions for payment cards, transactions, and financial data.
 * @module types/payment
 */
export interface PaymentCard {
  id: string;
  name: string;
  cardNumber: string;
  expireDate: string;
  cvc: string|number;
  isDefault: boolean;
  type: 'visa' | 'mastercard' | 'amex';
  cardColor: string;
}

/**
 * Interface representing a payment transaction.
 * It includes details about the sender, recipient, card used, amount, status, and type of transaction.
 * @interface Transaction
 * @property {string} id - Unique identifier for the transaction.
 * @property {string} [senderId] - ID of the sender.
 * @property {Object} [sender] - Details of the sender including id, fullname, email, and phone.
 * @property {string} [recipientId] - ID of the recipient.
 * @property {Object} [recipient] - Details of the recipient including id, fullname, email, and phone.
 * @property {string} [cardId] - ID of the card used for the transaction.
 * @property {Object} [card] - Details of the card used including id and name.
 * @property {number} amount - Amount of money involved in the transaction.
 * @property {'completed' | 'pending' | 'failed'} status - Status of the transaction.
 * @property {string} [description] - Optional description of the transaction.
 */
export interface Transaction {
  id: string;
  senderId?: string;
  sender?: {
    id: string,
    fullname: string,
    email: string,
    phone: string|null
  }|null;
  recipientId?: string;
  recipient?: {
    id: string,
    fullname: string,
    email: string,
    phone: string|null
  }|null;
  cardId?: string;
  card?: {
    id: string;
    name: string;
  }|null;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  description?: string;
  type: string;
  timestamp: Date;
};

/**
 * Interface representing monthly financial data.
 * It includes the name of the month, amounts received, sent, and optionally revenue.
 * @interface MonthlyData
 * @property {string} name - Name of the month.
 * @property {number} received - Amount received in the month.
 * @property {number} sent - Amount sent in the month.
 * @property {number} [revenue] - Optional revenue for the month.
 */
export interface MonthlyData {
  name: string;
  received: number;
  sent: number;
  revenue?: number;
}

/**
 * Interface representing financial data summary.
 * It includes total revenue, total sent, and total received amounts.
 * @interface FinancialData
 * @property {number} revenue - Total revenue.
 * @property {number} sent - Total amount sent.
 * @property {number} received - Total amount received.
 */
export interface FinancialData {
  revenue: number;
  sent: number;
  received: number;
}
