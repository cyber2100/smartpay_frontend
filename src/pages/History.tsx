import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUp, Calendar, Search } from "lucide-react";
import { AnimatedBackground } from '@/components/animated-background';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/hooks/use-auth';
import { useWallet, Transaction } from '@/hooks/use-wallet';

// Mock data for development/fallback
const mockTransactions: Transaction[] = [
  {
    id: '1',
    senderId: 'user-123',
    recipientId: 'user-456',
    senderName: 'John Doe',
    recipientName: 'Alice Smith',
    amount: 250.00,
    description: 'Dinner payment',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: 'completed'
  },
  {
    id: '2',
    senderId: 'user-789',
    recipientId: 'user-123',
    senderName: 'Bob Wilson',
    recipientName: 'John Doe',
    amount: 150.75,
    description: 'Coffee refund',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    status: 'completed'
  },
  {
    id: '3',
    senderId: 'user-123',
    recipientId: 'user-321',
    senderName: 'John Doe',
    recipientName: 'Sarah Johnson',
    amount: 75.25,
    description: 'Lunch split',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    status: 'completed'
  },
  {
    id: '4',
    senderId: 'user-654',
    recipientId: 'user-123',
    senderName: 'Mike Davis',
    recipientName: 'John Doe',
    amount: 500.00,
    description: 'Rent contribution',
    timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000), // Yesterday
    status: 'completed'
  },
  {
    id: '5',
    senderId: 'user-123',
    recipientId: 'user-987',
    senderName: 'John Doe',
    recipientName: 'Emma Brown',
    amount: 30.50,
    description: 'Movie tickets',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    status: 'completed'
  },
  {
    id: '6',
    senderId: 'user-111',
    recipientId: 'user-123',
    senderName: 'David Lee',
    recipientName: 'John Doe',
    amount: 125.80,
    description: 'Grocery sharing',
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
    status: 'completed'
  },
  {
    id: '7',
    senderId: 'user-123',
    recipientId: 'user-222',
    senderName: 'John Doe',
    recipientName: 'Lisa Garcia',
    amount: 200.00,
    description: 'Birthday gift contribution',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    status: 'completed'
  }
];

interface HistoryProps {}

const History: React.FC<HistoryProps> = () => {
  const { user, isAuthenticated } = useAuth();
  const { getTransactions } = useWallet();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [usesMockData, setUsesMockData] = useState<boolean>(false);
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);
  
  // Get all transactions with fallback to mock data
  useEffect(() => {
    const fetchTransactions = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const transactions = await getTransactions();
        
        // Check if we got real data or if the API is not available
        if (transactions && transactions.length > 0) {
          setAllTransactions(transactions);
          setUsesMockData(false);
        } else {
          // Fallback to mock data if no transactions or API unavailable
          console.warn('API not available or no transactions found, using mock data');
          setAllTransactions(mockTransactions);
          setUsesMockData(true);
        }
      } catch (error) {
        console.error('Error fetching transactions, falling back to mock data:', error);
        setAllTransactions(mockTransactions);
        setUsesMockData(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchTransactions();
    }
  }, [getTransactions, isAuthenticated]);
  
  // Apply filters
  const filteredTransactions = allTransactions.filter((tx: Transaction): boolean => {
    // Text search
    const searchMatch = 
      tx.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.description && tx.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Type filter
    let typeMatch = true;
    if (filterType === 'sent' && tx.senderId !== user?.id) {
      typeMatch = false;
    } else if (filterType === 'received' && tx.recipientId !== user?.id) {
      typeMatch = false;
    }
    
    return searchMatch && typeMatch;
  });

  // Format date for display
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Group transactions by date (for day headers)
  const groupByDate = (transactions: Transaction[]): [string, Transaction[]][] => {
    const groups: { [key: string]: Transaction[] } = {};
    
    transactions.forEach((tx: Transaction) => {
      const date = new Date(tx.timestamp);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(tx);
    });
    
    // Convert to array of [date, transactions] and sort by date (newest first)
    return Object.entries(groups).sort((a, b) => {
      return new Date(b[0]).getTime() - new Date(a[0]).getTime();
    });
  };
  
  const groupedTransactions = groupByDate(filteredTransactions);
  
  // Format date for group headers
  const formatGroupDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toISOString().split('T')[0] === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (date.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen pb-16">
        <AnimatedBackground />
        <div className="container px-4 pt-8">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Loading your transactions...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <AnimatedBackground />
      
      <div className="container px-4 pt-8">
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              View all your past transactions
              {usesMockData && (
                <span className="block text-xs text-orange-600 mt-1">
                  • Using demo data (API not available)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <div className="w-full md:w-48">
                <Select
                  value={filterType}
                  onValueChange={(value: string) => setFilterType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Transactions list */}
            <div className="space-y-6">
              {groupedTransactions.length > 0 ? (
                groupedTransactions.map(([dateKey, txs]: [string, Transaction[]]) => (
                  <div key={dateKey}>
                    {/* Date header */}
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <h4 className="text-sm font-medium">{formatGroupDate(dateKey)}</h4>
                    </div>
                    
                    {/* Transactions for this date */}
                    <div className="space-y-2">
                      {txs.map((tx: Transaction) => (
                        <div 
                          key={tx.id} 
                          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full 
                              ${tx.senderId === user?.id ? 'bg-destructive/10' : 'bg-primary/10'}`
                            }>
                              {tx.senderId === user?.id ? (
                                <ArrowRight className="h-4 w-4 text-destructive" />
                              ) : (
                                <ArrowUp className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            
                            <div>
                              <p className="font-medium">
                                {tx.senderId === user?.id ? `To ${tx.recipientName}` : `From ${tx.senderName}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {tx.description || 'Money transfer'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className={`font-medium 
                              ${tx.senderId === user?.id ? 'text-destructive' : 'text-primary'}`
                            }>
                              {tx.senderId === user?.id ? '-' : '+'}
                              ${tx.amount.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(tx.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8">
                  <p className="text-muted-foreground">No matching transactions found</p>
                  {searchTerm && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Try adjusting your search or filter criteria
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default History;