import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { isAdmin, isModerator } from '@/lib/permissions'

// Helper function to read JSON files
async function readJsonFile<T>(filePath: string): Promise<T> {
  const fullPath = path.join(process.cwd(), filePath)
  const fileContent = await fs.readFile(fullPath, 'utf8')
  return JSON.parse(fileContent) as T
}

export async function GET(req: NextRequest) {
  try {
    // Verify authorization via authorization header or query parameter
    const url = new URL(req.url)
    const authUserId = url.searchParams.get('auth_user_id')
    
    if (!authUserId) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }
    
    // Check if user is admin or moderator
    const users = await readJsonFile<any[]>('lib/mock-data/users.json')
    const authUser = users.find(u => u.id === authUserId)
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    if (!isAdmin(authUser) && !isModerator(authUser)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    // Return users without passwords
    const safeUsers = users.map(({ password, ...user }) => user)
    
    return NextResponse.json(safeUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 