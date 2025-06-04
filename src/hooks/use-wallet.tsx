import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth, User } from './use-auth';
import { useToast } from "@/hooks/use-toast";
import { walletService } from '@/services/api';

import { Transaction } from '@/types/payment';

type WalletContextType = {
  balance: number;
  isLoading: boolean;
  transactions: Transaction[];
  withdraw: (amount: number, cardId: string) => Promise<boolean>;
  transfer: (recipient: string, amount: number, description?: string) => Promise<boolean>;
  deposit: (cardId: string, amount: number) => Promise<boolean>;
  allTransactions: Transaction[];
  allUsers: User[];
  loadWalletData: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

/**
 * WalletProvider component to provide wallet-related context to the application.
 *
 * @param param0 - The props for the provider component.
 * @returns The WalletProvider component.
 */
export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize balance and fetch transactions when user changes
  useEffect(() => {
    if(isAuthenticated && user?.isVerified) {
      loadWalletData();
    } else {
      setBalance(0);
      setTransactions([]);
      setAllTransactions([]);
      setAllUsers([]);
    }
  }, [isAuthenticated, user?.isVerified]);

  /**
   * Load wallet data including balance and transactions.
   * This function fetches the user's balance and transactions from the wallet service.
   * It also formats the transactions to match the expected structure.
   * If an error occurs, it displays a toast notification.
   */
  const loadWalletData = async () => {
    setIsLoading(true);

    try {
      const userBalance = await walletService.getBalance();
      setBalance(userBalance);
      
      const userTransactionData = await walletService.getTransactions();
      
      const formattedTransactions = userTransactionData.map((tx: any) => ({
        ...tx,
        senderId: tx.sender_id,
        recipientId: tx.recipient_id,
        cardId: tx.card_id,
        status: tx.status as 'completed' | 'pending' | 'failed',
        timestamp: tx.created_at
      }));
      
      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      toast({
        title: "Error",
        description: "Failed to load wallet data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refreshes the user's transaction history.
   * @returns {Promise<void>}
   */
  const refreshTransactions = async () => {
    if (!isAuthenticated || !user) return;
    setIsLoading(true);
    
    try {
      const userTransactionData = await walletService.getTransactions();
      const formattedTransactions = userTransactionData.map((tx: any) => ({
        ...tx,
        senderId: tx.sender_id,
        recipientId: tx.recipient_id,
        cardId: tx.card_id,
        status: tx.status as 'completed' | 'pending' | 'failed',
        timestamp: tx.created_at
      }));
      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error refreshing transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Withdraws money from the user's wallet.
   * @param amount - The amount to withdraw.
   * @param cardId - The ID of the card to withdraw from.
   * @returns {Promise<boolean>} - Whether the withdrawal was successful.
   */
  const withdraw = async (amount: number, cardId: string): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;

    setIsLoading(true);    
    try {
      const result = await walletService.withdraw(amount, cardId);
      
      setBalance(result.balance);
      
      await refreshTransactions();
      
      toast({
        title: "Top up successful",
        description: `${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} has been added to your wallet.`
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Top up failed",
        description: error.response?.data?.detail || "Failed to top up wallet.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Deposits money into the user's wallet.
   * @param cardId - The ID of the card to deposit from.
   * @param amount - The amount to deposit.
   * @returns {Promise<boolean>} - Whether the deposit was successful.
   */
  const deposit = async (cardId: string, amount: number): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to make a deposit.",
        variant: "destructive"
      });
      return false;
    }

    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Deposit amount must be greater than zero.",
        variant: "destructive"
      });
      return false;
    }

    if (!cardId) {
      toast({
        title: "Payment method required",
        description: "Please select a payment card.",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);

    try {
      const result = await walletService.deposit(cardId, amount);
      
      if (result.balance !== undefined) {
        setBalance(result.balance);
      } else {
        setBalance(prevBalance => prevBalance + amount);
      }
      
      await refreshTransactions();
      
      toast({
        title: "Deposit successful",
        description: `${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} has been added to your wallet.`
      });
      
      return true;
    } catch (error: any) {
      console.error('Deposit error:', error);
      
      let errorMessage = "Failed to process deposit.";
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Deposit failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Transfers money to another user.
   * @param recipientIdentifier - The identifier of the recipient (email or user ID).
   * @param amount - The amount to transfer.
   * @param description - An optional description for the transfer.
   * @returns {Promise<boolean>} - Whether the transfer was successful.
   */
  const transfer = async (recipientIdentifier: string, amount: number, description?: string): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;
    setIsLoading(true);
    
    try {
      await walletService.transfer(recipientIdentifier, amount, description);
      
      await refreshTransactions();
      
      toast({
        title: "Transfer successful",
        description: `${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} has been sent.`
      });
      
      setBalance(balance - amount);

      return true;
    } catch (error: any) {
      toast({
        title: "Transfer failed",
        description: error.response?.data?.detail?.msg || "Failed to send money.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Value to provide
  const value: WalletContextType = {
    balance,
    isLoading,
    transactions,
    withdraw,
    transfer,
    deposit,
    allTransactions,
    allUsers,
    loadWalletData,
  };
  
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};