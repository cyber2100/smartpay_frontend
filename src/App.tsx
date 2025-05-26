import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { WalletProvider } from "@/hooks/use-wallet";
import { SettingsProvider } from "./hooks/use-settings";
import { CardProvider } from "./hooks/use-card";
import { NotificationProvider } from "./hooks/use-notifications";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "./components/sidebar";
import { AnimatePresence, motion } from "framer-motion";
import { MobileButtonNavigation } from "./components/MobileButtonNavigation";
import { PublicOnlyRoute, ProtectedRoute } from "./components/RouteGuard";
import Index from "./pages/Index";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Verify from "./pages/Verify";
import Wallet from "./pages/Wallet";
import Transfer from "./pages/Transfer";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import History from "./pages/History";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Setting from "./pages/Setting";
import Card from "./pages/Card";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import TransactionStatistics from "./pages/admin/TransactionStatistics";
import BalanceStatistics from "./pages/admin/BalanceStatistics";
import Notification from "./pages/Notification";

const queryClient = new QueryClient();

// Animation wrapper component
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="sync">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0 }}
        className="flex-1"
      >
        {children}
        <MobileButtonNavigation />
      </motion.div>
    </AnimatePresence>
  );
};

// AuthRoutes wrapper component that properly creates the layout
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-background">
      <div className="hidden md:block w-64">
        <Sidebar />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <PageTransition>
      <Routes>
        {/* Public routes - accessible to everyone */}
        <Route path="/" element={<Index />} />
        
        {/* Public routes - only for non-authenticated users */}
        <Route 
          path="/signin" 
          element={
            <PublicOnlyRoute>
              <Signin />
            </PublicOnlyRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicOnlyRoute>
              <Signup />
            </PublicOnlyRoute>
          } 
        />
        
        {/* Verify route - accessible to everyone (needed for email verification) */}
        <Route path="/verify" element={<Verify />} />
        
        {/* Protected routes - only for authenticated users */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <AuthLayout>
                <Dashboard />
              </AuthLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/wallet" 
          element={
            <ProtectedRoute>
              <AuthLayout>
                <Wallet />
              </AuthLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/transfer" 
          element={
            <ProtectedRoute>
              <AuthLayout>
                <Transfer />
              </AuthLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/deposit" 
          element={
            <ProtectedRoute>
              <AuthLayout>
                <Deposit />
              </AuthLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/withdraw" 
          element={
            <ProtectedRoute>
              <AuthLayout>
                <Withdraw />
              </AuthLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/history" 
          element={
            <ProtectedRoute>
              <AuthLayout>
                <History />
              </AuthLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute>
              <AuthLayout>
                <UserManagement />
              </AuthLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/transactions" 
          element={
            <ProtectedRoute>
              <AuthLayout>
                <TransactionStatistics />
              </AuthLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/balances" 
          element={
            <ProtectedRoute>
              <AuthLayout>
                <BalanceStatistics />
              </AuthLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/setting" 
          element={
            <ProtectedRoute>
              <AuthLayout>
                <Setting />
              </AuthLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/card" 
          element={
            <ProtectedRoute>
              <AuthLayout>
                <Card />
              </AuthLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <AuthLayout>
                <Notification />
              </AuthLayout>
            </ProtectedRoute>
          } 
        />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageTransition>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        <WalletProvider>
          <CardProvider>
            <SettingsProvider>
              <NotificationProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <div className="min-h-screen flex flex-col">
                      <Navbar />
                      <AppRoutes />
                    </div>
                  </BrowserRouter>
                </TooltipProvider>
              </NotificationProvider>
            </SettingsProvider>
          </CardProvider>
        </WalletProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;