import { z } from "zod";

/**
 * Base image validation schema
 */
const imageSchema = z.custom<File | string>(
  (val) => {
    // If it's a File object, check it's valid
    if (val instanceof File) {
      return val.size > 0;
    }
    // If it's a string (empty file input), it's invalid
    if (typeof val === "string") {
      return val.length > 0;
    }
    // Any other type is invalid
    return false;
  },
  { message: "Image is required" }
).refine(
  (val) => {
    // If it's a File, check it's an image type
    if (val instanceof File) {
      return val.type.startsWith("image/");
    }
    // String values pass (for backward compatibility)
    return true;
  },
  { message: "Image must be a valid image file" }
);

/**
 * Zod Schema for Product Form Validation (Create Mode)
 * 
 * Defines validation rules for all product fields:
 * - title: Required string with minimum 3 characters
 * - description: Required string with minimum 10 characters
 * - price: Required positive number
 * - image: Required file (handled as string for file name)
 * - category: Required string
 */
export const productSchema = z.object({
  title: z
    .string({ required_error: "Product title is required" })
    .min(1, "Product title is required")
    .min(3, "Product title must be at least 3 characters")
    .max(200, "Product title must be less than 200 characters"),
  description: z
    .string({ required_error: "Product description is required" })
    .min(1, "Product description is required")
    .min(10, "Product description must be at least 10 characters")
    .max(5000, "Product description must be less than 5000 characters"),
  price: z
    .string({ required_error: "Product price is required" })
    .min(1, "Product price is required")
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num);
    }, "Price must be a valid number")
    .refine((val) => {
      const num = Number(val);
      return num > 0;
    }, "Price must be greater than 0")
    .refine((val) => {
      const num = Number(val);
      return num <= 999999.99;
    }, "Price must be less than 999,999.99")
    .transform((val) => Number(val)),
  image: imageSchema,
  category: z
    .string({ required_error: "Product category is required" })
    .min(1, "Product category is required")
    .max(100, "Category must be less than 100 characters"),
});

/**
 * Zod Schema for Product Form Validation (Edit Mode)
 * 
 * Same as productSchema but with optional image field
 */
export const productEditSchema = productSchema.extend({
  image: imageSchema.optional(),
});

export type ProductSchema = z.infer<typeof productSchema>;
export type ProductEditSchema = z.infer<typeof productEditSchema>;

