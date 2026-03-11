"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import api from "@/lib/api/axios";
import axios from "axios";
import avatar from "@/assets/svg/avatar.svg";

type FollowUser = {
  id: string | number;
  name: string;
  username: string;
  avatarUrl?: string | null;
};

export default function FollowingModal({
  username,
  onClose,
}: {
  username: string;
  onClose: () => void;
}) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  const fetchFollowing = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get(`/users/${username}/following`);
      const data =
        response.data?.data?.users ||
        response.data?.data?.following ||
        response.data?.data?.items ||
        response.data?.data ||
        response.data ||
        [];

      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching following:", error.response?.data);
      } else {
        console.error("Error fetching following:", error);
      }
    } finally {
      setLoading(false);
    }
  }, [username]);

  const handleUnfollow = useCallback(
    async (userId: string | number, usernameToUnfollow: string) => {
      try {
        setFollowLoading(usernameToUnfollow);
        await api.delete(`/follow/${usernameToUnfollow}`);

        setUsers((prev) =>
          prev.filter((user) => user.id.toString() !== userId.toString()),
        );
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Unfollow error:", error.response?.data);
        } else {
          console.error("Unfollow error:", error);
        }
      } finally {
        setFollowLoading(null);
      }
    },
    [],
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("user");

      if (raw) {
        try {
          const user = JSON.parse(raw);
          setCurrentUsername(user.username ?? null);
        } catch {
          // ignore
        }
      }
    }

    fetchFollowing();
  }, [fetchFollowing]);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close following modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
      />

      <div className="absolute inset-0 flex flex-col bg-black md:hidden">
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between bg-neutral-950 px-4 py-4">
          <div>
            <h2 className="text-lg font-bold text-white">Following</h2>
            <p className="text-xs text-neutral-500">@{username}</p>
          </div>

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

        <div className="flex-1 overflow-y-auto bg-neutral-950 px-4 pb-8">
          {loading ? (
            <div className="py-8 text-center text-sm text-neutral-500">
              Loading...
            </div>
          ) : users.length === 0 ? (
            <div className="py-8 text-center text-sm text-neutral-500">
              No following yet
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => {
                const isMe = user.username === currentUsername;
                const isProcessing = followLoading === user.username;

                return (
                  <div key={user.id} className="flex items-center gap-3">
                    <Image
                      src={user.avatarUrl || avatar}
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

                    {!isMe && (
                      <button
                        onClick={() => handleUnfollow(user.id, user.username)}
                        disabled={isProcessing}
                        className="group inline-flex items-center gap-1.5 rounded-full border border-neutral-600 bg-neutral-800 px-4 py-2 text-xs font-medium text-neutral-200 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5 shrink-0"
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

                        <span>{isProcessing ? "..." : "Following"}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="hidden h-full w-full items-center justify-center p-6 md:flex">
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/95 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-white">Following</h2>
              <p className="text-[11px] text-neutral-500">@{username}</p>
            </div>

            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors hover:bg-neutral-800"
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

          <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
            {loading ? (
              <div className="py-8 text-center text-sm text-neutral-500">
                Loading...
              </div>
            ) : users.length === 0 ? (
              <div className="py-8 text-center text-sm text-neutral-500">
                No following yet
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => {
                  const isMe = user.username === currentUsername;
                  const isProcessing = followLoading === user.username;

                  return (
                    <div key={user.id} className="flex items-center gap-3">
                      <Image
                        src={user.avatarUrl || avatar}
                        alt={user.name}
                        width={38}
                        height={38}
                        className="shrink-0 rounded-full object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                          {user.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="truncate text-[11px] text-neutral-500">
                            @{user.username}
                          </p>

                          {isMe && (
                            <span className="rounded-full border border-violet-500/40 bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-300">
                              You
                            </span>
                          )}
                        </div>
                      </div>

                      {!isMe && (
                        <button
                          onClick={() => handleUnfollow(user.id, user.username)}
                          disabled={isProcessing}
                          className="group inline-flex items-center gap-1 rounded-full border border-neutral-600 bg-neutral-800 px-3 py-1.5 text-[11px] font-medium text-neutral-200 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 shrink-0"
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

                          <span>{isProcessing ? "..." : "Following"}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
