/**
 * @file Category types for the e-commerce application
 */

/**
 * Category object with slug, name, and URL
 */
export type Category = {
	slug: string;
	name: string;
	url: string;
};

/**
 * Response from the categories API endpoint
 * Returns an array of category objects
 */
export type CategoriesResponse = Category[];

