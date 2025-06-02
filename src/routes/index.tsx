import React from "react";
import { useRoutes } from "react-router-dom";

import { MobileButtonNavigation } from "@/components/MobileButtonNavigation";
import { useAuth } from "@/hooks/use-auth";
// Import or define your authRoutes here
import authRoutes from "./authRoutes"; // Adjust the path as needed
import mainRoutes from "./mainRoutes"; // Adjust the path as needed
import adminRoutes from "./adminRoutes"; // Adjust the path as needed
import NotFound from "@/pages/NotFound"; // Adjust the path as needed

const RoutesWrapper = ({ isAdmin, isAuthenticated }) => {
  let routes = [...authRoutes];

  if (isAuthenticated) {
    routes = [
      ...routes,
      ...(isAdmin ? adminRoutes : []),
      ...mainRoutes,
    ];
  }
  routes.push({
    path: "*",
    element: <NotFound />
  });

  return useRoutes(routes);
};

const AppRoutes = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <>
      <RoutesWrapper 
        isAdmin={isAdmin}
        isAuthenticated={isAuthenticated} 
      />
      <MobileButtonNavigation />
    </>
  );
};

export default AppRoutes;