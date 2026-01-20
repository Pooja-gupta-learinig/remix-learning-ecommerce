
import type { Route } from "../+types/home";
import { AppLayout } from "../../layouts/AppLayouts";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Home Page" },
    { name: "description", content: "Welcome to e-commerce site!" },
  ];
}

export default function Home() {
  return <AppLayout>home page design comming soon</AppLayout>;
}
