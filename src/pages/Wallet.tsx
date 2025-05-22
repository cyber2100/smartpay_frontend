import React, { useState } from 'react';
import { ArrowRight, ArrowUp, ArrowDown, Clock, CreditCard, DollarSign, Plus, Minus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { AnimatedBackground } from '@/components/animated-background';

// Type definitions
interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: Date;
  type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out';
  description?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
}

const Wallet: React.FC = () => {
  // Mock user data - replace with actual auth hook
  const user: User = {
    id: 'user123',
    email: 'user@example.com',
    name: 'John Doe'
  };

  const navigator = useNavigate();
  
  // Mock wallet data
  const [balance] = useState<number>(2847.65);
  const [transactions] = useState<Transaction[]>([
    {
      id: 'tx1',
      title: 'Deposit from Visa Card',
      amount: 500.00,
      date: new Date(2025, 4, 21, 14, 30),
      type: 'deposit',
      description: 'Card ending in 4242'
    },
    {
      id: 'tx2',
      title: 'Transfer to Alice Smith',
      amount: -150.00,
      date: new Date(2025, 4, 20, 11, 15),
      type: 'transfer_out',
      description: 'Payment for services'
    },
    {
      id: 'tx3',
      title: 'Received from Bob Johnson',
      amount: 275.50,
      date: new Date(2025, 4, 19, 16, 45),
      type: 'transfer_in',
      description: 'Project payment'
    },
    {
      id: 'tx4',
      title: 'Withdrawal to Mastercard',
      amount: -200.00,
      date: new Date(2025, 4, 18, 9, 20),
      type: 'withdrawal',
      description: 'Card ending in 5678'
    },
    {
      id: 'tx5',
      title: 'Deposit from American Express',
      amount: 800.00,
      date: new Date(2025, 4, 17, 13, 10),
      type: 'deposit',
      description: 'Card ending in 9012'
    },
    {
      id: 'tx6',
      title: 'Transfer to Sarah Wilson',
      amount: -89.99,
      date: new Date(2025, 4, 15, 18, 30),
      type: 'transfer_out',
      description: 'Dinner split'
    }
  ]);

  const handleDirectToPath = (path: string) => {
    navigator(path);
  }

  // Format date for display
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get transaction icon and color
  const getTransactionDisplay = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'deposit':
        return {
          icon: <Plus className="h-4 w-4" />,
          bgColor: 'bg-green-500/10',
          textColor: 'text-green-600',
          amountColor: 'text-green-600'
        };
      case 'withdrawal':
        return {
          icon: <Minus className="h-4 w-4" />,
          bgColor: 'bg-red-500/10',
          textColor: 'text-red-600',
          amountColor: 'text-red-600'
        };
      case 'transfer_in':
        return {
          icon: <ArrowDown className="h-4 w-4" />,
          bgColor: 'bg-blue-500/10',
          textColor: 'text-blue-600',
          amountColor: 'text-green-600'
        };
      case 'transfer_out':
        return {
          icon: <ArrowUp className="h-4 w-4" />,
          bgColor: 'bg-orange-500/10',
          textColor: 'text-orange-600',
          amountColor: 'text-red-600'
        };
      default:
        return {
          icon: <DollarSign className="h-4 w-4" />,
          bgColor: 'bg-gray-500/10',
          textColor: 'text-gray-600',
          amountColor: 'text-gray-600'
        };
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-16">
        <AnimatedBackground />
        
        <div className="container px-4 pt-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">My Wallet</h1>
            <p className="text-muted-foreground">Manage your account balance and transactions</p>
          </div>

          {/* Balance Card */}
          <Card className="mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/10 z-0"></div>
            
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                  Account Balance
                </CardTitle>
              </div>
              <CardDescription>Your current available balance</CardDescription>
            </CardHeader>
            
            <CardContent className="relative z-10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <h2 className="text-5xl font-bold mb-2">
                    ${balance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Account: {user.email}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={()=>handleDirectToPath('/deposit')}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4" /> 
                    Deposit
                  </Button>
                  
                  <Button 
                    onClick={()=>handleDirectToPath('/withdraw')}
                    variant="outline"
                    className="gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    <Minus className="h-4 w-4" /> 
                    Withdraw
                  </Button>
                  
                  <Button 
                    onClick={()=>handleDirectToPath('/transfer')}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <ArrowRight className="h-4 w-4" /> 
                    Transfer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supported Cards Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Supported Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Visa</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-950 rounded-lg">
                  <CreditCard className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Mastercard</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-950 rounded-lg">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">American Express</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Recent Transactions</CardTitle>
                <Button variant="ghost" size="sm" onClick={()=>handleDirectToPath('/history')}>
                  View all
                </Button>
              </div>
              <CardDescription>Your recent account activity</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {transactions.length > 0 ? (
                  transactions.map((transaction: Transaction) => {
                    const display = getTransactionDisplay(transaction);
                    
                    return (
                      <div 
                        key={transaction.id} 
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${display.bgColor}`}>
                            <div className={display.textColor}>
                              {display.icon}
                            </div>
                          </div>
                          
                          <div>
                            <p className="font-medium">
                              {transaction.title}
                            </p>
                            {transaction.description && (
                              <p className="text-sm text-muted-foreground">
                                {transaction.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className={`font-semibold ${display.amountColor}`}>
                            {transaction.amount < 0 ? '-' : '+'}
                            ${Math.abs(transaction.amount).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </p>
                          <p className="text-xs flex items-center justify-end gap-1 text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center p-8 border rounded-lg">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No transactions yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start by making a deposit or transfer
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Wallet;