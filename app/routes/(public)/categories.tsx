

import{ AppLayout } from "../../layouts/AppLayouts";
import type { Route } from "./+types/categories";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Category Page" },
    { name: "description", content: "Welcome to e-commerce site!" },
  ];
}

export default function Categories() {
  return <AppLayout>category page design coming soon</AppLayout>;
}
