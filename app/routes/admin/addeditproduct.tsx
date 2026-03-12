import { useForm, getFormProps, getInputProps, getTextareaProps, getSelectProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, useNavigation } from "react-router";
import { useEffect, useState, useRef } from "react";
import type { Route } from "./+types/addeditproduct";
import { Link } from "react-router";
import { productSchema, productEditSchema } from "~/lib/product.schema";
import { fetchProductById } from "~/lib/product-detail";
import type { Product } from "~/types/product.types";
import { adminLoader } from "~/lib/admin.server";

/**
 * Server-side Loader Function
 * 
 * Fetches product data if productId is provided (edit mode)
 */
export async function loader({ request, params }: Route.LoaderArgs) {
  // Protect route from direct access: admin only.
  // If not logged in → /login, if logged in as customer → /dashboard.
  await adminLoader(request);
  const { productId } = params;
  
  if (productId) {
    try {
      const product = await fetchProductById(productId);
      return { product };
    } catch (error) {
      throw new Response(null, {
        status: 404,
        statusText: "Product data not found",
      });
      
    }
  }
  
  return { product: null };
}

/**
 * Server-side Action Function
 * 
 * Handles form submission with server-side validation using Conform and Zod.
 * Supports both create (POST) and update (PUT) operations.
 * Returns validation errors or success response.
 */
