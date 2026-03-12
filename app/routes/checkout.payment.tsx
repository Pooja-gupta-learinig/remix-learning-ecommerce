import { useForm, getFormProps, getInputProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, useNavigation, redirect, Link, useActionData, useLoaderData } from "react-router";
import { z } from "zod";
import type { Route } from "./+types/checkout.payment";
import { getSession, commitSession } from "~/sessions.server";

const checkoutDataKey = "checkoutData";

const paymentSchema = z
	.object({
		cardNumber: z
			.string({ required_error: "Card number is required" })
			.min(1, "Card number is required")
			.regex(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/, "Card number must be exactly 16 digits (e.g., 1234 5678 9012 3456)")
			.transform((val) => val.replace(/\s/g, "")),
		cardName: z
			.string({ required_error: "Cardholder name is required" })
			.min(1, "Cardholder name is required")
			.min(2, "Cardholder name must be at least 2 characters")
			.max(50, "Cardholder name must be less than 50 characters")
			.regex(/^[a-zA-Z\s'-]+$/, "Cardholder name can only contain letters, spaces, hyphens, and apostrophes"),
		expiryMonth: z
			.string({ required_error: "Expiry month is required" })
			.min(1, "Expiry month is required")
			.regex(/^(0[1-9]|1[0-2])$/, "Expiry month must be between 01 and 12")
			.transform(Number),
		expiryYear: z
			.string({ required_error: "Expiry year is required" })
			.min(1, "Expiry year is required")
			.regex(/^\d{2}$/, "Expiry year must be 2 digits (e.g., 25 for 2025)")
			.transform(Number),
		cvv: z
			.string({ required_error: "CVV is required" })
			.min(1, "CVV is required")
			.regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits (found on the back of your card)"),
	})
	.refine(
		(data) => {
			const currentYear = new Date().getFullYear() % 100;
			const currentMonth = new Date().getMonth() + 1;
			if (data.expiryYear < currentYear) {
				return false;
			}
			if (data.expiryYear === currentYear && data.expiryMonth < currentMonth) {
				return false;
			}
			return true;
		},
		{
			message: "This card has expired. Please use a card with a valid expiry date.",
			path: ["expiryYear"],
		}
	);

export async function loader({ request }: Route.LoaderArgs) {
	const session = await getSession(request.headers.get("Cookie"));
	const checkoutData = session.get(checkoutDataKey);

	// If no address data, redirect to address step
	if (!checkoutData?.address) {
		throw redirect("/checkout/address");
	}

	// Return saved payment data (excluding masked card number for security)
	const savedPayment = checkoutData?.payment;
	const paymentDefaults = savedPayment
		? {
				cardName: savedPayment.cardName || "",
				expiryMonth: savedPayment.expiryMonth
					? String(savedPayment.expiryMonth).padStart(2, "0")
					: "",
				expiryYear: savedPayment.expiryYear
					? String(savedPayment.expiryYear % 100).padStart(2, "0")
					: "",
				cvv: savedPayment.cvv || "",
				// Don't restore card number as it's masked
				cardNumber: "",
			}
		: null;

	return {
		savedPayment: paymentDefaults,
	};
}

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();

	const submission = parseWithZod(formData, { schema: paymentSchema });

	if (submission.status !== "success") {
		return submission.reply();
	}

	// Save payment data to session (in production, you'd tokenize this)
	const session = await getSession(request.headers.get("Cookie"));
	const checkoutData = session.get(checkoutDataKey) || {};

	// Only store last 4 digits for security
	const cardNumber = submission.value.cardNumber;
	const last4 = cardNumber.slice(-4);

	session.set(checkoutDataKey, {
		...checkoutData,
		payment: {
			...submission.value,
			cardNumber: `**** **** **** ${last4}`, // Masked for display
		},
	});

	// Redirect to review step
	throw redirect("/checkout/review", {
		headers: {
			"Set-Cookie": await commitSession(session),
		},
	});
}

export default function CheckoutPayment() {
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";
	const actionData = useActionData<typeof action>();
	const { savedPayment } = useLoaderData<typeof loader>();

	const [form, fields] = useForm({
		lastResult: actionData,
		defaultValue: savedPayment || undefined,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: paymentSchema });
		},
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
	});

	const formatCardNumber = (value: string): string => {
		const cleaned = value.replace(/\s/g, "");
		const match = cleaned.match(/.{1,4}/g);
		return match ? match.join(" ") : cleaned;
	};

	return (
		<div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm">
			<h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Information</h2>

			{form.errors && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
					<p className="text-red-800 text-sm font-medium">{form.errors[0]}</p>
				</div>
			)}

			<Form method="post" className="space-y-6" {...getFormProps(form)}>
				{/* Card Number */}
				<div>
					<label
						htmlFor={fields.cardNumber.id}
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Card Number <span className="text-red-500">*</span>
					</label>
					<input
						{...getInputProps(fields.cardNumber, { type: "text" })}
						placeholder="1234 5678 9012 3456"
						maxLength={19}
						onChange={(e) => {
							const formatted = formatCardNumber(e.target.value);
							e.target.value = formatted;
							// Trigger form validation by dispatching input event
							const inputEvent = new Event("input", { bubbles: true });
							e.target.dispatchEvent(inputEvent);
						}}
						className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors ${
							fields.cardNumber.errors
								? "border-red-500 focus:border-red-500 focus:ring-red-200"
								: "border-gray-300"
						}`}
					/>
					{fields.cardNumber.errors && (
						<p className="mt-1 text-sm text-red-600" role="alert" id={fields.cardNumber.errorId}>
							{fields.cardNumber.errors[0]}
						</p>
					)}
				</div>

				{/* Cardholder Name */}
				<div>
					<label
						htmlFor={fields.cardName.id}
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Cardholder Name <span className="text-red-500">*</span>
					</label>
					<input
						{...getInputProps(fields.cardName, { type: "text" })}
						placeholder="John Doe"
						className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors ${
							fields.cardName.errors
								? "border-red-500 focus:border-red-500 focus:ring-red-200"
								: "border-gray-300"
						}`}
					/>
					{fields.cardName.errors && (
						<p className="mt-1 text-sm text-red-600" role="alert" id={fields.cardName.errorId}>
							{fields.cardName.errors[0]}
						</p>
					)}
				</div>

				{/* Expiry and CVV */}
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Expiry Date <span className="text-red-500">*</span>
						</label>
						<div className="grid grid-cols-2 gap-2">
							<div>
								<input
									{...getInputProps(fields.expiryMonth, { type: "text" })}
									placeholder="MM"
									maxLength={2}
									className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors ${
										fields.expiryMonth.errors
											? "border-red-500 focus:border-red-500 focus:ring-red-200"
											: "border-gray-300"
									}`}
								/>
								{fields.expiryMonth.errors && (
									<p
										className="mt-1 text-sm text-red-600"
										role="alert"
										id={fields.expiryMonth.errorId}
									>
										{fields.expiryMonth.errors[0]}
									</p>
								)}
							</div>
							<div>
								<input
									{...getInputProps(fields.expiryYear, { type: "text" })}
									placeholder="YY"
									maxLength={2}
									className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors ${
										fields.expiryYear.errors
											? "border-red-500 focus:border-red-500 focus:ring-red-200"
											: "border-gray-300"
									}`}
								/>
								{fields.expiryYear.errors && (
									<p
										className="mt-1 text-sm text-red-600"
										role="alert"
										id={fields.expiryYear.errorId}
									>
										{fields.expiryYear.errors[0]}
									</p>
								)}
							</div>
						</div>
					</div>

					<div>
						<label
							htmlFor={fields.cvv.id}
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							CVV <span className="text-red-500">*</span>
						</label>
						<input
							{...getInputProps(fields.cvv, { type: "text" })}
							placeholder="123"
							maxLength={4}
							className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors ${
								fields.cvv.errors
									? "border-red-500 focus:border-red-500 focus:ring-red-200"
									: "border-gray-300"
							}`}
						/>
						{fields.cvv.errors && (
							<p className="mt-1 text-sm text-red-600" role="alert" id={fields.cvv.errorId}>
								{fields.cvv.errors[0]}
							</p>
						)}
					</div>
				</div>

				{/* Security Note */}
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<div className="flex items-start gap-2">
						<svg
							className="w-5 h-5 text-blue-600 mt-0.5 shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							/>
						</svg>
						<p className="text-sm text-blue-800">
							Your payment information is secure and encrypted. We do not store your full card
							details.
						</p>
					</div>
				</div>

				{/* Navigation Buttons */}
				<div className="flex justify-between pt-4">
					<Link
						to="/checkout/address"
						className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
					>
						Back to Address
					</Link>
					<button
						type="submit"
						className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Processing..." : "Continue to Review"}
					</button>
				</div>
			</Form>
		</div>
	);
}

