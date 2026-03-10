import api from "./axios";
import { ApiPost } from "@/types";
import { Post } from "@/types/post";

function mapApiPostToPost(raw: ApiPost): Post {
  const author = raw.author ?? {
    id: 0,
    username: "",
    name: "",
    avatar_url: null,
  };

  return {
    id: Number(raw.id),
    imageUrl: raw.imageUrl ?? raw.image_url ?? null,
    caption: raw.caption ?? raw.content ?? "",
    createdAt: raw.createdAt ?? raw.created_at ?? "",
    author: {
      id: Number(author.id ?? 0),
      username: author.username ?? "",
      name: author.name ?? "",
      avatarUrl: author.avatarUrl ?? author.avatar_url ?? null,
    },
    likeCount:
      raw.likeCount ??
      raw.like_count ??
      raw.likes_count ??
      raw.counts?.likes ??
      0,
    commentCount:
      raw.commentCount ??
      raw.comment_count ??
      raw.comments_count ??
      raw.counts?.comments ??
      0,
    shareCount: raw.shareCount ?? raw.shares_count ?? raw.counts?.shares ?? 0,
    likedByMe: raw.likedByMe ?? raw.is_liked ?? false,
    savedByMe: raw.savedByMe ?? raw.is_saved ?? false,
  };
}

export const getPostsApi = async (): Promise<Post[]> => {
  const res = await api.get("/posts");

  const rawPosts =
    res.data?.data?.posts ??
    res.data?.data?.items ??
    res.data?.data ??
    res.data?.posts ??
    res.data ??
    [];

  return Array.isArray(rawPosts) ? rawPosts.map(mapApiPostToPost) : [];
};

export const getFeedApi = async (): Promise<Post[]> => {
  const res = await api.get("/feed");

  const rawPosts =
    res.data?.data?.items ??
    res.data?.data?.posts ??
    res.data?.data ??
    res.data?.items ??
    res.data?.posts ??
    res.data ??
    [];

  return Array.isArray(rawPosts) ? rawPosts.map(mapApiPostToPost) : [];
};
