import { useState } from "react";
import { NavLink, useLocation, useSearchParams, useNavigate } from "react-router";
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
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Check if category is active based on pathname or search params
  const isCategoryActive = (categorySlug: string): boolean => {
    // Check if pathname matches category route
    if (location.pathname === `/products/category/${categorySlug}`) {
      return true;
    }
    
    // Check if we're on product details page with category in URL
    // Pattern: /products/{productSlug}/{productId}/category/{categorySlug}
    const productDetailsMatch = location.pathname.match(/\/products\/[^/]+\/[^/]+\/category\/([^/]+)/);
    if (productDetailsMatch && productDetailsMatch[1] === categorySlug) {
      return true;
    }
    
    // Check if we're on search page and category param matches
    if (location.pathname === "/product/search") {
      const categoryParam = searchParams.get("category");
      return categoryParam === categorySlug;
    }
    
    return false;
  };

  const categoryLinks = (
    <nav className="space-y-2">
      {categories.map((cat: Category) => {
        const isActive = isCategoryActive(cat.slug);
        return (
          <NavLink
            key={cat.slug}
            to={`/products/category/${cat.slug}`}
            onClick={() => setIsDropdownOpen(false)}
            className={`block px-3 py-2 rounded-md capitalize
             ${isActive
               ? "bg-black text-white"
               : "hover:bg-gray-100"}`}
          >
            {cat.name}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile/Tablet Dropdown */}
      <div className="md:hidden w-full border-b bg-white shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Categories</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="text-sm text-gray-600 hover:text-indigo-600 font-medium cursor-pointer"
              aria-label="Clear selection"
            >
              Clear selection
            </button>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-1 cursor-pointer"
              aria-expanded={isDropdownOpen}
              aria-label="Toggle categories menu"
            >
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
          </div>
        </div>
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
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Categories</h2>
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="text-sm text-gray-600 hover:text-indigo-600 font-medium cursor-pointer"
            aria-label="Clear selection"
          >
            Clear selection
          </button>
        </div>

        {/* Menu */}
        <div className="p-4 overflow-y-auto flex-1">
          {categoryLinks}
        </div>
      </aside>
    </>
  );
}
