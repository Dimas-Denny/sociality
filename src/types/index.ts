export interface User {
  id: string;
  username: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_following?: boolean;
  is_me?: boolean;
}

export interface Post {
  id: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  author: User;
  likes_count: number;
  comments_count: number;
  saves_count: number;
  is_liked?: boolean;
  is_saved?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface AuthUser extends User {
  email: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
