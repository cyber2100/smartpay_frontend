import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, User } from './use-auth';
import { useToast } from "@/hooks/use-toast";
import { walletService, transactionService, adminService } from '@/services/api';

// Types
import { Transaction } from '@/types/payment';

export type WalletContextType = {
  balance: number;
  transactions: Transaction[];
  withdraw: (amount: number, cardId: string) => Promise<boolean>;
  transfer: (recipient: string, amount: number, description?: string) => Promise<boolean>;
  deposit: (cardId: string, amount: number) => Promise<boolean>;
  getTransactions: () => Promise<Transaction[]>;
  allTransactions: Transaction[];
  allUsers: User[];
};

// Context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const { toast } = useToast();
  
  // Initialize balance and fetch transactions when user changes
  useEffect(() => {
    const loadWalletData = async () => {
      if (isAuthenticated && user) {
        try {
          // Get user balance
          const userBalance = await walletService.getBalance();
          setBalance(userBalance);
          
          // Get user transactions
          const userTransactionData = await walletService.getTransactions();
          
          // Transform API transactions to our app format
          const formattedTransactions = userTransactionData.map((tx: any) => ({
            ...tx,
            senderId: tx.sender_id,
            recipientId: tx.recipient_id,
            cardId: tx.card_id,
            status: tx.status as 'completed' | 'pending' | 'failed',
            timestamp: tx.created_at
          }));
          
          setTransactions(formattedTransactions);
          
          // If admin, fetch all transactions and users
          if (isAdmin) {
            try {
              const allTxData = await transactionService.getAllTransactions();
              const formattedAllTx = allTxData.map((tx: any) => ({
                ...tx,
                senderId: tx.sender_id,
                recipientId: tx.recipient_id,
                cardId: tx.card_id,
                status: tx.status as 'completed' | 'pending' | 'failed',
                timestamp: tx.created_at
              }));
              setAllTransactions(formattedAllTx);
              
              const allUsersData = await adminService.getAllUsers();
              const formattedUsers = allUsersData.map((u: any) => ({
                id: u.id,
                name: u.fullname,
                email: u.email,
                phone: u.phone,
                isAdmin: u.is_admin,
                balance: u.balance,
                isVerified: u.is_verified
              }));
              setAllUsers(formattedUsers);
            } catch (error) {
              console.error('Error fetching admin data:', error);
            }
          }
        } catch (error) {
          console.error('Error loading wallet data:', error);
          toast({
            title: "Error",
            description: "Failed to load wallet data",
            variant: "destructive"
          });
        }
      } else {
        setBalance(0);
        setTransactions([]);
        setAllTransactions([]);
        setAllUsers([]);
      }
    };
    
    loadWalletData();
  }, [isAuthenticated, user, isAdmin, toast]);
  
  // Helper function to refresh transactions
  const refreshTransactions = async () => {
    if (!isAuthenticated || !user) return;
    
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
    }
  };
  
  // Top up wallet
  const withdraw = async (amount: number, cardId: string): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;
    
    try {
      const result = await walletService.withdraw(amount, cardId);
      
      // Update local balance
      setBalance(result.balance);
      
      // Refresh transactions
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
    }
  };

  // Deposit money with card
  const deposit = async (cardId: string, amount: number): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to make a deposit.",
        variant: "destructive"
      });
      return false;
    }

    // Validate amount
    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Deposit amount must be greater than zero.",
        variant: "destructive"
      });
      return false;
    }

    // Validate cardId
    if (!cardId) {
      toast({
        title: "Payment method required",
        description: "Please select a payment card.",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Call the deposit API service
      const result = await walletService.deposit(cardId, amount);
      
      // Update local balance with the new balance from the API response
      if (result.balance !== undefined) {
        setBalance(result.balance);
      } else {
        // Fallback: add the deposit amount to current balance
        setBalance(prevBalance => prevBalance + amount);
      }
      
      // Refresh transactions to show the new deposit transaction
      await refreshTransactions();
      
      // If admin, refresh all transactions as well
      if (isAdmin) {
        try {
          const allTxData = await transactionService.getAllTransactions();
          const formattedAllTx = allTxData.map((tx: any) => ({
            ...tx,
            senderId: tx.sender_id,
            recipientId: tx.recipient_id,
            cardId: tx.card_id,
            status: tx.status as 'completed' | 'pending' | 'failed',
            timestamp: tx.created_at
          }));
          setAllTransactions(formattedAllTx);
        } catch (adminError) {
          console.error('Error refreshing admin transactions:', adminError);
        }
      }
      
      toast({
        title: "Deposit successful",
        description: `${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} has been added to your wallet.`
      });
      
      return true;
    } catch (error: any) {
      console.error('Deposit error:', error);
      
      let errorMessage = "Failed to process deposit.";
      
      // Handle different types of errors
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
    }
  };
  
  // Transfer money
  const transfer = async (recipientIdentifier: string, amount: number, description?: string): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;
    
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
        description: error.response?.data?.detail || "Failed to send money.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Get user's transactions
  const getTransactions = async (): Promise<Transaction[]> => {
    if (!user) return [];
    try {
      const userTransactionData = await walletService.getTransactions();
      const result = userTransactionData.map((tx: any) => ({
        ...tx,
        senderId: tx.sender_id,
        recipientId: tx.recipient_id,
        cardId: tx.card_id,
        status: tx.status as 'completed' | 'pending' | 'failed',
        timestamp: tx.created_at
      }));
      setTransactions(result);
      return result;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  };
  
  // Value to provide
  const value: WalletContextType = {
    balance,
    transactions,
    withdraw,
    transfer,
    deposit,
    getTransactions,
    allTransactions,
    allUsers
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