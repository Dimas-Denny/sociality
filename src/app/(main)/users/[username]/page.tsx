"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api/axios";
import axios from "axios";
import postIcon from "@/assets/svg/post.svg";
import likeIcon from "@/assets/svg/like.svg";
import likedIcon from "@/assets/svg/like2.svg";
import shareIcon from "@/assets/svg/share.svg";
import FollowersModal from "@/components/layout/FollowersModal";
import FollowingModal from "@/components/layout/FollowingModal";

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

function isValidImageSrc(src?: string | null): src is string {
  if (!src) return false;
  if (src === "string") return false;

  return (
    src.startsWith("/") ||
    src.startsWith("http://") ||
    src.startsWith("https://")
  );
}

function AvatarFallback({
  name,
  avatarUrl,
  size = 80,
}: {
  name: string;
  avatarUrl?: string | null;
  size?: number;
}) {
  if (isValidImageSrc(avatarUrl)) {
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
  if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (n >= 1_000) {
    return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
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
  const [loadingLiked, setLoadingLiked] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasRestoredScroll, setHasRestoredScroll] = useState(false);

  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  useEffect(() => {
    const savedTab = sessionStorage.getItem("userProfileActiveTab");
    if (savedTab === "posts" || savedTab === "liked") {
      setActiveTab(savedTab);
    }
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const [profileRes, postsRes] = await Promise.all([
          api.get(`/users/${username}`),
          api.get(`/users/${username}/posts`),
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
          postsRes.data?.data?.posts ??
          postsRes.data?.data?.items ??
          postsRes.data?.posts ??
          postsRes.data?.data ??
          [];

        setPosts(Array.isArray(postsData) ? postsData : []);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Profile error:", error.response?.data);
        } else {
          console.error("Profile error:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [username]);

  useEffect(() => {
    const savedTab = sessionStorage.getItem("userProfileActiveTab");

    if (savedTab === "liked" && likedPosts.length === 0 && !loadingLiked) {
      fetchLikedPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingLiked, likedPosts.length]);

  useEffect(() => {
    if (loading || hasRestoredScroll) return;

    const savedScrollY = sessionStorage.getItem("userProfilePostScrollY");
    const savedTab = sessionStorage.getItem("userProfileActiveTab");

    if (!savedScrollY) return;
    if (savedTab === "liked" && loadingLiked) return;

    const y = Number(savedScrollY);

    const timer = window.setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, y);
          sessionStorage.removeItem("userProfilePostScrollY");
          sessionStorage.removeItem("userProfileActiveTab");
          setHasRestoredScroll(true);
        });
      });
    }, 150);

    return () => window.clearTimeout(timer);
  }, [
    loading,
    loadingLiked,
    hasRestoredScroll,
    activeTab,
    posts.length,
    likedPosts.length,
  ]);

  const fetchLikedPosts = async () => {
    try {
      setLoadingLiked(true);

      const likedRes = await api.get(`/users/${username}/likes`);
      const likedData =
        likedRes.data?.data?.posts ??
        likedRes.data?.data?.items ??
        likedRes.data?.posts ??
        likedRes.data?.data ??
        [];

      setLikedPosts(Array.isArray(likedData) ? likedData : []);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Liked posts error:", error.response?.data);
      } else {
        console.error("Liked posts error:", error);
      }
      setLikedPosts([]);
    } finally {
      setLoadingLiked(false);
    }
  };

  const handleTabChange = (tab: "posts" | "liked") => {
    setActiveTab(tab);

    if (tab === "liked" && likedPosts.length === 0) {
      fetchLikedPosts();
    }
  };

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
      } else {
        console.error("Follow error:", error);
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

  const handleOpenPost = (postId: number) => {
    sessionStorage.setItem("userProfilePostScrollY", String(window.scrollY));
    sessionStorage.setItem("userProfileActiveTab", activeTab);
    router.push(`/posts/${postId}`, { scroll: false });
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
      <div className="sticky top-0 z-20 mt-4 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-5xl px-4 md:px-6 lg:px-8">
          <div className="flex h-14 items-center md:mx-auto md:max-w-3xl">
            <button
              onClick={() => router.back()}
              className="group inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm font-medium text-white transition-all hover:border-neutral-700 hover:bg-neutral-900"
              aria-label="Go back"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
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
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 pt-5 md:px-6 lg:px-8">
        <div className="md:mx-auto md:max-w-3xl">
          <div className="space-y-4 md:space-y-6">
            <div className="space-y-4 md:hidden">
              <div className="flex items-center gap-3">
                <AvatarFallback
                  name={profile.name}
                  avatarUrl={profile.avatarUrl}
                  size={56}
                />
                <div className="flex flex-col">
                  <span className="text-base font-bold leading-tight text-white">
                    {profile.name}
                  </span>
                  <span className="text-sm text-neutral-500">
                    @{profile.username}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!isMe && (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
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

                <button
                  onClick={handleShare}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 transition-colors hover:bg-neutral-800"
                >
                  <Image src={shareIcon} alt="Share" width={18} height={18} />
                  {copied && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-neutral-800 px-2 py-1 text-xs text-white">
                      Link copied!
                    </span>
                  )}
                </button>
              </div>

              <p className="text-sm leading-relaxed text-neutral-300">
                {profile.bio && profile.bio.trim() !== ""
                  ? profile.bio
                  : "No bio yet."}
              </p>
            </div>

            <div className="hidden md:flex md:items-start md:justify-between md:gap-6">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <AvatarFallback
                  name={profile.name}
                  avatarUrl={profile.avatarUrl}
                  size={64}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-lg font-bold leading-tight text-white">
                        {profile.name}
                      </p>
                      <p className="text-sm text-neutral-500">
                        @{profile.username}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-neutral-300">
                    {profile.bio && profile.bio.trim() !== ""
                      ? profile.bio
                      : "No bio yet."}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {!isMe && (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
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

                <button
                  onClick={handleShare}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 transition-colors hover:bg-neutral-800"
                >
                  <Image src={shareIcon} alt="Share" width={18} height={18} />
                  {copied && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-neutral-800 px-2 py-1 text-xs text-white">
                      Link copied!
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 divide-x divide-neutral-800 py-1 text-center">
              <div className="flex flex-col items-center gap-0.5 px-2">
                <span className="text-base font-bold text-white md:text-lg">
                  {formatCount(profile.postCount ?? 0)}
                </span>
                <span className="text-xs text-neutral-500">Post</span>
              </div>

              <button
                onClick={() => setShowFollowersModal(true)}
                className="flex flex-col items-center gap-0.5 px-2 transition-opacity hover:opacity-80"
              >
                <span className="text-base font-bold text-white md:text-lg">
                  {formatCount(profile.followerCount ?? 0)}
                </span>
                <span className="text-xs text-neutral-500">Followers</span>
              </button>

              <button
                onClick={() => setShowFollowingModal(true)}
                className="flex flex-col items-center gap-0.5 px-2 transition-opacity hover:opacity-80"
              >
                <span className="text-base font-bold text-white md:text-lg">
                  {formatCount(profile.followingCount ?? 0)}
                </span>
                <span className="text-xs text-neutral-500">Following</span>
              </button>

              <div className="flex flex-col items-center gap-0.5 px-2">
                <span className="text-base font-bold text-white md:text-lg">
                  {formatCount(profile.likeCount ?? 0)}
                </span>
                <span className="text-xs text-neutral-500">Likes</span>
              </div>
            </div>

            <div className="flex border-b border-neutral-800">
              <button
                onClick={() => handleTabChange("posts")}
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
                onClick={() => handleTabChange("liked")}
                className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors ${
                  activeTab === "liked"
                    ? "border-white text-white"
                    : "border-transparent text-neutral-500 hover:text-neutral-300"
                }`}
              >
                <Image
                  src={activeTab === "liked" ? likedIcon : likeIcon}
                  alt="liked"
                  width={18}
                  height={18}
                />
                Liked
              </button>
            </div>

            <div className="pt-4">
              {activeTab === "liked" && loadingLiked ? (
                <p className="py-12 text-center text-sm text-neutral-500">
                  Loading...
                </p>
              ) : displayedPosts.length === 0 ? (
                <p className="py-12 text-center text-sm text-neutral-500">
                  {activeTab === "posts"
                    ? "No posts yet"
                    : "No liked posts yet"}
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-1 md:gap-1.5">
                  {displayedPosts.map((post) => (
                    <button
                      key={post.id}
                      className="relative aspect-square overflow-hidden rounded-sm md:rounded-md"
                      onClick={() => handleOpenPost(post.id)}
                    >
                      {isValidImageSrc(post.imageUrl) ? (
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

      {showFollowersModal && profile?.username && (
        <FollowersModal
          username={profile.username}
          onClose={() => setShowFollowersModal(false)}
        />
      )}

      {showFollowingModal && profile?.username && (
        <FollowingModal
          username={profile.username}
          onClose={() => setShowFollowingModal(false)}
        />
      )}
    </div>
  );
}
