"use client";

import { useQuery } from "@tanstack/react-query";
import { getPostsApi } from "@/lib/api/post";
import PostCard from "@/components/layout/PostCard";
import { Post } from "@/types/post";

export default function FeedPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["posts"],
    queryFn: getPostsApi,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-neutral-500 text-sm">Loading posts...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-accent-red text-sm">Failed to load posts.</p>
      </div>
    );
  }

  const posts: Post[] = data?.data?.posts ?? [];

  return (
    <div className="max-w-xl mx-auto">
      {posts.length === 0 ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <p className="text-neutral-500 text-sm">No posts yet.</p>
        </div>
      ) : (
        posts.map((post: Post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}
