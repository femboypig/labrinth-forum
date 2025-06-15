// This file contains only type definitions that can be used on both client and server
// No server-only code here

// Type definitions
export interface CategoryWithStats {
  id: string
  name: string
  slug: string
  description: string | null
  icon_name: string | null
  post_count: number
  reply_count: number
  is_moderated?: boolean // Add flag to mark categories that only allow moderator posts
}

export interface PostListItem {
  id: string
  title: string
  author_name: string
  created_at: string
  reply_count: number
  category_slug: string
  category_name: string
  is_moderated?: boolean // Add flag to identify moderated posts
}

export interface PostDetail extends PostListItem {
  content: string
  replies: Reply[]
  images?: string[] // Optional array of image URLs
}

export interface Reply {
  id: string
  author_name: string
  content: string
  created_at: string
  post_id: string
}

export interface User {
  id: string
  username: string
  email: string
  display_name: string
  avatar_url: string | null
  created_at: string
  role: 'admin' | 'moderator' | 'user'
  // Ban properties
  is_banned?: boolean
  ban_reason?: string | null
  ban_date?: string | null
  ban_end_date?: string | null
  banned_by?: string | null
  // Mute properties
  is_muted?: boolean
  mute_reason?: string | null
  mute_date?: string | null
  mute_end_date?: string | null
  muted_by?: string | null
}

export interface AuthResponse {
  user: User | null
  error: string | null
}
