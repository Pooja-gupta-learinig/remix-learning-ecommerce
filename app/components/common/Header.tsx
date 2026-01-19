import { Link, NavLink } from "react-router";
import { ShoppingCart } from "lucide-react";

export  function Header() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-indigo-600">
            E-CommerceShop
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex gap-6 text-gray-600 font-medium">
          <NavLink to="/" className={({ isActive }) =>
        isActive ? "font-bold text-black" : "hover:text-indigo-800"
           }>
            Home
          </NavLink>
          <NavLink to="/products"  className={({ isActive }) =>
        isActive ? "font-bold text-black" : "hover:text-indigo-800"
           }>
            Products
          </NavLink>
          <NavLink to="/categories" className={({ isActive }) =>
        isActive ? "font-bold text-black" : "hover:text-indigo-800"
           }>
            Categories
          </NavLink>
          <NavLink to="/contact-us" className={({ isActive }) =>
        isActive ? "font-bold text-black" : "hover:text-indigo-800"
           }>
            Contact Me
          </NavLink>
       

  <NavLink to="/about" className={({ isActive }) =>
        isActive ? "font-bold text-black" : "hover:text-indigo-800"
           }>
            About Us
          </NavLink>
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search products..."
            className="hidden md:block border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Cart */}
          <NavLink to="/cart" className="relative">
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
              2
            </span>
          </NavLink>

          {/* Auth */}
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
            <Link
            to="/wizard"
           target="_blank"
            className="text-sm font-medium text-gray-700 hover:text-indigo-600"
          >
          Wizard
          </Link>
        </div>
      </div>
    </header>
  );
}
