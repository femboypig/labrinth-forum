"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { isAdmin, isModerator } from '@/lib/permissions'
import { User } from '@/lib/data'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Search, Ban, XCircle, User as UserIcon, AlertTriangle, Shield } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default function AdminUsersPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<{text: string, type: 'success'|'error'}|null>(null)
  
  // Ban/mute form state
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionType, setActionType] = useState<'ban'|'mute'|null>(null)
  const [actionReason, setActionReason] = useState('')
  const [actionDuration, setActionDuration] = useState('')

  useEffect(() => {
    // Redirect if not admin or moderator
    if (!isLoading && user) {
      if (!isAdmin(user) && !isModerator(user)) {
        router.push('/')
      } else {
        // Load users if admin/moderator
        fetchUsers()
      }
    } else if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  // Apply search filter
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredUsers(
        users.filter(u => 
          u.username.toLowerCase().includes(query) || 
          u.display_name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
        )
      )
    }
  }, [searchQuery, users])

  const fetchUsers = async () => {
    try {
      // Note: In a real app, this would be an API call to fetch users
      // Here we'll simulate a server call by using the mock data
      setIsLoadingUsers(true)
      const response = await fetch(`/api/admin/users?auth_user_id=${user?.id}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`)
      }
      
      const data = await response.json()
      setUsers(data)
      setFilteredUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setStatusMessage({
        text: 'Failed to load users',
        type: 'error'
      })
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const handleBanUser = async (targetUser: User) => {
    setSelectedUser(targetUser)
    setActionType('ban')
    setActionReason('')
    setActionDuration('')
  }

  const handleMuteUser = async (targetUser: User) => {
    setSelectedUser(targetUser)
    setActionType('mute')
    setActionReason('')
    setActionDuration('')
  }

  const handleUnbanUser = async (targetUserId: string) => {
    if (!user) return
    
    setActionInProgress(targetUserId)
    setStatusMessage(null)
    
    try {
      const response = await fetch('/api/user/ban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moderatorId: user.id,
          targetUserId: targetUserId,
          unban: true
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to unban user')
      }
      
      // Refresh users list
      fetchUsers()
      setStatusMessage({
        text: 'User unbanned successfully',
        type: 'success'
      })
    } catch (error) {
      console.error('Error unbanning user:', error)
      setStatusMessage({
        text: typeof error === 'object' && error !== null && 'message' in error 
          ? String(error.message) 
          : 'Failed to unban user',
        type: 'error'
      })
    } finally {
      setActionInProgress(null)
    }
  }

  const handleUnmuteUser = async (targetUserId: string) => {
    if (!user) return
    
    setActionInProgress(targetUserId)
    setStatusMessage(null)
    
    try {
      const response = await fetch('/api/user/mute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moderatorId: user.id,
          targetUserId: targetUserId,
          unmute: true
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to unmute user')
      }
      
      // Refresh users list
      fetchUsers()
      setStatusMessage({
        text: 'User unmuted successfully',
        type: 'success'
      })
    } catch (error) {
      console.error('Error unmuting user:', error)
      setStatusMessage({
        text: typeof error === 'object' && error !== null && 'message' in error 
          ? String(error.message) 
          : 'Failed to unmute user',
        type: 'error'
      })
    } finally {
      setActionInProgress(null)
    }
  }

  const submitAction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedUser || !actionType) return
    
    setActionInProgress(selectedUser.id)
    setStatusMessage(null)
    
    try {
      // Parse duration to a number
      const durationValue = parseInt(actionDuration, 10)
      if (isNaN(durationValue) || durationValue <= 0) {
        throw new Error('Please enter a valid duration')
      }
      
      const endpoint = actionType === 'ban' ? '/api/user/ban' : '/api/user/mute'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moderatorId: user.id,
          targetUserId: selectedUser.id,
          reason: actionReason,
          duration: durationValue
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to ${actionType} user`)
      }
      
      // Refresh users list
      fetchUsers()
      setStatusMessage({
        text: `User ${actionType === 'ban' ? 'banned' : 'muted'} successfully`,
        type: 'success'
      })
      
      // Close form
      setSelectedUser(null)
      setActionType(null)
    } catch (error) {
      console.error(`Error ${actionType}ing user:`, error)
      setStatusMessage({
        text: typeof error === 'object' && error !== null && 'message' in error 
          ? String(error.message) 
          : `Failed to ${actionType} user`,
        type: 'error'
      })
    } finally {
      setActionInProgress(null)
    }
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-gray-200 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p className="ml-3">Loading...</p>
      </div>
    )
  }

  if (!user || (!isAdmin(user) && !isModerator(user))) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 flex flex-col">
      <header className="w-full py-4 px-4 md:px-6 bg-black sticky top-0 z-50 border-b border-gray-800 shadow-md">
        <div className="container mx-auto flex justify-between items-center max-w-7xl">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center bg-black hover:bg-gray-900 px-3 py-2 rounded-xl text-gray-200 hover:text-white transition-colors duration-200 border border-gray-800"
            >
              <span className="font-medium">Back to Forums</span>
            </Link>
            <h1 className="ml-4 text-xl font-semibold text-white">Admin Dashboard - Users</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12 w-full max-w-7xl flex-grow">
        <div className="bg-black border border-gray-800 rounded-xl overflow-hidden shadow-lg p-6">
          {statusMessage && (
            <div className={`mb-6 p-4 rounded-xl text-sm ${
              statusMessage.type === 'success' 
                ? 'bg-black border border-green-600 text-green-400' 
                : 'bg-black border border-red-600 text-red-400'
            }`}>
              {statusMessage.text}
            </div>
          )}
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Manage Users</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black border-gray-800 text-gray-200 focus:border-gray-700 rounded-lg"
              />
            </div>
          </div>

          {isLoadingUsers ? (
            <div className="flex items-center justify-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <p className="ml-3 text-gray-400">Loading users...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-900 text-left text-gray-400 text-xs">
                      <th className="p-3 font-medium rounded-tl-lg">User</th>
                      <th className="p-3 font-medium">Role</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Joined</th>
                      <th className="p-3 font-medium rounded-tr-lg text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-900/30">
                          <td className="p-3">
                            <div className="flex items-center">
                              <div className="rounded-full bg-black border border-gray-800 p-1.5 mr-3">
                                <UserIcon className="h-4 w-4 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-300">{u.display_name}</p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            {u.role === 'admin' && (
                              <span className="bg-black text-xs font-bold py-1 px-2 rounded-lg uppercase text-red-400 border border-red-600">
                                Admin
                              </span>
                            )}
                            {u.role === 'moderator' && (
                              <span className="bg-black text-xs font-bold py-1 px-2 rounded-lg uppercase text-blue-400 border border-blue-600">
                                Mod
                              </span>
                            )}
                            {u.role === 'user' && (
                              <span className="bg-black text-xs font-bold py-1 px-2 rounded-lg uppercase text-gray-400 border border-gray-600">
                                User
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            {u.is_banned && (
                              <div className="flex items-center">
                                <AlertTriangle className="h-4 w-4 text-red-500 mr-1.5" />
                                <span className="text-xs text-red-400">Banned</span>
                              </div>
                            )}
                            {u.is_muted && !u.is_banned && (
                              <div className="flex items-center">
                                <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1.5" />
                                <span className="text-xs text-yellow-400">Muted</span>
                              </div>
                            )}
                            {!u.is_banned && !u.is_muted && (
                              <span className="text-xs text-green-400">Active</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {/* Check if user is banned or user is admin (can't be banned) */}
                              {u.is_banned ? (
                                <Button
                                  onClick={() => handleUnbanUser(u.id)}
                                  disabled={actionInProgress === u.id || u.role === 'admin'}
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-8 bg-transparent border-green-600 text-green-500 hover:bg-green-900/20"
                                >
                                  {actionInProgress === u.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <>
                                      <XCircle className="h-3.5 w-3.5 mr-1" /> Unban
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => handleBanUser(u)}
                                  disabled={u.role === 'admin' || actionInProgress === u.id}
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-8 bg-transparent border-red-600 text-red-500 hover:bg-red-900/20"
                                >
                                  <Ban className="h-3.5 w-3.5 mr-1" /> Ban
                                </Button>
                              )}
                              
                              {u.is_muted ? (
                                <Button
                                  onClick={() => handleUnmuteUser(u.id)}
                                  disabled={actionInProgress === u.id || u.role === 'admin'}
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-8 bg-transparent border-blue-600 text-blue-500 hover:bg-blue-900/20"
                                >
                                  {actionInProgress === u.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <>
                                      <XCircle className="h-3.5 w-3.5 mr-1" /> Unmute
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => handleMuteUser(u)}
                                  disabled={u.role === 'admin' || actionInProgress === u.id}
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-8 bg-transparent border-yellow-600 text-yellow-500 hover:bg-yellow-900/20"
                                >
                                  <Shield className="h-3.5 w-3.5 mr-1" /> Mute
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">
                          No users found matching your search
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                Total users: {filteredUsers.length}
              </div>
            </>
          )}
        </div>
      </main>
      
      {/* Ban/Mute User Modal */}
      {selectedUser && actionType && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              {actionType === 'ban' ? 'Ban User' : 'Mute User'}: {selectedUser.display_name}
            </h3>
            
            <form onSubmit={submitAction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Reason
                </label>
                <Input
                  type="text"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={`Reason for ${actionType}`}
                  className="bg-black border-gray-800 text-gray-200 focus:border-gray-700 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  {actionType === 'ban' ? 'Duration (days, 0 for permanent)' : 'Duration (hours)'}
                </label>
                <Input
                  type="number"
                  value={actionDuration}
                  onChange={(e) => setActionDuration(e.target.value)}
                  min="1"
                  placeholder={actionType === 'ban' ? 'Days' : 'Hours'}
                  className="bg-black border-gray-800 text-gray-200 focus:border-gray-700 rounded-lg"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null)
                    setActionType(null)
                  }}
                  variant="outline"
                  className="bg-black border-gray-800 text-gray-400"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={actionInProgress === selectedUser.id}
                  className={`${
                    actionType === 'ban' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-yellow-600 hover:bg-yellow-700'
                  } text-white`}
                >
                  {actionInProgress === selectedUser.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    actionType === 'ban' ? 'Ban User' : 'Mute User'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <footer className="w-full py-5 text-center border-t border-gray-800">
        <p className="text-gray-600 text-xs">&copy; {new Date().getFullYear()} labrinth. All rights reserved.</p>
      </footer>
    </div>
  )
} 