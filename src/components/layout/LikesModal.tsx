"use client";

import { useEffect, useState, useCallback } from "react";
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

type FollowedUsersMap = Record<string, boolean>;

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
  const [followedUsers, setFollowedUsers] = useState<FollowedUsersMap>({});

  const getStorageKey = (userId: string | number) =>
    `followed_${userId.toString()}`;

  const fetchLikes = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get(`/posts/${postId}/likes`);
      const data =
        response.data?.data?.users ||
        response.data?.data ||
        response.data ||
        [];

      const safeUsers = Array.isArray(data) ? data : [];
      setUsers(safeUsers);

      if (typeof window !== "undefined") {
        try {
          const stored = JSON.parse(
            localStorage.getItem("followedUsers") || "{}",
          );
          const initialFollowState: FollowedUsersMap = {};

          safeUsers.forEach((user: LikeUser) => {
            const storageKey = getStorageKey(user.id);
            initialFollowState[user.id] =
              stored[storageKey] ?? user.followedByMe ?? false;
          });

          setFollowedUsers(initialFollowState);
        } catch {
          const fallbackState: FollowedUsersMap = {};
          safeUsers.forEach((user: LikeUser) => {
            fallbackState[user.id] = user.followedByMe ?? false;
          });
          setFollowedUsers(fallbackState);
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching likes:", error.response?.data);
      }
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const updateFollowed = useCallback((userId: string, newFollowed: boolean) => {
    setFollowedUsers((prev) => {
      const updated = {
        ...prev,
        [userId]: newFollowed,
      };

      if (typeof window !== "undefined") {
        try {
          const stored = JSON.parse(
            localStorage.getItem("followedUsers") || "{}",
          );
          stored[getStorageKey(userId)] = newFollowed;
          localStorage.setItem("followedUsers", JSON.stringify(stored));
        } catch {
          // ignore error
        }
      }

      return updated;
    });
  }, []);

  const handleFollow = useCallback(
    async (userId: string, username: string) => {
      try {
        setFollowLoading(username);
        await api.post(`/follow/${username}`, {});
        updateFollowed(userId, true);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Follow error:", error.response?.data);
        }
      } finally {
        setFollowLoading(null);
      }
    },
    [updateFollowed],
  );

  const handleUnfollow = useCallback(
    async (userId: string, username: string) => {
      try {
        setFollowLoading(username);
        await api.delete(`/follow/${username}`);
        updateFollowed(userId, false);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Unfollow error:", error.response?.data);
        }
      } finally {
        setFollowLoading(null);
      }
    },
    [updateFollowed],
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("user");

      if (raw) {
        try {
          const user = JSON.parse(raw);
          setCurrentUsername(user.username ?? null);
        } catch {
          // ignore parse error
        }
      }
    }

    fetchLikes();
  }, [fetchLikes]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {postImageUrl && (
        <div className="relative w-full aspect-video">
          <Image src={postImageUrl} alt="post" fill className="object-cover" />
        </div>
      )}

      <div className="flex-1 overflow-y-auto bg-neutral-950 px-4 pb-8">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-neutral-950 py-4">
          <h2 className="text-lg font-bold text-white">Likes</h2>

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

        {loading ? (
          <div className="py-8 text-center text-sm text-neutral-500">
            Loading...
          </div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-sm text-neutral-500">
            No likes yet
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => {
              const isMe = user.username === currentUsername;
              const isFollowed = followedUsers[user.id] ?? false;

              return (
                <div key={user.id} className="flex items-center gap-3">
                  <Image
                    src={user.avatarUrl ?? avatar}
                    alt={user.name}
                    width={44}
                    height={44}
                    className="shrink-0 rounded-full object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {user.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="truncate text-xs text-neutral-500">
                        @{user.username}
                      </p>

                      {isMe && (
                        <span className="rounded-full border border-violet-500/40 bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-300">
                          You
                        </span>
                      )}
                    </div>
                  </div>

                  {!isMe &&
                    (isFollowed ? (
                      <button
                        onClick={() => handleUnfollow(user.id, user.username)}
                        disabled={followLoading === user.username}
                        className="flex items-center gap-1.5 rounded-full border border-neutral-600 px-4 py-2 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-800 disabled:opacity-50"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
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
                        onClick={() => handleFollow(user.id, user.username)}
                        disabled={followLoading === user.username}
                        className="rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
                      >
                        {followLoading === user.username ? "..." : "Follow"}
                      </button>
                    ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
