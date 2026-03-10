import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default [
  index("routes/(public)/home.tsx"), // index route
  route(".well-known/appspecific/com.chrome.devtools.json", "routes/.well-known.appspecific.com.chrome.devtools.json.tsx"), // Chrome DevTools well-known path
  route("about", "routes/(public)/about.tsx"), // static route
  route("contact-us", "routes/(public)/contact.tsx"), // static route
  route("products", "routes/(public)/products.tsx"), // static route
  route("categories", "routes/(public)/categories.tsx"), // static route
  route("examples", "routes/(public)/examples.tsx"), // examples page
  route("wizard/*", "routes/(componentRouteExample)/wizard.tsx"), // component routing example
  route("myroute/:myrouteId", "routes/(public)/myRouterWithDefaultParams.tsx"), //dynamic route example
  route(":lang?/optionalRoutewithmanual", "routes/(public)/optionalRoutewithmanual.tsx"), // optional with manual routing example
  // Admin routes with layout
  layout("layouts/AdminLayout.tsx", [
    route("admin", "routes/admin/admin.dashboard.tsx"),
    route("admin/products", "routes/admin/admin.products.tsx"),
    route("admin/orders", "routes/admin/admin.orders.tsx"),
    route("admin/users", "routes/admin/admin.users.tsx"),
    route("admin/settings", "routes/admin/admin.settings.tsx"),
    route("admin/products/addeditproduct/:productId?", "routes/admin/addeditproduct.tsx"), // add product route
    route("admin/products/deleteproduct/:productId", "routes/admin/deleteproduct.$productId.tsx"),
    route("admin/users/addedituser/:userId", "routes/admin/addedituser.$userId.tsx"),
    route("admin/users/deleteuser/:userId", "routes/admin/deleteuser.$userId.tsx"),
  ]),
  route("await-defer-examples", "routes/(public)/await-defer-examples.tsx"), // await defer examples with await API calls
  route("use-fetcher-defer-dashboard", "routes/(public)/use-fetcher-defer-dashboard.tsx"), // useFetcher + defer dashboard demo
  // route("(:lang)/optionalwithmanualrouting", "routes/(public)/($lang)/optionalwithmanualrouting.tsx"), // optional with manual routing example
  // posts.($lang).tsx is handled by file-system routing (flatRoutes) - supports both /posts and /posts/:lang
  // Auth Nested routes
  layout("routes/auth/AuthLayout.tsx", [
    route("login", "routes/auth/login.tsx"),
    route("sign-up", "routes/auth/sign-up.tsx"),
    //      // 404 inside public layout
    route("*", "routes/auth/catchall.tsx"), // catchall route,
  ]),
     // parent route
  route("dashboard", "routes/(private)/dashboard.tsx", [
//     // child routes

  ]),
  route("logout", "routes/auth/logout.tsx"), // /logout - matches /logout exactly
  route("settings", "routes/(private)/settings.tsx"),
  // Blog routes - folder-based routing
  // Note: Order matters - more specific routes (new) must come before dynamic routes (:slug)
 route("blog", "routes/blog/route.tsx"), // /blog
 route("blog/new", "routes/blog/new/route.tsx"), // /blog/new (must come before :slug)
 route("blog/:slug", "routes/blog/$slug/route.tsx"), // /blog/:slug
 route("orders", "routes/(private)/orders/route.tsx"), // /orders - matches /orders exactly
 route("orders/:orderId", "routes/(private)/orders/$orderId/route.tsx"), // /orders/:orderId - matches /orders/a3475c60-44f1-4971-9950-34ffaccc6720
 // Orders routes - MUST be defined before flatRoutes() to ensure correct matching order
 // Static route must come before dynamic route so /orders matches exactly before /orders/:orderId
 //route("orders", "routes/orders/route.tsx"), // /orders - matches /orders exactly
// route("orders/:orderId", "routes/orders/$orderId/route.tsx"), // /orders/:orderId - matches /orders/a3475c60-44f1-4971-9950-34ffaccc6720
 //route("client-data-loader", "routes/client-data-loader.tsx"), // client loader test route
  //   route("c/:categoryId/p/:productId", "routes/(public)/product.tsx"), // dynamic route
 // route("users/:userId/edit?", "routes/(public)/user.tsx"), // optional param route

  ...(await flatRoutes()),
] satisfies RouteConfig;

// Note: The order of routes matters. More specific routes should be defined before less specific ones.