import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { canCreateModeratedPost } from '@/lib/permissions'

// Helper function to read JSON files
async function readJsonFile<T>(filePath: string): Promise<T> {
  const fullPath = path.join(process.cwd(), filePath)
  const fileContent = await fs.readFile(fullPath, 'utf8')
  return JSON.parse(fileContent) as T
}

// Helper function to write JSON files
async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  const fullPath = path.join(process.cwd(), filePath)
  await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf8')
}

// GET - fetch all moderated posts
export async function GET(req: NextRequest) {
  try {
    const posts = await readJsonFile<any[]>('lib/mock-data/posts.json')
    
    // Filter posts to get only moderated ones
    const moderatedPosts = posts.filter(post => post.is_moderated === true)
    
    // Sort by creation date, newest first
    moderatedPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    return NextResponse.json({ posts: moderatedPosts })
  } catch (error) {
    console.error('Error fetching moderated posts:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// POST - create a new moderated post (only moderators and admins)
export async function POST(req: NextRequest) {
  try {
    const { title, content, categoryId, authorId } = await req.json()
    
    // Validate required fields
    if (!title || !content || !categoryId || !authorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Get user information
    const users = await readJsonFile<any[]>('lib/mock-data/users.json')
    const user = users.find(u => u.id === authorId)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if user has permission to create moderated posts
    if (!canCreateModeratedPost(user)) {
      return NextResponse.json(
        { error: 'You do not have permission to create moderated posts' },
        { status: 403 }
      )
    }
    
    // Check if user is banned or muted
    if (user.is_banned) {
      return NextResponse.json(
        { error: 'You cannot create posts while banned' },
        { status: 403 }
      )
    }
    
    if (user.is_muted) {
      return NextResponse.json(
        { error: 'You cannot create posts while muted' },
        { status: 403 }
      )
    }
    
    // Get category information
    const categories = await readJsonFile<any[]>('lib/mock-data/categories.json')
    const category = categories.find(c => c.id === categoryId)
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
    
    // Create new post
    const newPost = {
      id: uuidv4(),
      title,
      content,
      author_name: user.display_name,
      created_at: new Date().toISOString(),
      category_id: categoryId,
      category_name: category.name,
      category_slug: category.slug,
      replies: [{ count: 0 }],
      is_moderated: true // Mark as a moderated post
    }
    
    // Add post to posts collection
    const posts = await readJsonFile<any[]>('lib/mock-data/posts.json')
    posts.push(newPost)
    await writeJsonFile('lib/mock-data/posts.json', posts)
    
    // Update category post count
    const categoryIndex = categories.findIndex(c => c.id === categoryId)
    if (categoryIndex !== -1) {
      categories[categoryIndex].post_count += 1
      await writeJsonFile('lib/mock-data/categories.json', categories)
    }
    
    return NextResponse.json({
      message: 'Moderated post created successfully',
      post: newPost
    })
  } catch (error) {
    console.error('Error creating moderated post:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 