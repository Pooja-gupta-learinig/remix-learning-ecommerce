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
    .string({ required_error: "Title is required" })
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters"),
  description: z
    .string({ required_error: "Description is required" })
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters"),
  price: z
    .string({ required_error: "Price is required" })
    .min(1, "Price is required")
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0;
    }, "Price must be a positive number")
    .transform((val) => Number(val)),
  image: imageSchema,
  category: z
    .string({ required_error: "Category is required" })
    .min(1, "Category is required"),
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

