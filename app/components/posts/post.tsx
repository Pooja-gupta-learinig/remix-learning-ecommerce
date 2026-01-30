import { useLoaderData } from "react-router";
import type { loader } from "~/routes/posts.($lang).tsx";
import PostItem from "~/components/posts/post-item";
import { PostsListWrapper } from "~/components/posts/posts-list-wrapper";
import type { Post } from "~/types/post.types";

export default function Post() {
  const { postsData } = useLoaderData<typeof loader>();

  return (
    <PostsListWrapper>
      {/* Render postsData items using PostItem */}
      {postsData.posts.map((post: Post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </PostsListWrapper>
  );
}