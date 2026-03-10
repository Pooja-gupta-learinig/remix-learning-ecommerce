import { Form, useNavigation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import type { Route } from "./+types/deleteuser.$userId";
import { getUserById, deleteUser } from "~/auth/users.server";
import type { StoredUser } from "~/auth/users.server";
import { Link } from "react-router";
import { adminLoader } from "~/lib/admin.server";

/**
 * Server-side Loader Function
 * 
 * Fetches user data to display what will be deleted
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
		// Prevent deletion of admin users
		if (user.role === "admin") {
			throw new Response(null, {
				status: 403,
				statusText: "Cannot delete admin users",
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
 * Handles user deletion via DELETE method.
 * Deletes the user from users.json.
 * Returns success status or error.
 */
export async function action({ request, params }: Route.ActionArgs) {
	await adminLoader(request);
	const { userId } = params;
	
	if (!userId) {
		return { error: "User ID is required", success: false };
	}

	if (request.method === "DELETE") {
		try {
			// Check if user is admin before deletion
			const user = await getUserById(userId);
			if (!user) {
				return { error: "User not found", success: false };
			}
			if (user.role === "admin") {
				return { error: "Cannot delete admin users", success: false };
			}

			const deleted = await deleteUser(userId);

			console.log("deleted", deleted);

			if (!deleted) {
				return { error: "User not found", success: false };
			}

			return { success: true, message: "User deleted successfully" };
		} catch (error) {
			console.error("Error deleting user:", error);
			return { error: "An error occurred while deleting the user", success: false };
		}
	}

	return { error: "Invalid request method", success: false };
}

/**
 * Delete User Page Component
 * 
 * Displays user information and confirmation form.
 * Shows success message after successful deletion.
 */
export default function DeleteUserPage({ loaderData, actionData }: Route.ComponentProps) {
	const navigation = useNavigation();
	const navigate = useNavigate();
	const isSubmitting = navigation.state === "submitting";
	const [showSuccess, setShowSuccess] = useState(false);
	
	const user = (loaderData as { user: StoredUser } | undefined)?.user;
	const actionResult = actionData as { success?: boolean; error?: string; message?: string } | undefined;

	// Show success message when deletion is successful
	useEffect(() => {
		if (actionResult?.success) {
			setShowSuccess(true);
			console.log("actionResult", actionResult);
			// Redirect to admin users page after 2 seconds
			const timer = setTimeout(() => {
				navigate("/admin/users");
			}, 2000);
			
			return () => clearTimeout(timer);
		}
	}, [actionResult?.success, navigate]);

	// If user is not found, show error
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

	// If user is admin, show error message
	if (user.role === "admin") {
		return (
			<div className="max-w-4xl mx-auto">
				<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">Cannot Delete Admin User</h1>
					<p className="text-gray-600 mb-6">Admin users cannot be deleted for security reasons.</p>
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
				<h1 className="text-3xl font-bold text-gray-900 mb-2">Delete User</h1>
				<p className="text-gray-600 text-sm">
					Are you sure you want to delete this user? This action cannot be undone.
				</p>
			</div>

			<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
				{/* Success Message */}
				{showSuccess && actionResult?.success && (
					<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
						<div className="flex items-center gap-2">
							<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
							<p className="text-green-800 text-sm font-medium">
								{actionResult.message || "User deleted successfully!"}
							</p>
						</div>
						<p className="text-green-700 text-xs mt-2">Redirecting to users page...</p>
					</div>
				)}

				{/* Error Message */}
				{actionResult?.error && !actionResult.success && (
					<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-red-800 text-sm font-medium">
							{actionResult.error}
						</p>
					</div>
				)}

				{/* User Information */}
				<div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
					<div className="space-y-3">
						<div>
							<span className="text-sm font-medium text-gray-700">Email:</span>
							<p className="text-gray-900">{user.email}</p>
						</div>
						<div>
							<span className="text-sm font-medium text-gray-700">Role:</span>
							<span
								className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
									user.role === "admin"
										? "bg-purple-100 text-purple-800"
										: "bg-blue-100 text-blue-800"
								}`}
							>
								{user.role}
							</span>
						</div>
						<div>
							<span className="text-sm font-medium text-gray-700">Created At:</span>
							<p className="text-gray-900">
								{new Date(user.createdAt).toLocaleString()}
							</p>
						</div>
						<div>
							<span className="text-sm font-medium text-gray-700">User ID:</span>
							<p className="text-gray-900 font-mono text-sm">{user.id}</p>
						</div>
					</div>
				</div>

				{/* Delete Form */}
				<Form method="delete" className="space-y-4">
					<div className="flex gap-4">
						<button
							type="submit"
							disabled={isSubmitting || showSuccess}
							className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							{isSubmitting ? (
								<>
									<svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Deleting...
								</>
							) : (
								<>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
									Delete User
								</>
							)}
						</button>
						<button
							type="button"
							onClick={() => { 
								navigate("/admin/users");
							}}
							className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
						>
							Cancel
						</button>
					</div>
				</Form>
			</div>
		</div>
	);
}

