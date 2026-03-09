export interface Author {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
}

export interface Post {
  id: number;
  imageUrl: string | null;
  caption: string;
  createdAt: string;
  author: Author;
  likeCount: number;
  commentCount: number;
  shareCount?: number;
  likedByMe: boolean;
  savedByMe?: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
