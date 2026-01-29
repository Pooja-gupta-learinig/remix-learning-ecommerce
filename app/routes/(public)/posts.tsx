import { AppLayout } from "~/layouts/AppLayouts";
// import type { Route } from "./+types/posts";
import type { LoaderFunctionArgs } from "react-router";
import { fetchPosts } from "~/lib/posts";
import Post from "~/components/posts/post";

import { useLoaderData } from "react-router";

export async function loader({ params, request }: LoaderFunctionArgs) {
	const postsData = await fetchPosts();

	return {
		postsData: postsData,
	};
}

export default function Posts() {
	// const { postsData } = useLoaderData<typeof loader>(); // postsData is the data fetched from the loader function in component
	// console.log("postsData", postsData);
	return (
		<AppLayout hasSidebar={false}>
			<Post />
		</AppLayout>
	);
}