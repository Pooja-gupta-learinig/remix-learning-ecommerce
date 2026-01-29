/**
 * @file Post data fetching utilities
 */

import type { PostsResponse } from "~/types/post.types";

/**
 * Fetches posts from the dummyjson API
 * @returns Promise resolving to posts response
 * @throws Response error if fetch fails or data is invalid
 */
export async function fetchPosts(): Promise<PostsResponse> {
	const response = await fetch("https://dummyjson.com/posts");

	if (!response.ok) {
		throw new Response("Failed to load posts", {
			status: response.status,
		});
	}

	const postsData: PostsResponse = await response.json();

	if (!postsData || !postsData.posts) {
		throw new Response("Posts data not found", {
			status: 404,
			statusText: "Posts data not found",
		});
	}

	return postsData;
}