export async function action({ request, params }: Route.ActionArgs) {
  await adminLoader(request);
  const formData = await request.formData();
  const { productId } = params;
  const isEditMode = !!productId;
  
  // Use edit schema if in edit mode (image is optional), otherwise use create schema
  const schema = isEditMode ? productEditSchema : productSchema;
  
  // Parse form data with Zod schema using Conform
  const submission = parseWithZod(formData, { schema });
  
  // If validation fails, return the submission with errors
  if (submission.status !== "success") {
    return submission.reply();
  }
  
  // Validation passed - extract validated data
  const { title, description, price, category, image } = submission.value;

  // Prepare request body
  const requestBody: Record<string, unknown> = {
    title,
    description,
    price,
    category,
  };

  // Only include image if it's provided (for edit mode, image is optional)
  if (image instanceof File) {
    // In a real app, you'd upload the file and get a URL
    // For now, we'll skip the image field in the API call for file uploads
    // requestBody.image = imageUrl;
  } else if (typeof image === "string" && image.length > 0) {
    requestBody.image = image;
  }

  // Determine API endpoint and method
  const url = isEditMode 
    ? `https://dummyjson.com/products/${productId}`
    : 'https://dummyjson.com/products/add';
  const method = isEditMode ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} product`);
    }
    
    const result = await response.json();
    console.log(`Product ${isEditMode ? 'updated' : 'created'}:`, result);
  } catch (error) {
    console.error(`Error ${isEditMode ? 'updating' : 'creating'} product:`, error);
    return submission.reply({
      formErrors: [`Failed to ${isEditMode ? 'update' : 'create'} product. Please try again.`],
    });
  }
  
  // Return success response using Conform's reply format
  return submission.reply({
    formErrors: [],
    fieldErrors: {},
  });
}

/**
 * Add/Edit Product Page Component
 * 
 * Uses Conform for form state management and real-time validation.
 * Displays validation errors inline with each field.
 * Supports both create and edit modes based on productId parameter.
 */
export default function AddEditProductPage({ actionData, loaderData, params }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const hasResetRef = useRef(false);
  
  const { productId } = params;
  const isEditMode = !!productId;
  const product = (loaderData as { product: Product | null } | undefined)?.product ?? null;
  
  // Use edit schema if in edit mode, otherwise use create schema
  const schema = isEditMode ? productEditSchema : productSchema;
  
  // Initialize Conform form with last submission (for error handling) and default values
  const [form, fields] = useForm({
    lastResult: actionData,
    defaultValue: product ? {
      title: product.title || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      category: product.category || "",
      // Note: image field cannot be pre-populated for file inputs
    } : undefined,
    onValidate({ formData }) {
      // Real-time validation on client side
      return parseWithZod(formData, { schema });
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

  // Reset form and show success message when product is created/updated successfully
  useEffect(() => {
    if (isSuccess && !hasResetRef.current) {
      // Mark as reset to prevent multiple resets
      hasResetRef.current = true;
      
      // Show success message
      setShowSuccess(true);
      
      // Only reset form if in create mode (not edit mode)
      if (!isEditMode) {
        // Manually reset file input first (file inputs can only be set to empty string)
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        
        // Reset the HTML form
        if (formRef.current) {
          formRef.current.reset();
        }
        
        // Reset Conform form state
        form.reset();
      }
      
      // Hide success message after 2 seconds
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 2000); // 2 seconds = 2000 milliseconds
      
      // Cleanup timer on unmount or when isSuccess changes
      return () => {
        clearTimeout(timer);
      };
    }
    
    // Reset the flag when actionData changes (new submission)
    if (!isSuccess) {
      hasResetRef.current = false;
    }
  }, [isSuccess, actionData, isEditMode, form]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditMode ? "Edit Product" : "Create Product"}
        </h1>
        <p className="text-gray-600 text-sm">
          {isEditMode 
            ? "Update the product details below"
            : "Fill in the details below to create a new product"}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">

          {/* Success Message - Shows for 2 seconds */}
          {showSuccess && isSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-medium">
                ✓ Product {isEditMode ? "updated" : "created"} successfully!
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
            {/* Title Field */}
            <div>
              <label
                htmlFor={fields.title.id}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title <span className="text-red-500">*</span>
              </label>
              <input
                {...getInputProps(fields.title, { type: "text" })}
                placeholder="Enter product title"
                className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors ${
                  fields.title.errors
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-300"
                }`}
              />
              {fields.title.errors && (
                <p className="mt-1 text-sm text-red-600" role="alert" id={fields.title.errorId}>
                  {fields.title.errors[0]}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div>
              <label
                htmlFor={fields.description.id}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                {...getTextareaProps(fields.description)}
                placeholder="Enter product description"
                rows={4}
                className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors ${
                  fields.description.errors
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-300"
                }`}
              />
              {fields.description.errors && (
                <p className="mt-1 text-sm text-red-600" role="alert" id={fields.description.errorId}>
                  {fields.description.errors[0]}
                </p>
              )}
            </div>

            {/* Price Field */}
            <div>
              <label
                htmlFor={fields.price.id}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Price <span className="text-red-500">*</span>
              </label>
              <input
                {...getInputProps(fields.price, { type: "number", step: "0.01" })}
                placeholder="Enter product price"
                className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors ${
                  fields.price.errors
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-300"
                }`}
              />
              {fields.price.errors && (
                <p className="mt-1 text-sm text-red-600" role="alert" id={fields.price.errorId}>
                  {fields.price.errors[0]}
                </p>
              )}
            </div>

            {/* Image Field */}
            <div>
              <label
                htmlFor={fields.image.id}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Image {!isEditMode && <span className="text-red-500">*</span>}
                {isEditMode && <span className="text-gray-500 text-xs ml-2">(Optional - leave empty to keep current image)</span>}
              </label>
              {isEditMode && product?.thumbnail && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600 mb-1">Current image:</p>
                  <img 
                    src={product.thumbnail} 
                    alt={product.title}
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                </div>
              )}
              <input
                id={fields.image.id}
                name={fields.image.name}
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors ${
                  fields.image.errors
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-300"
                }`}
              />
              {fields.image.errors && (
                <p className="mt-1 text-sm text-red-600" role="alert" id={fields.image.errorId}>
                  {fields.image.errors[0]}
                </p>
              )}
            </div>

            {/* Category Field */}
            <div>
              <label
                htmlFor={fields.category.id}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category <span className="text-red-500">*</span>
              </label>
              <select
                {...getSelectProps(fields.category)}
                className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition-colors ${
                  fields.category.errors
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-300"
                }`}
              >
                <option value="">Select a category</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="books">Books</option>
                <option value="home">Home & Garden</option>
                <option value="sports">Sports</option>
                <option value="toys">Toys</option>
              </select>
              {fields.category.errors && (
                <p className="mt-1 text-sm text-red-600" role="alert" id={fields.category.errorId}>
                  {fields.category.errors[0]}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (isEditMode ? "Updating..." : "Creating...") 
                : (isEditMode ? "Update Product" : "Create Product")}
            </button>
          </Form>
      </div>
    </div>
  );
}
