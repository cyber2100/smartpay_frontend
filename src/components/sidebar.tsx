import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Home,
  LogOut, 
  Settings, 
  User,
  Wallet, 
  Clock,
  Send,
  CreditCard,
  ArrowUpCircle,
  ArrowDownCircle,
  UserCheck,
  Users,
  Receipt,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MenuItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  path: string;
}

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdminPanelView } = useAuth();
  
  const pathSegments: string[] = location.pathname.split('/');
  const activePage: string = pathSegments[pathSegments.length - 1] || 'dashboard';
  
  const regularMenuItems: MenuItem[] = [
    { id: 'dashboard', name: 'Dashboard', icon: <Home className="h-5 w-5" />, path: '/dashboard' },
    { id: 'wallet', name: 'Wallet', icon: <Wallet className="h-5 w-5" />, path: '/wallet' },
    { id: 'card', name: 'Card', icon: <CreditCard className="h-5 w-5" />, path: '/card' },
    { id: 'deposit', name: 'Deposit', icon: <ArrowDownCircle className="h-5 w-5" />, path: '/deposit' },
    { id: 'withdraw', name: 'Withdraw', icon: <ArrowUpCircle className="h-5 w-5" />, path: '/withdraw' },
    { id: 'transfer', name: 'Transfer', icon: <Send className="h-5 w-5" />, path: '/transfer' },
    { id: 'history', name: 'History', icon: <Clock className="h-5 w-5" />, path: '/history' },
  ];

  const adminMenuItems: MenuItem[] = [
    { id: 'users', name: 'Users', icon: <Users className="h-5 w-5" />, path: '/admin/users' },
    { id: 'transactions', name: 'Transactions', icon: <Receipt className="h-5 w-5" />, path: '/admin/transactions' },
    { id: 'balances', name: 'Balances', icon: <DollarSign className="h-5 w-5" />, path: '/admin/balances' },
  ];
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>(regularMenuItems);
  
  useEffect(() => {
    if (isAdminPanelView) {
      setMenuItems(adminMenuItems);
    } else {
      const baseItems = [...regularMenuItems];
      // Add AdminPanel option for non-admin view if user is admin
      if (user?.isAdmin) {
        const adminPanelMenu: MenuItem = { 
          id: 'admin', 
          name: 'AdminPanel', 
          icon: <UserCheck className="h-5 w-5" />, 
          path: '/admin' 
        };
        baseItems.push(adminPanelMenu);
      }
      setMenuItems(baseItems);
    }
  }, [isAdminPanelView, user?.isAdmin]);
  
  const handleNavigation = (path: string): void => {
    navigate(path);
  };

  return (
    <div className="fixed top-16 left-0 w-64 bottom-0 bg-background border-r flex flex-col justify-between py-6 overflow-y-auto">
      <div className="space-y-6 flex-1">
        <div className="px-4">
          <h2 className="text-2xl font-bold">
            {isAdminPanelView ? 'Admin Dashboard' : 'Finance App'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isAdminPanelView ? 'Manage system' : 'Manage your money'}
          </p>
        </div>
        
        <div className="space-y-1 px-2 flex-1">
          {menuItems.map((item: MenuItem) => (
            <Button
              key={item.id}
              variant={activePage === item.id ? "default" : "ghost"}
              className={`w-full justify-start gap-3 ${
                activePage === item.id ? "bg-primary text-primary-foreground" : ""
              }`}
              onClick={() => handleNavigation(item.path)}
            >
              {item.icon}
              {item.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};