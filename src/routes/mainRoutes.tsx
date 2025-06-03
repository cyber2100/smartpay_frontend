import MainLayout from "@/layout/MainLayout";
import Verify from "@/pages/Verify";
import Dashboard from "@/pages/Dashboard";
import Wallet from "@/pages/Wallet";
import CardPage from "@/pages/Card";
import Transfer from "@/pages/Transfer";
import Deposit from "@/pages/Deposit";
import Withdraw from "@/pages/Withdraw";
import History from "@/pages/History";
import SettingPage from "@/pages/Setting";
import NotificationsPage from "@/pages/Notification";          
import { ProtectedRoute } from "./RouteGuide";

const mainRoutes = [
  {
    path: "/verify",
    element: <Verify />,
  },
  {
    path: "/dashboard",
    element: <MainLayout><Dashboard /></MainLayout>,
  },
  {
    path: "/wallet",
    element: <MainLayout><Wallet /></MainLayout>,
  },
  {
    path: "/card",
    element: <MainLayout><CardPage /></MainLayout>,
  },
  {
    path: "/deposit",
    element: <MainLayout><Deposit /></MainLayout>,
  },
  {
    path: "/withdraw",
    element: <MainLayout><Withdraw /></MainLayout>,
  },
  {
    path: "/transfer",
    element: <MainLayout><Transfer /></MainLayout>,
  },
  {
    path: "/history",
    element: <MainLayout><History /></MainLayout>,
  },
  {
    path: "/setting",
    element: <MainLayout><SettingPage /></MainLayout>, // Placeholder for settings page
  },
  {
    path: "/notifications",
    element: <MainLayout><NotificationsPage /></MainLayout>,
  }
];

const protectedRoutes = mainRoutes.map((route) => {
  return {
    ...route,
    element: (
      <ProtectedRoute>
        {route.element}
      </ProtectedRoute>
    ),
  };
}
);

export default protectedRoutes;
