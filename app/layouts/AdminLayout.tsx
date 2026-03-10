import { Outlet, Link, useLocation } from "react-router";
import {
	LayoutDashboard,
	ShoppingCart,
	Package,
	Users,
	LogOut,
	Settings,
} from "lucide-react";

/**
 * Admin layout with sidebar navigation
 * Uses Outlet pattern for nested admin routes
 */
export default function AdminLayout() {
	const location = useLocation();

	const navItems = [
		{
			to: "/admin",
			label: "Dashboard",
			icon: LayoutDashboard,
		},
		{
			to: "/admin/products",
			label: "Products",
			icon: Package,
		},
		{
			to: "/admin/orders",
			label: "Orders",
			icon: ShoppingCart,
		},
		{
			to: "/admin/users",
			label: "Users",
			icon: Users,
		},
		{
			to: "/admin/settings",
			label: "Settings",
			icon: Settings,
		},
	];

	const isActive = (path: string): boolean => {
		if (path === "/admin") {
			return location.pathname === "/admin";
		}
		return location.pathname.startsWith(path);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="flex">
				{/* Sidebar */}
				<aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0">
					<div className="p-6">
						<h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
						<p className="text-sm text-gray-600 mt-1">E-commerce Management</p>
					</div>

					<nav className="px-4 pb-4">
						<ul className="space-y-2">
							{navItems.map((item) => {
								const Icon = item.icon;
								const active = isActive(item.to);
								return (
									<li key={item.to}>
										<Link
											to={item.to}
											className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
												active
													? "bg-indigo-50 text-indigo-700 font-medium"
													: "text-gray-700 hover:bg-gray-50"
											}`}
										>
											<Icon className="w-5 h-5" />
											<span>{item.label}</span>
										</Link>
									</li>
								);
							})}
						</ul>
					</nav>

					<div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
						<Link
							to="/dashboard"
							className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
						>
							<LogOut className="w-5 h-5" />
							<span>Back to Site</span>
						</Link>
					</div>
				</aside>

				{/* Main Content */}
				<main className="flex-1 ml-64">
					<div className="p-8">
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	);
}
