import { useRoutes } from "react-router-dom";

import Index from "@/pages/Index";
import Signin from "@/pages/auth/Signin";
import Signup from "@/pages/auth/Signup";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import { PublicOnlyRoute } from "./RouteGuide";

const authRoutes = [
  { path: "/", element: <Index /> },
  { path: "/signin", element: <Signin /> },
  { path: "/signup", element: <Signup /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
];

const publicRoutes = authRoutes.map((route) => {
  return {
    ...route,
    element: <PublicOnlyRoute>{route.element}</PublicOnlyRoute>, // No need for ProtectedRoute here
  };
});

export default publicRoutes;