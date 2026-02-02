import { useState } from "react";
import ProductInfo from "./ProductInfo";
import ProductReviews from "./ProductReviews";
import ProductMeta from "./ProductMeta";
import type { ProductComponentProps } from "~/types/product-component-props.types";
import type { ClientLoaderFunctionArgs } from "react-router";

export async function clientLoader({
  serverLoader,
}: ClientLoaderFunctionArgs) {
  console.log("⚡ CLIENT loader running");

  // reuse server data if needed
  const serverData = await serverLoader();

  return {
    ...serverData,
    source: "client",
    timestamp: Date.now(),
  };
}

export default function ProductDetails({ product }: ProductComponentProps) {
  const [selectedImage, setSelectedImage] = useState(product.thumbnail);
  const images = product.images && product.images.length > 0 
    ? [product.thumbnail, ...product.images] 
    : [product.thumbnail];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
