"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import api from "@/lib/api/axios";
import axios from "axios";
import { timeAgo } from "@/lib/timeAgo";

import likeIcon from "@/assets/svg/like.svg";
import likedIcon from "@/assets/svg/liked.svg";
import commentIcon from "@/assets/svg/comment.svg";
import shareIcon from "@/assets/svg/share.svg";
import savedIcon from "@/assets/svg/saved.svg";
import savedActiveIcon from "@/assets/svg/saved2.svg";

const EMOJIS = [
  "😀",
  "😂",
  "😍",
  "🥰",
  "😎",
  "😭",
  "😅",
  "🤩",
  "😇",
  "🥳",
  "❤️",
  "🔥",
  "👏",
  "🙌",
  "💯",
  "✨",
  "🎉",
  "💪",
  "🤔",
  "😮",
  "😢",
  "😡",
  "🤣",
  "😏",
  "🥺",
  "😴",
  "🤯",
  "🫶",
  "💀",
  "👀",
];

type Comment = {
  id: number;
  text?: string;
  content?: string;
  body?: string;
  createdAt: string;
  author: {
    name: string;
    username: string;
    avatarUrl?: string | null;
  };
};

function CommentAvatar({
  avatarUrl,
  name,
  size = 36,
}: {
  avatarUrl?: string | null;
  name: string;
  size?: number;
}) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-neutral-700 text-sm font-bold text-white"
      style={{ width: size, height: size }}
    >
      {name?.charAt(0).toUpperCase() ?? "?"}
    </div>
  );
}

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
        // ignore
      }
    }
  };

  return [saved, updateSaved] as const;
};

