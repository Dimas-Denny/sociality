"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import api from "@/lib/api/axios";
import BottomBar from "@/components/layout/BottomBar";
import galleryIcon from "@/assets/svg/gallery.svg";
import savedIcon from "@/assets/svg/saved.svg";
import shareIcon from "@/assets/svg/share.svg";

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

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<"gallery" | "saved">("gallery");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAll = async () => {
    try {
      const [profileRes, postsRes] = await Promise.all([
        api.get("/me"),
        api.get("/me/posts").catch(() => ({ data: null })),
      ]);
      const profileData = profileRes.data?.data ?? profileRes.data;
      setProfile(profileData);

      const postsData =
        postsRes.data?.data?.posts ??
        postsRes.data?.data ??
        postsRes.data ??
        [];
      setPosts(Array.isArray(postsData) ? postsData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/profile/${profile?.username}`;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <span className="text-neutral-500 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-32">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white"
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
          <span className="font-semibold text-base">{profile?.name}</span>
        </button>
        {profile?.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt="avatar"
            width={36}
            height={36}
            className="rounded-full object-cover"
            style={{ width: 36, height: 36 }}
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-neutral-700 flex items-center justify-center text-white text-sm font-bold">
            {profile?.name?.charAt(0).toUpperCase() ?? "?"}
          </div>
        )}
      </div>

      <div className="px-4 space-y-4">
        {/* Avatar besar + Name */}
        <div className="flex items-center gap-4">
          {profile?.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt="avatar"
              width={64}
              height={64}
              className="rounded-full object-cover shrink-0"
              style={{ width: 64, height: 64 }}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-neutral-700 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {profile?.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
          )}
          <div>
            <p className="text-white font-bold text-base">{profile?.name}</p>
            <p className="text-neutral-500 text-sm">@{profile?.username}</p>
          </div>
        </div>

        {/* Edit Profile + Share */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/profile/edit")}
            className="flex-1 border border-neutral-700 text-white text-sm font-semibold py-2.5 rounded-full hover:bg-neutral-800 transition-colors"
          >
            Edit Profile
          </button>
          <button
            onClick={handleShare}
            className="relative w-10 h-10 flex items-center justify-center border border-neutral-700 rounded-full hover:bg-neutral-800 transition-colors"
          >
            <Image src={shareIcon} alt="Share" width={18} height={18} />
            {copied && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                Link copied!
              </span>
            )}
          </button>
        </div>

        {/* Bio */}
        <p className="text-neutral-300 text-sm leading-relaxed">
          {profile?.bio && profile.bio.trim() !== ""
            ? profile.bio
            : "No bio yet. Tap Edit Profile to add one ✨"}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-center py-1">
          {[
            { label: "Post", value: profile?.postCount ?? 0 },
            { label: "Followers", value: profile?.followerCount ?? 0 },
            { label: "Following", value: profile?.followingCount ?? 0 },
            { label: "Likes", value: profile?.likeCount ?? 0 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-0.5"
            >
              <span className="text-white font-bold text-base">
                {stat.value}
              </span>
              <span className="text-neutral-500 text-xs">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800">
          <button
            onClick={() => setActiveTab("gallery")}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "gallery"
                ? "border-white text-white"
                : "border-transparent text-neutral-500"
            }`}
          >
            <Image src={galleryIcon} alt="Gallery" width={18} height={18} />
            Gallery
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "saved"
                ? "border-white text-white"
                : "border-transparent text-neutral-500"
            }`}
          >
            <Image src={savedIcon} alt="Saved" width={18} height={18} />
            Saved
          </button>
        </div>

        {/* Gallery Content */}
        {activeTab === "gallery" && (
          <>
            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <p className="text-white font-bold text-xl">
                  Your story starts here
                </p>
                <p className="text-neutral-500 text-sm leading-relaxed max-w-xs">
                  Share your first post and let the world see your moments,
                  passions, and memories. Make this space truly yours.
                </p>
                <button
                  onClick={() => router.push("/add-post")}
                  className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-3 rounded-full transition-colors mt-2"
                >
                  Upload My First Post
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="aspect-square relative rounded-sm overflow-hidden"
                  >
                    <Image
                      src={post.imageUrl}
                      alt="post"
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Saved Content */}
        {activeTab === "saved" && (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-neutral-500 text-sm">No saved posts yet</p>
          </div>
        )}
      </div>

      <BottomBar />
    </div>
  );
}
