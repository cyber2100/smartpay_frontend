import React, { useState } from 'react';
import { Users, BarChart3, Wallet } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'; 
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/admin');
  const navigate = useNavigate();
  
  const tabs = [
    {
      id: 'users',
      label: 'User Management',
      path: '/admin/users',
      icon: Users,
      description: 'Manage users, view profiles, and handle user verification'
    },
    {
      id: 'transactions',
      label: 'Transaction Statistics',
      path: '/admin/transactions',
      icon: BarChart3,
      description: 'View transaction analytics, reports, and payment insights'
    },
    {
      id: 'balances',
      label: 'Balance Statistics',
      path: '/admin/balances',
      icon: Wallet,
      description: 'Monitor account balances, financial summaries, and wallet data'
    }
  ];

  const handleTabClick = (path: string) => {
    setCurrentPath(path);
    navigate(path);
    console.log(`Navigating to: ${path}`);
  };

  const isCurrentPath = (path: string) => {
    return currentPath === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 bg-[size:20px_20px] opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50/50 to-transparent dark:via-slate-900/50" />
      
      <div className="relative container px-4 pt-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Admin Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your platform with comprehensive administrative tools
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = isCurrentPath(tab.path);
              
              return (
                <Card 
                  key={tab.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                    isActive 
                      ? 'ring-2 ring-primary shadow-lg bg-primary/5' 
                      : 'hover:ring-1 hover:ring-primary/50'
                  }`}
                  onClick={() => handleTabClick(tab.path)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className={`p-4 rounded-full ${
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <IconComponent size={32} />
                      </div>
                    </div>
                    <CardTitle className={`text-xl ${
                      isActive ? 'text-primary' : 'text-foreground'
                    }`}>
                      {tab.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tab.description}
                    </p>
                    {isActive && (
                      <div className="mt-4 pt-4 border-t">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                          Current Section
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="mt-16 text-center">
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="py-8">
                <h3 className="text-lg font-semibold mb-2">Welcome to Admin Dashboard</h3>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                  Select a section above to access detailed management tools. Each section provides 
                  comprehensive controls and analytics for different aspects of your platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;