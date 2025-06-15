import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper function to read JSON file
function readJsonFile<T>(filePath: string): T {
  const fullPath = path.join(process.cwd(), filePath);
  const fileContent = fs.readFileSync(fullPath, 'utf8');
  return JSON.parse(fileContent) as T;
}

// GET handler for /api/categories/posts/[categoryId]
export async function GET(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    // Read posts from the mock data file
    const posts = readJsonFile<any[]>('lib/mock-data/posts.json');
    const categories = readJsonFile<any[]>('lib/mock-data/categories.json');
    
    // Find the category
    const category = categories.find(cat => cat.id === params.categoryId);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Filter posts by category ID
    const categoryPosts = posts
      .filter(post => post.category_id === params.categoryId)
      .map(post => ({
        id: post.id,
        title: post.title,
        author_name: post.author_name,
        created_at: post.created_at,
        reply_count: post.replies[0].count || 0,
        category_slug: category.slug,
        category_name: category.name
      }));
    
    // Return the posts as JSON
    return NextResponse.json(categoryPosts);
  } catch (error) {
    console.error(`Error fetching posts for category ${params.categoryId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
} 