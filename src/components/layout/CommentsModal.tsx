"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import avatar from "@/assets/svg/avatar.svg";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://be-social-media-api-production.up.railway.app";

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

export default function CommentsModal({
  postId,
  onClose,
  postImageUrl,
}: {
  postId: number;
  onClose: () => void;
  postImageUrl?: string;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE}/api/posts/${postId}/comments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      // API returns: response.data.data.comments
      const data = response.data?.data?.comments ?? [];
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch comments error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!text.trim()) return;
    try {
      setPosting(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE}/api/posts/${postId}/comments`,
        { text: text.trim() },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const newComment =
        response.data?.data?.comment ??
        response.data?.data ??
        response.data ??
        null;

      if (newComment && typeof newComment === "object") {
        setComments((prev) => [newComment, ...prev]);
      }

      setText("");
      setShowEmoji(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Post comment error:",
          JSON.stringify(error.response?.data, null, 2),
        );
      }
    } finally {
      setPosting(false);
    }
  };

  // API pakai field "text"
  const getCommentText = (comment: Comment): string => {
    return comment.text ?? comment.content ?? comment.body ?? "";
  };

  const insertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Post image preview */}
      {postImageUrl && (
        <div className="relative w-full aspect-video shrink-0">
          <Image src={postImageUrl} alt="post" fill className="object-cover" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-neutral-950 sticky top-0 z-10 shrink-0">
        <h2 className="text-white font-bold text-lg">Comments</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
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

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto bg-neutral-950 px-4 space-y-4 pb-4">
        {loading ? (
          <div className="text-neutral-500 text-center py-8 text-sm">
            Loading...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-neutral-500 text-center py-8 text-sm">
            No comments yet
          </div>
        ) : (
          comments.map((comment, index) => (
            <div key={comment.id ?? index} className="flex gap-3">
              <Image
                src={comment.author?.avatarUrl ?? avatar}
                alt={comment.author?.name ?? "user"}
                width={36}
                height={36}
                style={{ width: 36, height: 36 }}
                className="rounded-full object-cover shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-white text-sm font-semibold">
                    {comment.author?.name}
                  </p>
                  <p className="text-neutral-500 text-xs">
                    {comment.createdAt}
                  </p>
                </div>
                <p className="text-neutral-300 text-sm mt-0.5">
                  {getCommentText(comment)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Emoji Picker */}
      {showEmoji && (
        <div className="bg-neutral-900 border-t border-neutral-800 px-4 py-3 grid grid-cols-10 gap-2 shrink-0">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => insertEmoji(emoji)}
              className="text-xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="bg-neutral-950 border-t border-neutral-800 px-4 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={() => setShowEmoji((prev) => !prev)}
          className={`text-2xl transition-colors ${
            showEmoji ? "text-violet-400" : "text-neutral-400 hover:text-white"
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
          className="flex-1 bg-transparent text-white placeholder:text-neutral-500 text-sm focus:outline-none"
        />

        <button
          onClick={handlePost}
          disabled={posting || !text.trim()}
          className="text-violet-400 hover:text-violet-300 font-semibold text-sm disabled:opacity-40 transition-colors"
        >
          {posting ? "..." : "Post"}
        </button>
      </div>
    </div>
  );
}
