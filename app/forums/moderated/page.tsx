"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { canCreateModeratedPost } from '@/lib/permissions'
import { ModeratedPostBadge } from '@/components/ui/moderated-post-badge'
import { Shield, ChevronLeft, MessageSquare, Clock, Loader2, PenSquare, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Types
interface ModeratedPost {
  id: string
  title: string
  author_name: string
  created_at: string
  category_slug: string
  replies: { count: number }[]
  is_moderated: boolean
}

export default function ModeratedPostsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<ModeratedPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchModeratedPosts()
  }, [])

  const fetchModeratedPosts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // In a real app, you would fetch from an API endpoint
      // Here we'll simulate by filtering the posts with is_moderated flag
      const response = await fetch('/api/categories/posts/moderated')
      
      if (!response.ok) {
        throw new Error('Failed to fetch moderated posts')
      }
      
      const data = await response.json()
      setPosts(data.posts)
    } catch (error) {
      console.error('Error fetching moderated posts:', error)
      setError('Failed to load moderated posts')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 flex flex-col">
      <header className="w-full py-4 px-4 md:px-6 bg-black sticky top-0 z-50 border-b border-gray-800 shadow-md">
        <div className="container mx-auto flex items-center justify-between max-w-4xl">
          <Link
            href="/"
            className="flex items-center bg-black hover:bg-gray-900 px-3 py-2 rounded-xl text-gray-200 hover:text-white transition-all duration-200 border border-gray-800"
          >
            <ChevronLeft className="h-4 w-4 mr-2 text-gray-400" />
            <span className="font-medium">Back to Forums</span>
          </Link>
          <div className="flex items-center">
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
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8 w-full max-w-4xl flex-grow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-amber-500 mr-2" />
            <h1 className="text-xl font-semibold text-white">Moderated Posts</h1>
          </div>
          
          {user && canCreateModeratedPost(user) ? (
            <Button
              onClick={() => router.push('/forums/moderated/create')}
              className="bg-black hover:bg-gray-900 text-white border border-gray-800 text-sm px-4 py-2 h-auto rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <PenSquare className="mr-2 h-4 w-4" /> Create Post
            </Button>
          ) : user ? (
            <div className="flex items-center text-amber-400 text-sm">
              <AlertTriangle className="h-4 w-4 mr-1.5" />
              <span>Only moderators can post here</span>
            </div>
          ) : (
            <Button
              onClick={() => router.push('/auth/login')}
              className="bg-black hover:bg-gray-900 text-white border border-gray-800 text-sm px-4 py-2 h-auto rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              Login to View
            </Button>
          )}
        </div>

        <div className="bg-black border border-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-800 bg-black">
            <p className="text-gray-400 text-sm">
              This is a moderated section where only administrators and moderators can create posts. 
              These posts are for official announcements and important information.
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <p className="ml-3 text-gray-500">Loading posts...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-400">{error}</p>
            </div>
          ) : posts.length > 0 ? (
            <div className="divide-y divide-gray-800">
              {posts.map((post) => (
                <div key={post.id} className="p-5 hover:bg-gray-900/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <Link href={`/forums/${post.category_slug}/${post.id}`} className="block">
                      <h3 className="text-lg font-medium text-white hover:text-amber-400 transition-colors">
                        {post.title}
                      </h3>
                    </Link>
                    <ModeratedPostBadge className="ml-2" />
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span className="mr-3">{post.author_name}</span>
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                      <span>{post.replies[0]?.count || 0} replies</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <MessageSquare className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500">No moderated posts yet</p>
            </div>
          )}
        </div>
      </main>
      
      <footer className="w-full py-5 text-center border-t border-gray-800">
        <p className="text-gray-600 text-xs">&copy; {new Date().getFullYear()} labrinth. All rights reserved.</p>
      </footer>
    </div>
  )
} 