import type { Route } from "./+types/admin.products";
import { useLoaderData, Link } from "react-router";
import { adminLoader } from "~/lib/admin.server";
import { fetchProducts } from "~/lib/products";
import { Package, Plus, Edit, Trash2 } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
	await adminLoader(request);
	const productsData = await fetchProducts({});
	return { products: productsData.products };
}

export default function AdminProducts() {
	const { products } = useLoaderData<typeof loader>();

	return (
		<div className="max-w-7xl mx-auto">
			{/* Header */}
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
					<p className="mt-2 text-sm text-gray-600">
						Manage your product catalog
					</p>
				</div>
				<Link
					to="/admin/products/addeditproduct"
					className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
				>
					<Plus className="w-5 h-5" />
					Add Product
				</Link>
			</div>

			{/* Products Table */}
			{products.length === 0 ? (
				<div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
					<Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<p className="text-gray-500 mb-4">No products found.</p>
					<Link
						to="/admin/addeditproduct"
						className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
					>
						<Plus className="w-5 h-5" />
						Add Your First Product
					</Link>
				</div>
			) : (
				<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Product
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Category
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Price
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Stock
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Rating
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{products.map((product) => (
									<tr key={product.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center gap-3">
												<img
													src={product.thumbnail}
													alt={product.title}
													className="w-12 h-12 rounded-lg object-cover"
												/>
												<div>
													<div className="text-sm font-medium text-gray-900">
														{product.title}
													</div>
													<div className="text-sm text-gray-500">
														ID: {product.id}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
												{product.category}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												${product.price.toFixed(2)}
											</div>
											{product.discountPercentage > 0 && (
												<div className="text-xs text-green-600">
													{product.discountPercentage}% off
												</div>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{product.stock} units
											</div>
											{product.stock < 10 && (
												<div className="text-xs text-red-600">Low stock</div>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center gap-1">
												<span className="text-sm font-medium text-gray-900">
													{product.rating}
												</span>
												<span className="text-yellow-400">★</span>
												<span className="text-xs text-gray-500">
													({product.reviews?.length || 0})
												</span>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<div className="flex items-center gap-2">
												<Link
													to={`/admin/products/addeditproduct/${product.id}`}
													className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
													title="Edit product"
												>
													<Edit className="w-4 h-4" />
												</Link>
												<Link
													to={`/admin/products/deleteproduct/${product.id}`}
													className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
													title="Delete product"
												>
													<Trash2 className="w-4 h-4" />
												</Link>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
}

