import React, { useEffect, useState } from 'react';
import { ArrowRight, ArrowUp, ArrowDown, Clock, CreditCard, DollarSign, Plus, Minus, PlusIcon, MinusIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { AnimatedBackground } from '@/components/animated-background';
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/hooks/use-wallet';

import { Transaction } from '@/types/payment';

const Wallet: React.FC = () => {
  const { user } = useAuth();
  const { transactions, balance } = useWallet();
  
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user?.isVerified) {
      handleDirectToPath('/verify');
    }
  }, []);

  // Handle navigation to different paths
  const handleDirectToPath = (path: string) => {
    navigate(path);
  };

  /**
   * Formats a date for display.
   * @param timestamp - The timestamp to format.
   * @returns The formatted date string.
   */
  const formatDate = (timestamp: Date | string): string => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  /**
   * Gets the title for a transaction based on its type and involved parties.
   * @param transaction - The transaction to get the title for.
   * @returns The title for the transaction.
   */
  const getTransactionTitle = (transaction: Transaction): string => {
    if (!user?.id) return 'Transaction';
    
    switch (transaction.type) {
      case 'deposit':
        return 'Deposit to Account';
      case 'withdraw':
        return 'Withdrawal from Account';
      case 'transfer':
        if (transaction.senderId === user.id) {
          const recipientName = transaction.recipient?.fullname || 
                               transaction.recipient?.email || 
                               'Unknown User';
          return `Sent to ${recipientName}`;
        } 
        else if (transaction.recipientId === user.id) {
          const senderName = transaction.sender?.fullname || 
                            transaction.sender?.email || 
                            'Unknown User';
          return `Received from ${senderName}`;
        }
        return 'Transfer';
      default:
        return `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} Transaction`;
    }
  };

  /**
   * Gets the display information for a transaction.
   * @param transaction - The transaction to get the display information for.
   * @returns The display information for the transaction.
   */
  const getTransactionDisplay = (transaction: Transaction) => {
    if (!user?.id) {
      return {
        icon: <DollarSign className="h-4 w-4" />,
        bgColor: 'bg-gray-500/10',
        textColor: 'text-gray-600',
        amountColor: 'text-gray-600'
      };
    }

    const isIncoming = transaction.recipientId === user.id;
    const isOutgoing = transaction.senderId === user.id;
    
    switch (transaction.type) {
      case 'deposit':
        return {
          icon: <PlusIcon className="h-4 w-4" />,
          bgColor: 'bg-green-500/10',
          textColor: 'text-green-600',
          amountColor: 'text-green-600'
        };
      case 'withdraw':
        return {
          icon: <MinusIcon className="h-4 w-4" />,
          bgColor: 'bg-red-500/10',
          textColor: 'text-red-600',
          amountColor: 'text-red-600'
        };
      case 'transfer':
        if (isIncoming && !isOutgoing) {
          return {
            icon: <ArrowDown className="h-4 w-4" />,
            bgColor: 'bg-blue-500/10',
            textColor: 'text-blue-600',
            amountColor: 'text-green-600'
          };
        } else if (isOutgoing) {
          return {
            icon: <ArrowUp className="h-4 w-4" />,
            bgColor: 'bg-orange-500/10',
            textColor: 'text-orange-600',
            amountColor: 'text-red-600'
          };
        }
        return {
          icon: <ArrowRight className="h-4 w-4" />,
          bgColor: 'bg-purple-500/10',
          textColor: 'text-purple-600',
          amountColor: 'text-purple-600'
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

  /**
   * Gets the amount for a transaction, adjusting for the user's perspective.
   * @param transaction - The transaction to get the amount for.
   * @returns The adjusted transaction amount.
   */
  const getTransactionAmount = (transaction: Transaction): number => {
    if (!user?.id) return transaction.amount;
    
    switch (transaction.type) {
      case 'deposit':
        return transaction.amount;
      case 'withdraw':
        return -transaction.amount;
      case 'transfer':
        if (transaction.recipientId === user.id && transaction.senderId !== user.id) {
          return transaction.amount;
        } 
        else if (transaction.senderId === user.id) {
          return -transaction.amount;
        }
        return transaction.amount;
      default:
        return transaction.amount;
    }
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Sort transactions by timestamp (newest first)
  const sortedTransactions = transactions ? 
    [...transactions].sort((a, b) => {
      const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
      const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    }) : [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-16">
        <AnimatedBackground />
        
        <div className="container px-4 pt-8 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">My Wallet</h1>
            <p className="text-muted-foreground">Manage your account balance and transactions</p>
          </div>

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
                    ${typeof balance === 'number' ? balance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }) : '0.00'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Account: {user?.email || 'Unknown'}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={() => handleDirectToPath('/deposit')}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4" /> 
                    Deposit
                  </Button>
                  
                  <Button 
                    onClick={() => handleDirectToPath('/withdraw')}
                    variant="outline"
                    className="gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    <Minus className="h-4 w-4" /> 
                    Withdraw
                  </Button>
                  
                  <Button 
                    onClick={() => handleDirectToPath('/transfer')}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <ArrowRight className="h-4 w-4" /> 
                    Transfer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

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

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Recent Transactions</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => handleDirectToPath('/history')}>
                  View all
                </Button>
              </div>
              <CardDescription>Your recent account activity</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {sortedTransactions && sortedTransactions.length > 0 ? (
                  sortedTransactions.slice(0, 5).map((transaction: Transaction) => {
                    const display = getTransactionDisplay(transaction);
                    const amount = getTransactionAmount(transaction);
                    const title = getTransactionTitle(transaction);
                    
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
                              {title}
                            </p>
                            {transaction.description && (
                              <p className="text-sm text-muted-foreground">
                                {transaction.description}
                              </p>
                            )}
                            {transaction.card && (
                              <p className="text-xs text-muted-foreground">
                                Card: {transaction.card.name}
                              </p>
                            )}
                            {transaction.status && transaction.status !== 'completed' && (
                              <p className={`text-xs mt-1 ${getStatusColor(transaction.status)}`}>
                                Status: {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className={`font-semibold ${amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {amount < 0 ? '-' : '+'}
                            ${Math.abs(amount).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </p>
                          <p className="text-xs flex items-center justify-end gap-1 text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(transaction.timestamp)}
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