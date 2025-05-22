import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUp, Clock, CreditCard, DollarSign, RefreshCw } from "lucide-react";
import { AnimatedBackground } from '@/components/animated-background';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/hooks/use-wallet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Type definitions
interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: Date;
}

interface PlatformData {
  name: string;
  balance: number;
  email: string;
  accountId: string;
  color: string;
  buttonColor: string;
  icon: React.ReactNode;
  url: string;
  transactions: Transaction[];
}

type PlatformType = 'paypal' | 'stripe' | 'payoneer';
type ReceiverType = 'email' | 'phone';

const Wallet: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { balance, transactions } = useWallet();
  const navigate = useNavigate();
  
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('paypal');
  const [isTransferOpen, setIsTransferOpen] = useState<boolean>(false);
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [receiverInfo, setReceiverInfo] = useState<string>('');
  const [receiverType, setReceiverType] = useState<ReceiverType>('email');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Platform-specific data
  const platformData: Record<PlatformType, PlatformData> = {
    paypal: {
      name: 'PayPal',
      balance: 1254.75,
      email: user?.email || 'user@example.com',
      accountId: 'PP-' + (user?.id || '12345678'),
      color: 'from-blue-500/20 to-blue-600/10',
      buttonColor: 'bg-blue-500',
      icon: <DollarSign className="h-6 w-6 text-blue-500" />,
      url: 'https://www.paypal.com',
      transactions: [
        { id: 'pp1', title: 'eBay Purchase', amount: -89.99, date: new Date(2025, 4, 19, 14, 30) },
        { id: 'pp2', title: 'Freelance Payment', amount: 350.00, date: new Date(2025, 4, 17, 9, 15) },
        { id: 'pp3', title: 'Online Store Refund', amount: 24.50, date: new Date(2025, 4, 15, 16, 45) },
        { id: 'pp4', title: 'Subscription Renewal', amount: -12.99, date: new Date(2025, 4, 10, 7, 30) },
      ]
    },
    stripe: {
      name: 'Stripe',
      balance: 3782.40,
      email: user?.email || 'user@example.com',
      accountId: 'ST-' + (user?.id || '87654321'),
      color: 'from-purple-500/20 to-purple-600/10',
      buttonColor: 'bg-purple-600',
      icon: <CreditCard className="h-6 w-6 text-purple-600" />,
      url: 'https://dashboard.stripe.com',
      transactions: [
        { id: 'st1', title: 'Client Invoice #1082', amount: 1200.00, date: new Date(2025, 4, 20, 11, 25) },
        { id: 'st2', title: 'Platform Fee', amount: -35.80, date: new Date(2025, 4, 20, 11, 25) },
        { id: 'st3', title: 'Client Invoice #1075', amount: 850.00, date: new Date(2025, 4, 15, 14, 10) },
        { id: 'st4', title: 'Platform Fee', amount: -25.50, date: new Date(2025, 4, 15, 14, 10) },
      ]
    },
    payoneer: {
      name: 'Payoneer',
      balance: 945.20,
      email: user?.email || 'user@example.com',
      accountId: 'PN-' + (user?.id || '23456789'),
      color: 'from-red-500/20 to-red-600/10',
      buttonColor: 'bg-red-500',
      icon: <RefreshCw className="h-6 w-6 text-red-500" />,
      url: 'https://myaccount.payoneer.com',
      transactions: [
        { id: 'py1', title: 'Marketplace Earnings', amount: 427.50, date: new Date(2025, 4, 18, 17, 20) },
        { id: 'py2', title: 'Withdrawal to Bank', amount: -300.00, date: new Date(2025, 4, 14, 10, 45) },
        { id: 'py3', title: 'Client Payment', amount: 180.00, date: new Date(2025, 4, 9, 13, 15) },
        { id: 'py4', title: 'Annual Fee', amount: -29.95, date: new Date(2025, 4, 5, 0, 0) },
      ]
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);
  
  const handleTransfer = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) return;
    if (!receiverInfo.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to the selected platform
      window.open(platformData[selectedPlatform].url, '_blank');
      setIsTransferOpen(false);
      setTransferAmount('');
      setReceiverInfo('');
    } catch (error) {
      console.error('Transfer error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const goToPlatform = (): void => {
    window.open(platformData[selectedPlatform].url, '_blank');
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handlePlatformChange = (value: string): void => {
    setSelectedPlatform(value as PlatformType);
  };

  const handleReceiverTypeChange = (type: ReceiverType): void => {
    setReceiverType(type);
  };

  const handleTransferAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setTransferAmount(e.target.value);
  };

  const handleReceiverInfoChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setReceiverInfo(e.target.value);
  };

  const closeTransferDialog = (): void => {
    setIsTransferOpen(false);
  };

  const openTransferDialog = (): void => {
    setIsTransferOpen(true);
  };

  // Get platform-specific data
  const currentPlatform: PlatformData = platformData[selectedPlatform];
  
  return (
    <div className="min-h-screen pb-16">
      <AnimatedBackground />
      
      <div className="container px-4 pt-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main wallet card */}
          <div className="w-full md:w-2/3">
            <Card className="relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${currentPlatform.color} z-0`}></div>
              
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Your {currentPlatform.name} Account</CardTitle>
                  {currentPlatform.icon}
                </div>
                <CardDescription>Manage your {currentPlatform.name} balance and transactions</CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <Tabs defaultValue="paypal" value={selectedPlatform} onValueChange={handlePlatformChange} className="mb-6">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="paypal">PayPal</TabsTrigger>
                    <TabsTrigger value="stripe">Stripe</TabsTrigger>
                    <TabsTrigger value="payoneer">Payoneer</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <p className="text-muted-foreground">{currentPlatform.name} Balance</p>
                    <h3 className="text-4xl font-bold">
                      ${currentPlatform.balance.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Account ID: {currentPlatform.accountId}
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      onClick={openTransferDialog}
                      className="gap-1"
                    >
                      <ArrowUp className="h-4 w-4" /> Transfer
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={goToPlatform}
                      className="gap-1"
                    >
                      <ArrowRight className="h-4 w-4" /> Go to {currentPlatform.name}
                    </Button>
                  </div>
                </div>
                
                {/* Transaction history section */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-semibold">Recent {currentPlatform.name} Transactions</h4>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={goToPlatform}
                    >
                      View all
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {currentPlatform.transactions.length > 0 ? (
                      currentPlatform.transactions.map((tx: Transaction) => (
                        <div 
                          key={tx.id} 
                          className="flex items-center justify-between p-3 rounded-lg border bg-card"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full 
                              ${tx.amount < 0 ? 'bg-destructive/10' : 'bg-primary/10'}`
                            }>
                              {tx.amount < 0 ? (
                                <ArrowRight className="h-4 w-4" />
                              ) : (
                                <ArrowUp className="h-4 w-4" />
                              )}
                            </div>
                            
                            <div>
                              <p className="font-medium">{tx.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {currentPlatform.name} transaction
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className={`font-medium 
                              ${tx.amount < 0 ? 'text-destructive' : 'text-primary'}`
                            }>
                              {tx.amount < 0 ? '-' : '+'}
                              ${Math.abs(tx.amount).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </p>
                            <p className="text-xs flex items-center justify-end gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatDate(tx.date)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-muted-foreground">No transactions yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Side panel */}
          <div className="w-full md:w-1/3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={openTransferDialog} className="w-full justify-start gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Transfer Money
                </Button>
                <Button variant="outline" onClick={goToPlatform} className="w-full justify-start gap-2">
                  <Clock className="h-4 w-4" />
                  View Full {currentPlatform.name} Dashboard
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{currentPlatform.name} Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Account Name</p>
                  <p className="font-medium">{user?.name || 'User Name'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{currentPlatform.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account ID</p>
                  <p className="font-medium">{currentPlatform.accountId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    Connected
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Transfer dialog */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Money with {currentPlatform.name}</DialogTitle>
            <DialogDescription>
              Enter recipient information and the amount you want to send.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTransfer}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="receiverType">Send to</Label>
                <div className="flex gap-2 mb-2">
                  <Button 
                    type="button"
                    variant={receiverType === 'email' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => handleReceiverTypeChange('email')}
                  >
                    Email
                  </Button>
                  <Button 
                    type="button"
                    variant={receiverType === 'phone' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => handleReceiverTypeChange('phone')}
                  >
                    Phone
                  </Button>
                </div>
                <Input
                  id="receiverInfo"
                  type={receiverType === 'email' ? 'email' : 'tel'}
                  placeholder={receiverType === 'email' ? 'recipient@example.com' : '+1 (555) 123-4567'}
                  value={receiverInfo}
                  onChange={handleReceiverInfoChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  min="1"
                  step="any"
                  value={transferAmount}
                  onChange={handleTransferAmountChange}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeTransferDialog}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? "Processing..." : "Send Money"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Wallet;