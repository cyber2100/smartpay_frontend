import React from "react";
import { useRoutes } from "react-router-dom";

import { AnimatePresence, motion } from "framer-motion";
import { MobileButtonNavigation } from "@/components/MobileButtonNavigation";
import { Routes, Route, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
// Import or define your authRoutes here
import authRoutes from "./authRoutes"; // Adjust the path as needed
import mainRoutes from "./mainRoutes"; // Adjust the path as needed
import adminRoutes from "./adminRoutes"; // Adjust the path as needed
import Maintenance from "@/pages/Maintenance ";

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

const RoutesWrapper = ({ user, isAdmin, isAuthenticated, isMaintenanceMode }) => {
  let routes = [];

  if (isMaintenanceMode) {
    routes = [{ path: "*", element: <Maintenance /> }];
  } else if (isAuthenticated) {
    routes = [
      ...(isAdmin ? adminRoutes : []),
      ...mainRoutes,
    ];
  } else {
    routes = authRoutes;
  }

  return useRoutes(routes);
};

const AppRoutes = () => {
  const isMaintenanceMode = false;
  const { user, isAuthenticated, isAdmin } = useAuth();

  return (
    <PageTransition>
      <RoutesWrapper 
        user={user}
        isAdmin={isAdmin}
        isAuthenticated={isAuthenticated} 
        isMaintenanceMode={isMaintenanceMode} 
      />
    </PageTransition>
  );
};

export default AppRoutes;