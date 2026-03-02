import { Form, Link, NavLink, useLocation, useNavigate, useRouteLoaderData } from "react-router";
import { ShoppingCart, Menu, X, Search, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type { UserSession } from "~/sessions.server";
import type { Cart } from "~/lib/cart-session.server";
import { triggerLogoutEvent } from "~/lib/cross-tab-logout";
import type { Category } from "~/types/category.types";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesMenuOpen, setIsCategoriesMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const rootData = useRouteLoaderData("root") as
    | { user?: UserSession | null; cart?: Cart; categories?: Category[] }
    | undefined;
  const user = rootData?.user ?? null;
  const cart = rootData?.cart ?? { items: [] };
  const categories = rootData?.categories ?? [];

  // Calculate total items in cart
  const cartItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  // Generate category slug helper
  const categorySlug = (category: Category): string => {
    if (category.slug) {
      return category.slug;
    }
    return category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  };

  function handleClearSearch(): void {
    setSearchQuery("");
  }

  // Sync search query with URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const queryParam = urlParams.get("q");
    if (queryParam) {
      setSearchQuery(queryParam);
    } else if (location.pathname !== "/product/search") {
      // Clear search query when not on search page
      setSearchQuery("");
    }
  }, [location.search, location.pathname]);

  // Extract category slug from URL if present
  const getCategorySlug = (): string | null => {
    // Check if category is in pathname (category page)
    const pathMatch = location.pathname.match(/\/products\/category\/([^/]+)/);
    if (pathMatch) {
      return pathMatch[1];
    }
    
    // Check if category is in search params (search page)
    if (location.pathname === "/product/search") {
      const searchParams = new URLSearchParams(location.search);
      const categoryParam = searchParams.get("category");
      return categoryParam;
    }
    
    return null;
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    
    if (!trimmedQuery) {
      return;
    }

    const categorySlug = getCategorySlug();
    const searchParams = new URLSearchParams({ q: trimmedQuery });
    
    if (categorySlug) {
      searchParams.set("category", categorySlug);
    }

    navigate(`/product/search?${searchParams.toString()}`);
    
    // Close mobile menu if open
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-xl md:text-2xl font-bold text-indigo-600">
            E-CommerceShop
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 text-gray-600 font-medium">
            <div
              className="relative"
             
            >
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "font-bold text-black" : "hover:text-indigo-800"
                }
              >
                Home
              </NavLink>
         
            </div>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                isActive ? "font-bold text-black" : "hover:text-indigo-800"
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/categories"
              className={({ isActive }) =>
                isActive ? "font-bold text-black" : "hover:text-indigo-800"
              }
            >
              Categories
            </NavLink>
            <NavLink
              to="/contact-us"
              className={({ isActive }) =>
                isActive ? "font-bold text-black" : "hover:text-indigo-800"
              }
            >
              Contact Me
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive ? "font-bold text-black" : "hover:text-indigo-800"
              }
            >
              About Us
            </NavLink>
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search - Desktop */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center"
            >
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200 placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none transition-colors rounded-full p-0.5 hover:bg-gray-200"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="relative ml-2 bg-linear-to-r from-indigo-600 to-indigo-700 text-white px-5 py-2.5 rounded-full hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                aria-label="Search products"
                disabled={!searchQuery.trim()}
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </form>

            {/* Cart */}
            <NavLink to="/cart" className="relative">
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </NavLink>

            {/* Auth + Role - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              {user && (
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Role: <span className="text-gray-800">{user.role}</span>
                </span>
              )}
              {user ? (
                <Form method="post" action="/logout">
                  <button
                    type="submit"
                    onClick={() => {
                      // Trigger logout event for other tabs/windows
                      triggerLogoutEvent();
                    }}
                    className="text-sm font-medium text-gray-700 hover:text-indigo-600"
                  >
                    Logout
                  </button>
                </Form>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className="text-sm font-medium text-gray-700 hover:text-indigo-600"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/sign-up"
                    className="text-sm font-medium text-gray-700 hover:text-indigo-600"
                  >
                    Sign Up
                  </NavLink>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-indigo-600"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200 placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none transition-colors rounded-full p-0.5 hover:bg-gray-200"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="w-full mt-3 bg-linear-to-r from-indigo-600 to-indigo-700 text-white px-5 py-2.5 rounded-full hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                aria-label="Search products"
                disabled={!searchQuery.trim()}
              >
                <Search className="w-4 h-4" />
                <span>Search Products</span>
              </button>
            </form>

            {/* Mobile Navigation */}
            <nav className="flex flex-col gap-4 text-gray-600 font-medium">
              <NavLink
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? "font-bold text-black py-2"
                    : "hover:text-indigo-800 py-2"
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? "font-bold text-black py-2"
                    : "hover:text-indigo-800 py-2"
                }
              >
                Products
              </NavLink>
              <NavLink
                to="/categories"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? "font-bold text-black py-2"
                    : "hover:text-indigo-800 py-2"
                }
              >
                Categories
              </NavLink>
              <NavLink
                to="/contact-us"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? "font-bold text-black py-2"
                    : "hover:text-indigo-800 py-2"
                }
              >
                Contact Me
              </NavLink>
              <NavLink
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? "font-bold text-black py-2"
                    : "hover:text-indigo-800 py-2"
                }
              >
                About Us
              </NavLink>
            </nav>

            {/* Mobile Auth */}
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t">
              {user ? (
                <Form method="post" action="/logout">
                  <button
                    type="submit"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      // Trigger logout event for other tabs/windows
                      triggerLogoutEvent();
                    }}
                    className="text-left text-sm font-medium text-gray-700 hover:text-indigo-600 py-2"
                  >
                    Logout
                  </button>
                </Form>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm font-medium text-gray-700 hover:text-indigo-600 py-2"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/sign-up"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm font-medium text-gray-700 hover:text-indigo-600 py-2"
                  >
                    Sign Up
                  </NavLink>
                </>
              )}
             
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
