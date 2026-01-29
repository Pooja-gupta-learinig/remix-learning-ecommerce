type PostsListWrapperProps = {
	title?: string;
	children: React.ReactNode;
};

export function PostsListWrapper({
	title,
	children,
}: PostsListWrapperProps) {
	return (
		<div className="max-w-7xl mx-auto px-4 py-6">
			{title && <h1 className="text-2xl font-bold mb-4">{title}</h1>}
			<div className="flex flex-col gap-6">
				{children}
			</div>
		</div>
	);
}

