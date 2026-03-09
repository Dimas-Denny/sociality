"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import PostCard from "@/components/layout/PostCard";
import BottomBar from "@/components/layout/BottomBar";
import { Post } from "@/types/post";
import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://be-social-media-api-production.up.railway.app";

export default function FeedPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"feed" | "explore">("feed");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const topRef = useRef<HTMLDivElement>(null);

  const fetchPosts = async (tab: "feed" | "explore") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const endpoint =
        tab === "feed" ? `${API_BASE}/api/feed` : `${API_BASE}/api/posts`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data =
        tab === "feed"
          ? response.data?.data?.items || []
          : response.data?.data?.posts || [];

      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          `${tab} error:`,
          error.response?.status,
          error.response?.data,
        );
      } else {
        console.error(`${tab} error:`, error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const tab = searchParams.get("tab") as "feed" | "explore" | null;
    const initialTab = tab === "explore" ? "explore" : "feed";
    setActiveTab(initialTab);
    fetchPosts(initialTab);
  }, [searchParams]);

  // Scroll ke atas + refresh
  const handleHome = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
    fetchPosts(activeTab);
  };

  return (
    <div className="bg-black min-h-screen pb-32">
      <div ref={topRef} />

      {/* Tab */}
      <div className="px-6 pt-4 pb-2">
        <div className="inline-flex rounded-full bg-neutral-900 p-1">
          <button
            onClick={() => {
              setActiveTab("feed");
              fetchPosts("feed");
            }}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "feed"
                ? "bg-violet-600 text-white shadow-lg"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            <span>🏠</span>
            <span>Feed</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("explore");
              fetchPosts("explore");
            }}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "explore"
                ? "bg-violet-600 text-white shadow-lg"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            <span>⭕</span>
            <span>Explore</span>
          </button>
        </div>
      </div>

      {/* Posts */}
      <div className="px-6 py-4 space-y-4">
        {loading ? (
          <div className="text-neutral-500 text-center py-12 text-sm">
            Loading...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-neutral-500 text-center py-12 text-sm">
            {activeTab === "feed"
              ? "Follow some people to see posts"
              : "No posts available"}
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>

      {/* Bottom Bar */}
      <BottomBar onHome={handleHome} />
    </div>
  );
}
