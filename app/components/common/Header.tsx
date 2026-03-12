import { Form, Link, NavLink, useLocation, useNavigate, useRouteLoaderData } from "react-router";
import { ShoppingCart, Menu, X, Search, ChevronDown, Settings, User, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import type { UserSession } from "~/sessions.server";
import type { Cart } from "~/lib/cart-session.server";
import { triggerLogoutEvent } from "~/lib/cross-tab-logout";
import type { Category } from "~/types/category.types";
import { capitalizeFirst } from "~/lib/utils";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesMenuOpen, setIsCategoriesMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);
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

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

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
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="shrink-0 text-lg sm:text-xl md:text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
          >
            <span className="block leading-tight">
              <span className="text-indigo-600">E-</span>
              <span className="text-indigo-700">CommerceShop</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-gray-700">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                }`
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/categories"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                }`
              }
            >
              Categories
            </NavLink>
            <NavLink
              to="/contact-us"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                }`
              }
            >
              Contact Me
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                }`
              }
            >
              About Us
            </NavLink>
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Search - Desktop */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center gap-2"
            >
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors z-10">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 lg:w-80 pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200 placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none transition-colors rounded-full p-0.5 hover:bg-gray-200 z-10 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 lg:px-5 py-2.5 rounded-full hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
                aria-label="Search products"
                disabled={!searchQuery.trim()}
              >
                <Search className="w-4 h-4" />
                <span className="hidden lg:inline">Search</span>
              </button>
            </form>

            {/* Cart */}
            <NavLink 
              to="/cart" 
              className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 group-hover:text-indigo-600 transition-colors" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center shadow-sm">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </NavLink>

            {/* Auth + Role - Desktop */}
            <div className="hidden md:flex items-center gap-3 lg:gap-4">
              {user && (
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Role:
                  </span>
                  <span className="text-sm font-semibold text-indigo-700">{user.role}</span>
                </div>
              )}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm font-medium text-gray-700 hover:text-indigo-600 cursor-pointer"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden lg:inline">{user.firstName ? capitalizeFirst(user.firstName) : user.email}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  
                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <NavLink
                        to="/settings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                            isActive ? "bg-indigo-50 text-indigo-700 font-medium" : ""
                          }`
                        }
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </NavLink>
                      {user.role === "admin" && (
                        <NavLink
                          to="/admin/settings"
                          onClick={() => setIsUserMenuOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                              isActive ? "bg-indigo-50 text-indigo-700 font-medium" : ""
                            }`
                          }
                        >
                          <Settings className="w-4 h-4" />
                          Admin Settings
                        </NavLink>
                      )}
                      <div className="border-t border-gray-200 my-1" />
                      <Form 
                        method="post" 
                        action="/logout"
                        onSubmit={() => {
                          // Trigger logout event for other tabs/windows
                          triggerLogoutEvent();
                          // Close menu
                          setIsUserMenuOpen(false);
                        }}
                      >
                        <button
                          type="submit"
                          className="w-full cursor-pointer text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </Form>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className="text-sm font-medium text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/sign-up"
                    className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-5 py-2.5 rounded-full hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-100 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Sign Up
                  </NavLink>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
                    <button
                      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                      className="md:hidden p-2 rounded-lg text-gray-700 hover:text-indigo-600 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                      aria-label="Toggle menu"
                      aria-expanded={isMobileMenuOpen}
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
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="pt-4 pb-4 border-t border-gray-200">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors z-10">
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none transition-colors rounded-full p-0.5 hover:bg-gray-200 z-10 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="w-full mt-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-5 py-2.5 rounded-full hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
                aria-label="Search products"
                disabled={!searchQuery.trim()}
              >
                <Search className="w-4 h-4" />
                <span>Search Products</span>
              </button>
            </form>

            {/* Mobile Navigation */}
            <nav className="flex flex-col gap-1 mb-4">
              <NavLink
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                  }`
                }
              >
                Products
              </NavLink>
              <NavLink
                to="/categories"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                  }`
                }
              >
                Categories
              </NavLink>
              <NavLink
                to="/contact-us"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                  }`
                }
              >
                Contact Me
              </NavLink>
              <NavLink
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                  }`
                }
              >
                About Us
              </NavLink>
            </nav>

            {/* Mobile Auth */}
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
              {user && (
                <div className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-lg mb-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Role:
                  </span>
                  <span className="text-sm font-semibold text-indigo-700">{user.role}</span>
                </div>
              )}
              {user ? (
                <>
                  <NavLink
                    to="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 font-semibold"
                          : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                      }`
                    }
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </NavLink>
                  {user.role === "admin" && (
                    <NavLink
                      to="/admin/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-indigo-50 text-indigo-700 font-semibold"
                            : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                        }`
                      }
                    >
                      <Settings className="w-5 h-5" />
                      Admin Settings
                    </NavLink>
                  )}
                  <Form 
                    method="post" 
                    action="/logout"
                    onSubmit={() => {
                      // Trigger logout event for other tabs/windows
                      triggerLogoutEvent();
                      // Close menu
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <button
                      type="submit"
                      className="w-full text-left flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-all duration-200"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </Form>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-all duration-200"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/sign-up"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-5 py-3 rounded-full text-base font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 text-center shadow-md hover:shadow-lg transform hover:scale-105 active:scale-100 whitespace-nowrap"
                  >
                    Sign Up
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
