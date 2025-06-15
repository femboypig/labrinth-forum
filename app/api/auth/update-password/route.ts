import { NextRequest, NextResponse } from 'next/server'
import { getUserById, verifyPassword, updateUserPassword } from '@/lib/server-data'

export async function POST(req: NextRequest) {
  try {
    const { userId, currentPassword, newPassword } = await req.json()

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Get the user from database
    const user = await getUserById(userId)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Verify the current password
    const isPasswordValid = await verifyPassword(userId, currentPassword)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      )
    }
    
    // Update the password
    await updateUserPassword(userId, newPassword)
    
    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Update password error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 