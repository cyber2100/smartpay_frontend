import React from "react";
import { useRoutes } from "react-router-dom";

import { MobileButtonNavigation } from "@/components/MobileButtonNavigation";
import { useAuth } from "@/hooks/use-auth";
// Import or define your authRoutes here
import authRoutes from "./authRoutes"; // Adjust the path as needed
import mainRoutes from "./mainRoutes"; // Adjust the path as needed
import adminRoutes from "./adminRoutes"; // Adjust the path as needed
import Maintenance from "@/pages/Maintenance ";

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
    <>
      <RoutesWrapper 
        user={user}
        isAdmin={isAdmin}
        isAuthenticated={isAuthenticated} 
        isMaintenanceMode={isMaintenanceMode} 
      />
      <MobileButtonNavigation />
    </>
  );
};

export default AppRoutes;