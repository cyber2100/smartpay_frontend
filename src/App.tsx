import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { WalletProvider } from "@/hooks/use-wallet";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "./components/sidebar";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import Index from "./pages/Index";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Verify from "./pages/Verify";
import Wallet from "./pages/Wallet";
import Transfer from "./pages/Transfer";
import Deposit from "./pages/Deposit";
import History from "./pages/History";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import React from "react";
import ProfilePage from "./pages/Profile";
import Card from "./pages/Card";
import Dashboard from "./pages/Dashboard";
import { MobileButtonNavigation } from "./components/MobileButtonNavigation";
import { useAuth } from "@/hooks/use-auth";
import { CardProvider } from "./hooks/use-card";

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
  const { isAuthenticated } = useAuth();
  return (
    <PageTransition>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/dashboard" element={<AuthLayout><Dashboard /></AuthLayout>} />
        <Route path="/wallet" element={<AuthLayout><Wallet /></AuthLayout>} />
        <Route path="/transfer" element={<AuthLayout><Transfer /></AuthLayout>} />
        <Route path="/deposit" element={<AuthLayout><Deposit /></AuthLayout>} />
        <Route path="/history" element={<AuthLayout><History /></AuthLayout>} />
        <Route path="/admin" element={<AuthLayout><AdminPanel /></AuthLayout>} />
        <Route path="/profile" element={<AuthLayout><ProfilePage /></AuthLayout>} />
        <Route path="/card" element={<AuthLayout><Card /></AuthLayout>} />
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
          </CardProvider>
        </WalletProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
