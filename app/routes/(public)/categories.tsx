

import type { LoaderFunctionArgs } from "react-router";
import{ AppLayout } from "../../layouts/AppLayouts";
import type { Route } from "./+types/categories";
import { fetchCategories } from "~/lib/categories";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Category Page" },
    { name: "description", content: "Welcome to e-commerce site!" },
  ];
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	const categoriesData = await fetchCategories();
//console.log("Categories Data:", categoriesData);
	return {
		categoriesData: categoriesData,
	};
}


export default function Categories() {
  return <AppLayout>category page design coming soon</AppLayout>;
}
