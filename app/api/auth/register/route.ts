import { NextRequest, NextResponse } from 'next/server'
import { registerUser } from '@/lib/server-data'

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json()

    // Validate inputs
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength (at least 6 characters)
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Register the user
    const registerResult = await registerUser(username, email, password)

    if (registerResult.error) {
      return NextResponse.json(
        { error: registerResult.error },
        { status: 400 }
      )
    }

    // Return the new user data
    return NextResponse.json({ user: registerResult.user })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 