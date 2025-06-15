import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { canBanUser } from '@/lib/permissions'

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

export async function POST(req: NextRequest) {
  try {
    // Get request data
    const { moderatorId, targetUserId, reason, duration } = await req.json()

    if (!moderatorId || !targetUserId) {
      return NextResponse.json(
        { error: 'Moderator ID and target user ID are required' },
        { status: 400 }
      )
    }

    // Get users information
    const users = await readJsonFile<any[]>('lib/mock-data/users.json')
    
    // Find moderator
    const moderator = users.find(u => u.id === moderatorId)
    if (!moderator) {
      return NextResponse.json(
        { error: 'Moderator not found' },
        { status: 404 }
      )
    }
    
    // Check if user has permission to ban
    if (!canBanUser(moderator)) {
      return NextResponse.json(
        { error: 'You do not have permission to ban users' },
        { status: 403 }
      )
    }
    
    // Find target user
    const targetUserIndex = users.findIndex(u => u.id === targetUserId)
    if (targetUserIndex === -1) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      )
    }
    
    // Prevent banning admins
    if (users[targetUserIndex].role === 'admin') {
      return NextResponse.json(
        { error: 'Administrators cannot be banned' },
        { status: 403 }
      )
    }
    
    // Determine ban end date
    const banEndDate = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null // duration in days

    // Update user with ban information
    users[targetUserIndex] = {
      ...users[targetUserIndex],
      is_banned: true,
      ban_reason: reason || 'Violation of forum rules',
      ban_date: new Date().toISOString(),
      ban_end_date: banEndDate ? banEndDate.toISOString() : null, // Permanent if null
      banned_by: moderator.display_name
    }
    
    // Save updated users
    await writeJsonFile('lib/mock-data/users.json', users)
    
    return NextResponse.json({ 
      message: 'User banned successfully',
      user: {
        id: users[targetUserIndex].id,
        display_name: users[targetUserIndex].display_name,
        is_banned: true,
        ban_end_date: users[targetUserIndex].ban_end_date
      }
    })
  } catch (error) {
    console.error('Error banning user:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 