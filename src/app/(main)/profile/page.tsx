"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api/axios";
import BottomBar from "@/components/layout/BottomBar";
import savedIcon from "@/assets/svg/saved.svg";
import savedActiveIcon from "@/assets/svg/saved2.svg";
import likeIcon from "@/assets/svg/like.svg";
import likedIcon from "@/assets/svg/like2.svg";
import shareIcon from "@/assets/svg/share.svg";
import postIcon from "@/assets/svg/post.svg";

type ProfileData = {
  id: number;
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  postCount: number;
  followerCount: number;
  followingCount: number;
  likeCount: number;
};

type Post = {
  id: number;
  imageUrl: string;
};

function formatCount(n: number): string {
  if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }

  if (n >= 1_000) {
    return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }

  return String(n);
}

function isValidImageSrc(src?: string | null): src is string {
  if (!src) return false;
  if (src === "string") return false;

  return (
    src.startsWith("/") ||
    src.startsWith("http://") ||
    src.startsWith("https://")
  );
}

function Avatar({
  url,
  name,
  size,
}: {
  url: string | null;
  name?: string;
  size: number;
}) {
  if (isValidImageSrc(url)) {
    return (
      <Image
        src={url}
        alt="avatar"
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-neutral-700 font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {name?.charAt(0).toUpperCase() ?? "?"}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "saved" | "liked">(
    "posts",
  );
  const [loading, setLoading] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [loadingLiked, setLoadingLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const postRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const hasRestoredRef = useRef(false);

  useEffect(() => {
    const savedTab = sessionStorage.getItem("profileActiveTab");

    if (savedTab === "posts" || savedTab === "saved" || savedTab === "liked") {
      setActiveTab(savedTab);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const savedTab = sessionStorage.getItem("profileActiveTab");

    if (savedTab === "saved" && savedPosts.length === 0 && !loadingSaved) {
      fetchSavedPosts();
    }

    if (savedTab === "liked" && likedPosts.length === 0 && !loadingLiked) {
      fetchLikedPosts();
    }
  }, [loadingSaved, loadingLiked, savedPosts.length, likedPosts.length]);

  useEffect(() => {
    if (loading || hasRestoredRef.current) return;
    if (activeTab === "saved" && loadingSaved) return;
    if (activeTab === "liked" && loadingLiked) return;

    const savedPostId = sessionStorage.getItem("profileLastPostId");
    const savedTab = sessionStorage.getItem("profileActiveTab");

    if (!savedPostId) return;
    if (savedTab && savedTab !== activeTab) return;

    const postId = Number(savedPostId);
    const el = postRefs.current[postId];

    if (!el) return;

    const timer = window.setTimeout(() => {
      el.scrollIntoView({
        block: "center",
        inline: "nearest",
        behavior: "auto",
      });

      sessionStorage.removeItem("profileLastPostId");
      sessionStorage.removeItem("profileActiveTab");
      hasRestoredRef.current = true;
    }, 150);

    return () => window.clearTimeout(timer);
  }, [
    loading,
    loadingSaved,
    loadingLiked,
    activeTab,
    posts.length,
    savedPosts.length,
    likedPosts.length,
  ]);

  const fetchAll = async () => {
    try {
      const [profileRes, postsRes] = await Promise.all([
        api.get("/me"),
        api.get("/me/posts").catch(() => ({ data: null })),
      ]);

      const raw = profileRes.data?.data;

      setProfile({
        ...raw.profile,
        postCount: raw.stats?.posts ?? 0,
        followerCount: raw.stats?.followers ?? 0,
        followingCount: raw.stats?.following ?? 0,
        likeCount: raw.stats?.likes ?? 0,
      });

      const postsData =
        postsRes.data?.data?.items ??
        postsRes.data?.data?.posts ??
        postsRes.data?.data ??
        [];

      setPosts(Array.isArray(postsData) ? postsData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedPosts = async () => {
    try {
      setLoadingSaved(true);

      const res = await api.get("/me/saved");
      const data =
        res.data?.data?.posts ??
        res.data?.data?.saved ??
        res.data?.data ??
        res.data ??
        [];

      setSavedPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch saved error:", err);
      setSavedPosts([]);
    } finally {
      setLoadingSaved(false);
    }
  };

  const fetchLikedPosts = async () => {
    try {
      setLoadingLiked(true);

      const res = await api.get("/me/likes");
      const data =
        res.data?.data?.posts ??
        res.data?.data?.likes ??
        res.data?.data?.liked ??
        res.data?.data ??
        res.data ??
        [];

      setLikedPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch liked posts error:", err);
      setLikedPosts([]);
    } finally {
      setLoadingLiked(false);
    }
  };

  const handleTabChange = (tab: "posts" | "saved" | "liked") => {
    setActiveTab(tab);

    if (tab === "saved" && savedPosts.length === 0) {
      fetchSavedPosts();
    }

    if (tab === "liked" && likedPosts.length === 0) {
      fetchLikedPosts();
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/users/${profile?.username}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("input");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenPost = (postId: number) => {
    sessionStorage.setItem("profileLastPostId", String(postId));
    sessionStorage.setItem("profileActiveTab", activeTab);
    router.push(`/posts/${postId}`, { scroll: false });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <span className="text-sm text-neutral-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-32 md:pb-16">
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
                <Avatar
                  url={profile?.avatarUrl ?? null}
                  name={profile?.name}
                  size={56}
                />
                <div className="flex flex-col">
                  <span className="text-base font-bold leading-tight text-white">
                    {profile?.name}
                  </span>
                  <span className="text-sm text-neutral-500">
                    @{profile?.username}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/profile/edit")}
                  className="flex-1 rounded-full border border-neutral-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
                >
                  Edit Profile
                </button>

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
                {profile?.bio && profile.bio.trim() !== ""
                  ? profile.bio
                  : "No bio yet. Tap Edit Profile to add one ✨"}
              </p>
            </div>

            <div className="hidden md:flex md:items-start md:justify-between md:gap-6">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <Avatar
                  url={profile?.avatarUrl ?? null}
                  name={profile?.name}
                  size={64}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-lg font-bold leading-tight text-white">
                        {profile?.name}
                      </p>
                      <p className="text-sm text-neutral-500">
                        @{profile?.username}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-neutral-300">
                    {profile?.bio && profile.bio.trim() !== ""
                      ? profile.bio
                      : "No bio yet. Tap Edit Profile to add one ✨"}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <button
                  onClick={() => router.push("/profile/edit")}
                  className="rounded-full border border-neutral-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
                >
                  Edit Profile
                </button>

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
              {[
                { label: "Post", value: profile?.postCount ?? 0 },
                { label: "Followers", value: profile?.followerCount ?? 0 },
                { label: "Following", value: profile?.followingCount ?? 0 },
                { label: "Likes", value: profile?.likeCount ?? 0 },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center gap-0.5 px-2"
                >
                  <span className="text-base font-bold text-white md:text-lg">
                    {formatCount(stat.value)}
                  </span>
                  <span className="text-xs text-neutral-500">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="flex border-b border-neutral-800">
              <button
                onClick={() => handleTabChange("posts")}
                className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors ${
                  activeTab === "posts"
                    ? "border-white text-white"
                    : "border-transparent text-neutral-500"
                }`}
              >
                <Image src={postIcon} alt="Posts" width={18} height={18} />
                Gallery
              </button>

              <button
                onClick={() => handleTabChange("saved")}
                className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors ${
                  activeTab === "saved"
                    ? "border-white text-white"
                    : "border-transparent text-neutral-500"
                }`}
              >
                <Image
                  src={activeTab === "saved" ? savedActiveIcon : savedIcon}
                  alt="Saved"
                  width={18}
                  height={18}
                />
                Saved
              </button>

              <button
                onClick={() => handleTabChange("liked")}
                className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors ${
                  activeTab === "liked"
                    ? "border-white text-white"
                    : "border-transparent text-neutral-500"
                }`}
              >
                <Image
                  src={activeTab === "liked" ? likedIcon : likeIcon}
                  alt="Like"
                  width={18}
                  height={18}
                />
                Like
              </button>
            </div>

            {activeTab === "posts" && (
              <>
                {posts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                    <p className="text-xl font-bold text-white">
                      Your story starts here
                    </p>
                    <p className="max-w-xs text-sm leading-relaxed text-neutral-500">
                      Share your first post and let the world see your moments,
                      passions, and memories.
                    </p>
                    <button
                      onClick={() => router.push("/add-post")}
                      className="mt-2 rounded-full bg-violet-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-violet-500"
                    >
                      Upload My First Post
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1 md:gap-1.5">
                    {posts.map((post) => (
                      <button
                        key={post.id}
                        ref={(el) => {
                          postRefs.current[post.id] = el;
                        }}
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
              </>
            )}

            {activeTab === "saved" && (
              <>
                {loadingSaved ? (
                  <div className="py-12 text-center text-sm text-neutral-500">
                    Loading...
                  </div>
                ) : savedPosts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                    <p className="text-lg font-bold text-white">
                      No saved posts yet
                    </p>
                    <p className="max-w-xs text-sm text-neutral-500">
                      Tap the bookmark icon on any post to save it here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1 md:gap-1.5">
                    {savedPosts.map((post) => (
                      <button
                        key={post.id}
                        ref={(el) => {
                          postRefs.current[post.id] = el;
                        }}
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
              </>
            )}

            {activeTab === "liked" && (
              <>
                {loadingLiked ? (
                  <div className="py-12 text-center text-sm text-neutral-500">
                    Loading...
                  </div>
                ) : likedPosts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                    <p className="text-lg font-bold text-white">
                      No liked posts yet
                    </p>
                    <p className="max-w-xs text-sm text-neutral-500">
                      Tap the like icon on any post to see it here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1 md:gap-1.5">
                    {likedPosts.map((post) => (
                      <button
                        key={post.id}
                        ref={(el) => {
                          postRefs.current[post.id] = el;
                        }}
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
              </>
            )}
          </div>
        </div>
      </div>

      <BottomBar />
    </div>
  );
}
