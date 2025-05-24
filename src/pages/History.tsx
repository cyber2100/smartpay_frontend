import React, { useEffect, useState } from 'react';
import { ArrowRight, ArrowUp, ArrowDown, Clock, CreditCard, DollarSign, Plus, Minus, PlusIcon, MinusIcon, Search, Filter, X, User, Calendar, Hash, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { AnimatedBackground } from '@/components/animated-background';
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/hooks/use-wallet';
import { Transaction } from '@/types/payment';

const Hitory: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { transactions, getTransactions, balance } = useWallet();
  
  const navigate = useNavigate();
  
  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated) {
      return navigate('/signin');
    } else if (!user?.isVerified) {
      return navigate('/verify');
    }
    getTransactions();
  }, [isAuthenticated, user?.isVerified, navigate, getTransactions]);

  const handleDirectToPath = (path: string) => {
    navigate(path);
  };

  // Format timestamp for display - handling both Date objects and ISO strings from backend
  const formatDate = (timestamp: Date | string): string => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    
    // Check if date is valid
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

  // Format full date for detail dialog
  const formatFullDate = (timestamp: Date | string): string => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  // Get transaction title based on type and parties involved
  const getTransactionTitle = (transaction: Transaction): string => {
    if (!user?.id) return 'Transaction';
    
    switch (transaction.type) {
      case 'deposit':
        return 'Deposit to Account';
      case 'withdraw':
        return 'Withdrawal from Account';
      case 'transfer':
        // Check if current user is the sender
        if (transaction.senderId === user.id) {
          const recipientName = transaction.recipient?.fullname || 
                               transaction.recipient?.email || 
                               'Unknown User';
          return `Transfer to ${recipientName}`;
        } 
        // Check if current user is the recipient
        else if (transaction.recipientId === user.id) {
          const senderName = transaction.sender?.fullname || 
                            transaction.sender?.email || 
                            'Unknown User';
          return `Transfer from ${senderName}`;
        }
        return 'Transfer';
      default:
        return `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} Transaction`;
    }
  };

  // Get transaction icon and color
  const getTransactionDisplay = (transaction: Transaction) => {
    if (!user?.id) {
      return {
        icon: <DollarSign className="h-4 w-4" />,
        bgColor: 'bg-gray-500/10',
        textColor: 'text-gray-600',
        amountColor: 'text-gray-600'
      };
    }

    // Determine if this is an incoming or outgoing transaction for the current user
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
        // Fallback for transfer type
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

  // Determine if a transaction amount should display as positive or negative
  const getTransactionAmount = (transaction: Transaction): number => {
    if (!user?.id) return transaction.amount;
    
    switch (transaction.type) {
      case 'deposit':
        return transaction.amount;
      case 'withdraw':
        return -transaction.amount;
      case 'transfer':
        // If current user is the recipient, it's a positive amount
        if (transaction.recipientId === user.id && transaction.senderId !== user.id) {
          return transaction.amount;
        } 
        // If current user is the sender, it's a negative amount
        else if (transaction.senderId === user.id) {
          return -transaction.amount;
        }
        // Fallback: return the amount as-is
        return transaction.amount;
      default:
        // For other transaction types, assume positive
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

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Filter and search transactions
  const filteredTransactions = React.useMemo(() => {
    if (!transactions) return [];

    let filtered = [...transactions];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(transaction => {
        const title = getTransactionTitle(transaction).toLowerCase();
        const description = transaction.description?.toLowerCase() || '';
        const amount = transaction.amount.toString();
        const senderName = transaction.sender?.fullname?.toLowerCase() || transaction.sender?.email?.toLowerCase() || '';
        const recipientName = transaction.recipient?.fullname?.toLowerCase() || transaction.recipient?.email?.toLowerCase() || '';
        const cardName = transaction.card?.name?.toLowerCase() || '';
        
        return title.includes(searchLower) ||
               description.includes(searchLower) ||
               amount.includes(searchLower) ||
               senderName.includes(searchLower) ||
               recipientName.includes(searchLower) ||
               cardName.includes(searchLower);
      });
    }

    // Sort by timestamp (newest first)
    return filtered.sort((a, b) => {
      const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
      const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });
  }, [transactions, selectedCategory, searchTerm, user?.id]);

  // Get unique transaction types for filter dropdown
  const transactionTypes = React.useMemo(() => {
    if (!transactions) return [];
    const types = [...new Set(transactions.map(t => t.type))];
    return types.map(type => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1)
    }));
  }, [transactions]);

  // Handle transaction row click
  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailDialogOpen(true);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-xl">Transaction History</CardTitle>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  
                  {/* Category Filter */}
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {transactionTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Clear Filters Button */}
                  {(searchTerm || selectedCategory !== 'all') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Filter Summary */}
              {(searchTerm || selectedCategory !== 'all') && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Showing {filteredTransactions.length} of {transactions?.length || 0} transactions</span>
                  {searchTerm && (
                    <Badge variant="secondary" className="text-xs">
                      Search: "{searchTerm}"
                    </Badge>
                  )}
                  {selectedCategory !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      Type: {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                    </Badge>
                  )}
                </div>
              )}
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2">
                {filteredTransactions && filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction: Transaction) => {
                    const display = getTransactionDisplay(transaction);
                    const amount = getTransactionAmount(transaction);
                    const title = getTransactionTitle(transaction);
                    
                    return (
                      <div 
                        key={transaction.id} 
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleTransactionClick(transaction)}
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
                              <Badge 
                                variant={getStatusBadgeVariant(transaction.status)}
                                className="text-xs mt-1"
                              >
                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </Badge>
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
                ) : searchTerm || selectedCategory !== 'all' ? (
                  <div className="text-center p-8 border rounded-lg">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No transactions match your search</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try adjusting your search terms or filters
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearFilters}
                      className="mt-3"
                    >
                      Clear filters
                    </Button>
                  </div>
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

      {/* Transaction Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Transaction Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this transaction
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Transaction Header */}
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${getTransactionDisplay(selectedTransaction).bgColor}`}>
                  <div className={getTransactionDisplay(selectedTransaction).textColor}>
                    {getTransactionDisplay(selectedTransaction).icon}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {getTransactionTitle(selectedTransaction)}
                  </h3>
                  <Badge variant={getStatusBadgeVariant(selectedTransaction.status)}>
                    {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Amount */}
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Amount</p>
                <p className={`text-3xl font-bold ${getTransactionAmount(selectedTransaction) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {getTransactionAmount(selectedTransaction) < 0 ? '-' : '+'}
                  ${Math.abs(getTransactionAmount(selectedTransaction)).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>

              {/* Transaction Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction ID</p>
                    <p className="font-mono text-sm">{selectedTransaction.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="text-sm">{formatFullDate(selectedTransaction.timestamp)}</p>
                  </div>
                </div>

                {selectedTransaction.description && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-sm">{selectedTransaction.description}</p>
                    </div>
                  </div>
                )}

                {selectedTransaction.sender && (
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">From</p>
                      <p className="text-sm font-medium">{selectedTransaction.sender.fullname}</p>
                      <p className="text-xs text-muted-foreground">{selectedTransaction.sender.email}</p>
                      {selectedTransaction.sender.phone && (
                        <p className="text-xs text-muted-foreground">{selectedTransaction.sender.phone}</p>
                      )}
                    </div>
                  </div>
                )}

                {selectedTransaction.recipient && (
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">To</p>
                      <p className="text-sm font-medium">{selectedTransaction.recipient.fullname}</p>
                      <p className="text-xs text-muted-foreground">{selectedTransaction.recipient.email}</p>
                      {selectedTransaction.recipient.phone && (
                        <p className="text-xs text-muted-foreground">{selectedTransaction.recipient.phone}</p>
                      )}
                    </div>
                  </div>
                )}

                {selectedTransaction.card && (
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="text-sm">{selectedTransaction.card.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Hitory;