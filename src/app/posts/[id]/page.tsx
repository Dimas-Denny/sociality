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
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-neutral-700 flex items-center justify-center shrink-0 text-white font-bold"
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
        if (axios.isAxiosError(error))
          console.error("Fetch post error:", error.response?.data);
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
        setLikeCount((p) => p - 1);
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
      if (axios.isAxiosError(error))
        console.error("Comment error:", error.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-neutral-950 min-h-screen flex items-center justify-center">
        <p className="text-neutral-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="bg-neutral-950 min-h-screen flex items-center justify-center">
        <p className="text-neutral-500 text-sm">Post not found</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-950 min-h-screen pb-36">
      {/* Back button */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={() => router.back()}
          className="text-neutral-400 hover:text-white transition-colors"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* 1. Gambar Post */}
      <div className="w-full aspect-video relative bg-black">
        <Image src={post.imageUrl} alt="post" fill className="object-contain" />
      </div>

      {/* 2. Avatar + Nama + Waktu */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => router.push(`/users/${post.author.username}`)}>
          <AvatarFallback
            url={post.author.avatarUrl}
            name={post.author.name}
            size={38}
          />
        </button>
        <div>
          <button
            onClick={() => router.push(`/users/${post.author.username}`)}
            className="text-white text-sm font-semibold hover:underline"
          >
            {post.author.name}
          </button>
          <p className="text-neutral-500 text-xs">{timeAgo(post.createdAt)}</p>
        </div>
      </div>

      {/* 3. Caption */}
      <div className="px-4 pb-4">
        <p className="text-neutral-200 text-sm leading-relaxed">
          <span className="text-white font-semibold mr-2">
            {post.author.name}
          </span>
          {post.caption}
        </p>
      </div>

      {/* 4. Label Comments */}
      <div className="px-4 pb-3 border-t border-neutral-800 pt-4">
        <p className="text-white font-semibold text-sm">Comments</p>
      </div>

      {/* 5. List Komentar */}
      <div className="px-4 space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-500 text-sm">No comments yet</p>
            <p className="text-neutral-600 text-xs mt-1">
              Start the conversation
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3">
              <AvatarFallback
                url={comment.author.avatarUrl}
                name={comment.author.name}
                size={32}
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">
                  <span className="font-semibold mr-2">
                    {comment.author.name}
                  </span>
                  <span className="text-neutral-300">{comment.text}</span>
                </p>
                <p className="text-neutral-600 text-xs mt-0.5">
                  {timeAgo(comment.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 6. Bottom Bar Sticky */}
      <div className="fixed bottom-0 left-0 right-0 bg-neutral-950 border-t border-neutral-800 px-4 py-3 space-y-3">
        {/* Like, Comment, Save, Share */}
        <div className="flex items-center gap-5">
          <button onClick={handleLike} className="flex items-center gap-1.5">
            <Image
              src={liked ? likedIcon : likeIcon}
              alt="like"
              width={22}
              height={22}
            />
            <span className="text-neutral-400 text-sm">{likeCount}</span>
          </button>
          <button
            onClick={() => inputRef.current?.focus()}
            className="flex items-center gap-1.5"
          >
            <Image src={commentIcon} alt="comment" width={22} height={22} />
            <span className="text-neutral-400 text-sm">{comments.length}</span>
          </button>
          <button onClick={handleSave} className="ml-auto">
            <Image
              src={saved ? savedActiveIcon : savedIcon}
              alt="save"
              width={22}
              height={22}
            />
          </button>
          <div className="relative">
            <button onClick={handleShare}>
              <Image src={shareIcon} alt="share" width={22} height={22} />
            </button>
            {copied && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                Link copied!
              </span>
            )}
          </div>
        </div>

        {/* Input Comment */}
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleComment()}
            placeholder="Add Comment"
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2.5 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
          <button
            onClick={handleComment}
            disabled={!commentText.trim() || submitting}
            className="text-violet-400 font-semibold text-sm disabled:opacity-40 transition-opacity"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
