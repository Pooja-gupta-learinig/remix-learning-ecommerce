

import type { Route } from "./+types/products";
import{ AppLayout } from "../../layouts/AppLayouts";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Product Page" },
    { name: "description", content: "Welcome to e-commerce site!" },
  ];
}


export default function Products() {
  return <AppLayout>product page design coming soon</AppLayout>;
}
