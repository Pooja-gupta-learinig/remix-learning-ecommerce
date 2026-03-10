import { useForm, getFormProps, getInputProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, useNavigation } from "react-router";
import { useEffect, useState, useRef } from "react";
import type { Route } from "./+types/settings";
import { requireUserSession, createUserSession } from "~/sessions.server";
import { getUserById, updateUser } from "~/auth/users.server";
import { userSettingsSchema } from "~/lib/user.schema";
import { AppLayout } from "~/layouts/AppLayouts";
import { Settings, Mail, Lock } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
	const user = await requireUserSession(request);
	const storedUser = await getUserById(user.id);
	
	if (!storedUser) {
		throw new Response(null, {
			status: 404,
			statusText: "User not found",
		});
	}
	
	return { user: storedUser };
}

export async function action({ request }: Route.ActionArgs) {
	const user = await requireUserSession(request);
	const formData = await request.formData();
	
	// Parse form data with Zod schema using Conform
	const submission = parseWithZod(formData, { schema: userSettingsSchema });
	
	// If validation fails, return the submission with errors
	if (submission.status !== "success") {
		return submission.reply();
	}
	
	// Validation passed - extract validated data
	const { email, password } = submission.value;
	
	try {
		const updatedUser = await updateUser({
			id: user.id,
			email,
			password,
		});
		
		if (!updatedUser) {
			return submission.reply({
				formErrors: ["User not found"],
			});
		}
		
		// Update session with new email if it changed
		if (email && email !== user.email) {
			return await createUserSession({
				request,
				user: { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role },
				redirectTo: "/dashboard/settings",
			});
		}
		
		return submission.reply({
			formErrors: [],
			fieldErrors: {},
		});
	} catch (error) {
		if (error instanceof Error && error.message === "USER_EMAIL_ALREADY_EXISTS") {
			return submission.reply({
				formErrors: ["An account with this email already exists"],
			});
		}
		console.error("Error updating user:", error);
		return submission.reply({
			formErrors: ["Failed to update settings. Please try again."],
		});
	}
}

export default function SettingsPage({ actionData, loaderData }: Route.ComponentProps) {
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";
	const formRef = useRef<HTMLFormElement>(null);
	const [showSuccess, setShowSuccess] = useState(false);
	const hasResetRef = useRef(false);
	
	const user = (loaderData as { user: { email: string } } | undefined)?.user;
	
	// Initialize Conform form with last submission (for error handling) and default values
	const [form, fields] = useForm({
		lastResult: actionData,
		defaultValue: {
			email: user?.email || "",
		},
		onValidate({ formData }) {
			// Real-time validation on client side
			return parseWithZod(formData, { schema: userSettingsSchema });
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
	
	// Show success message when settings are updated successfully
	useEffect(() => {
		if (isSuccess && !hasResetRef.current) {
			hasResetRef.current = true;
			setShowSuccess(true);
			
			// Hide success message after 3 seconds
			const timer = setTimeout(() => {
				setShowSuccess(false);
			}, 3000);
			
			return () => clearTimeout(timer);
		}
		
		if (!isSuccess) {
			hasResetRef.current = false;
		}
	}, [isSuccess]);
	
	return (
		<AppLayout hasSidebar={false}>
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-2">
						<Settings className="w-8 h-8 text-indigo-600" />
						<h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
					</div>
					<p className="text-gray-600 text-sm">
						Manage your account information and preferences
					</p>
				</div>
				
				<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
					{/* Success Message */}
					{showSuccess && isSuccess && (
						<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
							<p className="text-green-800 text-sm font-medium">
								✓ Settings updated successfully!
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
								className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
							>
								<Mail className="w-4 h-4" />
								Email <span className="text-red-500">*</span>
							</label>
							<input
								{...getInputProps(fields.email, { type: "email" })}
								placeholder="Enter your email"
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
								className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
							>
								<Lock className="w-4 h-4" />
								Password <span className="text-gray-500 text-xs ml-2">(Optional - leave empty to keep current password)</span>
							</label>
							<input
								{...getInputProps(fields.password, { type: "password" })}
								placeholder="Enter new password (optional)"
								autoComplete="new-password"
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
						
						{/* Submit Button */}
						<div className="flex gap-4 pt-4">
							<button
								type="submit"
								className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-medium"
								disabled={isSubmitting}
							>
								{isSubmitting ? "Saving..." : "Save Changes"}
							</button>
						</div>
					</Form>
				</div>
			</div>
		</AppLayout>
	);
}
