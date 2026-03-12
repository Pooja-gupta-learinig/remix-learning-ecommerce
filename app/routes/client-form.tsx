// route('/products/:productId', './product.tsx')

/**
 * Client Form Component with Real-time Zod Validation
 * 
 * This component demonstrates a form with:
 * - Real-time client-side validation using Zod
 * - Server-side validation in the action function
 * - Error display that only shows after user interaction (touched fields)
 * - Visual feedback with red borders for invalid fields
 */

import { useState, useEffect } from "react";
import { z } from "zod";
import type { Route } from "./+types/client-form";
import { Form, useSubmit } from "react-router";
import { AppLayout } from "~/layouts/AppLayouts";

/**
 * Zod Schema for Form Validation
 * 
 * Defines the validation rules for the form fields:
 * - title: Required string with minimum 1 character
 * - email: Must be a valid email address format
 */
const formSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  email: z
    .string({ required_error: "Email address is required" })
    .min(1, "Email address is required")
    .email("Please enter a valid email address (e.g., user@example.com)")
    .max(100, "Email address must be less than 100 characters"),
});

/**
 * TypeScript type inferred from the Zod schema
 * This ensures type safety when working with form data
 */
export type FormSchema = z.infer<typeof formSchema>;

/**
 * Server-side Action Function
 * 
 * This function runs on the server when the form is submitted.
 * It handles:
 * - Extracting form data from the request
 * - Server-side validation using Zod
 * - Returning success/error responses to the client
 * 
 * @param request - The incoming request containing form data
 * @returns Object with success status and either data or validation errors
 */
