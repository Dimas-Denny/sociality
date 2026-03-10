"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api/axios";
import axios from "axios";
import postIcon from "@/assets/svg/post.svg";
import savedActiveIcon from "@/assets/svg/saved2.svg";
import shareIcon from "@/assets/svg/share.svg";

type UserProfile = {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  bio?: string;
  postCount: number;
  followerCount: number;
  followingCount: number;
  likeCount: number;
  followedByMe?: boolean;
};

type Post = {
  id: number;
  imageUrl?: string | null;
};

function AvatarFallback({
  name,
  avatarUrl,
  size = 80,
}: {
  name: string;
  avatarUrl?: string | null;
  size?: number;
}) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-full bg-neutral-700 font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {name?.charAt(0).toUpperCase() ?? "?"}
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000)
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();

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

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "liked">("posts");
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const [profileRes, postsRes, likedRes] = await Promise.all([
          api.get(`/users/${username}`),
          api.get(`/users/${username}/posts`),
          api.get(`/users/${username}/likes`),
        ]);

        const raw = profileRes.data?.data ?? profileRes.data;

        setProfile({
          ...raw,
          postCount: raw.counts?.post ?? 0,
          followerCount: raw.counts?.followers ?? 0,
          followingCount: raw.counts?.following ?? 0,
          likeCount: raw.counts?.likes ?? 0,
          followedByMe: raw.isFollowing ?? false,
        });

        const postsData =
          postsRes.data?.data?.posts ?? postsRes.data?.posts ?? [];
        const likedData =
          likedRes.data?.data?.posts ?? likedRes.data?.posts ?? [];

        setPosts(Array.isArray(postsData) ? postsData : []);
        setLikedPosts(Array.isArray(likedData) ? likedData : []);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Profile error:", error.response?.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [username]);

  const handleFollow = async () => {
    if (!profile) return;
    if (profile.username === currentUsername) return;

    try {
      setFollowLoading(true);

      if (profile.followedByMe) {
        await api.delete(`/follow/${username}`);
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                followedByMe: false,
                followerCount: Math.max(0, prev.followerCount - 1),
              }
            : prev,
        );
      } else {
        await api.post(`/follow/${username}`, {});
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                followedByMe: true,
                followerCount: prev.followerCount + 1,
              }
            : prev,
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Follow error:", error.response?.data);
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/users/${profile?.username}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy link error:", error);
    }
  };

  const displayedPosts = activeTab === "posts" ? posts : likedPosts;
  const isMe = currentUsername === profile?.username;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <p className="text-sm text-neutral-500">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <p className="text-sm text-neutral-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-16 md:pb-20">
      <div className="mx-auto w-full max-w-5xl px-4 pt-5 md:px-8 md:pt-8">
        <div className="mx-auto w-full md:max-w-3xl">
          {/* Mobile header */}
          <div className="mb-4 flex items-center gap-4 md:hidden">
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

            <h1 className="text-lg font-semibold text-white">
              {profile.username}
            </h1>
          </div>

          {/* Desktop spacing */}
          <div className="hidden md:block md:h-2" />

          {/* Profile top */}
          <div className="space-y-5">
            {/* Mobile */}
            <div className="md:hidden">
              <div className="mb-5 flex items-center gap-4">
                <AvatarFallback
                  name={profile.name}
                  avatarUrl={profile.avatarUrl}
                  size={80}
                />

                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold leading-tight text-white">
                    {profile.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-neutral-500">
                      @{profile.username}
                    </p>
                    {isMe && (
                      <span className="rounded-full border border-violet-500/40 bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-300">
                        You
                      </span>
                    )}
                  </div>

                  {profile.bio && (
                    <p className="mt-1 text-sm text-neutral-400">
                      {profile.bio}
                    </p>
                  )}
                </div>

                {!isMe && (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
                      profile.followedByMe
                        ? "border border-neutral-600 text-neutral-300 hover:bg-neutral-800"
                        : "bg-violet-600 text-white hover:bg-violet-500"
                    }`}
                  >
                    {followLoading
                      ? "..."
                      : profile.followedByMe
                        ? "Following"
                        : "Follow"}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-4 divide-x divide-neutral-800 rounded-2xl bg-neutral-900 py-3 text-center">
                {[
                  { label: "Posts", value: profile.postCount ?? 0 },
                  { label: "Followers", value: profile.followerCount ?? 0 },
                  { label: "Following", value: profile.followingCount ?? 0 },
                  { label: "Likes", value: profile.likeCount ?? 0 },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-0.5">
                    <p className="text-base font-bold text-white">
                      {formatCount(stat.value)}
                    </p>
                    <p className="text-xs text-neutral-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop */}
            <div className="hidden md:block">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <AvatarFallback
                    name={profile.name}
                    avatarUrl={profile.avatarUrl}
                    size={56}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-white">
                      {profile.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <p className="text-sm text-neutral-500">
                        @{profile.username}
                      </p>
                      {isMe && (
                        <span className="rounded-full border border-violet-500/40 bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-300">
                          You
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-sm text-neutral-300">
                      {profile.bio && profile.bio.trim() !== ""
                        ? profile.bio
                        : "No bio yet."}
                    </p>
                  </div>
                </div>

                {!isMe && (
                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
                        profile.followedByMe
                          ? "border border-neutral-600 text-neutral-300 hover:bg-neutral-800"
                          : "bg-violet-600 text-white hover:bg-violet-500"
                      }`}
                    >
                      {followLoading
                        ? "..."
                        : profile.followedByMe
                          ? "Following"
                          : "Follow"}
                    </button>

                    <button
                      onClick={handleShare}
                      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 transition-colors hover:bg-neutral-800"
                    >
                      <Image
                        src={shareIcon}
                        alt="Share"
                        width={18}
                        height={18}
                      />
                      {copied && (
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-neutral-800 px-2 py-1 text-xs text-white">
                          Link copied!
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-5 grid grid-cols-4 divide-x divide-neutral-800 py-1 text-center">
                {[
                  { label: "Post", value: profile.postCount ?? 0 },
                  { label: "Followers", value: profile.followerCount ?? 0 },
                  { label: "Following", value: profile.followingCount ?? 0 },
                  { label: "Likes", value: profile.likeCount ?? 0 },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col items-center gap-0.5 px-2"
                  >
                    <span className="text-lg font-bold text-white">
                      {formatCount(stat.value)}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-5 flex border-b border-neutral-800">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors ${
                activeTab === "posts"
                  ? "border-white text-white"
                  : "border-transparent text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <Image src={postIcon} alt="posts" width={18} height={18} />
              Gallery
            </button>

            <button
              onClick={() => setActiveTab("liked")}
              className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors ${
                activeTab === "liked"
                  ? "border-white text-white"
                  : "border-transparent text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <Image src={savedActiveIcon} alt="liked" width={18} height={18} />
              Liked
            </button>
          </div>

          {/* Gallery */}
          <div className="pt-4">
            {displayedPosts.length === 0 ? (
              <p className="py-12 text-center text-sm text-neutral-500">
                {activeTab === "posts" ? "No posts yet" : "No liked posts yet"}
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-1 md:gap-1.5">
                {displayedPosts.map((post) => (
                  <button
                    key={post.id}
                    className="relative aspect-square overflow-hidden rounded-sm md:rounded-md"
                    onClick={() => router.push(`/posts/${post.id}`)}
                  >
                    {post.imageUrl ? (
                      <Image
                        src={post.imageUrl}
                        alt="post"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-neutral-800" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
