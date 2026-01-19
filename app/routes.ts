import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";



export default [
  index("routes/home.tsx"),
  route("about", "routes/(public)/about.tsx"),
  route("contact-us", "routes/(public)/contact.tsx"),
  route("products", "routes/(public)/products.tsx"),
  route("categories", "routes/(public)/categories.tsx"),
  route("wizard/*", "routes/(componentRouteExample)/wizard.tsx"), // component routing example
  route("myroute/:myrouteId", "routes/myRouterWithDefaultParams.tsx"),
  

   // Auth Nested routes
  layout("routes/auth/AuthLayout.tsx", [
    route("login", "routes/auth/login.tsx"),
    route("sign-up", "routes/auth/sign-up.tsx"),
     // 404 inside public layout
    route("*", "routes/catchall.tsx"), // catchall route,
  ]),

   // parent route
  route("dashboard", "routes/(private)/dashboard.tsx", [
    // child routes
    route("settings", "routes/(private)/settings.tsx"),
  ]),
  route("c/:categoryId/p/:productId", "routes/(public)/product.tsx"), // dynamic route
 // route("users/:userId/edit?", "routes/(public)/user.tsx"), // optional param route

] satisfies RouteConfig;
