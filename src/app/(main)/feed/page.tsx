"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import PostCard from "@/components/layout/PostCard";
import BottomBar from "@/components/layout/BottomBar";
import { Post } from "@/types/post";
import { getFeedApi, getPostsApi } from "@/lib/api/posts";

function FeedContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"feed" | "explore">("feed");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const topRef = useRef<HTMLDivElement>(null);

  const fetchPosts = async (tab: "feed" | "explore") => {
    try {
      setLoading(true);
      const data = tab === "feed" ? await getFeedApi() : await getPostsApi();
      setPosts(data);
    } catch (error) {
      console.error(`${tab} error:`, error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const tab = searchParams.get("tab");
    const initialTab = tab === "explore" ? "explore" : "feed";
    setActiveTab(initialTab);
    fetchPosts(initialTab);
  }, [searchParams]);

  const handleChangeTab = (tab: "feed" | "explore") => {
    setActiveTab(tab);
    fetchPosts(tab);
  };

  const handleHome = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
    fetchPosts(activeTab);
  };

  return (
    <div className="bg-black min-h-screen pb-32">
      <div ref={topRef} />

      <div className="px-6 pt-4 pb-2">
        <div className="inline-flex rounded-full bg-neutral-900 p-1">
          <button
            onClick={() => handleChangeTab("feed")}
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
            onClick={() => handleChangeTab("explore")}
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

      <BottomBar onHome={handleHome} />
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-black min-h-screen flex items-center justify-center">
          <span className="text-neutral-500 text-sm">Loading...</span>
        </div>
      }
    >
      <FeedContent />
    </Suspense>
  );
}
