// Client-side database access for React client components
// This is a simplified version of the database access for client components

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { CategoryWithStats, PostDetail, PostListItem, Reply } from './data'

// Create a Supabase client
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.com'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'example-key'
  return createSupabaseClient(supabaseUrl, supabaseKey)
}

// Mock data for client-side usage
// In a real app, this would fetch from Supabase or another API
export async function getCategories(): Promise<CategoryWithStats[]> {
  try {
    const response = await fetch('/api/categories')
    if (!response.ok) throw new Error('Failed to fetch categories')
    return await response.json()
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function getCategoryBySlug(slug: string): Promise<CategoryWithStats | null> {
  try {
    const response = await fetch(`/api/categories/${slug}`)
    if (!response.ok) throw new Error('Failed to fetch category')
    return await response.json()
  } catch (error) {
    console.error(`Error fetching category ${slug}:`, error)
    return null
  }
}

export async function getPostsByCategory(categoryId: string): Promise<PostListItem[]> {
  try {
    const response = await fetch(`/api/categories/posts/${categoryId}`)
    if (!response.ok) throw new Error('Failed to fetch posts')
    return await response.json()
  } catch (error) {
    console.error(`Error fetching posts for category ${categoryId}:`, error)
    return []
  }
}

export async function getPostDetails(postId: string): Promise<PostDetail | null> {
  try {
    const response = await fetch(`/api/posts/${postId}`)
    if (!response.ok) throw new Error('Failed to fetch post details')
    return await response.json()
  } catch (error) {
    console.error(`Error fetching post ${postId}:`, error)
    return null
  }
}

// Function to get image URL with proper path
export function getImageUrl(imagePath: string): string {
  // If the path already starts with http or https, it's an external URL
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  
  // If the path starts with a slash, it's a local path
  if (imagePath.startsWith('/')) {
    // In development, use the local path
    if (process.env.NODE_ENV === 'development') {
      return imagePath
    }
    // In production, use the domain
    return `${process.env.NEXT_PUBLIC_SITE_URL || ''}${imagePath}`
  }
  
  // Default case
  return `/uploads/${imagePath}`
} 