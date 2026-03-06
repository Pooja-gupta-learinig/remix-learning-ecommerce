import { useForm, getFormProps, getInputProps, getSelectProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, useNavigation, useNavigate } from "react-router";
import { useEffect, useState, useRef } from "react";
import type { Route } from "./+types/addedituser.$userId";
import { Link } from "react-router";
import { userSchema, userEditSchema } from "~/lib/user.schema";
import { getUserById, updateUser } from "~/auth/users.server";
import type { StoredUser } from "~/auth/users.server";
import { adminLoader } from "~/lib/admin.server";

/**
 * Server-side Loader Function
 * 
 * Fetches user data if userId is provided (edit mode)
 */
export async function loader({ request, params }: Route.LoaderArgs) {
	await adminLoader(request);
	const { userId } = params;
	
	if (!userId) {
		throw new Response(null, {
			status: 400,
			statusText: "User ID is required",
		});
	}

	try {
		const user = await getUserById(userId);
		if (!user) {
			throw new Response(null, {
				status: 404,
				statusText: "User not found",
			});
		}
		return { user };
	} catch (error) {
		if (error instanceof Response) {
			throw error;
		}
		throw new Response(null, {
			status: 404,
			statusText: "User not found",
		});
	}
}

/**
 * Server-side Action Function
 * 
 * Handles form submission with server-side validation using Conform and Zod.
 * Supports update (PUT) operation.
 * Returns validation errors or success response.
 */
export async function action({ request, params }: Route.ActionArgs) {
	await adminLoader(request);
	const formData = await request.formData();
	const { userId } = params;
	
	if (!userId) {
		return {
			status: "error",
			error: "User ID is required",
		};
	}

	// Parse form data with Zod schema using Conform
	const submission = parseWithZod(formData, { schema: userEditSchema });
	
	// If validation fails, return the submission with errors
	if (submission.status !== "success") {
		return submission.reply();
	}
	
	// Validation passed - extract validated data
	const { email, password, role } = submission.value;

	try {
		const updatedUser = await updateUser({
			id: userId,
			email,
			password,
			role,
		});

		if (!updatedUser) {
			return submission.reply({
				formErrors: ["User not found"],
			});
		}

		return submission.reply({
			formErrors: [],
			fieldErrors: {},
		});
	} catch (error) {
		if (error instanceof Error && error.message === "USER_EMAIL_ALREADY_EXISTS") {
			return submission.reply({
				formErrors: ["An user with this email already exists"],
			});
		}
		console.error("Error updating user:", error);
		return submission.reply({
			formErrors: ["Failed to update user. Please try again."],
		});
	}
}

/**
 * Add/Edit User Page Component
 * 
 * Uses Conform for form state management and real-time validation.
 * Displays validation errors inline with each field.
 * Supports edit mode based on userId parameter.
 */
