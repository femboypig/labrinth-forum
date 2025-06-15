import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper function to read JSON file
function readJsonFile<T>(filePath: string): T {
  const fullPath = path.join(process.cwd(), filePath);
  const fileContent = fs.readFileSync(fullPath, 'utf8');
  return JSON.parse(fileContent) as T;
}

// GET handler for /api/categories/[slug]
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Read categories from the mock data file
    const categories = readJsonFile<any[]>('lib/mock-data/categories.json');
    
    // Find the category with the matching slug
    const category = categories.find(cat => cat.slug === params.slug);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Return the category as JSON
    return NextResponse.json(category);
  } catch (error) {
    console.error(`Error fetching category ${params.slug}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
} 