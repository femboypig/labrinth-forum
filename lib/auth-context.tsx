"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from './data'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean, error?: string }>
  register: (username: string, email: string, password: string) => Promise<{ success: boolean, error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for user in localStorage on initial load
    const storedUser = localStorage.getItem('forum_user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        
        // Check if user's ban has expired
        if (parsedUser.is_banned && parsedUser.ban_end_date) {
          const banEndDate = new Date(parsedUser.ban_end_date)
          const now = new Date()
          
          if (now > banEndDate) {
            // Ban has expired, remove ban status
            parsedUser.is_banned = false
            parsedUser.ban_reason = null
            parsedUser.ban_date = null
            parsedUser.ban_end_date = null
            parsedUser.banned_by = null
            localStorage.setItem('forum_user', JSON.stringify(parsedUser))
          }
        }
        
        // Check if user's mute has expired
        if (parsedUser.is_muted && parsedUser.mute_end_date) {
          const muteEndDate = new Date(parsedUser.mute_end_date)
          const now = new Date()
          
          if (now > muteEndDate) {
            // Mute has expired, remove mute status
            parsedUser.is_muted = false
            parsedUser.mute_reason = null
            parsedUser.mute_date = null
            parsedUser.mute_end_date = null
            parsedUser.muted_by = null
            localStorage.setItem('forum_user', JSON.stringify(parsedUser))
          }
        }
        
        setUser(parsedUser)
      } catch (error) {
        console.error('Failed to parse stored user data', error)
        localStorage.removeItem('forum_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' }
      }
      
      // Check if the user is banned
      if (data.user.is_banned) {
        let banMessage = "Your account has been banned."
        
        // If there's a ban end date, include it in the message
        if (data.user.ban_end_date) {
          const banEndDate = new Date(data.user.ban_end_date)
          const now = new Date()
          
          if (now < banEndDate) {
            const dateFormatted = new Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }).format(banEndDate)
            
            banMessage += ` Your ban will be lifted on ${dateFormatted}.`
          } else {
            // Ban has expired, remove ban status and continue with login
            data.user.is_banned = false
            data.user.ban_reason = null
            data.user.ban_date = null
            data.user.ban_end_date = null
            data.user.banned_by = null
          }
        } else {
          // Permanent ban
          banMessage += " This is a permanent ban."
        }
        
        // If user is still banned, return error
        if (data.user.is_banned) {
          if (data.user.ban_reason) {
            banMessage += ` Reason: ${data.user.ban_reason}`
          }
          
          return { success: false, error: banMessage }
        }
      }
      
      setUser(data.user)
      localStorage.setItem('forum_user', JSON.stringify(data.user))
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Registration failed' }
      }
      
      setUser(data.user)
      localStorage.setItem('forum_user', JSON.stringify(data.user))
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('forum_user')
  }

  const value = {
    user,
    isLoading,
    login,
    register,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 