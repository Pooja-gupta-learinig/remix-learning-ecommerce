import { z } from "zod";

export const userSchema = z.object({
	email: z
		.string({ required_error: "Email address is required" })
		.min(1, "Email address is required")
		.email("Please enter a valid email address (e.g., user@example.com)")
		.max(100, "Email address must be less than 100 characters"),
	password: z
		.string({ required_error: "Password is required" })
		.min(1, "Password is required")
		.min(6, "Password must be at least 6 characters")
		.max(100, "Password must be less than 100 characters"),
	role: z.enum(["admin", "customer"], {
		required_error: "User role is required. Please select either Admin or Customer.",
		invalid_type_error: "Invalid role selected. Please choose Admin or Customer.",
	}),
	firstName: z
		.string({ required_error: "First name is required" })
		.min(1, "First name is required")
		.min(2, "First name must be at least 2 characters")
		.max(50, "First name must be less than 50 characters")
		.regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes"),
	lastName: z
		.string({ required_error: "Last name is required" })
		.min(1, "Last name is required")
		.min(2, "Last name must be at least 2 characters")
		.max(50, "Last name must be less than 50 characters")
		.regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes"),
});

export const userEditSchema = z.object({
	email: z
		.string({ required_error: "Email address is required" })
		.min(1, "Email address is required")
		.email("Please enter a valid email address (e.g., user@example.com)")
		.max(100, "Email address must be less than 100 characters"),
	password: z
		.string()
		.min(6, "Password must be at least 6 characters")
		.max(100, "Password must be less than 100 characters")
		.optional(),
	role: z.enum(["admin", "customer"], {
		required_error: "User role is required. Please select either Admin or Customer.",
		invalid_type_error: "Invalid role selected. Please choose Admin or Customer.",
	}),
	firstName: z
		.string({ required_error: "First name is required" })
		.min(1, "First name is required")
		.min(2, "First name must be at least 2 characters")
		.max(50, "First name must be less than 50 characters")
		.regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes"),
	lastName: z
		.string({ required_error: "Last name is required" })
		.min(1, "Last name is required")
		.min(2, "Last name must be at least 2 characters")
		.max(50, "Last name must be less than 50 characters")
		.regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes"),
});

export const userSettingsSchema = z.object({
	email: z
		.string({ required_error: "Email address is required" })
		.min(1, "Email address is required")
		.email("Please enter a valid email address (e.g., user@example.com)")
		.max(100, "Email address must be less than 100 characters"),
	password: z
		.string()
		.min(6, "Password must be at least 6 characters")
		.max(100, "Password must be less than 100 characters")
		.optional(),
	firstName: z
		.string({ required_error: "First name is required" })
		.min(1, "First name is required")
		.min(2, "First name must be at least 2 characters")
		.max(50, "First name must be less than 50 characters")
		.regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes"),
	lastName: z
		.string({ required_error: "Last name is required" })
		.min(1, "Last name is required")
		.min(2, "Last name must be at least 2 characters")
		.max(50, "Last name must be less than 50 characters")
		.regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes"),
});

export type UserSchema = z.infer<typeof userSchema>;
export type UserEditSchema = z.infer<typeof userEditSchema>;
export type UserSettingsSchema = z.infer<typeof userSettingsSchema>;