export default function CommentsModal({
  postId,
  onClose,
  postImageUrl,
  onCommentAdded,
  authorName,

  authorAvatarUrl,
  caption,
  createdAt,
  initialLiked,
  initialLikeCount,
  initialCommentCount,
  initialShareCount,
  initialSaved,
}: {
  postId: number;
  onClose: () => void;
  postImageUrl?: string;
  onCommentAdded?: () => void;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  caption: string;
  createdAt: string;
  initialLiked: boolean;
  initialLikeCount: number;
  initialCommentCount: number;
  initialShareCount: number;
  initialSaved: boolean;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [copied, setCopied] = useState(false);

  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
  const [optimisticLikeCount, setOptimisticLikeCount] = useState<number | null>(
    null,
  );
  const [saved, setSaved] = usePersistedSaveState(postId, initialSaved);

  const inputRef = useRef<HTMLInputElement>(null);

  const liked = optimisticLiked ?? initialLiked ?? false;
  const likeCount = optimisticLikeCount ?? initialLikeCount ?? 0;
  const commentCount =
    comments.length > 0 ? comments.length : (initialCommentCount ?? 0);
  const shareCount = initialShareCount ?? 0;

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await api.get(`/posts/${postId}/comments`);
        const data = response.data?.data?.comments ?? [];
        setComments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Fetch comments error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleLike = async () => {
    const prevLiked = liked;
    const prevLikeCount = likeCount;

    try {
      if (liked) {
        setOptimisticLiked(false);
        setOptimisticLikeCount(Math.max(0, likeCount - 1));
        await api.delete(`/posts/${postId}/like`);
        return;
      }

      setOptimisticLiked(true);
      setOptimisticLikeCount(likeCount + 1);
      await api.post(`/posts/${postId}/like`, {});
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
        await api.delete(`/posts/${postId}/save`);
      } else {
        setSaved(true);
        await api.post(`/posts/${postId}/save`, {});
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
    try {
      const url = `${window.location.origin}/posts/${postId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy link error:", error);
    }
  };

  const handlePost = async () => {
    const value = text.trim();
    if (!value) return;

    try {
      setPosting(true);

      const response = await api.post(`/posts/${postId}/comments`, {
        text: value,
      });

      const newComment =
        response.data?.data?.comment ??
        response.data?.data ??
        response.data ??
        null;

      if (newComment && typeof newComment === "object") {
        setComments((prev) => [newComment, ...prev]);
      }

      onCommentAdded?.();
      setText("");
      setShowEmoji(false);
    } catch (error) {
      console.error("Post comment error:", error);
    } finally {
      setPosting(false);
    }
  };

  const getCommentText = (comment: Comment): string => {
    return comment.text ?? comment.content ?? comment.body ?? "";
  };

  const getCommentTime = (date?: string): string => {
    if (!date) return "";
    try {
      return timeAgo(date);
    } catch {
      return date;
    }
  };

  const insertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close comments modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"
      />

      {/* Mobile */}
      <div className="absolute inset-0 flex flex-col bg-black md:hidden">
        {postImageUrl && (
          <div className="relative aspect-video w-full shrink-0">
            <Image
              src={postImageUrl}
              alt="post"
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between bg-neutral-950 px-4 py-4">
          <h2 className="text-lg font-bold text-white">Comments</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-white transition-colors hover:bg-neutral-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="border-b border-neutral-800 px-4 py-4">
          <div className="flex items-start gap-3">
            <CommentAvatar avatarUrl={authorAvatarUrl} name={authorName} />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-white">
                  {authorName}
                </p>
                <p className="text-xs text-neutral-500">
                  {getCommentTime(createdAt)}
                </p>
              </div>

              <p className="mt-1 text-sm text-neutral-300">{caption}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-neutral-950 px-4 py-4">
          {loading ? (
            <div className="py-8 text-center text-sm text-neutral-500">
              Loading...
            </div>
          ) : comments.length === 0 ? (
            <div className="py-8 text-center text-sm text-neutral-500">
              No comments yet
            </div>
          ) : (
            comments.map((comment, index) => (
              <div key={comment.id ?? index} className="flex gap-3">
                <CommentAvatar
                  avatarUrl={comment.author?.avatarUrl}
                  name={comment.author?.name ?? "?"}
                />

                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">
                      {comment.author?.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {getCommentTime(comment.createdAt)}
                    </p>
                  </div>

                  <p className="mt-0.5 text-sm text-neutral-300">
                    {getCommentText(comment)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-neutral-800 px-4 py-3">
          <div className="mb-3 flex items-center gap-4 text-sm text-neutral-400">
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <Image
                src={liked ? likedIcon : likeIcon}
                alt="like"
                width={18}
                height={18}
              />
              <span>{likeCount}</span>
            </button>

            <div className="flex items-center gap-1.5">
              <Image src={commentIcon} alt="comment" width={18} height={18} />
              <span>{commentCount}</span>
            </div>

            <button
              onClick={handleShare}
              className="relative flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <Image src={shareIcon} alt="share" width={18} height={18} />
              <span>{shareCount}</span>

              {copied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-neutral-800 px-2 py-1 text-xs text-white">
                  Link copied!
                </span>
              )}
            </button>

            <button
              onClick={handleSave}
              className="ml-auto transition-colors hover:text-white"
            >
              <Image
                src={saved ? savedActiveIcon : savedIcon}
                alt="saved"
                width={18}
                height={18}
                className={saved ? "brightness-200" : ""}
              />
            </button>
          </div>
        </div>

        {showEmoji && (
          <div className="grid shrink-0 grid-cols-10 gap-2 border-t border-neutral-800 bg-neutral-900 px-4 py-3">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => insertEmoji(emoji)}
                className="text-xl transition-transform hover:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <div className="flex shrink-0 items-center gap-3 border-t border-neutral-800 bg-neutral-950 px-4 py-3">
          <button
            onClick={() => setShowEmoji((prev) => !prev)}
            className={`text-2xl transition-colors ${
              showEmoji
                ? "text-violet-400"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            😊
          </button>

          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePost()}
            placeholder="Add Comment"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
          />

          <button
            onClick={handlePost}
            disabled={posting || !text.trim()}
            className="text-sm font-semibold text-violet-400 transition-colors hover:text-violet-300 disabled:opacity-40"
          >
            {posting ? "..." : "Post"}
          </button>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden h-full w-full items-center justify-center p-6 md:flex">
        <div className="relative flex h-[78vh] w-full max-w-5xl overflow-hidden rounded-[28px] border border-neutral-800 bg-neutral-950 shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-black/30"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="relative hidden basis-[64%] bg-black md:block">
            {postImageUrl ? (
              <Image
                src={postImageUrl}
                alt="post"
                fill
                className="object-contain"
              />
            ) : (
              <div className="h-full w-full bg-neutral-900" />
            )}
          </div>

          <div className="flex w-full basis-[36%] flex-col bg-neutral-950">
            <div className="border-b border-neutral-800 px-5 py-4">
              <div className="flex items-start gap-3 pr-8">
                <CommentAvatar
                  avatarUrl={authorAvatarUrl}
                  name={authorName}
                  size={34}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-white">
                      {authorName}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      {getCommentTime(createdAt)}
                    </p>
                  </div>

                  <p className="mt-1 line-clamp-4 text-xs leading-5 text-neutral-300">
                    {caption || "No description yet."}
                  </p>
                </div>

                <button className="text-neutral-500 transition-colors hover:text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6h.01M12 12h.01M12 18h.01"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="border-b border-neutral-800 px-5 py-3">
              <p className="text-xs font-semibold text-white">Comments</p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loading ? (
                <div className="py-8 text-center text-sm text-neutral-500">
                  Loading...
                </div>
              ) : comments.length === 0 ? (
                <div className="py-8 text-center text-sm text-neutral-500">
                  No comments yet
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment, index) => (
                    <div
                      key={comment.id ?? index}
                      className="border-b border-neutral-900 pb-4 last:border-b-0"
                    >
                      <div className="flex gap-3">
                        <CommentAvatar
                          avatarUrl={comment.author?.avatarUrl}
                          name={comment.author?.name ?? "?"}
                          size={34}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-white">
                              {comment.author?.name}
                            </p>
                            <p className="text-[11px] text-neutral-500">
                              {getCommentTime(comment.createdAt)}
                            </p>
                          </div>

                          <p className="mt-1 text-xs leading-5 text-neutral-300">
                            {getCommentText(comment)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-neutral-800 px-5 py-3">
              <div className="mb-3 flex items-center gap-4 text-xs text-neutral-400">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-1.5 transition-colors hover:text-white"
                >
                  <Image
                    src={liked ? likedIcon : likeIcon}
                    alt="like"
                    width={18}
                    height={18}
                  />
                  <span>{likeCount}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <Image
                    src={commentIcon}
                    alt="comment"
                    width={18}
                    height={18}
                  />
                  <span>{commentCount}</span>
                </div>

                <button
                  onClick={handleShare}
                  className="relative flex items-center gap-1.5 transition-colors hover:text-white"
                >
                  <Image src={shareIcon} alt="share" width={18} height={18} />
                  <span>{shareCount}</span>

                  {copied && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-neutral-800 px-2 py-1 text-xs text-white">
                      Link copied!
                    </span>
                  )}
                </button>

                <button
                  onClick={handleSave}
                  className="ml-auto transition-colors hover:text-white"
                >
                  <Image
                    src={saved ? savedActiveIcon : savedIcon}
                    alt="saved"
                    width={18}
                    height={18}
                    className={saved ? "brightness-200" : ""}
                  />
                </button>
              </div>

              {showEmoji && (
                <div className="mb-3 grid grid-cols-8 gap-2 rounded-2xl border border-neutral-800 bg-neutral-900 p-3">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => insertEmoji(emoji)}
                      className="text-lg transition-transform hover:scale-125"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3">
                <button
                  onClick={() => setShowEmoji((prev) => !prev)}
                  className={`text-lg transition-colors ${
                    showEmoji
                      ? "text-violet-400"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  😊
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePost()}
                  placeholder="Add Comment"
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
                />

                <button
                  onClick={handlePost}
                  disabled={posting || !text.trim()}
                  className="text-xs font-semibold text-neutral-400 transition-colors hover:text-white disabled:opacity-40"
                >
                  {posting ? "..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
