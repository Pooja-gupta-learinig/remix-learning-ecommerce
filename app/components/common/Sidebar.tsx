import { useState } from "react";
import { NavLink } from "react-router";
import type { Category } from "~/types/category.types";

type SidebarProps = {
  position?: "left" | "right";
  categories: Category[];
};

export function CategorySidebar({
  position = "left",
  categories,
}: SidebarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const categoryLinks = (
    <nav className="space-y-2">
      {categories.map((cat: Category) => (
        <NavLink
          key={cat.slug}
          to={`/products/category/${cat.slug}`}
          onClick={() => setIsDropdownOpen(false)}
          className={({ isActive }) =>
            `block px-3 py-2 rounded-md capitalize
             ${isActive
               ? "bg-black text-white"
               : "hover:bg-gray-100"}`
          }
        >
          {cat.name}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile/Tablet Dropdown */}
      <div className="md:hidden w-full border-b bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-left"
          aria-expanded={isDropdownOpen}
          aria-label="Toggle categories menu"
        >
          <h2 className="text-lg font-semibold">Categories</h2>
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {isDropdownOpen && (
          <div className="px-4 pb-4 border-t bg-white">
            {categoryLinks}
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden md:flex
          ${position === "left" ? "border-r" : "border-l"}
          w-72 bg-white shadow-sm
          flex-col
          h-full
        `}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Categories</h2>
        </div>

        {/* Menu */}
        <div className="p-4 overflow-y-auto flex-1">
          {categoryLinks}
        </div>
      </aside>
    </>
  );
}
