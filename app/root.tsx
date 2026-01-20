import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type MetaFunction,
  type LoaderFunctionArgs,
} from "react-router";

//import { Header } from "~/components/common";
import type { Route } from "./+types/root";
import { fetchCategories } from "~/lib/categories";
import "./tailwind.css";

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
	return {
		categories: categoriesData,
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
    <main className="pt-16 p-4 container mx-auto">
      <div className="border border-red-500 bg-red-100 text-red-900 p-6 rounded-lg ">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
      </div>
    </main>
  );
}
