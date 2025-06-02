import { useRoutes } from "react-router-dom";

import Index from "@/pages/Index";
import Signin from "@/pages/auth/Signin";
import Signup from "@/pages/auth/Signup";
import ForgotPassword from "@/pages/auth/ForgotPassword";

const authRoutes = [
  { path: "/", element: <Index /> },
  { path: "/signin", element: <Signin /> },
  { path: "/signup", element: <Signup /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
];

export default authRoutes;