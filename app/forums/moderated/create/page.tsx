"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { canCreateModeratedPost } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, Shield, Loader2, Send } from 'lucide-react'
import Link from 'next/link'

export default function CreateModeratedPostPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '1' // Default category ID for moderated posts
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if user has permission
  useEffect(() => {
    if (user && !canCreateModeratedPost(user)) {
      router.push('/forums/moderated')
    }
  }, [user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/categories/posts/moderated', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          categoryId: formData.categoryId,
          authorId: user.id
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create moderated post')
      }
      
      const data = await response.json()
      
      // Redirect to the new post
      router.push(`/forums/${data.post.category_slug}/${data.post.id}`)
    } catch (error) {
      console.error('Error creating moderated post:', error)
      setError(typeof error === 'object' && error !== null && 'message' in error 
        ? String(error.message) 
        : 'Failed to create moderated post')
      setIsSubmitting(false)
    }
  }

  if (!user || !canCreateModeratedPost(user)) {
    return (
      <div className="min-h-screen bg-black text-gray-200 flex items-center justify-center">
        <div className="text-center p-8">
          <Shield className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-white mb-2">Access Restricted</h1>
          <p className="text-gray-400 mb-6">Only moderators and administrators can create posts in this section.</p>
          <Link
            href="/forums/moderated"
            className="inline-flex items-center bg-black hover:bg-gray-900 px-4 py-2 rounded-xl text-gray-200 hover:text-white transition-all duration-200 border border-gray-800"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            <span>Back to Moderated Posts</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 flex flex-col">
      <header className="w-full py-4 px-4 md:px-6 bg-black sticky top-0 z-50 border-b border-gray-800 shadow-md">
        <div className="container mx-auto flex items-center justify-between max-w-4xl">
          <Link
            href="/forums/moderated"
            className="flex items-center bg-black hover:bg-gray-900 px-3 py-2 rounded-xl text-gray-200 hover:text-white transition-all duration-200 border border-gray-800"
          >
            <ChevronLeft className="h-4 w-4 mr-2 text-gray-400" />
            <span className="font-medium">Back to Moderated Posts</span>
          </Link>
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-amber-500 mr-2" />
            <span className="tracking-tight text-white font-semibold">Create Moderated Post</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8 w-full max-w-4xl flex-grow">
        <div className="bg-black border border-gray-800 rounded-xl shadow-lg overflow-hidden p-6">
          <div className="mb-6 border-b border-gray-800 pb-4">
            <h1 className="text-xl font-semibold text-white mb-2">Create a Moderated Post</h1>
            <p className="text-gray-400 text-sm">
              This post will be visible to all users but marked as an official moderated post.
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 rounded-xl text-sm bg-black border border-red-600 text-red-400">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1.5">
                Post Title
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter post title"
                required
                className="bg-black border-gray-800 text-gray-200 focus:border-amber-700 py-6 text-sm rounded-xl shadow-inner"
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-400 mb-1.5">
                Post Content
              </label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Enter post content"
                required
                rows={10}
                className="bg-black border-gray-800 text-gray-200 focus:border-amber-700 text-sm rounded-xl shadow-inner"
              />
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-700 text-white text-sm px-5 py-2.5 h-auto rounded-xl shadow-sm hover:shadow-md transition-colors duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Create Post
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
      
      <footer className="w-full py-5 text-center border-t border-gray-800">
        <p className="text-gray-600 text-xs">&copy; {new Date().getFullYear()} labrinth. All rights reserved.</p>
      </footer>
    </div>
  )
} 