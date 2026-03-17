import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
 // buildDirectory: "build",
 //ssr: true,
  // NOTE: Disable prerender for this app because the root loader depends on
  // per-request data (cookies/session cart) and external fetches.
  // Prerender generates static `.data` files that don't update after cart actions.
  prerender: [],
} satisfies Config;
