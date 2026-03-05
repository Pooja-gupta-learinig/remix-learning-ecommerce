import { Link, useFetcher, useRouteLoaderData, useRevalidator } from "react-router";
import type { Product } from "~/types/product.types";
import type { Cart } from "~/lib/cart-session.server";
import { useEffect } from "react";

export default function ProductItem({ product }: { product: Product }) {
	const fetcher = useFetcher();
	const revalidator = useRevalidator();
	const rootData = useRouteLoaderData("root") as { cart?: Cart } | undefined;
	const cart = rootData?.cart ?? { items: [], totalItems: 0, totalPrice: 0 };

	const cartItem = cart.items.find((item) => item.productId === product.id);
	const isInCart = !!cartItem;
	const currentQuantity = cartItem?.quantity ?? 0;

	useEffect(() => {
		if (fetcher.data?.success) {
			revalidator.revalidate();
		}
	}, [fetcher.data, revalidator]);
  const discountedPrice = (
    product.price -
    (product.price * product.discountPercentage) / 100
  ).toFixed(2);

  const productSlug = product.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const categorySlug = product.category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  

  return (
    
    <div className="group rounded-xl border bg-white shadow-sm hover:shadow-lg transition overflow-hidden">
    <Link
      to={`/products/${productSlug}/${product.id}/category/${categorySlug}`}
      prefetch="intent"
    >
      {/* Image */}
      <div className="relative">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="h-48 w-full object-cover"
        />

        {/* Discount Badge */}
        <span className="absolute top-2 left-2 rounded-md bg-red-500 px-2 py-1 text-xs font-semibold text-white">
          -{product.discountPercentage.toFixed(0)}%
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
          {product.title}
        </h3>

        <p className="text-sm text-gray-500 line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 text-sm">
          <span className="text-yellow-500">★</span>
          <span className="font-medium">{product.rating}</span>
          <span className="text-gray-400">({product.stock} in stock)</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-green-600">
            ${discountedPrice}
          </span>
          <span className="text-sm line-through text-gray-400">
            ${product.price}
          </span>
        </div>

        {/* Availability */}
        <p
          className={`text-sm font-medium ${
            product.availabilityStatus === "In Stock"
              ? "text-green-600"
              : "text-red-500"
          }`}
        >
          {product.availabilityStatus}
        </p>
  
      </div>
</Link>
      <div className="p-4">
        {/* Action */}
        {isInCart ? (
          <div className="flex items-center gap-2">
            <fetcher.Form method="post" action="/cart/actions" className="flex items-center gap-2 flex-1">
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
                className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                -
              </button>
              <span className="text-sm font-semibold min-w-8 text-center">
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
                className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                +
              </button>
            </fetcher.Form>
            <fetcher.Form method="post" action="/cart/actions" className="flex-1">
              <input type="hidden" name="action" value="remove" />
              <input type="hidden" name="productId" value={product.id} />
              <button
                type="submit"
                disabled={fetcher.state !== "idle"}
                className="w-full rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {fetcher.state !== "idle" ? "Removing..." : "Remove"}
              </button>
            </fetcher.Form>
          </div>
        ) : (
          <fetcher.Form method="post" action="/cart/actions">
            <input type="hidden" name="action" value="add" />
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="quantity" value="1" />
            <button
              type="submit"
              disabled={product.stock === 0 || fetcher.state !== "idle"}
              className="mt-2 w-full rounded-lg bg-black py-2 text-sm font-semibold text-white hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {fetcher.state !== "idle" ? "Adding..." : "Add to Cart"}
            </button>
          </fetcher.Form>
        )}
      </div>
    </div>
    
  );
}
