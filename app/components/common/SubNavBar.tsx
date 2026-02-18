import { NavLink } from "react-router";

export function SubNavBar() {
  return (
    <nav className="border-b bg-gray-50 sticky top-[73px] z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-6 overflow-x-auto">
          {/* Home Sub-menu Items */}
          <div className="flex items-center gap-1 min-w-0">
            {/* <NavLink
              to="/"
              className={({ isActive }) =>
                `whitespace-nowrap px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-600 hover:text-indigo-600 hover:border-gray-300"
                }`
              }
            >
              Dashboard
            </NavLink> */}
            {/* <NavLink
              to="/home/overview"
              className={({ isActive }) =>
                `whitespace-nowrap px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-600 hover:text-indigo-600 hover:border-gray-300"
                }`
              }
            >
              Overview
            </NavLink> */}
            <NavLink
              to="/addeditproduct"
              className={({ isActive }) =>
                `whitespace-nowrap px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-600 hover:text-indigo-600 hover:border-gray-300"
                }`
              }
            >
              Add Product
            </NavLink>
           
          </div>
        </div>
      </div>
    </nav>
  );
}

