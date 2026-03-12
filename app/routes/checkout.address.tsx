import { useForm, getFormProps, getInputProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, useNavigation, redirect, useActionData, useLoaderData } from "react-router";
import { z } from "zod";
import type { Route } from "./+types/checkout.address";
import { getSession, commitSession } from "~/sessions.server";

const checkoutDataKey = "checkoutData";

const addressSchema = z.object({
	firstName: z
		.string({ required_error: "First name is required" })
		.min(1, "First name is required")
		.max(50, "First name must be less than 50 characters")
		.regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes"),
	lastName: z
		.string({ required_error: "Last name is required" })
		.min(1, "Last name is required")
		.max(50, "Last name must be less than 50 characters")
		.regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes"),
	email: z
		.string({ required_error: "Email address is required" })
		.min(1, "Email address is required")
		.email("Please enter a valid email address (e.g., john.doe@example.com)")
		.max(100, "Email address must be less than 100 characters"),
	phone: z
		.string({ required_error: "Phone number is required" })
		.min(10, "Phone number must be at least 10 digits")
		.max(15, "Phone number must be less than 15 characters")
		.regex(/^[\d\s\-\+\(\)]+$/, "Phone number can only contain digits, spaces, hyphens, plus signs, and parentheses"),
	address: z
		.string({ required_error: "Street address is required" })
		.min(1, "Street address is required")
		.min(5, "Street address must be at least 5 characters")
		.max(200, "Street address must be less than 200 characters"),
	city: z
		.string({ required_error: "City is required" })
		.min(1, "City is required")
		.min(2, "City must be at least 2 characters")
		.max(100, "City must be less than 100 characters")
		.regex(/^[a-zA-Z\s'-]+$/, "City can only contain letters, spaces, hyphens, and apostrophes"),
	state: z
		.string({ required_error: "State/Province is required" })
		.min(1, "State/Province is required")
		.min(2, "State/Province must be at least 2 characters")
		.max(100, "State/Province must be less than 100 characters"),
	zipCode: z
		.string({ required_error: "Zip/Postal code is required" })
		.min(1, "Zip/Postal code is required")
		.min(5, "Zip/Postal code must be at least 5 characters")
		.max(10, "Zip/Postal code must be less than 10 characters")
		.regex(/^[\dA-Za-z\s-]+$/, "Zip/Postal code can only contain letters, digits, spaces, and hyphens"),
	country: z
		.string({ required_error: "Country is required" })
		.min(1, "Country is required")
		.min(2, "Country must be at least 2 characters")
		.max(100, "Country must be less than 100 characters"),
});

export async function loader({ request }: Route.LoaderArgs) {
	const session = await getSession(request.headers.get("Cookie"));
	const checkoutData = session.get(checkoutDataKey);
	
	return {
		savedAddress: checkoutData?.address || null,
	};
}

export async function action({ request }: Route.ActionArgs) {
	// Security: Validate HTTP method
	if (request.method !== "POST") {
		return {
			status: "error" as const,
			formErrors: ["Method not allowed"],
		};
	}

	// Security: Rate limiting
	const clientIp = request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
		request.headers.get("X-Real-IP") ||
		"unknown";
	
	const { checkRateLimit } = await import("~/lib/security.server");
	const rateLimit = checkRateLimit(`checkout:${clientIp}`, 10, 60 * 1000); // 10 requests per minute
	
	if (!rateLimit.allowed) {
		return {
			status: "error" as const,
			formErrors: ["Too many requests. Please try again later."],
		};
	}

	// Security: CSRF protection
	const origin = request.headers.get("Origin");
	const host = request.headers.get("Host");
	if (origin && host) {
		try {
			const originUrl = new URL(origin);
			const requestUrl = new URL(request.url);
			if (process.env.NODE_ENV === "production" && originUrl.hostname !== requestUrl.hostname) {
				return {
					status: "error" as const,
					formErrors: ["Invalid request origin"],
				};
			}
		} catch {
			return {
				status: "error" as const,
				formErrors: ["Invalid request"],
			};
		}
	}

	const formData = await request.formData();

	const submission = parseWithZod(formData, { schema: addressSchema });

	if (submission.status !== "success") {
		return submission.reply();
	}

	// Save address data to session
	const session = await getSession(request.headers.get("Cookie"));
	const checkoutData = session.get(checkoutDataKey) || {};
	session.set(checkoutDataKey, {
		...checkoutData,
		address: submission.value,
	});

	// Redirect to payment step
	throw redirect("/checkout/payment", {
		headers: {
			"Set-Cookie": await commitSession(session),
		},
	});
}

export default function CheckoutAddress() {
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";
	const actionData = useActionData<typeof action>();
	const { savedAddress } = useLoaderData<typeof loader>();

	const [form, fields] = useForm({
		lastResult: actionData,
		defaultValue: savedAddress || undefined,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: addressSchema });
		},
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
	});

	return (
		<div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm">
			<h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Address</h2>

			{form.errors && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
					<p className="text-red-800 text-sm font-medium">{form.errors[0]}</p>
				</div>
			)}

			<Form method="post" className="space-y-6" {...getFormProps(form)}>
				{/* Name Fields */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label
							htmlFor={fields.firstName.id}
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							First Name <span className="text-red-500">*</span>
						</label>
						<input
							{...getInputProps(fields.firstName, { type: "text" })}
							placeholder="John"
							className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors ${
								fields.firstName.errors
									? "border-red-500 focus:border-red-500 focus:ring-red-200"
									: "border-gray-300"
							}`}
						/>
						{fields.firstName.errors && (
							<p className="mt-1 text-sm text-red-600" role="alert" id={fields.firstName.errorId}>
								{fields.firstName.errors[0]}
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor={fields.lastName.id}
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Last Name <span className="text-red-500">*</span>
						</label>
						<input
							{...getInputProps(fields.lastName, { type: "text" })}
							placeholder="Doe"
							className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors ${
								fields.lastName.errors
									? "border-red-500 focus:border-red-500 focus:ring-red-200"
									: "border-gray-300"
							}`}
						/>
						{fields.lastName.errors && (
							<p className="mt-1 text-sm text-red-600" role="alert" id={fields.lastName.errorId}>
								{fields.lastName.errors[0]}
							</p>
						)}
					</div>
				</div>

				{/* Contact Fields */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label
							htmlFor={fields.email.id}
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Email <span className="text-red-500">*</span>
						</label>
						<input
							{...getInputProps(fields.email, { type: "email" })}
							placeholder="john.doe@example.com"
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

					<div>
						<label
							htmlFor={fields.phone.id}
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Phone <span className="text-red-500">*</span>
						</label>
						<input
							{...getInputProps(fields.phone, { type: "tel" })}
							placeholder="+1 (555) 123-4567"
							className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors ${
								fields.phone.errors
									? "border-red-500 focus:border-red-500 focus:ring-red-200"
									: "border-gray-300"
							}`}
						/>
						{fields.phone.errors && (
							<p className="mt-1 text-sm text-red-600" role="alert" id={fields.phone.errorId}>
								{fields.phone.errors[0]}
							</p>
						)}
					</div>
				</div>

				{/* Address Field */}
				<div>
					<label
						htmlFor={fields.address.id}
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Address <span className="text-red-500">*</span>
					</label>
					<input
						{...getInputProps(fields.address, { type: "text" })}
						placeholder="123 Main Street"
						className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors ${
							fields.address.errors
								? "border-red-500 focus:border-red-500 focus:ring-red-200"
								: "border-gray-300"
						}`}
					/>
					{fields.address.errors && (
						<p className="mt-1 text-sm text-red-600" role="alert" id={fields.address.errorId}>
							{fields.address.errors[0]}
						</p>
					)}
				</div>

				{/* City, State, Zip */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div>
						<label
							htmlFor={fields.city.id}
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							City <span className="text-red-500">*</span>
						</label>
						<input
							{...getInputProps(fields.city, { type: "text" })}
							placeholder="New York"
							className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors ${
								fields.city.errors
									? "border-red-500 focus:border-red-500 focus:ring-red-200"
									: "border-gray-300"
							}`}
						/>
						{fields.city.errors && (
							<p className="mt-1 text-sm text-red-600" role="alert" id={fields.city.errorId}>
								{fields.city.errors[0]}
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor={fields.state.id}
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							State <span className="text-red-500">*</span>
						</label>
						<input
							{...getInputProps(fields.state, { type: "text" })}
							placeholder="NY"
							className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors ${
								fields.state.errors
									? "border-red-500 focus:border-red-500 focus:ring-red-200"
									: "border-gray-300"
							}`}
						/>
						{fields.state.errors && (
							<p className="mt-1 text-sm text-red-600" role="alert" id={fields.state.errorId}>
								{fields.state.errors[0]}
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor={fields.zipCode.id}
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Zip Code <span className="text-red-500">*</span>
						</label>
						<input
							{...getInputProps(fields.zipCode, { type: "text" })}
							placeholder="10001"
							className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors ${
								fields.zipCode.errors
									? "border-red-500 focus:border-red-500 focus:ring-red-200"
									: "border-gray-300"
							}`}
						/>
						{fields.zipCode.errors && (
							<p className="mt-1 text-sm text-red-600" role="alert" id={fields.zipCode.errorId}>
								{fields.zipCode.errors[0]}
							</p>
						)}
					</div>
				</div>

				{/* Country */}
				<div>
					<label
						htmlFor={fields.country.id}
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Country <span className="text-red-500">*</span>
					</label>
					<input
						{...getInputProps(fields.country, { type: "text" })}
						placeholder="United States"
						className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors ${
							fields.country.errors
								? "border-red-500 focus:border-red-500 focus:ring-red-200"
								: "border-gray-300"
						}`}
					/>
					{fields.country.errors && (
						<p className="mt-1 text-sm text-red-600" role="alert" id={fields.country.errorId}>
							{fields.country.errors[0]}
						</p>
					)}
				</div>

				{/* Submit Button */}
				<div className="flex justify-end pt-4">
					<button
						type="submit"
						className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Processing..." : "Continue to Payment"}
					</button>
				</div>
			</Form>
		</div>
	);
}

