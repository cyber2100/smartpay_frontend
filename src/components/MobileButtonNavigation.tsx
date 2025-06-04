import { 
  Home,
  Wallet, 
  Clock,
  Send, 
	IdCard,
	ArrowUp,
	ArrowDown,
	DollarSign,
	User2,
	Users,
	Receipt,
	BookDashed
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import {useAuth} from '@/hooks/use-auth'
import { ReactElement } from "react";

interface NavigationItem {
  id: string;
  icon: ReactElement;
  path: string;
}

export const MobileButtonNavigation = (): ReactElement => {
	const navigate = useNavigate();
	const location = useLocation();
	const { isAuthenticated, user, isAdminPanelView } = useAuth();
	const pathSegments: string[] = location.pathname.split('/');
	const activePage: string = pathSegments[1] || 'dashboard';
	
	const navigationItems: NavigationItem[] = (!isAuthenticated || isAuthenticated && !user.isVerified) ? [] : 
	isAdminPanelView ? [
		{ id: 'dashboard', icon: <BookDashed className="h-6 w-6" />, path: '/admin' },
		{ id: 'users', icon: <Users className="h-6 w-6" />, path: '/admin/users' },
		{ id: 'transactions', icon: <Receipt className="h-6 w-6" />, path: '/admin/transactions' },
		{ id: 'balances', icon: <DollarSign className="h-6 w-6" />, path: '/admin/balances' },
	] : [
		{ id: 'dashboard', icon: <Home className="h-6 w-6" />, path: '/dashboard' },
		{ id: 'wallet', icon: <Wallet className="h-6 w-6" />, path: '/wallet' },
		{ id: 'card', icon: <IdCard className="h-6 w-6" />, path: '/card' },
		{ id: 'deposit', icon: <ArrowUp className="h-6 w-6" />, path: '/deposit' },
		{ id: 'withdraw', icon: <ArrowDown className="h-6 w-6" />, path: '/withdraw' },
		{ id: 'transfer', icon: <Send className="h-6 w-6" />, path: '/transfer' },
		{ id: 'history', icon: <Clock className="h-6 w-6" />, path: '/history' },
	];
	
	return (
		<div className="min-[980px]:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50">
			<div className="flex items-center justify-around py-2">
			{navigationItems.map((item: NavigationItem) => (
				<Button
					key={item.id}
					variant="ghost"
					size="icon"
					className={activePage === item.id ? "text-primary" : "text-muted-foreground"}
					onClick={() => navigate(item.path)}
				>
				{item.icon}
				</Button>
			))}
			</div>
		</div>
	);
};