import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/server-data'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    // Validate inputs
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Authenticate user
    const authResult = await authenticateUser(username, password)

    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      )
    }

    // Return the user data
    return NextResponse.json({ user: authResult.user })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 