export interface ApiUser {
  id?: number | string;
  username?: string;
  name?: string;
  avatar_url?: string | null;
  avatarUrl?: string | null;
}

export interface ApiPost {
  id: number | string;
  imageUrl?: string | null;
  image_url?: string | null;
  caption?: string;
  content?: string;
  createdAt?: string;
  created_at?: string;

  author?: ApiUser;

  likeCount?: number;
  like_count?: number;
  likes_count?: number;

  commentCount?: number;
  comment_count?: number;
  comments_count?: number;

  shareCount?: number;
  shares_count?: number;

  likedByMe?: boolean;
  is_liked?: boolean;

  savedByMe?: boolean;
  is_saved?: boolean;

  counts?: {
    likes?: number;
    comments?: number;
    shares?: number;
  };
}

export interface ApiComment {
  id: string | number;
  content?: string | null;
  text?: string | null;
  body?: string | null;
  created_at?: string;
  createdAt?: string;
  author: ApiUser;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