export async function clientAction({
  request,
}: Route.ClientActionArgs) {
  // Extract form data from the request
  const formData = await request.formData();
  const addedData = Object.fromEntries(formData);
  addedData.gm = 'test';
  console.log('addedData', addedData);

  // Get individual field values
  const title = formData.get("title") as string;
  const email = formData.get("email") as string;

  /**
   * Server-side Validation with Zod
   * 
   * safeParse returns an object with:
   * - success: boolean indicating if validation passed
   * - data: validated data (if success is true)
   * - error: ZodError object (if success is false)
   */
  const validationResult = formSchema.safeParse({ title, email });
  
  // If validation fails, return errors to display on the client
  if (!validationResult.success) {
    return {
      success: false,
      // flatten() converts Zod errors into a flat structure with fieldErrors
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  console.log("🔵 title:", title);
  console.log("🔵 email:", email);

  // TODO: Save to database or perform other actions

  // Return success response with validated data
  return {
    success: true,
    title,
  };
}

/**
 * Type Definitions
 */

/**
 * ActionData - Response type from the server action
 * Contains success status, title (on success), or validation errors (on failure)
 */
type ActionData = {
  success?: boolean;
  title?: string;
  errors?: {
    title?: string[];
    email?: string[];
  };
};

/**
 * FieldErrors - Client-side error state
 * Stores error messages for each field (single string per field)
 */
type FieldErrors = {
  title?: string;
  email?: string;
};

/**
 * TouchedFields - Tracks which fields the user has interacted with
 * Used to determine when to show validation errors (only after user touches a field)
 */
type TouchedFields = {
  title: boolean;
  email: boolean;
};

/**
 * Client Form Component
 * 
 * Main component that renders the form with real-time validation.
 * Uses controlled inputs with React state for form values, touched status, and errors.
 * 
 * @param actionData - Data returned from the server action (success/error responses)
 */
export default function Client_Form({
  actionData,
}: Route.ComponentProps) {
  // Parse action data from server response
  const data = actionData as ActionData | undefined;
  
  // React Router's submit function for programmatic form submission
  const submit = useSubmit();
  
  /**
   * State Management
   * 
   * formValues: Controlled input values (two-way data binding)
   * touched: Tracks which fields user has interacted with (blurred)
   * errors: Stores validation error messages for each field
   */
  
  // Form field values - controlled inputs
  const [formValues, setFormValues] = useState({
    title: "",
    email: "",
  });
  
  // Track which fields have been touched (user has focused and blurred)
  // Errors only show for touched fields to avoid showing errors on initial load
  const [touched, setTouched] = useState<TouchedFields>({
    title: false,
    email: false,
  });
  
  // Client-side validation errors (cleared when field becomes valid)
  const [errors, setErrors] = useState<FieldErrors>({});
  
  // Track if success message should be displayed (auto-hides after 2 seconds)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  /**
   * Reset form after successful submission and manage success message display
   * 
   * When the form is successfully submitted (data?.success is true):
   * - Show success message for 2 seconds
   * - Reset all form state: values, touched status, and errors
   */
  useEffect(() => {
    if (data?.success) {
      // Show success message
      setShowSuccessMessage(true);
      
      // Reset form values to empty strings
      setFormValues({
        title: "",
        email: "",
      });
      
      // Reset touched status for all fields
      setTouched({
        title: false,
        email: false,
      });
      
      // Clear all validation errors
      setErrors({});
      
      // Hide success message after 2 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 2000);
      
      // Cleanup timer on unmount or if data changes
      return () => {
        clearTimeout(timer);
      };
    }
  }, [data?.success]);

  /**
   * Validates a single field using Zod
   * 
   * This function:
   * - Extracts the field's schema from the main form schema
   * - Validates the current value
   * - Updates error state (sets error if invalid, removes error if valid)
   * 
   * @param name - The field name to validate (must be a key in FormSchema)
   * @param value - The current value of the field
   */
  function validateField(name: keyof FormSchema, value: string): void {
    // Get the schema for this specific field (e.g., formSchema.shape.title)
    const fieldSchema = formSchema.shape[name];
    
    // Validate the value against the field's schema
    const result = fieldSchema.safeParse(value);
    
    if (!result.success) {
      // Validation failed - extract error message and update state
      const errorMessage = result.error.issues[0]?.message;
      setErrors((prev) => ({
        ...prev,
        [name]: errorMessage,
      }));
    } else {
      // Validation passed - remove error for this field
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }

  /**
   * Handles input change events
   * 
   * Updates the form value and performs real-time validation.
   * Only validates if the field has been touched (user has blurred it at least once).
   * This prevents showing errors while the user is still typing.
   * 
   * @param e - React change event from the input element
   */
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ): void {
    const { name, value } = e.target;
    const fieldName = name as keyof FormSchema;
    
    // Update the form value (controlled input)
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    /**
     * Real-time Validation Strategy:
     * Only validate if the field has been touched.
     * This means:
     * - User types in a field → no error shown yet
     * - User blurs the field → field is marked as touched, validation runs
     * - User continues typing → validation runs in real-time (errors clear when valid)
     */
    if (touched[fieldName]) {
      validateField(fieldName, value);
    }
  }

  /**
   * Handles input blur events (when field loses focus)
   * 
   * This is the trigger point for showing validation errors:
   * - Marks the field as "touched" (user has interacted with it)
   * - Runs validation immediately
   * - After this, handleChange will also validate on every keystroke
   * 
   * @param e - React focus event from the input element
   */
  function handleBlur(
    e: React.FocusEvent<HTMLInputElement>
  ): void {
    const { name, value } = e.target;
    const fieldName = name as keyof FormSchema;
    
    // Mark field as touched - this enables error display for this field
    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
    
    // Validate immediately when user leaves the field
    validateField(fieldName, value);
  }

  /**
   * Validates all form fields at once
   * 
   * Used when form is submitted to show errors for all fields,
   * even if they haven't been touched yet.
   */
  function validateAllFields(): boolean {
    const newErrors: FieldErrors = {};
    
    // Validate each field
    (Object.keys(formValues) as Array<keyof FormSchema>).forEach((fieldName) => {
      const value = formValues[fieldName];
      const fieldSchema = formSchema.shape[fieldName];
      const result = fieldSchema.safeParse(value);
      
      if (!result.success) {
        const errorMessage = result.error.issues[0]?.message;
        newErrors[fieldName] = errorMessage;
      }
    });
    
    // Update errors state with all validation results
    setErrors(newErrors);
    
    // Mark all fields as touched so errors will be displayed
    setTouched({
      title: true,
      email: true,
    });
    
    // Return true if validation passed (no errors), false otherwise
    return Object.keys(newErrors).length === 0;
  }

  /**
   * Handles form submission
   * 
   * Validates all fields before allowing form submission.
   * If validation fails, errors are shown for all fields and submission is prevented.
   * If validation passes, manually submits the form using React Router's submit function.
   * 
   * @param e - React form event
   */
  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    // Always prevent default to have full control over submission
    e.preventDefault();
    
    // Validate all fields first
    const isValid = validateAllFields();
    
    // If validation fails, show all errors and don't submit
    if (!isValid) {
      return;
    }
    
    // If validation passes, create FormData and submit using React Router's submit function
    const form = e.currentTarget;
    const formData = new FormData(form);
    submit(formData, { method: "post" });
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Create Product
            </h1>
            <p className="text-gray-600 text-sm">
              Fill in the details below to create a new Product
            </p>
          </div>

          {/* Success Message - Displayed for 2 seconds after successful form submission */}
          {showSuccessMessage && data?.success && data?.title && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-medium">
                ✓ Product "{data.title}" created successfully!
              </p>
            </div>
          )}

          {/* Form Element - Uses React Router's Form component for server-side handling */}
          <Form method="post" className="space-y-6" onSubmit={handleSubmit}>
            {/* Title Field */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
               Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formValues.title}
                onChange={handleChange}
                onBlur={handleBlur}
               // required
                placeholder="Enter product title"
                /**
                 * Dynamic className based on validation state:
                 * - Red border if field is touched and has errors
                 * - Gray border if field is valid or not yet touched
                 */
                className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors ${
                  touched.title && errors.title
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-300"
                }`}
                aria-label="product title"
                // Accessibility attributes for screen readers
                aria-invalid={touched.title && errors.title ? "true" : "false"}
                aria-describedby={touched.title && errors.title ? "title-error" : undefined}
              />
              {/* Client-side validation error - shown only if field is touched */}
              {touched.title && errors.title && (
                <p
                  id="title-error"
                  className="mt-1 text-sm text-red-600"
                  role="alert"
                >
                  {errors.title}
                </p>
              )}
              {/* Server-side validation error - shown if server returns errors */}
              {data?.errors?.title && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {data.errors.title[0]}
                </p>
              )}
            </div>
            
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
               Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formValues.email}
                onChange={handleChange}
                onBlur={handleBlur}
             //   required
                placeholder="Enter email address"
                /**
                 * Dynamic className based on validation state:
                 * - Red border if field is touched and has errors
                 * - Gray border if field is valid or not yet touched
                 */
                className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors ${
                  touched.email && errors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-300"
                }`}
                aria-label="Email address"
                // Accessibility attributes for screen readers
                aria-invalid={touched.email && errors.email ? "true" : "false"}
                aria-describedby={touched.email && errors.email ? "email-error" : undefined}
              />
              {/* Client-side validation error - shown only if field is touched */}
              {touched.email && errors.email && (
                <p
                  id="email-error"
                  className="mt-1 text-sm text-red-600"
                  role="alert"
                >
                  {errors.email}
                </p>
              )}
              {/* Server-side validation error - shown if server returns errors */}
              {data?.errors?.email && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {data.errors.email[0]}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                Create Product
              </button>
            </div>
          </Form>
        </div>
      </div>
    </AppLayout>
  );
}
