import { Form, useNavigation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import type { Route } from "./+types/deleteproduct.$productId";
import { AppLayout } from "~/layouts/AppLayouts";
import { fetchProductById } from "~/lib/product-detail";
import type { Product } from "~/types/product.types";
import { Link } from "react-router";

/**
 * Server-side Loader Function
 * 
 * Fetches product data to display what will be deleted
 */
export async function loader({ params }: Route.LoaderArgs) {
  const { productId } = params;
  
  if (!productId) {
    throw new Response(null, {
      status: 400,
      statusText: "Product ID is required",
    });
  }

  try {
    const product = await fetchProductById(productId);
    return { product };
  } catch (error) {
    throw new Response(null, {
      status: 404,
      statusText: "Product not found",
    });
  }
}

/**
 * Server-side Action Function
 * 
 * Handles product deletion via DELETE method.
 * Calls the DummyJSON API to delete the product.
 * Returns success status or error.
 */
export async function action({ request, params }: Route.ActionArgs) {
  const { productId } = params;
  
  if (!productId) {
    return { error: "Product ID is required", success: false };
  }

  if (request.method === "DELETE") {
    try {
      const response = await fetch(`https://dummyjson.com/products/${productId}`, {
        method: "DELETE",
      });

    

      if (!response.ok) {
        return { error: "Failed to delete product", success: false };
      }

      // Return success status
      return { success: true, message: "Product deleted successfully" };
    } catch (error) {
      console.error("Error deleting product:", error);
      return { error: "An error occurred while deleting the product", success: false };
    }
  }

  return { error: "Invalid request method", success: false };
}

/**
 * Delete Product Page Component
 * 
 * Displays product information and confirmation form.
 * Shows success message after successful deletion.
 */
export default function DeleteProductPage({ loaderData, actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const isSubmitting = navigation.state === "submitting";
  const [showSuccess, setShowSuccess] = useState(false);
  
  const product = (loaderData as { product: Product } | undefined)?.product;
  const actionResult = actionData as { success?: boolean; error?: string; message?: string } | undefined;

  // Generate product detail URL
  const productDetailUrl = product
    ? (() => {
        const productSlug = product.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        const categorySlug = product.category
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        return `/products/${productSlug}/${product.id}/category/${categorySlug}`;
      })()
    : null;
  
  // Show success message when deletion is successful
  useEffect(() => {
    if (actionResult?.success) {
      setShowSuccess(true);
      // Redirect to products page after 2 seconds
      const timer = setTimeout(() => {
        navigate("/products");
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [actionResult?.success, navigate]);

  // If product is not found, show error
  if (!product) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <Link
              to="/products"
              className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
          {/* Success Message */}
          {showSuccess && actionResult?.success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-800 text-sm font-medium">
                  {actionResult.message || "Product deleted successfully!"}
                </p>
              </div>
              <p className="text-green-700 text-xs mt-2">Redirecting to products page...</p>
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

          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Delete Product
            </h1>
            <p className="text-gray-600 text-sm">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
          </div>

          {/* Product Information */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex gap-6">
              {product.thumbnail && (
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                />
              )}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {product.title}
                </h2>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-700">
                    <span className="font-medium">Price:</span> ${product.price}
                  </span>
                  {product.category && (
                    <span className="text-gray-700">
                      <span className="font-medium">Category:</span> {product.category}
                    </span>
                  )}
                </div>
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
                    Delete Product
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (productDetailUrl) {
                    navigate(productDetailUrl);
                  } else {
                    navigate(-1);
                  }
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </Form>
        </div>
      </div>
    </AppLayout>
  );
}

