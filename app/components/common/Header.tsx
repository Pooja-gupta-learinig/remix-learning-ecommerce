import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { ShoppingCart, Menu, X, Search } from "lucide-react";
import { useState, useEffect } from "react";
import type { FormEvent } from "react";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

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
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "font-bold text-black" : "hover:text-indigo-800"
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                isActive ? "font-bold text-black" : "hover:text-indigo-800"
              }
            >
              Products
            </NavLink>
            {/* <NavLink
              to="/categories"
              className={({ isActive }) =>
                isActive ? "font-bold text-black" : "hover:text-indigo-800"
              }
            >
              Categories
            </NavLink> */}
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
              className="hidden md:flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center gap-1 text-sm font-medium"
                aria-label="Search products"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </form>

            {/* Cart */}
            <NavLink to="/cart" className="relative">
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
                2
              </span>
            </NavLink>

            {/* Auth - Desktop */}
            <div className="hidden md:flex items-center gap-2">
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
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center gap-1 text-sm font-medium"
                  aria-label="Search products"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
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
             
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
