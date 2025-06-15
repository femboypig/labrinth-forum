import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { canDeletePost } from '@/lib/permissions';
import { getPostDetails } from '@/lib/server-data';

// Helper function to read JSON files
async function readJsonFile<T>(filePath: string): Promise<T> {
  const fullPath = path.join(process.cwd(), filePath);
  const fileContent = await fs.readFile(fullPath, 'utf8');
  return JSON.parse(fileContent) as T;
}

// Helper function to write JSON files
async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  const fullPath = path.join(process.cwd(), filePath);
  await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf8');
}

// GET - fetch a specific post by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    // Extract postId from params first to avoid the NextJS warning
    const { postId } = params;
    const post = await getPostDetails(postId);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post details:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE - delete a post by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    // Extract postId from params first to avoid the NextJS warning
    const { postId } = params;
    
    // Get user information from request
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Get user information
    const users = await readJsonFile<any[]>('lib/mock-data/users.json');
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get post information
    const posts = await readJsonFile<any[]>('lib/mock-data/posts.json');
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    const post = posts[postIndex];
    
    // Check permission to delete
    if (!canDeletePost(user, post)) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this post' },
        { status: 403 }
      );
    }
    
    // Delete post
    posts.splice(postIndex, 1);
    await writeJsonFile('lib/mock-data/posts.json', posts);
    
    // Also delete any replies to this post
    const replies = await readJsonFile<any[]>('lib/mock-data/replies.json');
    const updatedReplies = replies.filter(r => r.post_id !== postId);
    
    // If we removed any replies, update the file
    if (replies.length !== updatedReplies.length) {
      await writeJsonFile('lib/mock-data/replies.json', updatedReplies);
    }
    
    // Update category post count
    const categories = await readJsonFile<any[]>('lib/mock-data/categories.json');
    const categoryIndex = categories.findIndex(c => c.id === post.category_id);
    
    if (categoryIndex !== -1) {
      categories[categoryIndex].post_count = Math.max(0, categories[categoryIndex].post_count - 1);
      await writeJsonFile('lib/mock-data/categories.json', categories);
    }
    
    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 