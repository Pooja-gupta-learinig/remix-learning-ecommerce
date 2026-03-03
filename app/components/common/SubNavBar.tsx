import { NavLink, useRouteLoaderData } from "react-router";

type RootLoaderData = {
	categories: unknown;
	user: { id: string; email: string; role: "admin" | "customer" } | null;
	cart: unknown;
};

export function SubNavBar() {
	const rootData = useRouteLoaderData("root") as RootLoaderData | undefined;
	const user = rootData?.user;

	return (
		<nav className="border-b border-gray-200 bg-gray-50 sticky top-16 md:top-20 z-40 shadow-sm">
			<div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
				<div className="flex items-center overflow-x-auto scrollbar-hide">
				<div className="flex items-center gap-1 sm:gap-2 min-w-max py-2">
					{user && (
						<>
							<NavLink
								to={user.role === "admin" ? "/admin" : "/dashboard"}
								className={({ isActive }) =>
									`whitespace-nowrap px-3 sm:px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
										isActive
											? "bg-indigo-100 text-indigo-700 font-semibold border-b-2 border-indigo-600"
											: "text-gray-600 hover:text-indigo-600 hover:bg-gray-100"
									}`
								}
							>
								{user.role === "admin" ? "Admin Dashboard" : "Dashboard"}
							</NavLink>
							<NavLink
								to={user.role === "admin" ? "/admin/orders" : "/orders"}
								className={({ isActive }) =>
									`whitespace-nowrap px-3 sm:px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
										isActive
											? "bg-indigo-100 text-indigo-700 font-semibold border-b-2 border-indigo-600"
											: "text-gray-600 hover:text-indigo-600 hover:bg-gray-100"
									}`
								}
							>
								Orders
							</NavLink>
						</>
					)}
					<NavLink
						to="/posts"
						className={({ isActive }) =>
							`whitespace-nowrap px-3 sm:px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
								isActive
									? "bg-indigo-100 text-indigo-700 font-semibold border-b-2 border-indigo-600"
									: "text-gray-600 hover:text-indigo-600 hover:bg-gray-100"
							}`
						}
					>
						Posts
					</NavLink>
					<NavLink
						to="/examples"
						className={({ isActive }) =>
							`whitespace-nowrap px-3 sm:px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
								isActive
									? "bg-indigo-100 text-indigo-700 font-semibold border-b-2 border-indigo-600"
									: "text-gray-600 hover:text-indigo-600 hover:bg-gray-100"
							}`
						}
					>
						Examples
					</NavLink>
					</div>
				</div>
			</div>
		</nav>
	);
}

