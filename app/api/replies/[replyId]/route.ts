import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { canDeleteReply } from '@/lib/permissions'

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

// GET - fetch a specific reply by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { replyId: string } }
) {
  try {
    // Extract replyId from params first to avoid the NextJS warning
    const { replyId } = params
    
    const replies = await readJsonFile<any[]>('lib/mock-data/replies.json')
    const reply = replies.find(r => r.id === replyId)

    if (!reply) {
      return NextResponse.json(
        { error: 'Reply not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(reply)
  } catch (error) {
    console.error('Error fetching reply:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// DELETE - delete a reply by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { replyId: string } }
) {
  try {
    // Extract replyId from params first to avoid the NextJS warning
    const { replyId } = params
    
    // Get user information from request
    const { userId } = await req.json()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Get user information
    const users = await readJsonFile<any[]>('lib/mock-data/users.json')
    const user = users.find(u => u.id === userId)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Get reply information
    const replies = await readJsonFile<any[]>('lib/mock-data/replies.json')
    const replyIndex = replies.findIndex(r => r.id === replyId)
    
    if (replyIndex === -1) {
      return NextResponse.json(
        { error: 'Reply not found' },
        { status: 404 }
      )
    }
    
    const reply = replies[replyIndex]
    
    // Check permission to delete
    if (!canDeleteReply(user, reply)) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this reply' },
        { status: 403 }
      )
    }
    
    // Get post information to update reply count
    const postId = reply.post_id
    const posts = await readJsonFile<any[]>('lib/mock-data/posts.json')
    const postIndex = posts.findIndex(p => p.id === postId)
    
    // Delete reply
    replies.splice(replyIndex, 1)
    await writeJsonFile('lib/mock-data/replies.json', replies)
    
    // Update post reply count if post exists
    if (postIndex !== -1) {
      const post = posts[postIndex]
      if (post.replies && post.replies[0] && typeof post.replies[0].count === 'number') {
        post.replies[0].count = Math.max(0, post.replies[0].count - 1)
        await writeJsonFile('lib/mock-data/posts.json', posts)
      }
    }
    
    // Update category reply count
    if (postIndex !== -1) {
      const post = posts[postIndex]
      const categories = await readJsonFile<any[]>('lib/mock-data/categories.json')
      const categoryIndex = categories.findIndex(c => c.id === post.category_id)
      
      if (categoryIndex !== -1) {
        categories[categoryIndex].reply_count = Math.max(0, categories[categoryIndex].reply_count - 1)
        await writeJsonFile('lib/mock-data/categories.json', categories)
      }
    }
    
    return NextResponse.json({ message: 'Reply deleted successfully' })
  } catch (error) {
    console.error('Error deleting reply:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 