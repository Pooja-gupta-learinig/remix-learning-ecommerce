import { useForm, getFormProps, getInputProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, useNavigation } from "react-router";
import { redirect } from "@remix-run/node";
import { useEffect, useState, useRef } from "react";
import { z } from "zod";
import type { Route } from "./+types/login";
import { AppLayout } from "~/layouts/AppLayouts";
import { createUserSession, getUserSession, getDefaultRedirectForRole } from "~/sessions.server";
import { ensureDefaultAdminUser, verifyLogin } from "~/auth/users.server";

/**
 * Zod Schema for Login Form Validation
 * 
 * Defines validation rules:
 * - email: Must be a valid email address
 * - password: Required string with minimum 6 characters
 */
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/**
 * Server-side Loader Function
 * 
 * Redirects logged-in users to their role-based dashboard.
 * If user is not logged in, allows access to the login page.
 */
export async function loader({ request }: Route.LoaderArgs) {
	const user = await getUserSession(request);
	if (user) {
		// User is already logged in, redirect to their role-based dashboard
		const redirectTo = getDefaultRedirectForRole(user.role);
		throw redirect(redirectTo);
	}
	return null;
}

/**
 * Server-side Action Function
 * 
 * Handles form submission with server-side validation using Conform and Zod.
 * Returns validation errors or success response.
 */
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  
  // Parse form data with Zod schema using Conform
  const submission = parseWithZod(formData, { schema: loginSchema });
  
  // If validation fails, return the submission with errors
  if (submission.status !== "success") {
    return submission.reply();
  }
  
  // Validation passed - extract validated data
  const { email, password } = submission.value;

  // Make sure the default admin exists (dev/demo convenience).
  await ensureDefaultAdminUser();

  const user = await verifyLogin({ email, password });
  if (!user) {
    return submission.reply({
      formErrors: ["Invalid email or password"],
    });
  }

  return await createUserSession({
    request,
    user: { id: user.id, email: user.email, role: user.role },
  });
}

/**
 * Login Page Component
 * 
 * Uses Conform for form state management and real-time validation.
 * Displays validation errors inline with each field.
 */
export default function LoginPage({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const formRef = useRef<HTMLFormElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const hasResetRef = useRef(false);
  
  // Initialize Conform form with last submission (for error handling)
  const [form, fields] = useForm({
    lastResult: actionData,
    onValidate({ formData }) {
      // Real-time validation on client side
      return parseWithZod(formData, { schema: loginSchema });
    },
    shouldValidate: "onBlur", // Validate on blur for better UX
    shouldRevalidate: "onInput", // Revalidate on input after first blur
  });
  
  // Check if form was successfully submitted (no errors in actionData)
  const isSuccess = actionData && 
    typeof actionData === "object" && 
    "status" in actionData && 
    (actionData as { status: string }).status === "success" &&
    !("error" in actionData && (actionData as { error: unknown }).error);

  // Reset form and show success message when login is successful
  useEffect(() => {
    if (isSuccess && !hasResetRef.current) {
      // Mark as reset to prevent multiple resets
      hasResetRef.current = true;
      
      // Show success message
      setShowSuccess(true);
      
      // Reset the HTML form
      if (formRef.current) {
        formRef.current.reset();
      }
      
      // Reset Conform form state
      form.reset();
      
      // Hide success message after 2 seconds
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      
      // Cleanup timer on unmount or when isSuccess changes
      return () => {
        clearTimeout(timer);
      };
    }
    
    // Reset the flag when actionData changes (new submission)
    if (!isSuccess) {
      hasResetRef.current = false;
    }
  }, [isSuccess, actionData, form]);

  return (
   <AppLayout hasSidebar={false} >
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Login
            </h1>
            <p className="text-gray-600 text-sm">
              Enter your email and password to access your account
            </p>
          </div>

          {/* Success Message - Shows for 2 seconds */}
          {showSuccess && isSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-medium">
                ✓ Login successful!
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
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <input
                {...getInputProps(fields.password, { type: "password" })}
                placeholder="Enter your password"
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
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </Form>
        </div>
      </div>
    </AppLayout>
  );
}