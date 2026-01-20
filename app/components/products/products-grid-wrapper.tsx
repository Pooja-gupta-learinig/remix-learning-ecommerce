type ProductsGridWrapperProps = {
	title?: string;
	children: React.ReactNode;
};

export function ProductsGridWrapper({
	title,
	children,
}: ProductsGridWrapperProps) {
	return (
		<div className="max-w-7xl mx-auto px-4 py-6">
			{title && <h1 className="text-2xl font-bold mb-4">{title}</h1>}
			<div
				className="grid gap-6 
          grid-cols-1 
          sm:grid-cols-2 
          md:grid-cols-3 
          lg:grid-cols-4"
			>
				{children}
			</div>
		</div>
	);
}

