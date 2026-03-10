import { z } from "zod";

export const userSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	role: z.enum(["admin", "customer"], {
		required_error: "Role is required",
	}),
});

export const userEditSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(6, "Password must be at least 6 characters").optional(),
	role: z.enum(["admin", "customer"], {
		required_error: "Role is required",
	}),
});

export const userSettingsSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export type UserSchema = z.infer<typeof userSchema>;
export type UserEditSchema = z.infer<typeof userEditSchema>;
export type UserSettingsSchema = z.infer<typeof userSettingsSchema>;

