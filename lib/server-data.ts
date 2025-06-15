import "server-only"
import { unstable_noStore as noStore } from "next/cache"
import { 
  CategoryWithStats,
  PostListItem,
  PostDetail,
  User,
  AuthResponse
} from "./data"
import { localDb } from "./local-db"
import { promises as fs } from "fs"
import path from "path"

// Server-only data fetching functions
export async function getServerCategories(): Promise<CategoryWithStats[]> {
  noStore() // Opt out of caching
  try {
    const categories = await readJsonFile<any[]>("lib/mock-data/categories.json")
    const posts = await readJsonFile<any[]>("lib/mock-data/posts.json")
    const replies = await readJsonFile<any[]>("lib/mock-data/replies.json")

    return categories.map((category) => {
      const categoryPosts = posts.filter((post) => post.category_id === category.id)
      const categoryPostIds = categoryPosts.map((post) => post.id)
      const categoryReplies = replies.filter((reply) => categoryPostIds.includes(reply.post_id))

      return {
        ...category,
        post_count: categoryPosts.length,
        reply_count: categoryReplies.length,
      }
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return [] // Return empty array on error
  }
}

export async function getServerCategoryBySlug(slug: string): Promise<CategoryWithStats | null> {
  noStore()
  try {
    const categories = await readJsonFile<any[]>("lib/mock-data/categories.json")
    const posts = await readJsonFile<any[]>("lib/mock-data/posts.json")
    const replies = await readJsonFile<any[]>("lib/mock-data/replies.json")

    const category = categories.find((c) => c.slug === slug)
    
    if (!category) {
      return null // Category not found
    }

    const categoryPosts = posts.filter((post) => post.category_id === category.id)
    const categoryPostIds = categoryPosts.map((post) => post.id)
    const categoryReplies = replies.filter((reply) => categoryPostIds.includes(reply.post_id))

    return {
      ...category,
      post_count: categoryPosts.length,
      reply_count: categoryReplies.length,
    }
  } catch (error) {
    console.error(`Error fetching category ${slug}:`, error)
    return null
  }
}

export async function getServerPostsForCategory(categoryId: string): Promise<PostListItem[]> {
  noStore()
  try {
    return localDb.getPostsForCategory(categoryId)
  } catch (error) {
    console.error(`Error fetching posts for category ${categoryId}:`, error)
    return []
  }
}

export async function getServerPostDetails(postId: string): Promise<PostDetail | null> {
  noStore()
  try {
    const posts = await readJsonFile<any[]>("lib/mock-data/posts.json")
    const replies = await readJsonFile<any[]>("lib/mock-data/replies.json")
    const categories = await readJsonFile<any[]>("lib/mock-data/categories.json")

    const post = posts.find((p) => p.id === postId)

    if (!post) {
      return null // Post not found
    }

    const category = categories.find((c) => c.id === post.category_id)
    const postReplies = replies
      .filter((reply) => reply.post_id === postId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      author_name: post.author_name,
      created_at: post.created_at,
      reply_count: postReplies.length,
      category_slug: category?.slug || "",
      category_name: category?.name || "",
      replies: postReplies,
    }
  } catch (error) {
    console.error("Error fetching post details:", error)
    return null
  }
}

// For API routes - these don't use noStore
export async function getCategoriesWithStats(): Promise<CategoryWithStats[]> {
  try {
    return localDb.getCategories()
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export async function getCategoryBySlug(slug: string): Promise<CategoryWithStats | null> {
  try {
    return localDb.getCategoryBySlug(slug)
  } catch (error) {
    console.error(`Error fetching category ${slug}:`, error)
    return null
  }
}

export async function getPostsForCategory(categoryId: string): Promise<PostListItem[]> {
  try {
    return localDb.getPostsForCategory(categoryId)
  } catch (error) {
    console.error(`Error fetching posts for category ${categoryId}:`, error)
    return []
  }
}

export async function getPostDetails(postId: string): Promise<PostDetail | null> {
  try {
    return localDb.getPostById(postId)
  } catch (error) {
    console.error(`Error fetching post details ${postId}:`, error)
    return null
  }
}

// Helper to read JSON files
async function readJsonFile<T>(filePath: string): Promise<T> {
  const dir = path.join(process.cwd(), filePath)
  const data = await fs.readFile(dir, "utf8")
  return JSON.parse(data)
}

// User authentication functions
export async function authenticateUser(username: string, password: string): Promise<AuthResponse> {
  try {
    const users = await readJsonFile<any[]>("lib/mock-data/users.json")
    const user = users.find(u => u.username === username && u.password === password)

    if (!user) {
      return { user: null, error: "Invalid username or password" }
    }

    // Don't send the password to the client
    const { password: _, ...safeUser } = user

    return {
      user: safeUser as User,
      error: null
    }
  } catch (error) {
    console.error("Error authenticating user:", error)
    return { user: null, error: "Authentication error" }
  }
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const users = await readJsonFile<any[]>("lib/mock-data/users.json")
    const user = users.find(u => u.id === userId)
    
    if (!user) {
      return null
    }
    
    // Don't include the password
    const { password: _, ...safeUser } = user
    return safeUser as User
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

// Verify user password
export async function verifyPassword(userId: string, password: string): Promise<boolean> {
  try {
    const users = await readJsonFile<any[]>("lib/mock-data/users.json")
    const user = users.find(u => u.id === userId)
    
    if (!user) {
      return false
    }
    
    return user.password === password
  } catch (error) {
    console.error("Error verifying password:", error)
    return false
  }
}

// Update user password
export async function updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
  try {
    const users = await readJsonFile<any[]>("lib/mock-data/users.json")
    const userIndex = users.findIndex(u => u.id === userId)
    
    if (userIndex === -1) {
      return false
    }
    
    // Update the password
    users[userIndex] = {
      ...users[userIndex],
      password: newPassword
    }
    
    // Write the updated users back to the file
    await fs.writeFile(
      path.join(process.cwd(), "lib/mock-data/users.json"),
      JSON.stringify(users, null, 2),
      "utf8"
    )
    
    return true
  } catch (error) {
    console.error("Error updating password:", error)
    return false
  }
}

// Delete user account
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const users = await readJsonFile<any[]>("lib/mock-data/users.json")
    const userIndex = users.findIndex(u => u.id === userId)
    
    if (userIndex === -1) {
      return false
    }
    
    // Remove the user from the array
    users.splice(userIndex, 1)
    
    // Write the updated users back to the file
    await fs.writeFile(
      path.join(process.cwd(), "lib/mock-data/users.json"),
      JSON.stringify(users, null, 2),
      "utf8"
    )
    
    return true
  } catch (error) {
    console.error("Error deleting user:", error)
    return false
  }
}

export async function registerUser(username: string, email: string, password: string): Promise<AuthResponse> {
  try {
    const users = await readJsonFile<any[]>("lib/mock-data/users.json")
    
    // Check if username or email already exists
    const existingUser = users.find(u => u.username === username || u.email === email)
    if (existingUser) {
      return { 
        user: null, 
        error: existingUser.username === username ? "Username already taken" : "Email already registered" 
      }
    }

    // Create new user
    const newUser = {
      id: `user${users.length + 1}`,
      username,
      password,
      email,
      display_name: username, // Default display name to username
      avatar_url: null,
      created_at: new Date().toISOString(),
      role: "user" as const
    }

    // Add user to the mock data
    const updatedUsers = [...users, newUser]
    
    // Write updated users data to file
    await fs.writeFile(
      path.join(process.cwd(), "lib/mock-data/users.json"),
      JSON.stringify(updatedUsers, null, 2),
      "utf8"
    )

    // Don't send the password to the client
    const { password: _, ...safeUser } = newUser

    return {
      user: safeUser as User,
      error: null
    }
  } catch (error) {
    console.error("Error registering user:", error)
    return { user: null, error: "Registration error" }
  }
} 