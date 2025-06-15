import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

async function readJsonFile<T>(filePath: string): Promise<T> {
  const fullPath = path.join(process.cwd(), filePath)
  const fileContent = await fs.readFile(fullPath, 'utf8')
  return JSON.parse(fileContent) as T
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Read data files
    const posts = await readJsonFile<any[]>('lib/mock-data/posts.json')
    const replies = await readJsonFile<any[]>('lib/mock-data/replies.json')
    const categories = await readJsonFile<any[]>('lib/mock-data/categories.json')
    const users = await readJsonFile<any[]>('lib/mock-data/users.json')
    
    // Find user by ID
    const user = users.find(u => u.id === userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Get user's posts (assuming posts have an author field that matches display_name)
    const userPosts = posts.filter(post => post.author_name === user.display_name)
      .map(post => {
        // Find the category for this post
        const category = categories.find(c => c.id === post.category_id)
        return {
          id: post.id,
          type: 'post',
          title: post.title,
          date: new Date(post.created_at),
          category: category?.name || 'Unknown',
          postId: post.id,
          categorySlug: category?.slug || ''
        }
      })
    
    // Get user's replies
    const userReplies = replies.filter(reply => reply.author_name === user.display_name)
      .map(reply => {
        // Find the post that this reply belongs to
        const post = posts.find(p => p.id === reply.post_id)
        // Find the category for this post
        const category = post ? categories.find(c => c.id === post.category_id) : null
        
        return {
          id: reply.id,
          type: 'reply',
          postTitle: post?.title || 'Unknown Post',
          content: reply.content,
          date: new Date(reply.created_at),
          postId: reply.post_id,
          categorySlug: category?.slug || ''
        }
      })
    
    // Combine and sort by date
    const allActivity = [...userPosts, ...userReplies]
    allActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    return NextResponse.json(allActivity)
  } catch (error) {
    console.error('Error fetching user activity:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 