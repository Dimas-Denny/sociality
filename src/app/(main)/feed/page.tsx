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
  const [hasRestoredPost, setHasRestoredPost] = useState(false);

  const listTopRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const postRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const getStickyOffset = () => {
    const mainNavbarHeight = 76;
    const feedTabsHeight = stickyRef.current?.offsetHeight ?? 0;
    return mainNavbarHeight + feedTabsHeight + 12;
  };

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
    const savedTab = sessionStorage.getItem("feedActiveTab");
    const queryTab = searchParams.get("tab");

    const initialTab =
      savedTab === "feed" || savedTab === "explore"
        ? savedTab
        : queryTab === "explore"
          ? "explore"
          : "feed";

    setActiveTab(initialTab);
    fetchPosts(initialTab);
  }, [searchParams]);

  useEffect(() => {
    if (loading || hasRestoredPost || posts.length === 0) return;

    const savedPostId = sessionStorage.getItem("feedLastPostId");
    const savedTab = sessionStorage.getItem("feedActiveTab");

    if (!savedPostId) return;
    if (savedTab && savedTab !== activeTab) return;

    const postId = Number(savedPostId);
    const target = postRefs.current[postId];

    if (!target) return;

    const timer = window.setTimeout(() => {
      const y =
        target.getBoundingClientRect().top + window.scrollY - getStickyOffset();

      window.scrollTo({
        top: Math.max(0, y),
        behavior: "auto",
      });

      sessionStorage.removeItem("feedLastPostId");
      sessionStorage.removeItem("feedActiveTab");
      setHasRestoredPost(true);
    }, 150);

    return () => window.clearTimeout(timer);
  }, [loading, posts, activeTab, hasRestoredPost]);

  const handleChangeTab = (tab: "feed" | "explore") => {
    setActiveTab(tab);
    setHasRestoredPost(true);
    sessionStorage.removeItem("feedLastPostId");
    sessionStorage.setItem("feedActiveTab", tab);
    fetchPosts(tab);
  };

  const handleHome = () => {
    if (listTopRef.current) {
      const y =
        listTopRef.current.getBoundingClientRect().top +
        window.scrollY -
        getStickyOffset();

      window.scrollTo({
        top: Math.max(0, y),
        behavior: "smooth",
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    fetchPosts(activeTab);
  };

  return (
    <div className="min-h-screen bg-black pb-32">
      <div ref={stickyRef} className="sticky top-[76px] z-30 px-4 pt-2 md:px-6">
        <div className="mx-auto flex w-full max-w-3xl justify-center">
          <div className="rounded-full bg-black/70 p-2 backdrop-blur-xl">
            <div className="inline-flex rounded-full border border-neutral-800 bg-neutral-900/90 p-1 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
              <button
                onClick={() => handleChangeTab("feed")}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === "feed"
                    ? "bg-violet-600 text-white shadow-lg"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
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
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                <span>⭕</span>
                <span>Explore</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-4 md:px-6">
        <div ref={listTopRef} className="w-full" />

        {loading ? (
          <div className="py-12 text-center text-sm text-neutral-500">
            Loading...
          </div>
        ) : posts.length === 0 ? (
          <div className="py-12 text-center text-sm text-neutral-500">
            {activeTab === "feed"
              ? "Follow some people to see posts"
              : "No posts available"}
          </div>
        ) : (
          <div className="flex w-full flex-col items-center gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                ref={(el) => {
                  postRefs.current[post.id] = el;
                }}
                className="w-full"
              >
                <PostCard post={post} feedTab={activeTab} />
              </div>
            ))}
          </div>
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
        <div className="flex min-h-screen items-center justify-center bg-black">
          <span className="text-sm text-neutral-500">Loading...</span>
        </div>
      }
    >
      <FeedContent />
    </Suspense>
  );
}
