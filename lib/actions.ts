"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Helper functions for file operations
function readJsonFile<T>(filePath: string): T {
  const fullPath = path.join(process.cwd(), filePath)
  const fileContent = fs.readFileSync(fullPath, 'utf8')
  return JSON.parse(fileContent) as T
}

function writeJsonFile<T>(filePath: string, data: T): void {
  const fullPath = path.join(process.cwd(), filePath)
  const jsonData = JSON.stringify(data, null, 2)
  fs.writeFileSync(fullPath, jsonData, 'utf8')
}

// Function to save uploaded images
async function saveImage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Create unique filename
  const filename = `${uuidv4()}-${file.name.replace(/\s+/g, '-')}`;
  const uploadDir = path.join(process.cwd(), 'public/uploads');
  
  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const filepath = path.join(uploadDir, filename);
  fs.writeFileSync(filepath, buffer);
  
  // Return the public URL path
  return `/uploads/${filename}`;
}

// Local database 
const postsPath = 'lib/mock-data/posts.json'
const categoriesPath = 'lib/mock-data/categories.json'
const repliesPath = 'lib/mock-data/replies.json'

const PostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title too long"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  categoryId: z.string().min(1, "Invalid category ID"),
  authorName: z.string().min(1, "Author name required"), // Temporary
})

export interface CreatePostFormState {
  errors?: {
    title?: string[]
    content?: string[]
    categoryId?: string[]
    authorName?: string[]
    database?: string[]
  }
  message?: string | null
  success?: boolean
  redirectTo?: string
}

export async function createPost(prevState: CreatePostFormState, formData: FormData): Promise<CreatePostFormState> {
  // Validate form data
  const validatedFields = PostSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    categoryId: formData.get("categoryId"),
    authorName: formData.get("authorName") || "Anonymous", // Default or get from auth
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check your input.",
    }
  }

  let { title, content, categoryId, authorName } = validatedFields.data

  try {
    // Handle image uploads
    const imageFiles = formData.getAll('images') as File[];
    const imageUrls: string[] = [];
    
    // Process each image file
    if (imageFiles && imageFiles.length > 0) {
      for (const file of imageFiles) {
        if (file.size > 0) {
          const imageUrl = await saveImage(file);
          imageUrls.push(imageUrl);
        }
      }
    }
    
    // If there are images, append them to the content as markdown
    if (imageUrls.length > 0) {
      const imageMarkdown = imageUrls.map(url => `\n\n![Image](${url})`).join('');
      content = content + imageMarkdown;
    }
    
    // Read existing posts
    const posts = readJsonFile<any[]>(postsPath)
    
    // Get category data
    const categories = readJsonFile<any[]>(categoriesPath)
    const category = categories.find(c => c.id === categoryId)
    
    if (!category) {
      return { 
        errors: { categoryId: ["Category not found"] }, 
        message: "Selected category not found." 
      }
    }
    
    // Create new post
    const newPost = {
      id: uuidv4(),
      title,
      content,
      author_name: authorName,
      created_at: new Date().toISOString(),
      category_id: categoryId,
      categories: {
        slug: category.slug,
        name: category.name
      },
      replies: [{ count: 0 }],
      images: imageUrls
    }
    
    // Add to posts array
    posts.push(newPost)
    writeJsonFile(postsPath, posts)
    
    // Update category post count
    category.post_count += 1
    writeJsonFile(categoriesPath, categories)
    
    // Revalidate paths
    revalidatePath(`/forums/${category.slug}`)
    revalidatePath("/") // Revalidate home page (forum list)
    
    // Return success with redirect URL instead of using redirect()
    return { 
      success: true,
      message: "Post created successfully!",
      redirectTo: `/forums/${category.slug}`
    }
    
  } catch (e: any) {
    console.error("Error creating post:", e)
    return {
      errors: { database: [e.message || "An unexpected error occurred."] },
      message: "An unexpected error occurred.",
    }
  }
}

// Placeholder for Reply Action
const ReplySchema = z.object({
  content: z.string().min(1, "Reply cannot be empty"),
  postId: z.string().min(1, "Invalid post ID"),
  authorName: z.string().min(1, "Author name required"), // Temporary
})

export interface CreateReplyFormState {
  errors?: {
    content?: string[]
    postId?: string[]
    authorName?: string[]
    database?: string[]
  }
  message?: string | null
}

export async function createReply(prevState: CreateReplyFormState, formData: FormData): Promise<CreateReplyFormState> {
  const validatedFields = ReplySchema.safeParse({
    content: formData.get("content"),
    postId: formData.get("postId"),
    authorName: formData.get("authorName") || "Anonymous",
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
    }
  }

  const { content, postId, authorName } = validatedFields.data

  try {
    // Read data files
    const posts = readJsonFile<any[]>(postsPath)
    const replies = readJsonFile<any[]>(repliesPath)
    const categories = readJsonFile<any[]>(categoriesPath)
    
    // Find the post
    const post = posts.find(p => p.id === postId)
    if (!post) {
      return { 
        errors: { postId: ["Post not found"] }, 
        message: "Post not found." 
      }
    }
    
    // Create new reply
    const newReply = {
      id: uuidv4(),
      post_id: postId,
      author_name: authorName,
      content,
      created_at: new Date().toISOString()
    }
    
    // Add to replies array
    replies.push(newReply)
    writeJsonFile(repliesPath, replies)
    
    // Update post reply count
    post.replies[0].count = post.replies[0].count + 1
    writeJsonFile(postsPath, posts)
    
    // Find category and update reply count
    const category = categories.find(c => c.id === post.category_id)
    if (category) {
      category.reply_count += 1
      writeJsonFile(categoriesPath, categories)
    }
    
    // Revalidate paths
    if (category) {
      revalidatePath(`/forums/${category.slug}/${postId}`)
    }
    revalidatePath("/") // Also revalidate home as reply counts might change
    
    return { message: "Reply posted successfully." }
  } catch (e: any) {
    return {
      errors: { database: [e.message || "An unexpected error occurred."] },
      message: "An unexpected error occurred.",
    }
  }
}
