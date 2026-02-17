import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
 // buildDirectory: "build",
 //ssr: true,
  prerender: ["/",    "/about", "/products", "/categories", "/privacy-policy", "/terms"],
} satisfies Config;
