import { Link } from "react-router";
import type { Product } from "~/types/product.types";

export default function ProductItem({ product }: { product: Product }) {
  const discountedPrice = (
    product.price -
    (product.price * product.discountPercentage) / 100
  ).toFixed(2);

  return (
    
    <div className="group rounded-xl border bg-white shadow-sm hover:shadow-lg transition overflow-hidden">
    <Link
      to={`/products/${product.id}`}
      className="block border rounded-lg shadow-sm hover:shadow-md transition bg-white"
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
</Link>
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

        {/* Action */}
        <button className="mt-2 w-full rounded-lg bg-black py-2 text-sm font-semibold text-white hover:bg-gray-800 transition">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
