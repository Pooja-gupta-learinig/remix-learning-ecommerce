import { useFetcher, useRouteLoaderData, useRevalidator, Link } from "react-router";
import type { ProductComponentProps } from "~/types/product-component-props.types";
import type { Cart } from "~/lib/cart-session.server";
import { useEffect, useState } from "react";

export default function ProductInfo({ product }: ProductComponentProps) {
	const fetcher = useFetcher();
	const revalidator = useRevalidator();
	const rootData = useRouteLoaderData("root") as { cart?: Cart } | undefined;
	const cart = rootData?.cart ?? { items: [] };
	const [quantity, setQuantity] = useState(1);

	const cartItem = cart.items.find((item) => item.productId === product.id);
	const isInCart = !!cartItem;
	const currentQuantity = cartItem?.quantity ?? 0;

	useEffect(() => {
		if (fetcher.data?.success) {
			setQuantity(1);
			revalidator.revalidate();
		}
	}, [fetcher.data, revalidator]);

	const discountedPrice = product.price - (product.price * product.discountPercentage) / 100;
  const originalPrice = product.discountPercentage > 0
    ? (product.price / (1 - product.discountPercentage / 100)).toFixed(2)
    : null;

  const stockStatus = product.stock > 0
    ? product.stock > 10
      ? { text: "In Stock", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" }
      : { text: `Only ${product.stock} left`, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" }
    : { text: "Out of Stock", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };

  return (
    <div className="flex flex-col space-y-6">
      {/* Brand & Category */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
          {product.brand}
        </span>
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
          {product.category}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
        {product.title}
      </h1>

      {/* Rating & Reviews */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(product.rating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-lg font-semibold text-gray-900">
            {product.rating}
          </span>
        </div>
        {product.reviews && product.reviews.length > 0 && (
          <span className="text-gray-500">
            ({product.reviews.length} {product.reviews.length === 1 ? "review" : "reviews"})
          </span>
        )}
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-bold text-gray-900">
          ${product.price.toFixed(2)}
        </span>
        {originalPrice && (
          <span className="text-xl text-gray-400 line-through">
            ${originalPrice}
          </span>
        )}
      </div>

      {/* Stock Status */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${stockStatus.bg} ${stockStatus.border} w-fit`}>
        <div className={`w-2 h-2 rounded-full ${stockStatus.color.replace("text-", "bg-")}`} />
        <span className={`text-sm font-medium ${stockStatus.color}`}>
          {stockStatus.text}
        </span>
      </div>

      {/* Description */}
      <div className="pt-2">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
        <p className="text-gray-600 leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Availability Status */}
      {product.availabilityStatus && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Availability:</span>
          <span className="font-medium text-gray-900">{product.availabilityStatus}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-4">
        {isInCart ? (
          <div className="flex flex-col gap-3">
            <fetcher.Form method="post" action="/cart/actions" className="flex items-center gap-2">
              <input type="hidden" name="action" value="update" />
              <input type="hidden" name="productId" value={product.id} />
              <button
                type="button"
                onClick={() => {
                  if (currentQuantity > 1) {
                    fetcher.submit(
                      {
                        action: "update",
                        productId: String(product.id),
                        quantity: String(currentQuantity - 1),
                      },
                      { method: "post", action: "/cart/actions" }
                    );
                  }
                }}
                disabled={currentQuantity <= 1 || fetcher.state !== "idle"}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="text-lg font-semibold min-w-12 text-center">
                {currentQuantity}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (currentQuantity < product.stock) {
                    fetcher.submit(
                      {
                        action: "update",
                        productId: String(product.id),
                        quantity: String(currentQuantity + 1),
                      },
                      { method: "post", action: "/cart/actions" }
                    );
                  }
                }}
                disabled={currentQuantity >= product.stock || fetcher.state !== "idle"}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </fetcher.Form>
            <div className="flex gap-3">
              <fetcher.Form method="post" action="/cart/actions" className="flex-1">
                <input type="hidden" name="action" value="remove" />
                <input type="hidden" name="productId" value={product.id} />
                <button
                  type="submit"
                  disabled={fetcher.state !== "idle"}
                  className="w-full bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {fetcher.state !== "idle" ? "Removing..." : "Remove from Cart"}
                </button>
              </fetcher.Form>
              <Link
                to="/cart"
                className="flex-1 bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200 text-center"
              >
                Go to Cart
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <fetcher.Form method="post" action="/cart/actions" className="flex-1">
              <input type="hidden" name="action" value="add" />
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="quantity" value={quantity} />
              <button
                type="submit"
                disabled={product.stock === 0 || fetcher.state !== "idle"}
                className="w-full bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {fetcher.state !== "idle" ? "Adding..." : "Add to Cart"}
              </button>
            </fetcher.Form>
          </div>
        )}
      </div>

      {/* Trust Badges */}
      <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Free Shipping</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Easy Returns</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Secure Payment</span>
        </div>
      </div>
    </div>
  );
}
  