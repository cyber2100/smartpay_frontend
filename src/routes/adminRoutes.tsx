import AdminDashboard from "@/pages/AdminDashboard";
import MainLayout from "@/layout/MainLayout";
import Index from "@/pages/Index";
import UserManagement from "@/pages/admin/UserManagement";
import TransactionStatistics from "@/pages/admin/TransactionStatistics";
import BalanceStatistics from "@/pages/admin/BalanceStatistics";

const adminRoutes = [
  {
    path: "/",
    element: <MainLayout><Index /></MainLayout>,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/admin/users",
    element: <MainLayout><UserManagement /></MainLayout>,
  },
  {
    path: "/admin/transactions",
    element: <MainLayout><TransactionStatistics /></MainLayout>,
  },
  {
    path: "/admin/balances",
    element: <MainLayout><BalanceStatistics /></MainLayout>,
  },
];

export default adminRoutes;