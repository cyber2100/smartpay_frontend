import { Notification } from "@/types/notification";

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Transfer Received',
    message: 'You received $250.00 from John Smith',
    type: 'transaction',
    read: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    metadata: {
      transactionId: 'tx_123',
      amount: 250.00
    }
  },
  {
    id: '3',
    title: 'Deposit Successful',
    message: 'Your deposit of $500.00 has been processed successfully',
    type: 'transaction',
    read: false,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    metadata: {
      transactionId: 'tx_789',
      amount: 500.00
    }
  },
  {
    id: '4',
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur on Sunday 2:00 AM - 4:00 AM EST',
    type: 'system',
    read: true,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: '5',
    title: 'Special Offer',
    message: 'Get 2% cashback on all transfers this month!',
    type: 'system',
    read: true,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  }
];