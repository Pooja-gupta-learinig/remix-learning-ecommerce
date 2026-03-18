import { AppLayout } from "~/layouts/AppLayouts";
import { Link } from "react-router";
import { HeartHandshake, RefreshCcw, ShieldCheck, Truck } from "lucide-react";
import type { Route } from "./+types/about";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About Us | E‑CommerceShop" },
    {
      name: "description",
      content:
        "Learn about E‑CommerceShop—our mission, what we build, and how this Remix + React Router demo store is put together.",
    },
  ];
}

export default function About() {
  const highlights = [
    {
      title: "Secure by default",
      description: "Auth, sessions, and best‑practice server patterns baked in.",
      icon: ShieldCheck,
    },
    {
      title: "Fast checkout",
      description: "Cart → address → payment → review flows built with data APIs.",
      icon: Truck,
    },
    {
      title: "Smooth UX",
      description: "Optimistic UI patterns, loading states, and responsive layouts.",
      icon: RefreshCcw,
    },
    {
      title: "Built for learning",
      description: "Readable code structure with routes, loaders, actions, and apis.",
      icon: HeartHandshake,
    },
  ] as const;

  return (
    <AppLayout hasSidebar={false}>
      <div className="bg-gradient-to-b from-indigo-50 via-white to-white">
        <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                About E‑CommerceShop
              </p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                A modern e‑commerce demo built with Remix + React Router
              </h1>
              <p className="mt-4 text-base leading-relaxed text-gray-600">
                This project is a learning-friendly storefront showcasing common commerce flows—product
                browsing, category navigation, search, cart actions, and a multi-step checkout.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Browse products
                </Link>
                <Link
                  to="/contact-us"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-sm ring-1 ring-inset ring-indigo-200 transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Contact us
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-lg font-semibold text-gray-900">What you’ll find here</h2>
              <ul className="mt-4 space-y-3 text-sm text-gray-700">
                <li className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                  <span>
                    File-based routes (public + private), loader/action examples, and typed route modules.
                  </span>
                </li>
              
                <li className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                  <span>Tailwind UI patterns with responsive navigation and reusable layout components.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                  <span>Admin routes for managing products, orders, and users.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14 sm:pb-18">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Want to explore the code paths?</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Start with the product list, add something to your cart, and walk through checkout to see
                  loaders and actions in action.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/cart"
                  className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                >
                  View cart
                </Link>
                <Link
                  to="/categories"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                >
                  Browse categories
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
