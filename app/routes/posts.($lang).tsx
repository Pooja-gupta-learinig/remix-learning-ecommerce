import { AppLayout } from "~/layouts/AppLayouts";
import type { LoaderFunctionArgs } from "react-router";
import { fetchPosts } from "~/lib/posts";
import Post from "~/components/posts/post";

import { useLoaderData, useParams } from "react-router";

export async function loader({ params, request }: LoaderFunctionArgs) {
	const postsData = await fetchPosts();

	return {
		postsData: postsData,
	};
}

export default function Posts() {
	// const { postsData } = useLoaderData<typeof loader>(); // postsData is the data fetched from the loader function in component
	// console.log("postsData", postsData);
	// optional with manual routing example param with file-system routing (flatRoutes)
	const { lang } = useParams();
	console.log("lang", lang);
	return (
		<AppLayout hasSidebar={false}>
		
		{lang && <p>Language: {lang} with file-system routing (flatRoutes)</p>}
			<Post />
		</AppLayout>
	);
}

