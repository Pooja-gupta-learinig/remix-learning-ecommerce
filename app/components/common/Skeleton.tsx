/**
 * Skeleton loader components for better loading UX
 */

export function ProductSkeleton() {
	return (
		<div className="group rounded-xl border bg-white shadow-sm animate-pulse overflow-hidden">
			{/* Image skeleton with discount badge */}
			<div className="relative">
				<div className="h-48 w-full bg-gray-200" />
				{/* Discount badge skeleton */}
				<div className="absolute top-2 left-2 h-6 w-12 bg-gray-300 rounded-md" />
			</div>

			{/* Content skeleton */}
			<div className="p-4 space-y-2">
				{/* Title */}
				<div className="h-6 bg-gray-200 rounded w-3/4" />
				
				{/* Description */}
				<div className="space-y-1">
					<div className="h-4 bg-gray-200 rounded w-full" />
					<div className="h-4 bg-gray-200 rounded w-5/6" />
				</div>

				{/* Rating section */}
				<div className="flex items-center gap-1">
					<div className="h-4 w-4 bg-gray-200 rounded" />
					<div className="h-4 bg-gray-200 rounded w-8" />
					<div className="h-4 bg-gray-200 rounded w-20" />
				</div>

				{/* Price section */}
				<div className="flex items-center gap-2">
					<div className="h-6 bg-gray-200 rounded w-16" />
					<div className="h-4 bg-gray-200 rounded w-12" />
				</div>

				{/* Availability status */}
				<div className="h-4 bg-gray-200 rounded w-20" />
			</div>

			{/* Action button skeleton */}
			<div className="p-4">
				<div className="h-10 bg-gray-200 rounded-lg w-full" />
			</div>
		</div>
	);
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
	return (
		<div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{Array.from({ length: count }).map((_, i) => (
				<ProductSkeleton key={i} />
			))}
		</div>
	);
}

export function ProductDetailSkeleton() {
	return (
		<div className="animate-pulse">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Image skeleton */}
				<div className="space-y-4">
					<div className="h-96 bg-gray-200 rounded-lg" />
					<div className="grid grid-cols-4 gap-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<div key={i} className="h-20 bg-gray-200 rounded" />
						))}
					</div>
				</div>

				{/* Info skeleton */}
				<div className="space-y-4">
					
					<div className="h-8 bg-gray-200 rounded w-3/4" />
					<div className="h-4 bg-gray-200 rounded w-1/2" />
					<div className="h-6 bg-gray-200 rounded w-1/4" />
					<div className="space-y-2">
						<div className="h-4 bg-gray-200 rounded w-full" />
						<div className="h-4 bg-gray-200 rounded w-full" />
						<div className="h-4 bg-gray-200 rounded w-2/3" />
					</div>
					<div className="h-12 bg-gray-200 rounded w-full" />
				</div>
			</div>
		</div>
	);
}

export function CartItemSkeleton() {
	return (
		<div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm animate-pulse">
			<div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
				<div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-lg shrink-0" />
				<div className="flex-1 space-y-3">
					<div className="h-5 bg-gray-200 rounded w-3/4" />
					<div className="h-4 bg-gray-200 rounded w-full" />
					<div className="h-4 bg-gray-200 rounded w-2/3" />
					<div className="h-6 bg-gray-200 rounded w-1/4" />
					<div className="h-8 bg-gray-200 rounded w-32" />
				</div>
				<div className="h-8 bg-gray-200 rounded w-20" />
			</div>
		</div>
	);
}

export function DashboardStatsSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8 animate-pulse">
			{Array.from({ length: 3 }).map((_, i) => (
				<div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center justify-between">
						<div className="flex-1 space-y-2">
							<div className="h-4 bg-gray-200 rounded w-1/2" />
							<div className="h-8 bg-gray-200 rounded w-1/3" />
						</div>
						<div className="w-12 h-12 bg-gray-200 rounded-lg" />
					</div>
				</div>
			))}
		</div>
	);
}

export function OrdersListSkeleton() {
	return (
		<div className="space-y-4 animate-pulse">
			{Array.from({ length: 3 }).map((_, i) => (
				<div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
					<div className="flex items-center justify-between">
						<div className="flex-1 space-y-2">
							<div className="h-4 bg-gray-200 rounded w-1/4" />
							<div className="h-4 bg-gray-200 rounded w-1/3" />
							<div className="h-4 bg-gray-200 rounded w-1/5" />
						</div>
						<div className="space-y-2">
							<div className="h-6 bg-gray-200 rounded w-20" />
							<div className="h-4 bg-gray-200 rounded w-24" />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

