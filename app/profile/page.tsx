"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Loader2, Save, User, Mail, Key, Calendar, Shield, LogOut, 
  ChevronLeft, Award, Settings, AlertTriangle, Clock, MessageSquare,
  FileText, Trash
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

// Types for user activity
interface UserActivity {
  id: string;
  type: 'post' | 'reply';
  title?: string;
  postTitle?: string;
  content?: string;
  date: Date;
  category?: string;
  postId?: string;
  categorySlug?: string;
}

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [isEditMode, setIsEditMode] = useState(false)
  const [profileData, setProfileData] = useState({
    display_name: '',
    email: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{text: string, type: 'success'|'error'}|null>(null)
  const [activeTab, setActiveTab] = useState('profile') // 'profile', 'activity', 'settings'
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // Delete account confirmation
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  
  // User activity
  const [userActivity, setUserActivity] = useState<UserActivity[]>([])
  const [isLoadingActivity, setIsLoadingActivity] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    } else if (user) {
      // Initialize form with current user data
      setProfileData({
        display_name: user.display_name,
        email: user.email,
      })
    }
  }, [user, isLoading, router])
  
  // Fetch user activity when tab changes to 'activity'
  useEffect(() => {
    if (activeTab === 'activity' && user) {
      fetchUserActivity()
    }
  }, [activeTab, user])
  
  // Function to fetch user activity
  const fetchUserActivity = async () => {
    if (!user) return
    
    setIsLoadingActivity(true)
    try {
      // Call the real API endpoint to fetch user activity
      const response = await fetch('/api/user/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id })
      })
      
      if (!response.ok) {
        throw new Error(`Error fetching activity: ${response.status}`)
      }
      
      const activityData = await response.json()
      setUserActivity(activityData)
    } catch (error) {
      console.error("Failed to fetch user activity:", error)
      // Show a message to the user if you want
      setUserActivity([])
    } finally {
      setIsLoadingActivity(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    })
  }
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatusMessage(null)
    
    // This is just a mock update that always succeeds
    // In a real app, this would call an API endpoint
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Profile update would happen here
      
      setStatusMessage({
        text: 'Profile updated successfully',
        type: 'success'
      })
      setIsEditMode(false)
    } catch (error) {
      setStatusMessage({
        text: 'Failed to update profile',
        type: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatusMessage(null)
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setStatusMessage({
        text: 'New passwords do not match',
        type: 'error'
      })
      setIsSubmitting(false)
      return
    }
    
    // Remove hardcoded password check and actually verify with API
    try {
      // Make API call to verify and update password
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setStatusMessage({
          text: data.error || 'Failed to update password',
          type: 'error'
        })
        setIsSubmitting(false)
        return
      }
      
      setStatusMessage({
        text: 'Password updated successfully',
        type: 'success'
      })
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      setStatusMessage({
        text: 'Failed to update password',
        type: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDeleteAccount = async () => {
    // First check if the confirmation text matches "DELETE"
    if (deleteConfirmText !== "DELETE") {
      setStatusMessage({
        text: 'Please type DELETE to confirm account deletion',
        type: 'error'
      })
      return
    }
    
    setIsSubmitting(true)
    setStatusMessage(null)
    
    try {
      // Make API call to delete user account
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete account')
      }
      
      // Clear user data from local state/storage
      logout()
      
      // Redirect to home with message
      router.push('/?message=account-deleted')
    } catch (error) {
      setStatusMessage({
        text: typeof error === 'object' && error !== null && 'message' in error 
          ? String(error.message) 
          : 'Failed to delete account',
        type: 'error'
      })
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-gray-200 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p className="ml-3">Loading profile...</p>
      </div>
    )
  }

  if (!user) {
    // Should be redirected by the useEffect, but just in case
    return (
      <div className="min-h-screen bg-black text-gray-200 flex flex-col items-center justify-center p-4">
        <div className="p-4 bg-black rounded-xl w-20 h-20 flex items-center justify-center mx-auto mb-5 border border-gray-800">
          <User className="h-10 w-10 text-gray-600" />
        </div>
        <h1 className="text-xl font-semibold text-white mb-2">Not Logged In</h1>
        <p className="text-gray-500 mb-6">You need to be logged in to view your profile</p>
        <Button
          onClick={() => router.push('/auth/login')}
          className="bg-black hover:bg-gray-900 text-white border border-gray-800 text-sm px-4 py-2 h-auto rounded-xl shadow-sm hover:shadow-md transition-colors duration-200"
        >
          Go to Login
        </Button>
      </div>
    )
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
              <ChevronLeft className="h-4 w-4 mr-2 text-gray-400" />
              <span className="font-medium">Back to Forums</span>
            </Link>
            <div className="flex items-center ml-6">
              <svg width="28" height="28" viewBox="0 0 512 514" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <g clipPath="url(#clip0_999_80)">
                  <path fillRule="evenodd" clipRule="evenodd" d="M503.16 323.56C514.55 281.47 515.32 235.91 503.2 190.76C466.57 54.2294 326.04 -26.8006 189.33 9.77942C83.8101 38.0194 11.3899 128.07 0.689941 230.47H43.99C54.29 147.33 113.74 74.7293 199.75 51.7093C306.05 23.2593 415.13 80.6694 453.17 181.38L411.03 192.65C391.64 145.799 352.57 111.45 306.3 96.8193L298.56 140.66C335.09 154.13 364.72 184.5 375.56 224.91C391.36 283.799 361.94 344.14 308.56 369.17L320.09 412.16C390.25 383.21 432.4 310.299 422.43 235.14L464.41 223.91C468.91 252.62 467.35 281.16 460.55 308.07L503.16 323.56Z" fill="#D4A576"/>
                  <path d="M321.99 504.22C185.27 540.8 44.7501 459.77 8.11011 323.24C3.84011 307.31 1.17 291.33 0 275.46H43.27C44.36 287.37 46.4699 299.35 49.6799 311.29C53.0399 323.8 57.45 335.75 62.79 347.07L101.38 323.92C98.1299 316.42 95.39 308.6 93.21 300.47C69.17 210.87 122.41 118.77 212.13 94.7596C229.13 90.2096 246.23 88.4396 262.93 89.1496L255.19 133C244.73 133.05 234.11 134.42 223.53 137.25C157.31 154.98 118.01 222.95 135.75 289.09C136.85 293.16 138.13 297.13 139.59 300.99L149 320.5L162.26 338.7C187.8 367.78 226.2 383.93 266.01 380.56L277.54 423.55C218.13 431.41 160.1 406.82 124.05 361.64L85.6399 384.68C136.25 451.17 223.84 484.11 309.61 461.16C371.35 444.64 419.4 402.56 445.42 349.38L488.06 364.88C457.17 431.16 398.22 483.82 321.99 504.22Z" fill="#D4A576"/>
                </g>
                <defs>
                  <clipPath id="clip0_999_80">
                    <rect width="512" height="514" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
              <span className="tracking-tight text-white font-semibold text-lg">labrinth</span>
            </div>
          </div>
          <Button
            onClick={() => {
              logout()
              router.push('/')
            }}
            className="bg-black hover:bg-gray-900 text-white border border-gray-800 text-sm px-5 py-2.5 h-auto rounded-xl shadow-sm hover:shadow-md transition-colors duration-200"
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12 w-full max-w-5xl flex-grow">
        <div className="bg-black border border-gray-800 rounded-xl overflow-hidden shadow-lg">
          <div className="px-8 pt-8 pb-2">
            <div className="flex flex-wrap justify-between items-start mb-8">
              <div className="flex items-start">
                <div className="rounded-xl bg-black border border-gray-800 p-4 mr-4">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
                <div>
                  <div className="flex items-center">
                    <h1 className="text-xl md:text-2xl font-semibold text-white mr-3">{user.display_name}</h1>
                    {user.role === 'admin' && (
                      <span className="bg-black text-xs font-bold py-1 px-2 rounded-lg uppercase text-white border border-red-600">
                        Admin
                      </span>
                    )}
                    {user.role === 'moderator' && (
                      <span className="bg-black text-xs font-bold py-1 px-2 rounded-lg uppercase text-white border border-blue-600">
                        Mod
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">Member since {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</p>

                  {/* Display ban or mute status if applicable */}
                  {user.is_banned && (
                    <div className="mt-2 bg-red-900/20 border border-red-900/30 rounded-lg py-1 px-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-1.5" />
                      <span className="text-xs text-red-400">
                        {user.ban_end_date 
                          ? `Banned until ${new Date(user.ban_end_date).toLocaleDateString()} ${new Date(user.ban_end_date).toLocaleTimeString()}`
                          : 'Permanently Banned'}
                      </span>
                    </div>
                  )}

                  {user.is_muted && !user.is_banned && (
                    <div className="mt-2 bg-yellow-900/20 border border-yellow-900/30 rounded-lg py-1 px-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1.5" />
                      <span className="text-xs text-yellow-400">
                        Muted until {new Date(user.mute_end_date).toLocaleDateString()} {new Date(user.mute_end_date).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 mt-4 sm:mt-0">
                {!isEditMode && (
                  <Button
                    onClick={() => setIsEditMode(true)}
                    className="bg-black hover:bg-gray-900 text-white border border-gray-800 text-sm px-4 py-2.5 h-auto rounded-xl shadow-sm hover:shadow-md transition-colors duration-200"
                  >
                    <Settings className="mr-2 h-4 w-4" /> Edit Profile
                  </Button>
                )}
              </div>
            </div>

            {/* Tab Navigation - Enhanced Design */}
            <div className="bg-black border border-gray-800 rounded-xl overflow-hidden p-1">
              <div className="flex relative">
                {/* Active Tab Indicator - animated backdrop */}
                <div 
                  className="absolute h-full transition-all duration-300 ease-in-out bg-gray-800/70 rounded-xl border border-amber-700/30 shadow-md"
                  style={{ 
                    width: '33.333%',
                    transform: activeTab === 'profile' 
                      ? 'translateX(0)' 
                      : activeTab === 'activity' 
                        ? 'translateX(100%)' 
                        : 'translateX(200%)'
                  }}
                />
                
                {/* Tab buttons */}
              <button
                onClick={() => setActiveTab('profile')}
                  className={`flex-1 z-10 px-6 py-3 text-sm font-medium rounded-xl flex items-center justify-center transition-colors duration-200 ${
                    activeTab === 'profile' ? 'text-amber-100 font-semibold' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <User className={`h-4 w-4 mr-2 ${activeTab === 'profile' ? 'text-amber-400' : 'text-gray-500'}`} />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                  className={`flex-1 z-10 px-6 py-3 text-sm font-medium rounded-xl flex items-center justify-center transition-colors duration-200 ${
                    activeTab === 'activity' ? 'text-amber-100 font-semibold' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Clock className={`h-4 w-4 mr-2 ${activeTab === 'activity' ? 'text-amber-400' : 'text-gray-500'}`} />
                Activity
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                  className={`flex-1 z-10 px-6 py-3 text-sm font-medium rounded-xl flex items-center justify-center transition-colors duration-200 ${
                    activeTab === 'settings' ? 'text-amber-100 font-semibold' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Settings className={`h-4 w-4 mr-2 ${activeTab === 'settings' ? 'text-amber-400' : 'text-gray-500'}`} />
                Settings
              </button>
              </div>
            </div>
          </div>

          {/* Line divider */}
          <div className="border-t border-gray-800"></div>

          {/* Profile Content */}
          <div className="p-8">
            {statusMessage && (
              <div className={`mb-8 p-4 rounded-xl text-sm ${
                statusMessage.type === 'success' 
                  ? 'bg-black border border-green-600 text-green-400' 
                  : 'bg-black border border-red-600 text-red-400'
              }`}>
                {statusMessage.text}
              </div>
            )}

            {activeTab === 'profile' && (
              <>
                {isEditMode ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="display_name" className="block text-sm font-medium text-gray-400 mb-1.5">
                        Display Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <Input
                          id="display_name"
                          name="display_name"
                          type="text"
                          value={profileData.display_name}
                          onChange={handleChange}
                          className="bg-black border-gray-800 text-gray-200 focus:border-gray-700 pl-12 py-6 text-sm rounded-xl shadow-inner"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1.5">
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-500" />
                        </div>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profileData.email}
                          onChange={handleChange}
                          className="bg-black border-gray-800 text-gray-200 focus:border-gray-700 pl-12 py-6 text-sm rounded-xl shadow-inner"
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 pt-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-black hover:bg-gray-900 text-white border border-gray-800 text-sm px-5 py-2.5 h-auto rounded-xl shadow-sm hover:shadow-md transition-colors duration-200"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                          </>
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => {
                          setIsEditMode(false)
                          // Reset form data to current user data
                          if (user) {
                            setProfileData({
                              display_name: user.display_name,
                              email: user.email,
                            })
                          }
                        }}
                        className="text-gray-400 bg-black hover:bg-gray-900 hover:text-gray-300 text-sm px-4 py-2.5 h-auto rounded-xl shadow-sm hover:shadow-md transition-colors duration-200 border border-gray-800"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-lg font-semibold text-white mb-4">User Information</h2>
                      <div className="space-y-4">
                        <div className="rounded-xl bg-black border border-gray-800 p-4 flex items-center">
                          <User className="h-5 w-5 text-gray-500 mr-4 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Display Name</p>
                            <p className="text-gray-300">{user.display_name}</p>
                          </div>
                        </div>
                        
                        <div className="rounded-xl bg-black border border-gray-800 p-4 flex items-center">
                          <Mail className="h-5 w-5 text-gray-500 mr-4 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Email</p>
                            <p className="text-gray-300">{user.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-semibold text-white mb-4">Account Details</h2>
                      <div className="space-y-4">
                        <div className="rounded-xl bg-black border border-gray-800 p-4 flex items-center">
                          <Shield className="h-5 w-5 text-gray-500 mr-4 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Role</p>
                            <p className="text-gray-300 capitalize">{user.role}</p>
                          </div>
                        </div>
                        
                        <div className="rounded-xl bg-black border border-gray-800 p-4 flex items-center">
                          <Calendar className="h-5 w-5 text-gray-500 mr-4 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Member Since</p>
                            <p className="text-gray-300">{new Date(user.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="rounded-xl bg-black border border-gray-800 p-4 flex items-center">
                          <Award className="h-5 w-5 text-gray-500 mr-4 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Status</p>
                            <p className="text-gray-300">Active Member</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
                
                {isLoadingActivity ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    <p className="ml-3 text-gray-400">Loading activity...</p>
                  </div>
                ) : userActivity.length > 0 ? (
                  <div className="space-y-4">
                    {userActivity.map(activity => (
                      <div key={activity.id} className="rounded-xl bg-black border border-gray-800 p-4">
                        <div className="flex items-start">
                          <div className="mr-4 mt-0.5">
                            {activity.type === 'post' ? (
                              <div className="p-2 bg-black border border-gray-700 rounded-lg">
                                <FileText className="h-4 w-4 text-gray-500" />
                              </div>
                            ) : (
                              <div className="p-2 bg-black border border-gray-700 rounded-lg">
                                <MessageSquare className="h-4 w-4 text-gray-500" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="text-xs uppercase font-medium bg-gray-900 text-gray-400 px-2 py-1 rounded-md border border-gray-800">
                                  {activity.type === 'post' ? 'Created Post' : 'Replied'}
                                </span>
                                
                                {activity.type === 'post' && activity.category && (
                                  <span className="ml-2 text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded-md border border-gray-800">
                                    {activity.category}
                                  </span>
                                )}
                              </div>
                              
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(activity.date, { addSuffix: true })}
                              </span>
                            </div>
                            
                            <h3 className="text-gray-200 font-medium mb-1">
                              {activity.type === 'post' ? activity.title : `RE: ${activity.postTitle}`}
                            </h3>
                            
                            {activity.type === 'reply' && activity.content && (
                              <p className="text-sm text-gray-500 line-clamp-2">{activity.content}</p>
                            )}
                            
                            <div className="mt-2 pt-2 border-t border-gray-800">
                              {/* Link to the actual post or reply */}
                              <Link 
                                href={activity.categorySlug && activity.postId ? 
                                  `/forums/${activity.categorySlug}/${activity.postId}` : '#'
                                } 
                                className="text-xs text-gray-400 hover:text-white transition-colors"
                              >
                                View {activity.type}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="mx-auto rounded-full bg-black border border-gray-800 p-3 w-16 h-16 flex items-center justify-center mb-4">
                      <Clock className="h-8 w-8 text-gray-500" />
                  </div>
                  <p className="text-gray-400">No recent activity to display</p>
                </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white mb-4">Account Settings</h2>
                
                {/* Change Password Section */}
                <div className="rounded-xl bg-black border border-gray-800 p-5">
                  <h3 className="text-white font-medium mb-4">Change Password</h3>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Key className="h-5 w-5 text-gray-500" />
                      </div>
                      <Input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Current Password"
                        className="bg-black border-gray-800 text-gray-200 focus:border-gray-700 pl-12 py-6 text-sm rounded-xl shadow-inner"
                        required
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Key className="h-5 w-5 text-gray-500" />
                      </div>
                      <Input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="New Password"
                        className="bg-black border-gray-800 text-gray-200 focus:border-gray-700 pl-12 py-6 text-sm rounded-xl shadow-inner"
                        required
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Key className="h-5 w-5 text-gray-500" />
                      </div>
                      <Input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm New Password"
                        className="bg-black border-gray-800 text-gray-200 focus:border-gray-700 pl-12 py-6 text-sm rounded-xl shadow-inner"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-black hover:bg-gray-900 text-white border border-gray-800 text-sm px-5 py-2.5 h-auto rounded-xl shadow-sm hover:shadow-md transition-colors duration-200"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </form>
                </div>

                {/* Delete Account Section */}
                <div className="rounded-xl bg-black border border-red-900/30 p-5">
                  <h3 className="text-white font-medium mb-2">Delete Account</h3>
                  <p className="text-sm text-gray-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                  
                  {!showDeleteConfirmation ? (
                  <Button
                      onClick={() => setShowDeleteConfirmation(true)}
                      className="bg-black hover:bg-red-900/20 text-red-500 border border-red-500/50 text-sm px-4 py-2 h-auto rounded-xl shadow-sm hover:shadow-md transition-colors duration-200"
                  >
                      <Trash className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-black border border-red-500/30 rounded-xl">
                        <div className="flex items-center mb-3">
                          <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                          <p className="text-sm text-red-400">This action cannot be undone. All your data will be permanently removed.</p>
                        </div>
                        
                        <div className="bg-black border border-red-500/30 p-3 rounded-lg">
                          <p className="text-sm text-red-300 mb-2">To confirm, type <span className="font-bold">DELETE</span> below:</p>
                          <Input 
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="Type DELETE to confirm"
                            className="bg-black border-gray-800 text-red-400 focus:border-red-600 text-sm rounded-xl"
                          />
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Button
                          onClick={handleDeleteAccount}
                          disabled={isSubmitting || deleteConfirmText !== 'DELETE'}
                          className={`bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 h-auto rounded-xl shadow-sm hover:shadow-md transition-colors duration-200 ${
                            deleteConfirmText !== 'DELETE' ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                            </>
                          ) : (
                            "Permanently Delete Account"
                          )}
                        </Button>
                        
                        <Button
                          onClick={() => {
                            setShowDeleteConfirmation(false)
                            setDeleteConfirmText('')
                          }}
                          disabled={isSubmitting}
                          className="bg-black hover:bg-gray-900 text-gray-400 border border-gray-800 hover:text-gray-300 text-sm px-4 py-2 h-auto rounded-xl shadow-sm hover:shadow-md transition-colors duration-200"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="w-full py-5 text-center border-t border-gray-800">
        <p className="text-gray-600 text-xs">&copy; {new Date().getFullYear()} labrinth. All rights reserved.</p>
      </footer>
    </div>
  )
} 