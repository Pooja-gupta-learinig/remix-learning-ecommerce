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
  route("wizard/*", "routes/(componentRouteExample)/wizard.tsx"), // component routing example
  route("myroute/:myrouteId", "routes/(public)/myRouterWithDefaultParams.tsx"), //dynamic route example
  route(":lang?/optionalRoutewithmanual", "routes/(public)/optionalRoutewithmanual.tsx"), // optional with manual routing example
  route("addeditproduct/:productId?", "routes/(private)/addeditproduct.tsx"), // add product route
  route("deleteproduct/:productId", "routes/(private)/deleteproduct.$productId.tsx"), // delete product route
  // route("(:lang)/optionalwithmanualrouting", "routes/(public)/($lang)/optionalwithmanualrouting.tsx"), // optional with manual routing example
  // posts.($lang).tsx is handled by file-system routing (flatRoutes) - supports both /posts and /posts/:lang
  // Auth Nested routes
  // layout("routes/auth/AuthLayout.tsx", [
  //   route("login", "routes/auth/login.tsx"),
  //   route("sign-up", "routes/auth/sign-up.tsx"),
  //   //      // 404 inside public layout
  //   route("*", "routes/auth/catchall.tsx"), // catchall route,
  // ]),
     // parent route
  route("dashboard", "routes/(private)/dashboard.tsx", [
//     // child routes
    route("settings", "routes/(private)/settings.tsx"),
  ]),
  // Blog routes - folder-based routing
  // Note: Order matters - more specific routes (new) must come before dynamic routes (:slug)
 route("blog", "routes/blog/route.tsx"), // /blog
 route("blog/new", "routes/blog/new/route.tsx"), // /blog/new (must come before :slug)
 route("blog/:slug", "routes/blog/$slug/route.tsx"), // /blog/:slug
 //route("client-data-loader", "routes/client-data-loader.tsx"), // client loader test route
  //   route("c/:categoryId/p/:productId", "routes/(public)/product.tsx"), // dynamic route
 // route("users/:userId/edit?", "routes/(public)/user.tsx"), // optional param route

  ...(await flatRoutes()),
] satisfies RouteConfig;

// Note: The order of routes matters. More specific routes should be defined before less specific ones.