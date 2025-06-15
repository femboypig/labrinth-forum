"use client" // Keep client for form interactions

import { Input } from "@/components/ui/input"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useFormStatus } from "react-dom"
import { type PostDetail as PostDetailType } from "@/lib/data" // Import only the type
import { getPostDetails, getImageUrl } from "@/lib/client-db" // Import getImageUrl function
import { createReply, type CreateReplyFormState } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, UserCircle, Loader2, MessageSquare, Send, Clock, Trash, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useActionState } from "react"
import ReactMarkdown from 'react-markdown'
import { canDeletePost, canDeleteReply } from '@/lib/permissions'

function ReplySubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button 
      type="submit" 
      disabled={pending} 
      className="bg-black hover:bg-gray-900 text-white border border-gray-800 text-sm px-4 py-2 h-auto rounded-md transition-all duration-200 flex items-center"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" /> Reply
        </>
      )}
    </Button>
  )
}

// This component will be rendered by a Server Component parent that fetches initial data
export default function PostPageClient({ initialPost }: { initialPost: PostDetailType | null }) {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const postId = params.postId as string
  const categorySlug = params.categorySlug as string

  const [post, setPost] = useState<PostDetailType | null>(initialPost)
  const [isLoading, setIsLoading] = useState<boolean>(!initialPost) // True if no initial post
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const initialState: CreateReplyFormState = { message: null, errors: {} }
  // Pass postId to the action via a hidden input or bind
  const createReplyWithPostId = createReply.bind(null) // You'll need to adjust createReply or pass postId differently
  const [replyState, dispatchReply] = useActionState(createReplyWithPostId, initialState)

  useEffect(() => {
    // If initialPost was not provided (e.g. client-side navigation after initial load), fetch it.
    // Or, if you want to re-fetch for updates.
    if (!initialPost && postId) {
      setIsLoading(true)
      getPostDetails(postId)
        .then((data: PostDetailType | null) => {
          setPost(data)
          setIsLoading(false)
        })
        .catch((err: Error) => {
          console.error("Failed to fetch post details on client:", err)
          setIsLoading(false)
          // Handle error display
        })
    }
  }, [postId, initialPost])

  // Effect to optimistically add reply or re-fetch on successful reply
  useEffect(() => {
    if (replyState.message === "Reply posted successfully." && !replyState.errors) {
      // Clear the form (if you control textarea value with state)
      // Re-fetch post details to show new reply
      getPostDetails(postId).then(setPost)
    }
  }, [replyState, postId])

  // Function to handle post deletion
  const handleDeletePost = async () => {
    if (!user || !post) return
    
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }
    
    setIsDeleting(true)
    setDeleteError(null)
    
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete post')
      }
      
      // Redirect to the category page
      router.push(`/forums/${categorySlug}`)
    } catch (error) {
      console.error('Error deleting post:', error)
      setDeleteError(typeof error === 'object' && error !== null && 'message' in error 
        ? String(error.message) 
        : 'Failed to delete post')
      setIsDeleting(false)
    }
  }
  
  // Function to handle reply deletion
  const handleDeleteReply = async (replyId: string) => {
    if (!user || !post) return
    
    if (!window.confirm('Are you sure you want to delete this reply? This action cannot be undone.')) {
      return
    }
    
    setIsDeleting(true)
    setDeleteError(null)
    
    try {
      const response = await fetch(`/api/replies/${replyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete reply')
      }
      
      // Refresh the post data to update the replies list
      const updatedPost = await getPostDetails(post.id)
      setPost(updatedPost)
    } catch (error) {
      console.error('Error deleting reply:', error)
      setDeleteError(typeof error === 'object' && error !== null && 'message' in error 
        ? String(error.message) 
        : 'Failed to delete reply')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-gray-200 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p className="ml-3">Loading post...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black text-gray-200 flex flex-col items-center justify-center">
        <header className="w-full py-4 px-4 md:px-6 bg-black sticky top-0 z-50 border-b border-gray-800 shadow-md">
          <div className="container mx-auto flex items-center max-w-4xl">
            <Link 
              href="/" 
              className="flex items-center bg-black hover:bg-gray-900 px-3 py-2 rounded-md text-gray-200 hover:text-white transition-all duration-200 border border-gray-800"
            >
              <ChevronLeft className="h-4 w-4 mr-2 text-gray-400" />
              <span className="font-medium">Back to Forums</span>
            </Link>
          </div>
        </header>
        <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
          <div className="p-4 bg-gray-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-5">
            <MessageSquare className="h-10 w-10 text-gray-600" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Post Not Found</h1>
          <p className="text-gray-500">The post you are looking for does not exist or may have been removed.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-gray-300 flex flex-col">
      <header className="w-full py-4 px-4 md:px-6 bg-black sticky top-0 z-50 border-b border-gray-800 shadow-md">
        <div className="container mx-auto flex items-center justify-between max-w-4xl">
          <Link
            href={`/forums/${post.category_slug}`}
            className="flex items-center bg-black hover:bg-gray-900 px-3 py-2 rounded-xl text-gray-200 hover:text-white transition-all duration-200 border border-gray-800"
          >
            <ChevronLeft className="h-4 w-4 mr-2 text-gray-400" />
            <span className="font-medium">Back to {post.category_name}</span>
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
        <article className="bg-black border border-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
          <header className="p-5 border-b border-gray-800 bg-black">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white bg-gray-900 px-2.5 py-1 rounded-xl border border-gray-800">
                {post.category_name}
              </span>
              <div className="flex items-center space-x-2">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                </div>
                
                {/* Post Delete Button - Only show if user has permission */}
                {user && post && canDeletePost(user, post) && (
                  <Button
                    onClick={handleDeletePost}
                    disabled={isDeleting}
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-500 hover:text-red-500 hover:bg-transparent"
                    title="Delete post"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-white mb-3">{post.title}</h1>
            <div className="flex items-center">
              <UserCircle className="h-4 w-4 text-gray-500 mr-1.5" />
              <span className="text-sm text-gray-400">{post.author_name}</span>
            </div>
          </header>
          <div
            className="prose prose-sm prose-invert max-w-none p-5 text-gray-300 prose-p:text-gray-300 prose-headings:text-gray-100 prose-strong:text-gray-200 prose-a:text-gray-300 hover:prose-a:text-white prose-blockquote:border-gray-700 prose-blockquote:text-gray-400 prose-code:text-gray-300 prose-code:bg-gray-900 prose-code:p-1 prose-code:rounded-md prose-pre:bg-gray-900 prose-pre:text-gray-300 prose-pre:rounded-md prose-img:rounded-md prose-img:max-h-96 prose-img:mx-auto"
          >
            <ReactMarkdown 
              components={{
                img: ({ node, ...props }) => {
                  const src = typeof props.src === 'string' ? props.src : '';
                  return <img {...props} src={getImageUrl(src)} className="rounded-lg max-h-96 mx-auto my-4" alt={props.alt || 'Post image'} />;
                }
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </article>

        {deleteError && (
          <div className="bg-black border border-red-500 rounded-xl p-4 mb-6 flex items-center text-red-400">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p className="text-sm">{deleteError}</p>
          </div>
        )}

        <section id="replies" className="bg-black border border-gray-800 rounded-xl shadow-lg p-5">
          <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 text-gray-400 mr-2" />
              <h2 className="text-sm font-medium text-white">{post.replies.length} Replies</h2>
            </div>
            {!user && (
              <Button
                onClick={() => router.push('/auth/login')}
                className="bg-black hover:bg-gray-900 text-white text-xs px-3 py-1 h-auto rounded-md border border-gray-800 transition-all duration-200"
              >
                Login to Reply
              </Button>
            )}
          </div>

          {post.replies.length > 0 && (
            <div className="space-y-5 mb-6">
              {post.replies.map((reply) => (
                <div key={reply.id} className="p-4 bg-black border border-gray-800 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <UserCircle className="h-4 w-4 text-gray-500 mr-1.5" />
                      <span className="text-sm font-medium text-gray-300">{reply.author_name}</span>
                      <span className="text-xs text-gray-600 ml-2">
                        &bull; {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    
                    {/* Reply Delete Button - Only show if user has permission */}
                    {user && canDeleteReply(user, reply) && (
                      <Button
                        onClick={() => handleDeleteReply(reply.id)}
                        disabled={isDeleting}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-500 hover:text-red-500 hover:bg-transparent"
                        title="Delete reply"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{reply.content}</p>
                </div>
              ))}
            </div>
          )}

          {user ? (
            <div className="border-t border-gray-800 pt-4 mt-4">
              <form action={dispatchReply}>
                <input type="hidden" name="postId" value={post.id} />
                <input type="hidden" name="authorName" value={user.display_name} />
                <div className="mb-2">
                  <div className="flex items-center mb-2">
                    <UserCircle className="h-4 w-4 text-gray-500 mr-1.5" />
                    <span className="text-sm font-medium text-gray-300">{user.display_name}</span>
                  </div>
                  <Textarea
                    name="content"
                    placeholder="Write your reply..."
                    rows={3}
                    className="bg-black border-gray-800 text-gray-200 focus:border-gray-700 placeholder:text-gray-600 text-sm rounded-xl shadow-sm"
                    required
                    aria-describedby="reply-content-error"
                  />
                  {replyState.errors?.content && (
                    <div id="reply-content-error" aria-live="polite" className="mt-1.5 text-xs text-red-400">
                      {replyState.errors.content.map((error: string) => (
                        <p key={error}>{error}</p>
                      ))}
                    </div>
                  )}
                </div>
                {replyState.errors?.database && (
                  <div aria-live="polite" className="mt-2.5 text-xs text-red-400">
                    {replyState.errors.database.map((error: string) => (
                      <p key={error}>{error}</p>
                    ))}
                  </div>
                )}
                {replyState.message && !replyState.errors?.database && (
                  <div
                    aria-live="polite"
                    className={`mt-2.5 text-xs ${replyState.errors ? "text-red-400" : "text-green-400"}`}
                  >
                    {replyState.message}
                  </div>
                )}
                <div className="mt-3 flex justify-end">
                  <ReplySubmitButton />
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-black border border-gray-800 rounded-xl p-4 text-center mt-4">
              <p className="text-gray-400 text-sm">Sign in to join the conversation</p>
            </div>
          )}
        </section>
      </main>
      <footer className="w-full py-5 text-center border-t border-gray-800">
        <p className="text-gray-600 text-xs">&copy; {new Date().getFullYear()} labrinth. All rights reserved.</p>
      </footer>
    </div>
  )
}
