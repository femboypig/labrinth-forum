import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { canMuteUser } from '@/lib/permissions'

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
    
    // Check if user has permission to mute
    if (!canMuteUser(moderator)) {
      return NextResponse.json(
        { error: 'You do not have permission to mute users' },
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
    
    // Prevent muting admins
    if (users[targetUserIndex].role === 'admin') {
      return NextResponse.json(
        { error: 'Administrators cannot be muted' },
        { status: 403 }
      )
    }
    
    // Require duration for muting (can't mute permanently)
    if (!duration || duration <= 0) {
      return NextResponse.json(
        { error: 'A positive mute duration is required' },
        { status: 400 }
      )
    }
    
    // Calculate mute end date (duration in hours)
    const muteEndDate = new Date(Date.now() + duration * 60 * 60 * 1000)

    // Update user with mute information
    users[targetUserIndex] = {
      ...users[targetUserIndex],
      is_muted: true,
      mute_reason: reason || 'Violation of forum rules',
      mute_date: new Date().toISOString(),
      mute_end_date: muteEndDate.toISOString(),
      muted_by: moderator.display_name
    }
    
    // Save updated users
    await writeJsonFile('lib/mock-data/users.json', users)
    
    return NextResponse.json({ 
      message: 'User muted successfully',
      user: {
        id: users[targetUserIndex].id,
        display_name: users[targetUserIndex].display_name,
        is_muted: true,
        mute_end_date: users[targetUserIndex].mute_end_date
      }
    })
  } catch (error) {
    console.error('Error muting user:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 