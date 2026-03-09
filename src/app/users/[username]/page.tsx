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
    <div className="w-20 h-20 rounded-full bg-neutral-700 flex items-center justify-center text-white text-2xl font-bold">
      {name?.charAt(0).toUpperCase() ?? "?"}
    </div>
  );
}

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();

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
        if (axios.isAxiosError(error))
          console.error("Profile error:", error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [username]);

  const handleFollow = async () => {
    if (!profile) return;
    try {
      setFollowLoading(true);
      if (profile.followedByMe) {
        await api.delete(`/follow/${username}`);
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                followedByMe: false,
                followerCount: prev.followerCount - 1,
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
      if (axios.isAxiosError(error))
        console.error("Follow error:", error.response?.data);
    } finally {
      setFollowLoading(false);
    }
  };

  const displayedPosts = activeTab === "posts" ? posts : likedPosts;

  if (loading) {
    return (
      <div className="bg-neutral-950 min-h-screen flex items-center justify-center">
        <p className="text-neutral-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-neutral-950 min-h-screen flex items-center justify-center">
        <p className="text-neutral-500 text-sm">User not found</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4">
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
        <h1 className="text-white font-semibold text-lg">{profile.username}</h1>
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-4 mb-5">
          <AvatarFallback name={profile.name} avatarUrl={profile.avatarUrl} />
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-lg leading-tight">
              {profile.name}
            </p>
            <p className="text-neutral-500 text-sm">@{profile.username}</p>
            {profile.bio && (
              <p className="text-neutral-400 text-sm mt-1">{profile.bio}</p>
            )}
          </div>
          <button
            onClick={handleFollow}
            disabled={followLoading}
            className={`shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 ${
              profile.followedByMe
                ? "border border-neutral-600 text-neutral-300 hover:bg-neutral-800"
                : "bg-violet-600 hover:bg-violet-500 text-white"
            }`}
          >
            {followLoading
              ? "..."
              : profile.followedByMe
                ? "Following"
                : "Follow"}
          </button>
        </div>

        {/* Stats — 4 kolom rata */}
        <div className="grid grid-cols-4 text-center divide-x divide-neutral-800 bg-neutral-900 rounded-2xl py-3">
          {[
            { label: "Posts", value: profile.postCount ?? 0 },
            { label: "Followers", value: profile.followerCount ?? 0 },
            { label: "Following", value: profile.followingCount ?? 0 },
            { label: "Likes", value: profile.likeCount ?? 0 },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-0.5">
              <p className="text-white font-bold text-base">{stat.value}</p>
              <p className="text-neutral-500 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs — 50/50 */}
      <div className="flex border-b border-neutral-800">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
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
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "liked"
              ? "border-violet-500 text-white"
              : "border-transparent text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <Image src={savedActiveIcon} alt="liked" width={18} height={18} />
          Liked
        </button>
      </div>

      {/* Posts Grid */}
      <div className="p-0.5">
        {displayedPosts.length === 0 ? (
          <p className="text-neutral-500 text-sm text-center py-12">
            {activeTab === "posts" ? "No posts yet" : "No liked posts yet"}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-0.5">
            {displayedPosts.map((post) => (
              <div
                key={post.id}
                className="aspect-square relative cursor-pointer"
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
                  <div className="w-full h-full bg-neutral-800" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
