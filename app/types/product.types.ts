/**
 * @file Product types for the e-commerce application
 */

export type Review = {
	reviewerName: string;
	rating: number;
	comment: string;
	date: string;
};

export type Product = {
	id: number;
	title: string;
	description: string;
	price: number;
	discountPercentage: number;
	rating: number;
	stock: number;
	brand: string;
	category: string;
	thumbnail: string;
	images: string[];
	availabilityStatus: string;
	reviews?: Review[];
	warrantyInformation?: string;
	returnPolicy?: string;
};














export type ProductsResponse = {
	products: Product[];
	total: number;
	skip: number;
	limit: number;
};

