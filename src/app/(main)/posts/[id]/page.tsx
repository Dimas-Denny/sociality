"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api/axios";
import axios from "axios";
import { timeAgo } from "@/lib/timeAgo";
import likeIcon from "@/assets/svg/like.svg";
import likedIcon from "@/assets/svg/liked.svg";
import commentIcon from "@/assets/svg/comment.svg";
import savedIcon from "@/assets/svg/saved.svg";
import savedActiveIcon from "@/assets/svg/saved2.svg";
import shareIcon from "@/assets/svg/share.svg";

type Author = {
  id: number;
  name: string;
  username: string;
  avatarUrl?: string | null;
};

type Comment = {
  id: number;
  text: string;
  createdAt: string;
  author: Author;
};

type PostDetail = {
  id: number;
  imageUrl: string;
  caption: string;
  createdAt: string;
  author: Author;
  likeCount: number;
  commentCount: number;
  shareCount?: number;
  likedByMe: boolean;
  savedByMe?: boolean;
};

function AvatarFallback({
  url,
  name,
  size,
}: {
  url?: string | null;
  name: string;
  size: number;
}) {
  if (url) {
    return (
      <Image
        src={url}
        alt={name}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-neutral-700 font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {name?.charAt(0).toUpperCase() ?? "?"}
    </div>
  );
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          api.get(`/posts/${id}`),
          api.get(`/posts/${id}/comments`),
        ]);

        const postData = postRes.data?.data ?? postRes.data;
        setPost(postData);
        setLiked(postData.likedByMe ?? false);
        setLikeCount(postData.likeCount ?? 0);
        setSaved(postData.savedByMe ?? false);

        const commentsData =
          commentsRes.data?.data?.comments ??
          commentsRes.data?.data?.items ??
          commentsRes.data?.data ??
          commentsRes.data ??
          [];

        setComments(Array.isArray(commentsData) ? commentsData : []);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Fetch post error:", error.response?.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleLike = async () => {
    try {
      if (liked) {
        await api.delete(`/posts/${id}/like`);
        setLiked(false);
        setLikeCount((p) => Math.max(0, p - 1));
      } else {
        await api.post(`/posts/${id}/like`, {});
        setLiked(true);
        setLikeCount((p) => p + 1);
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleSave = async () => {
    try {
      if (saved) {
        await api.delete(`/posts/${id}/save`);
        setSaved(false);
      } else {
        await api.post(`/posts/${id}/save`, {});
        setSaved(true);
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${id}`;

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

  const handleComment = async () => {
    if (!commentText.trim()) return;

    try {
      setSubmitting(true);
      const res = await api.post(`/posts/${id}/comments`, {
        text: commentText,
      });

      const newComment = res.data?.data ?? res.data;
      setComments((prev) => [...prev, newComment]);
      setCommentText("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Comment error:", error.response?.data);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <p className="text-sm text-neutral-500">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <p className="text-sm text-neutral-500">Post not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-32 md:pb-10">
      <div className="mx-auto w-full max-w-6xl px-4 pt-4 md:px-6 md:pt-6">
        {/* Mobile back */}
        <div className="mb-3 md:hidden">
          <button
            onClick={() => router.back()}
            className="text-neutral-400 transition-colors hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* Desktop layout */}
        <div className="overflow-hidden md:grid md:grid-cols-[minmax(0,1.15fr)_400px] md:gap-0 md:rounded-[28px] md:border md:border-neutral-800 md:bg-neutral-950">
          {/* Left side */}
          <div className="md:border-r md:border-neutral-800">
            <div className="relative w-full bg-black aspect-square md:aspect-auto md:h-[78vh]">
              <Image
                src={post.imageUrl}
                alt="post"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex min-h-0 flex-col bg-neutral-950">
            {/* Header author */}
            <div className="border-b border-neutral-800 px-4 py-4 md:px-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push(`/users/${post.author.username}`)}
                >
                  <AvatarFallback
                    url={post.author.avatarUrl}
                    name={post.author.name}
                    size={38}
                  />
                </button>

                <div className="min-w-0 flex-1">
                  <button
                    onClick={() =>
                      router.push(`/users/${post.author.username}`)
                    }
                    className="truncate text-sm font-semibold text-white hover:underline"
                  >
                    {post.author.name}
                  </button>
                  <p className="text-xs text-neutral-500">
                    {timeAgo(post.createdAt)}
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-sm leading-relaxed text-neutral-300">
                  <span className="mr-2 font-semibold text-white">
                    {post.author.name}
                  </span>
                  {post.caption}
                </p>
              </div>
            </div>

            {/* Comments title */}
            <div className="border-b border-neutral-800 px-4 py-3 md:px-5">
              <p className="text-sm font-semibold text-white">Comments</p>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto px-4 py-4 md:px-5">
              {comments.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-neutral-500">No comments yet</p>
                  <p className="mt-1 text-xs text-neutral-600">
                    Start the conversation
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="border-b border-neutral-900 pb-4 last:border-b-0"
                    >
                      <div className="flex items-start gap-3">
                        <AvatarFallback
                          url={comment.author.avatarUrl}
                          name={comment.author.name}
                          size={32}
                        />

                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white">
                            <span className="mr-2 font-semibold">
                              {comment.author.name}
                            </span>
                            <span className="text-neutral-300">
                              {comment.text}
                            </span>
                          </p>
                          <p className="mt-0.5 text-xs text-neutral-600">
                            {timeAgo(comment.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions + input */}
            <div className="border-t border-neutral-800 px-4 py-3 md:px-5">
              <div className="mb-3 flex items-center gap-5">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-1.5 text-neutral-400 transition-colors hover:text-white"
                >
                  <Image
                    src={liked ? likedIcon : likeIcon}
                    alt="like"
                    width={20}
                    height={20}
                  />
                  <span className="text-sm">{likeCount}</span>
                </button>

                <button
                  onClick={() => inputRef.current?.focus()}
                  className="flex items-center gap-1.5 text-neutral-400 transition-colors hover:text-white"
                >
                  <Image
                    src={commentIcon}
                    alt="comment"
                    width={20}
                    height={20}
                  />
                  <span className="text-sm">{comments.length}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="relative flex items-center gap-1.5 text-neutral-400 transition-colors hover:text-white"
                >
                  <Image src={shareIcon} alt="share" width={20} height={20} />
                  <span className="text-sm">{post.shareCount ?? 0}</span>

                  {copied && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-neutral-800 px-2 py-1 text-xs text-white">
                      Link copied!
                    </span>
                  )}
                </button>

                <button onClick={handleSave} className="ml-auto">
                  <Image
                    src={saved ? savedActiveIcon : savedIcon}
                    alt="save"
                    width={20}
                    height={20}
                  />
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-4 py-2.5">
                <input
                  ref={inputRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleComment()}
                  placeholder="Add Comment"
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
                />
                <button
                  onClick={handleComment}
                  disabled={!commentText.trim() || submitting}
                  className="text-sm font-semibold text-violet-400 transition-opacity disabled:opacity-40"
                >
                  {submitting ? "..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
