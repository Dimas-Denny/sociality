"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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

const usePersistedSaveState = (
  postId: string | number,
  initialSaved: boolean,
) => {
  const storageKey = postId.toString();

  const [saved, setSaved] = useState<boolean>(() => {
    if (typeof window === "undefined") return initialSaved;

    try {
      const savedPosts = JSON.parse(localStorage.getItem("savedPosts") || "{}");
      return savedPosts[storageKey] ?? initialSaved;
    } catch {
      return initialSaved;
    }
  });

  const updateSaved = (newSaved: boolean) => {
    setSaved(newSaved);

    if (typeof window !== "undefined") {
      try {
        const savedPosts = JSON.parse(
          localStorage.getItem("savedPosts") || "{}",
        );
        savedPosts[storageKey] = newSaved;
        localStorage.setItem("savedPosts", JSON.stringify(savedPosts));
      } catch {
        // ignore error
      }
    }
  };

  return [saved, updateSaved] as const;
};

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
        alt={name}
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
  const router = useRouter();

  const [showFull, setShowFull] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  const [likeAnim, setLikeAnim] = useState(false);
  const [saveAnim, setSaveAnim] = useState(false);
  const [copied, setCopied] = useState(false);

  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
  const [optimisticLikeCount, setOptimisticLikeCount] = useState<number | null>(
    null,
  );

  const [saved, setSaved] = usePersistedSaveState(
    post.id,
    post.savedByMe ?? false,
  );

  const [currentUsername] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;

    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;

      const user = JSON.parse(raw);
      return user.username ?? null;
    } catch {
      return null;
    }
  });

  const isMyPost = currentUsername === post.author.username;

  const liked = optimisticLiked ?? post.likedByMe ?? false;
  const likeCount = optimisticLikeCount ?? post.likeCount ?? 0;
  const displayedCommentCount = post.commentCount ?? 0;
  const displayedShareCount = post.shareCount ?? 0;

  const maxLength = 80;
  const isLong = (post.caption ?? "").length > maxLength;

  const goToAuthorProfile = () => {
    router.push(`/users/${post.author.username}`);
  };

  const goToPostDetail = () => {
    router.push(`/posts/${post.id}`);
  };

  const triggerLikeAnim = () => {
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 400);
  };

  const triggerSaveAnim = () => {
    setSaveAnim(true);
    setTimeout(() => setSaveAnim(false), 400);
  };

  const handleLike = async () => {
    const prevLiked = liked;
    const prevLikeCount = likeCount;

    try {
      if (liked) {
        setOptimisticLiked(false);
        setOptimisticLikeCount(Math.max(0, likeCount - 1));
        await api.delete(`/posts/${post.id}/like`);
        return;
      }

      setOptimisticLiked(true);
      setOptimisticLikeCount(likeCount + 1);
      triggerLikeAnim();
      await api.post(`/posts/${post.id}/like`, {});
    } catch (error) {
      setOptimisticLiked(prevLiked);
      setOptimisticLikeCount(prevLikeCount);
      console.error("Like error:", error);
    }
  };

  const handleSave = async () => {
    const prevSaved = saved;

    try {
      if (saved) {
        setSaved(false);
        await api.delete(`/posts/${post.id}/save`);
      } else {
        setSaved(true);
        triggerSaveAnim();
        await api.post(`/posts/${post.id}/save`, {});
      }
    } catch (error) {
      setSaved(prevSaved);

      if (axios.isAxiosError(error)) {
        console.error(
          "Save error:",
          error.response?.status,
          error.response?.data,
        );
      } else {
        console.error("Save error:", error);
      }
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${post.id}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Clipboard error:", error);
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
          onCommentAdded={() => {}}
        />
      )}

      <div className="w-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <button onClick={goToAuthorProfile}>
            <AuthorAvatar
              avatarUrl={post.author.avatarUrl}
              name={post.author.name}
            />
          </button>

          <div className="min-w-0">
            <button
              onClick={goToAuthorProfile}
              className="truncate text-sm font-semibold text-white hover:underline"
            >
              {post.author.name}
            </button>

            <div className="flex items-center gap-2">
              <p className="text-xs text-neutral-500">
                {timeAgo(post.createdAt)}
              </p>
              {isMyPost && (
                <span className="text-[10px] rounded-full border border-violet-500/40 bg-violet-500/10 px-2 py-0.5 text-violet-300">
                  You
                </span>
              )}
            </div>
          </div>
        </div>

        {post.imageUrl && (
          <div
            className="relative w-full aspect-video cursor-pointer"
            onClick={goToPostDetail}
          >
            <Image
              src={post.imageUrl}
              alt="post"
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="flex items-center gap-5 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleLike}
              className={`transition-transform duration-200 ${
                likeAnim ? "scale-125" : "scale-100"
              }`}
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
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              {likeCount}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowCommentsModal(true)}
              className="text-neutral-400 transition-colors hover:text-white"
            >
              <Image src={commentIcon} alt="comment" width={22} height={22} />
            </button>

            <button
              onClick={() => setShowCommentsModal(true)}
              className="text-sm text-neutral-400"
            >
              {displayedCommentCount}
            </button>
          </div>

          <div className="relative flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="text-neutral-400 transition-colors hover:text-white"
            >
              <Image src={shareIcon} alt="share" width={22} height={22} />
            </button>

            <span className="text-sm text-neutral-400">
              {displayedShareCount}
            </span>

            {copied && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-neutral-800 px-2 py-1 text-xs text-white">
                Link copied!
              </span>
            )}
          </div>

          <button
            onClick={handleSave}
            className={`ml-auto transition-transform duration-200 ${
              saveAnim ? "scale-125" : "scale-100"
            } ${saved ? "opacity-100" : "text-neutral-400 hover:text-white"}`}
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

        <div className="px-4 pb-4">
          <p className="text-sm font-semibold text-white">{post.author.name}</p>

          <p className="mt-0.5 text-sm text-neutral-300">
            {isLong && !showFull
              ? `${(post.caption ?? "").slice(0, maxLength)}...`
              : post.caption}

            {isLong && (
              <button
                onClick={() => setShowFull((prev) => !prev)}
                className="ml-1 text-sm text-violet-400 transition-colors hover:text-violet-300"
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
