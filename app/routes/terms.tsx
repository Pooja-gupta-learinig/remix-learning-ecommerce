


import { AppLayout } from "~/layouts/AppLayouts";
import type { Route } from "./+types/terms";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Terms Page" },
    { name: "description", content: "Welcome to e-commerce site!" },
  ];
}

export default function Terms() {
  return <AppLayout>terms page design coming soon</AppLayout>;
}