export default function AddEditUserPage({ actionData, loaderData }: Route.ComponentProps) {
	const navigation = useNavigation();
	const navigate = useNavigate();
	const isSubmitting = navigation.state === "submitting";
	const formRef = useRef<HTMLFormElement>(null);
	const [showSuccess, setShowSuccess] = useState(false);
	const hasResetRef = useRef(false);
	
	const user = (loaderData as { user: StoredUser } | undefined)?.user;
	
	if (!user) {
		return (
			<div className="max-w-4xl mx-auto">
				<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
					<p className="text-gray-600 mb-6">The user you're looking for doesn't exist.</p>
					<Link
						to="/admin/users"
						className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
					>
						Back to Users
					</Link>
				</div>
			</div>
		);
	}

	// Initialize Conform form with last submission (for error handling) and default values
	const [form, fields] = useForm({
		lastResult: actionData,
		defaultValue: {
			email: user.email || "",
			role: user.role || "customer",
		},
		onValidate({ formData }) {
			// Real-time validation on client side
			return parseWithZod(formData, { schema: userEditSchema });
		},
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
	});
	
	// Check if form was successfully submitted (no errors in actionData)
	const isSuccess = actionData && 
		typeof actionData === "object" && 
		"status" in actionData && 
		(actionData as { status: string }).status === "success" &&
		!("error" in actionData && (actionData as { error: unknown }).error);

	// Show success message when user is updated successfully
	useEffect(() => {
		if (isSuccess && !hasResetRef.current) {
			hasResetRef.current = true;
			setShowSuccess(true);
			
			// Redirect to users page after 2 seconds
			const timer = setTimeout(() => {
				navigate("/admin/users");
			}, 2000);
			
			return () => clearTimeout(timer);
		}
		
		if (!isSuccess) {
			hasResetRef.current = false;
		}
	}, [isSuccess, navigate]);

	return (
		<div className="max-w-4xl mx-auto">
			{/* Header */}
			<div className="mb-6">
				<Link
					to="/admin/users"
					className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
					Back to Users
				</Link>
				<h1 className="text-3xl font-bold text-gray-900 mb-2">Edit User</h1>
				<p className="text-gray-600 text-sm">
					Update the user details below
				</p>
			</div>

			<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
				{/* Success Message */}
				{showSuccess && isSuccess && (
					<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
						<p className="text-green-800 text-sm font-medium">
							✓ User updated successfully! Redirecting...
						</p>
					</div>
				)}

				{/* Form Error (non-field specific) */}
				{form.errors && (
					<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-red-800 text-sm font-medium">
							{form.errors[0]}
						</p>
					</div>
				)}

				<Form 
					method="post" 
					className="space-y-6" 
					{...getFormProps(form)}
					ref={formRef}
				>
					{/* Email Field */}
					<div>
						<label
							htmlFor={fields.email.id}
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Email <span className="text-red-500">*</span>
						</label>
						<input
							{...getInputProps(fields.email, { type: "email" })}
							placeholder="Enter user email"
							className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors ${
								fields.email.errors
									? "border-red-500 focus:border-red-500 focus:ring-red-200"
									: "border-gray-300"
							}`}
						/>
						{fields.email.errors && (
							<p className="mt-1 text-sm text-red-600" role="alert" id={fields.email.errorId}>
								{fields.email.errors[0]}
							</p>
						)}
					</div>

					{/* Password Field */}
					<div>
						<label
							htmlFor={fields.password.id}
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Password <span className="text-gray-500 text-xs ml-2">(Optional - leave empty to keep current password)</span>
						</label>
						<input
							{...getInputProps(fields.password, { type: "password" })}
							placeholder="Enter new password (optional)"
							autoComplete="off"
							className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors ${
								fields.password.errors
									? "border-red-500 focus:border-red-500 focus:ring-red-200"
									: "border-gray-300"
							}`}
						/>
						{fields.password.errors && (
							<p className="mt-1 text-sm text-red-600" role="alert" id={fields.password.errorId}>
								{fields.password.errors[0]}
							</p>
						)}
					</div>

					{/* Role Field */}
					<div>
						<label
							htmlFor={fields.role.id}
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Role <span className="text-red-500">*</span>
						</label>
						<select
							{...getSelectProps(fields.role)}
							className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors ${
								fields.role.errors
									? "border-red-500 focus:border-red-500 focus:ring-red-200"
									: "border-gray-300"
							}`}
						>
							<option value="customer">Customer</option>
							<option value="admin">Admin</option>
						</select>
						{fields.role.errors && (
							<p className="mt-1 text-sm text-red-600" role="alert" id={fields.role.errorId}>
								{fields.role.errors[0]}
							</p>
						)}
					</div>

					{/* Submit Button */}
					<div className="flex gap-4">
						<button
							type="submit"
							className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Updating..." : "Update User"}
						</button>
						<button
							type="button"
							onClick={() => navigate("/admin/users")}
							className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
						>
							Cancel
						</button>
					</div>
				</Form>
			</div>
		</div>
	);
}

