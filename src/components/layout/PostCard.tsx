"use client";

import { useState } from "react";
import Image from "next/image";
import axios from "axios";
import avatar from "@/assets/svg/avatar.svg";
import likeIcon from "@/assets/svg/like.svg";
import likedIcon from "@/assets/svg/liked.svg";
import commentIcon from "@/assets/svg/comment.svg";
import shareIcon from "@/assets/svg/share.svg";
import savedIcon from "@/assets/svg/saved.svg";
import LikesModal from "@/components/layout/LikesModal";
import CommentsModal from "@/components/layout/CommentsModal";
import { Post } from "@/types/post";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://be-social-media-api-production.up.railway.app";

export default function PostCard({ post }: { post: Post }) {
  const [showFull, setShowFull] = useState(false);
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [likeAnim, setLikeAnim] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [commentCount] = useState(post.commentCount);

  const maxLength = 80;
  const isLong = post.caption.length > maxLength;

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      if (liked) {
        await axios.delete(`${API_BASE}/api/posts/${post.id}/like`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLiked(false);
        setLikeCount((prev) => prev - 1);
      } else {
        await axios.post(
          `${API_BASE}/api/posts/${post.id}/like`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setLiked(true);
        setLikeCount((prev) => prev + 1);
        setLikeAnim(true);
        setTimeout(() => setLikeAnim(false), 400);
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  return (
    <>
      {showLikesModal && (
        <LikesModal
          postId={post.id}
          postImageUrl={post.imageUrl ?? undefined}
          onClose={() => setShowLikesModal(false)}
        />
      )}

      {showCommentsModal && (
        <CommentsModal
          postId={post.id}
          postImageUrl={post.imageUrl ?? undefined}
          onClose={() => setShowCommentsModal(false)}
        />
      )}

      <div className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
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
            <p className="text-white text-sm font-semibold">
              {post.author.name}
            </p>
            <p className="text-neutral-500 text-xs">{post.createdAt}</p>
          </div>
        </div>

        {/* Image */}
        {post.imageUrl && (
          <div className="w-full aspect-video relative">
            <Image
              src={post.imageUrl}
              alt="post"
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-5 px-4 py-3">
          {/* Like */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleLike}
              className={`transition-transform ${likeAnim ? "scale-125" : "scale-100"} duration-200`}
            >
              <Image
                src={liked ? likedIcon : likeIcon}
                alt="like"
                width={22}
                height={22}
              />
            </button>
            <button
              onClick={() => setShowLikesModal(true)}
              className="text-neutral-400 hover:text-white text-sm transition-colors"
            >
              {likeCount}
            </button>
          </div>

          {/* Comment */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowCommentsModal(true)}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <Image src={commentIcon} alt="comment" width={22} height={22} />
            </button>
            <button
              onClick={() => setShowCommentsModal(true)}
              className="text-neutral-400 hover:text-white text-sm transition-colors"
            >
              {commentCount}
            </button>
          </div>

          {/* Share */}
          <div className="flex items-center gap-1.5">
            <button className="text-neutral-400 hover:text-white transition-colors">
              <Image src={shareIcon} alt="share" width={22} height={22} />
            </button>
            <span className="text-neutral-400 text-sm">
              {post.shareCount ?? 0}
            </span>
          </div>

          {/* Saved */}
          <button className="ml-auto text-neutral-400 hover:text-white transition-colors">
            <Image src={savedIcon} alt="saved" width={22} height={22} />
          </button>
        </div>

        {/* Caption */}
        <div className="px-4 pb-4">
          <p className="text-white text-sm font-semibold">{post.author.name}</p>
          <p className="text-neutral-300 text-sm mt-0.5">
            {isLong && !showFull
              ? post.caption.slice(0, maxLength) + "..."
              : post.caption}
            {isLong && (
              <button
                onClick={() => setShowFull(!showFull)}
                className="text-violet-400 hover:text-violet-300 text-sm ml-1 transition-colors"
              >
                {showFull ? "Show Less" : "Show More"}
              </button>
            )}
          </p>
        </div>
      </div>
    </>
  );
}
