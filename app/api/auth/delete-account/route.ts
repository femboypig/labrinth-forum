import { NextRequest, NextResponse } from 'next/server'
import { deleteUser } from '@/lib/server-data'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Delete user account
    const success = await deleteUser(userId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 