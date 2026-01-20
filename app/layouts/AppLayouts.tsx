import { useRouteLoaderData } from "react-router";
import { Header, Footer, CategorySidebar } from "~/components/common";
import type { CategoriesResponse } from "~/types/category.types";

interface AppLayoutProps {
  children: React.ReactNode;
  hasHeader?: boolean;
  hasFooter?: boolean;
  hasSidebar?: boolean;
}

export function AppLayout({ children, hasHeader = true, hasFooter = true, hasSidebar = true }: AppLayoutProps) {
	// Get categories from root loader data
	// The root route is accessible via "root" id in React Router v7
	const rootData = useRouteLoaderData("root") as { categories: CategoriesResponse } | undefined;
	const categories = rootData?.categories ?? [];
    return (
        <main className="flex flex-col min-h-screen">
          {hasHeader && <Header />}
          <div className="flex flex-col md:flex-row flex-1">
            {hasSidebar && Array.isArray(categories) && categories.length > 0 && (
              <CategorySidebar categories={categories} />
            )}
            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </div>
          {hasFooter && <Footer />}
      </main>
    );
}


