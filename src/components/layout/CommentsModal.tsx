"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import api from "@/lib/api/axios";

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
}: {
  avatarUrl?: string | null;
  name: string;
}) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        width={36}
        height={36}
        style={{ width: 36, height: 36 }}
        className="rounded-full object-cover shrink-0"
      />
    );
  }

  return (
    <div className="w-9 h-9 rounded-full bg-neutral-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
      {name?.charAt(0).toUpperCase() ?? "?"}
    </div>
  );
}

export default function CommentsModal({
  postId,
  onClose,
  postImageUrl,
  onCommentAdded,
}: {
  postId: number;
  onClose: () => void;
  postImageUrl?: string;
  onCommentAdded?: () => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const insertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {postImageUrl && (
        <div className="relative w-full aspect-video shrink-0">
          <Image src={postImageUrl} alt="post" fill className="object-cover" />
        </div>
      )}

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
              <CommentAvatar
                avatarUrl={comment.author?.avatarUrl}
                name={comment.author?.name ?? "?"}
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
