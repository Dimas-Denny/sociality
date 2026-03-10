"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api/axios";
import axios from "axios";
import postIcon from "@/assets/svg/post.svg";
import savedActiveIcon from "@/assets/svg/saved2.svg";

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
}: {
  name: string;
  avatarUrl?: string | null;
}) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        width={80}
        height={80}
        className="rounded-full object-cover"
        style={{ width: 80, height: 80 }}
      />
    );
  }

  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-700 text-2xl font-bold text-white">
      {name?.charAt(0).toUpperCase() ?? "?"}
    </div>
  );
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
    <div className="min-h-screen bg-neutral-950">
      <div className="flex items-center gap-4 px-6 py-4">
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

        <h1 className="text-lg font-semibold text-white">{profile.username}</h1>
      </div>

      <div className="px-6 pb-4">
        <div className="mb-5 flex items-center gap-4">
          <AvatarFallback name={profile.name} avatarUrl={profile.avatarUrl} />

          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold leading-tight text-white">
              {profile.name}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-sm text-neutral-500">@{profile.username}</p>
              {isMe && (
                <span className="rounded-full border border-violet-500/40 bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-300">
                  You
                </span>
              )}
            </div>

            {profile.bio && (
              <p className="mt-1 text-sm text-neutral-400">{profile.bio}</p>
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
              <p className="text-base font-bold text-white">{stat.value}</p>
              <p className="text-xs text-neutral-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex border-b border-neutral-800">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors ${
            activeTab === "posts"
              ? "border-violet-500 text-white"
              : "border-transparent text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <Image src={postIcon} alt="posts" width={18} height={18} />
          Posts
        </button>

        <button
          onClick={() => setActiveTab("liked")}
          className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors ${
            activeTab === "liked"
              ? "border-violet-500 text-white"
              : "border-transparent text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <Image src={savedActiveIcon} alt="liked" width={18} height={18} />
          Liked
        </button>
      </div>

      <div className="p-0.5">
        {displayedPosts.length === 0 ? (
          <p className="py-12 text-center text-sm text-neutral-500">
            {activeTab === "posts" ? "No posts yet" : "No liked posts yet"}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-0.5">
            {displayedPosts.map((post) => (
              <div
                key={post.id}
                className="relative aspect-square cursor-pointer"
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
