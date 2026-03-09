"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import api from "@/lib/api/axios";
import axios from "axios";
import avatar from "@/assets/svg/avatar.svg";

type LikeUser = {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  followedByMe?: boolean;
};

export default function LikesModal({
  postId,
  onClose,
  postImageUrl,
}: {
  postId: number;
  onClose: () => void;
  postImageUrl?: string;
}) {
  const [users, setUsers] = useState<LikeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      const user = JSON.parse(raw);
      setCurrentUsername(user.username);
    }
    fetchLikes();
  }, []);

  const fetchLikes = async () => {
    try {
      const response = await api.get(`/posts/${postId}/likes`);
      const data =
        response.data?.data?.users ||
        response.data?.data ||
        response.data ||
        [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      if (axios.isAxiosError(error))
        console.error("Error fetching likes:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (username: string) => {
    try {
      setFollowLoading(username);
      await api.post(`/follow/${username}`, {});
      setUsers((prev) =>
        prev.map((u) =>
          u.username === username ? { ...u, followedByMe: true } : u,
        ),
      );
    } catch (error) {
      if (axios.isAxiosError(error))
        console.error("Follow error:", error.response?.data);
    } finally {
      setFollowLoading(null);
    }
  };

  const handleUnfollow = async (username: string) => {
    try {
      setFollowLoading(username);
      await api.delete(`/follow/${username}`);
      setUsers((prev) =>
        prev.map((u) =>
          u.username === username ? { ...u, followedByMe: false } : u,
        ),
      );
    } catch (error) {
      if (axios.isAxiosError(error))
        console.error("Unfollow error:", error.response?.data);
    } finally {
      setFollowLoading(null);
    }
  };

  const otherUsers = users.filter((u) => u.username !== currentUsername);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {postImageUrl && (
        <div className="relative w-full aspect-video">
          <Image src={postImageUrl} alt="post" fill className="object-cover" />
        </div>
      )}

      <div className="flex-1 overflow-y-auto bg-neutral-950 px-4 pb-8">
        <div className="flex items-center justify-between py-4 sticky top-0 bg-neutral-950 z-10">
          <h2 className="text-white font-bold text-lg">Likes</h2>
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

        {loading ? (
          <div className="text-neutral-500 text-center py-8 text-sm">
            Loading...
          </div>
        ) : otherUsers.length === 0 ? (
          <div className="text-neutral-500 text-center py-8 text-sm">
            No likes yet
          </div>
        ) : (
          <div className="space-y-3">
            {otherUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <Image
                  src={user.avatarUrl ?? avatar}
                  alt={user.name}
                  width={44}
                  height={44}
                  className="rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">
                    {user.name}
                  </p>
                  <p className="text-neutral-500 text-xs truncate">
                    @{user.username}
                  </p>
                </div>
                {user.followedByMe ? (
                  <button
                    onClick={() => handleUnfollow(user.username)}
                    disabled={followLoading === user.username}
                    className="flex items-center gap-1.5 border border-neutral-600 text-neutral-300 text-xs font-medium px-4 py-2 rounded-full hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Following
                  </button>
                ) : (
                  <button
                    onClick={() => handleFollow(user.username)}
                    disabled={followLoading === user.username}
                    className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors disabled:opacity-50"
                  >
                    {followLoading === user.username ? "..." : "Follow"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
