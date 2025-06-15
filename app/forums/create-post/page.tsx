// File path: app/forums/create-post/page.tsx
"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { createPost, type CreatePostFormState } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Loader2, FileText, ListFilter, Bold, Italic, Link as LinkIcon, Code, Image, PlusCircle } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/client-db"
import { useAuth } from "@/lib/auth-context"

interface CategoryOption {
  id: string
  name: string
}

// Fixed TypeScript interface for ToolbarButton props
interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function ToolbarButton({ icon, label, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-900 rounded-lg transition-colors"
      title={label}
    >
      {icon}
    </button>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-black hover:bg-gray-900 text-white border border-gray-800 w-full sm:w-auto text-sm px-5 py-2.5 h-auto rounded-xl shadow-sm hover:shadow-md transition-colors duration-200"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Submitting...
        </>
      ) : (
        "Create Post"
      )}
    </Button>
  )
}

export default function CreatePostPage() {
  const router = useRouter()
  const { user } = useAuth()
  const initialState: CreatePostFormState = { message: null, errors: {} }
  const [state, dispatch] = useActionState(createPost, initialState)
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  
  // References for formatting
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State for image previews
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/forums/create-post')
    }
  }, [user, router])

  // Handle redirects when post is successfully created
  useEffect(() => {
    if (state.success && state.redirectTo) {
      // Immediate feedback while redirect happens
      document.body.style.opacity = '0.7'
      document.body.style.transition = 'opacity 0.3s'
      
      // Use shorter timeout for faster redirect
      setTimeout(() => {
        router.push(state.redirectTo as string)
      }, 100)
    }
  }, [state, router])

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true)
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status}`);
        }
        const data = await response.json();
        setCategories(data || []);
      } catch (err) {
        console.error("Error fetching categories for form:", err)
      }
      setIsLoadingCategories(false)
    }
    fetchCategories()
  }, [])
  
  // Image handling functions
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    const newImages = Array.from(files)
    setImages(prev => [...prev, ...newImages])
    
    // Generate image previews
    newImages.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }
  
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  // Text formatting functions
  const applyFormat = (format: string) => {
    if (!contentRef.current) return
    
    const textarea = contentRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    
    let formattedText = ''
    
    switch(format) {
      case 'bold':
        formattedText = text.substring(0, start) + '**' + text.substring(start, end) + '**' + text.substring(end)
        break
      case 'italic':
        formattedText = text.substring(0, start) + '*' + text.substring(start, end) + '*' + text.substring(end)
        break
      case 'link':
        formattedText = text.substring(0, start) + '[' + text.substring(start, end) + '](url)' + text.substring(end)
        break
      case 'code':
        formattedText = text.substring(0, start) + '`' + text.substring(start, end) + '`' + text.substring(end)
        break
      default:
        return
    }
    
    textarea.value = formattedText
    textarea.focus()
    
    // Adjust cursor position for links
    if (format === 'link') {
      textarea.setSelectionRange(end + 4, end + 7) // Position cursor at "url"
    } else {
      textarea.setSelectionRange(start, end) // Keep selection
    }
  }

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Create a new FormData instance
    const formData = new FormData(e.currentTarget);
    
    // Remove any existing image fields
    for (const key of Array.from(formData.keys())) {
      if (key === 'images') {
        formData.delete(key);
      }
    }
    
    // Add each image file to the FormData
    images.forEach((file) => {
      formData.append('images', file);
    });
    
    // Dispatch the action with the FormData
    dispatch(formData);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-gray-200 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p className="ml-3">Redirecting to login...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-gray-300 flex flex-col">
      <header className="w-full py-4 px-4 md:px-6 bg-black sticky top-0 z-50 border-b border-gray-800 shadow-md">
        <div className="container mx-auto flex items-center justify-between max-w-3xl">
          <Link 
            href="/" 
            className="flex items-center bg-black hover:bg-gray-900 px-3 py-2 rounded-xl text-gray-200 hover:text-white transition-colors duration-200 border border-gray-800"
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
            <span className="font-semibold text-white text-lg">labrinth</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-10 w-full max-w-3xl flex-grow">
        <div className="bg-black border border-gray-800 rounded-xl shadow-lg p-6 md:p-8">
          <h1 className="text-xl font-semibold text-white mb-3 flex items-center">
            <FileText className="h-5 w-5 mr-3 text-gray-400" />
            Create New Post
          </h1>
          <p className="text-gray-500 text-sm mb-6">Share your thoughts with the community</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1.5">
                Title
              </label>
              <div className="relative">
                <Input
                  id="title"
                  name="title"
                  className="bg-black border-gray-800 text-gray-200 focus:border-gray-700 placeholder:text-gray-600 rounded-xl shadow-sm py-6"
                  placeholder="Enter post title"
                  required
                  aria-describedby="title-error"
                />
              </div>
              {state.errors?.title && (
                <div id="title-error" aria-live="polite" className="mt-1.5 text-xs text-red-400">
                  {state.errors.title.map((error: string) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-400 mb-1.5">
                Category
              </label>
              <div className="relative">
                {isLoadingCategories ? (
                  <div className="h-12 w-full bg-black border border-gray-800 rounded-xl flex items-center px-4 text-sm text-gray-500 shadow-sm">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading categories...
                  </div>
                ) : (
                  <Select name="categoryId" required>
                    <SelectTrigger
                      id="categoryId"
                      className="bg-black border-gray-800 text-gray-200 focus:border-gray-700 data-[placeholder]:text-gray-600 rounded-xl shadow-sm h-12 pl-10"
                      aria-describedby="category-error"
                    >
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-gray-800 text-gray-200 rounded-xl shadow-lg">
                      {categories.length > 0 ? (
                        categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} className="hover:!bg-gray-900 focus:!bg-gray-900 rounded-md">
                            {cat.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">No categories available.</div>
                      )}
                    </SelectContent>
                  </Select>
                )}
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <ListFilter className="h-4 w-4 text-gray-500" />
                </div>
              </div>
              {state.errors?.categoryId && (
                <div id="category-error" aria-live="polite" className="mt-1.5 text-xs text-red-400">
                  {state.errors.categoryId.map((error: string) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Hidden input for author name using authenticated user */}
            <input
              type="hidden"
              id="authorName"
              name="authorName"
              value={user.display_name}
            />

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-400 mb-1.5">
                Content
              </label>
              
              {/* Formatting Toolbar */}
              <div className="flex items-center mb-2 border border-gray-800 rounded-t-xl bg-black p-2 space-x-1 border-b-0">
                <div className="flex space-x-1 mr-2 pr-2 border-r border-gray-800">
                  <ToolbarButton 
                    icon={<Bold className="h-4 w-4" />} 
                    label="Bold" 
                    onClick={() => applyFormat('bold')} 
                  />
                  <ToolbarButton 
                    icon={<Italic className="h-4 w-4" />} 
                    label="Italic" 
                    onClick={() => applyFormat('italic')} 
                  />
                </div>
                
                <div className="flex space-x-1 mr-2 pr-2 border-r border-gray-800">
                  <ToolbarButton 
                    icon={<LinkIcon className="h-4 w-4" />} 
                    label="Add Link" 
                    onClick={() => applyFormat('link')} 
                  />
                  <ToolbarButton 
                    icon={<Code className="h-4 w-4" />} 
                    label="Code" 
                    onClick={() => applyFormat('code')} 
                  />
                </div>
                
                <div className="flex space-x-1">
                  <ToolbarButton
                    icon={<Image className="h-4 w-4" />}
                    label="Add Image" 
                    onClick={() => fileInputRef.current?.click()}
                  />
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  name="images"
                />
              </div>
              
              <Textarea
                id="content"
                name="content"
                ref={contentRef}
                rows={10}
                className="bg-black border-gray-800 text-gray-200 focus:border-gray-700 placeholder:text-gray-600 rounded-b-xl rounded-t-none shadow-sm"
                placeholder="Write your post content here... Use the toolbar above for formatting."
                required
                aria-describedby="content-error"
              />
              
              {/* Formatting Help Text */}
              <div className="mt-1 text-xs text-gray-500">
                <p>You can use markdown: **bold**, *italic*, [link text](url), `code`</p>
              </div>
              
              {state.errors?.content && (
                <div id="content-error" aria-live="polite" className="mt-1.5 text-xs text-red-400">
                  {state.errors.content.map((error: string) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              )}
              
              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 border border-gray-800 rounded-xl p-4 bg-gray-900/20">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Attached Images ({imagePreviews.length})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={preview} 
                          alt={`Preview ${index+1}`} 
                          className="w-full h-24 object-cover rounded-lg border border-gray-800"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-black bg-opacity-70 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove image"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                            <path d="M18 6L6 18M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {state.errors?.database && (
              <div aria-live="polite" className="text-sm text-red-400">
                {state.errors.database.map((error: string) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            )}
            {state.message && !state.errors?.database && (
              <div
                aria-live="polite"
                className={`text-sm ${state.errors && Object.keys(state.errors).length > 0 ? "text-red-400" : "text-green-400"}`}
              >
                {state.message}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <SubmitButton />
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
