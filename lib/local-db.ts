// This file should only be imported from server components or API routes
import "server-only";
import fs from 'fs'
import path from 'path'
import { CategoryWithStats, PostListItem, PostDetail, Reply } from './data'

// Helper function to read JSON files
function readJsonFile<T>(filePath: string): T {
  try {
    const fullPath = path.join(process.cwd(), filePath)
    const fileContent = fs.readFileSync(fullPath, 'utf8')
    return JSON.parse(fileContent) as T
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error)
    throw new Error(`Failed to read data from ${filePath}`)
  }
}

// Local database client with methods that match our data requirements
export const localDb = {
  // Categories
  getCategories: (): CategoryWithStats[] => {
    return readJsonFile<CategoryWithStats[]>('lib/mock-data/categories.json')
  },
  
  getCategoryBySlug: (slug: string): CategoryWithStats | null => {
    const categories = readJsonFile<CategoryWithStats[]>('lib/mock-data/categories.json')
    return categories.find(category => category.slug === slug) || null
  },
  
  // Posts
  getPostsForCategory: (categoryId: string): PostListItem[] => {
    const posts = readJsonFile<any[]>('lib/mock-data/posts.json')
    const categories = readJsonFile<any[]>('lib/mock-data/categories.json')
    const replies = readJsonFile<Reply[]>('lib/mock-data/replies.json')
    
    const category = categories.find(cat => cat.id === categoryId)
    if (!category) return []
    
    return posts
      .filter(post => post.category_id === categoryId)
      .map(post => {
        const postReplies = replies.filter(reply => reply.post_id === post.id)
        return {
          id: post.id,
          title: post.title,
          author_name: post.author_name,
          created_at: post.created_at,
          reply_count: postReplies.length,
          category_slug: category.slug,
          category_name: category.name,
        }
      })
  },
  
  // Post details with replies
  getPostById: (postId: string): PostDetail | null => {
    const posts = readJsonFile<any[]>('lib/mock-data/posts.json')
    const post = posts.find(p => p.id === postId)
    
    if (!post) return null
    
    const replies = readJsonFile<Reply[]>('lib/mock-data/replies.json')
    const postReplies = replies.filter(reply => reply.post_id === postId)
    
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      author_name: post.author_name,
      created_at: post.created_at,
      category_slug: post.categories.slug,
      category_name: post.categories.name,
      replies: postReplies,
      reply_count: postReplies.length,
    }
  }
} 