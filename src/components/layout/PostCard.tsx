"use client";

import { useState } from "react";
import Image from "next/image";
import api from "@/lib/api/axios";
import axios from "axios";
import likeIcon from "@/assets/svg/like.svg";
import likedIcon from "@/assets/svg/liked.svg";
import commentIcon from "@/assets/svg/comment.svg";
import shareIcon from "@/assets/svg/share.svg";
import savedIcon from "@/assets/svg/saved.svg";
import savedActiveIcon from "@/assets/svg/saved2.svg";
import LikesModal from "@/components/layout/LikesModal";
import CommentsModal from "@/components/layout/CommentsModal";
import { Post } from "@/types/post";
import { timeAgo } from "@/lib/timeAgo";
import { useRouter } from "next/navigation";

function AuthorAvatar({
  avatarUrl,
  name,
}: {
  avatarUrl: string | null;
  name: string;
}) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt="avatar"
        width={36}
        height={36}
        className="rounded-full object-cover shrink-0"
        style={{ width: 36, height: 36 }}
      />
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-neutral-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
      {name?.charAt(0).toUpperCase() ?? "?"}
    </div>
  );
}

export default function PostCard({ post }: { post: Post }) {
  const [showFull, setShowFull] = useState(false);
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [likeAnim, setLikeAnim] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [commentCount] = useState(post.commentCount);
  const [saved, setSaved] = useState(post.savedByMe ?? false);
  const [saveAnim, setSaveAnim] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const maxLength = 80;
  const isLong = post.caption.length > maxLength;

  const handleLike = async () => {
    try {
      if (liked) {
        await api.delete(`/posts/${post.id}/like`);
        setLiked(false);
        setLikeCount((prev) => prev - 1);
      } else {
        await api.post(`/posts/${post.id}/like`, {});
        setLiked(true);
        setLikeCount((prev) => prev + 1);
        setLikeAnim(true);
        setTimeout(() => setLikeAnim(false), 400);
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("input");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    try {
      if (saved) {
        await api.delete(`/posts/${post.id}/save`);
        setSaved(false);
      } else {
        await api.post(`/posts/${post.id}/save`, {});
        setSaved(true);
        setSaveAnim(true);
        setTimeout(() => setSaveAnim(false), 400);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Save error:",
          error.response?.status,
          error.response?.data,
        );
      }
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
          {/* Avatar bisa diklik juga */}
          <button onClick={() => router.push(`/users/${post.author.username}`)}>
            <AuthorAvatar
              avatarUrl={post.author.avatarUrl ?? null}
              name={post.author.name}
            />
          </button>
          <div>
            {/* Nama diklik → ke profile */}
            <button
              onClick={() => router.push(`/users/${post.author.username}`)}
              className="text-white text-sm font-semibold hover:underline"
            >
              {post.author.name}
            </button>
            <p className="text-neutral-500 text-xs">
              {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Image */}
        {post.imageUrl && (
          <div
            className="w-full aspect-video relative"
            onClick={() => router.push(`/posts/${post.id}`)}
          >
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
          <div className="relative flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <Image src={shareIcon} alt="share" width={22} height={22} />
            </button>
            <span className="text-neutral-400 text-sm">
              {post.shareCount ?? 0}
            </span>
            {copied && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                Link copied!
              </span>
            )}
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className={`ml-auto transition-transform ${saveAnim ? "scale-125" : "scale-100"} duration-200 ${
              saved ? "opacity-100" : "text-neutral-400 hover:text-white"
            }`}
          >
            <Image
              src={saved ? savedActiveIcon : savedIcon}
              alt="saved"
              width={22}
              height={22}
              className={saved ? "brightness-200" : ""}
            />
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
