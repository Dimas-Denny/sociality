import { Post } from "@/types/post";
import avatar from "@/assets/svg/avatar.svg";
import Image from "next/image";
import { useState } from "react";

export default function PostCard({ post }: { post: Post }) {
  const [showFull, setShowFull] = useState(false);
  const maxLength = 80;
  const isLong = post.caption.length > maxLength;

  return (
    <div className="w-full bg-neutral-950 border-b border-neutral-800">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <Image
          src={post.author.avatarUrl ?? avatar}
          alt="avatar"
          width={36}
          height={36}
          className="rounded-full object-cover"
        />
        <div>
          <p className="text-base-white text-sm font-semibold">
            {post.author.name}
          </p>
          <p className="text-neutral-500 text-xs">{post.createdAt}</p>
        </div>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="w-full aspect-4/3 relative">
          <Image src={post.imageUrl} alt="post" fill className="object-cover" />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-5 px-4 py-3">
        {/* Like */}
        <button
          className={`flex items-center gap-1.5 transition-colors ${post.likedByMe ? "text-rose-500" : "text-neutral-400 hover:text-rose-500"}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill={post.likedByMe ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
            />
          </svg>
          <span className="text-sm">{post.likeCount}</span>
        </button>

        {/* Comment */}
        <button className="flex items-center gap-1.5 text-neutral-400 hover:text-blue-400 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="text-sm">{post.commentCount}</span>
        </button>

        {/* Bookmark */}
        <button className="ml-auto text-neutral-400 hover:text-base-white transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>
      </div>

      {/* Caption */}
      <div className="px-4 pb-4">
        <p className="text-base-white text-sm font-semibold">
          {post.author.name}
        </p>
        <p className="text-neutral-300 text-sm mt-0.5">
          {isLong && !showFull
            ? post.caption.slice(0, maxLength) + "..."
            : post.caption}
          {isLong && (
            <button
              onClick={() => setShowFull(!showFull)}
              className="text-neutral-500 hover:text-neutral-300 text-sm ml-1 transition-colors"
            >
              {showFull ? "Show Less" : "Show More"}
            </button>
          )}
        </p>
      </div>
    </div>
  );
}
