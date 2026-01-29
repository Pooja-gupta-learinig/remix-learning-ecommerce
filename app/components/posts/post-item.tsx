import type { Post } from "~/types/post.types";

type PostItemProps = {
  post: Post;
};

export default function PostItem({ post }: PostItemProps) {
  return (
    <div className="group rounded-xl border bg-white shadow-sm hover:shadow-lg transition overflow-hidden">
      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition">
          {post.title}
        </h3>

        {/* Body */}
        <p className="text-sm text-gray-600 line-clamp-4 leading-relaxed">
          {post.body}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>User ID: {post.userId}</span>
          </div>

          {/* Reactions */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-red-500">❤️</span>
              <span className="font-medium text-gray-700">{post.reactions.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">👎</span>
              <span className="font-medium text-gray-700">{post.reactions.dislikes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

