/**
 * @file Post types for the e-commerce application
 */

export type Post = {
	id: number;
	title: string;
	body: string;
	userId: number;
	tags: string[];
	reactions: {
		likes: number;
		dislikes: number;
	};
};

export type PostsResponse = {
	posts: Post[];
	total: number;
	skip: number;
	limit: number;
};

