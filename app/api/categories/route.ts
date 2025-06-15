import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { CategoryWithStats } from '@/lib/data';

// Helper function to read JSON file
function readJsonFile<T>(filePath: string): T {
  const fullPath = path.join(process.cwd(), filePath);
  const fileContent = fs.readFileSync(fullPath, 'utf8');
  return JSON.parse(fileContent) as T;
}

// GET handler for /api/categories
export async function GET() {
  try {
    // Read categories, posts, and replies from mock data files
    const categories = readJsonFile<any[]>('lib/mock-data/categories.json');
    const posts = readJsonFile<any[]>('lib/mock-data/posts.json');
    const replies = readJsonFile<any[]>('lib/mock-data/replies.json');
    
    // Calculate statistics for each category
    const categoriesWithStats = categories.map(category => {
      const categoryPosts = posts.filter(post => post.category_id === category.id);
      const categoryPostIds = categoryPosts.map(post => post.id);
      const categoryReplies = replies.filter(reply => categoryPostIds.includes(reply.post_id));
      
      return {
        ...category,
        post_count: categoryPosts.length,
        reply_count: categoryReplies.length
      };
    });
    
    // Return the categories as JSON
    return NextResponse.json(categoriesWithStats);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
} 