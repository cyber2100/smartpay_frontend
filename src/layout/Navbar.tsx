import React, { ReactElement, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, Wallet, History, LogOut, UserCircle, WalletIcon, Settings, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { NotificationDropdown } from "../components/NotificationDropdown";
import { ModeToggle } from "../components/mode-toggle";

export function Navbar(): ReactElement {
  const { 
    isAuthenticated, 
    user, 
    signout, 
    isAdmin,
    isAdminPanelView,
    setIsAdminPanelView
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if current page is admin panel on mount and location change
  useEffect(() => {
    setIsAdminPanelView(location.pathname.startsWith('/admin'));
  }, [location.pathname]);

  const scrollToTop = (): void => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const refreshAndGoHome = (): void => {
    if (location.pathname === "/") {
      scrollToTop();
    } else {
      navigate("/", { replace: true });
    }
  };

  const handleSignout = (): void => {
    signout();
    navigate('/signin');
  };

  const handleAdminPanel = (): void => {
    navigate('/admin');
  };

  const handleBackToUserView = (): void => {
    navigate('/', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={refreshAndGoHome}
          >
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-primary">
              <Wallet className="h-5 w-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              SmartPay
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {!isAdminPanelView && (
                <>
                  <NotificationDropdown />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-9 w-9 rounded-full"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full">
                          <User />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user?.name}
                            {isAdmin && <span className="ml-2 text-xs bg-primary text-primary-foreground px-1 rounded">Admin</span>}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                          <Link to="/setting">
                            <Settings className="mr-2 h-4 w-4"/>
                            Setting
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/wallet">
                            <WalletIcon className="mr-2 h-4 w-4"/>
                            Wallet
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/history">
                            <History className="mr-2 h-4 w-4" />
                            <span>Transaction History</span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignout}>
                        <LogOut className="mr-2 h-4 w-4"/>
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}

              {isAdmin && (
                <>
                  {!isAdminPanelView ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAdminPanel}
                      className="flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      Admin Panel
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBackToUserView}
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      User Panel
                    </Button>
                  )}
                </>
              )}

              {isAdminPanelView && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}