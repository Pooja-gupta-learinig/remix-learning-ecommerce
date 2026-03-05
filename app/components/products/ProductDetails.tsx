import { useState } from "react";
import { Link, useRouteLoaderData } from "react-router";
import ProductInfo from "./ProductInfo";
import ProductReviews from "./ProductReviews";
import ProductMeta from "./ProductMeta";
import type { ProductComponentProps } from "~/types/product-component-props.types";
//import type { ClientLoaderFunctionArgs } from "react-router";
import type { UserSession } from "~/sessions.server";



// export async function clientLoader({
//   serverLoader,
// }: ClientLoaderFunctionArgs) {
//   console.log("⚡ CLIENT loader running");

//   // reuse server data if needed
//   const serverData = (await serverLoader()) as Record<string, unknown>;

//   return {
//     ...serverData,
//     source: "client",
//     timestamp: Date.now(),
//   };
// }

export default function ProductDetails({ product }: ProductComponentProps) {
  const rootData = useRouteLoaderData("root") as { user?: UserSession | null } | undefined;
const user = rootData?.user ?? null;

  const [selectedImage, setSelectedImage] = useState(product.thumbnail);
  const images = product.images && product.images.length > 0 
    ? [product.thumbnail, ...product.images] 
    : [product.thumbnail];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Edit and Delete Buttons */}
        {user?.role === "admin" && (
          <>
        <div className="flex justify-end gap-3 p-6 border-b border-gray-100">
          <Link
            to={`/admin/addeditproduct/${product.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
          <Link
            to={`/admin/deleteproduct/${product.id}`}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </Link>
        </div>
        </>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-6 lg:p-10">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-200 group">
              <img
                src={selectedImage}
                alt={product.title}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
              {product.discountPercentage > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                  -{product.discountPercentage}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === image
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Main Info */}
          <ProductInfo product={product} />
        </div>

        {/* Meta Information */}
        <div className="border-t border-gray-100 bg-gray-50/50">
          <ProductMeta product={product} />
        </div>

        {/* Reviews Section */}
        <div className="border-t border-gray-100 p-6 lg:p-10">
          <ProductReviews reviews={product.reviews} />
        </div>
      </div>
    </div>
  );
}
