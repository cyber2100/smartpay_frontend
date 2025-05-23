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
  title: string;
  amount: number;
  type: 'received' | 'sent';
  date: Date;
  from?: string;
  cardUsed?: PaymentCard;
}

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