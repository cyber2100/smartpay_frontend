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

export interface MonthlyData {
  name: string;
  received: number;
  sent: number;
  balance: number;
}

export interface FinancialData {
  balance: number;
  sent: number;
  received: number;
}
