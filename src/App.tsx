import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { WalletProvider } from "@/hooks/use-wallet";
import { SettingsProvider } from "./hooks/use-settings";
import { CardProvider } from "./hooks/use-card";
import { NotificationProvider } from "./hooks/use-notifications";
import { Navbar } from "@/layout/Navbar";
import AppRoutes from "@/routes/index";

const queryClient = new QueryClient();

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