


import { AppLayout } from "~/layouts/AppLayouts";
import type { Route } from "./+types/home";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "About Page" },
    { name: "description", content: "Welcome to e-commerce site!" },
  ];
}

export default function About() {
  return <AppLayout>about page design coming soon</AppLayout>;
}
