import { useEffect } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type MetaFunction,
  type LoaderFunctionArgs,
  Link,
} from "react-router";

//import { Header } from "~/components/common";
import type { Route } from "./+types/root";
import { fetchCategories } from "~/lib/categories";
import { getUserSession } from "~/sessions.server";
import { getCart } from "~/lib/cart-session.server";
import { setupLogoutListener } from "~/lib/cross-tab-logout";
import "./tailwind.css";
import { AlertTriangle } from "lucide-react";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
   { rel: "icon", href: "/favicon.ico" },
];

export const meta: MetaFunction = () => [
{ title: "E-Commerce App" },
  { name: "description", content: "Welcome to our e-commerce store" },
];

/**
 * Root loader - fetches common data like categories that are needed across the app
 */
export async function loader({ request }: LoaderFunctionArgs) {
	const categoriesData = await fetchCategories();
	const user = await getUserSession(request);
	const cart = await getCart(request);
	return {
		categories: categoriesData,
		user,
		cart,
	};
}


export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
	// Set up cross-tab logout listener
	useEffect(() => {
		const cleanup = setupLogoutListener("/login");
		return cleanup;
	}, []);

	return (
		<>
			{/* <Header /> */}
			<main>
				<Outlet />
			</main>
		</>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404 
        ? error.statusText ? error.statusText : "The requested page could not be found."
        :  details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main>
     <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
<div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
  <AlertTriangle className="mx-auto h-12 w-12 text-irish-apple mb-4" />
  <h1 className="text-2xl font-bold text-gray-800 mb-4">
    Oops! Something went wrong
  </h1>
  <p className="text-gray-600 mb-8">
    We apologize for the inconvenience. Our team has been notified and
    is working on a fix.
  </p>

  {process.env.NODE_ENV === "development" && (
    <pre className="bg-gray-100 p-4 rounded text-left text-sm text-gray-700 mb-8 overflow-auto">
     <h1>{message}</h1>
      <p>{details}</p>
    </pre>
  )}

{stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
  <div className="flex justify-center space-x-4">
    <Link to="/" className="hover:text-indigo-600 transition-colors cursor-pointer">
      <button className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">Go Back</button>
   </Link>
  </div>
</div>
</div>
    </main>
  );
}
