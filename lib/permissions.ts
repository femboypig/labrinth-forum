import { User } from './data'

// Define the type for a post or reply owner
export interface ContentOwner {
  author_name: string
}

/**
 * Check if a user can create posts or replies
 * All authenticated users can create content
 */
export function canCreate(user: User | null): boolean {
  return user !== null
}

/**
 * Check if a user can create posts in moderated sections
 * Only admins and moderators can create posts in moderated sections
 */
export function canCreateModeratedPost(user: User | null): boolean {
  if (!user) return false
  return user.role === 'admin' || user.role === 'moderator'
}

/**
 * Check if a user can reply to a post
 * All authenticated users can reply (with provisions for future restrictions)
 */
export function canReply(user: User | null, post: any): boolean {
  // For now, any authenticated user can reply
  // In the future, we might check if post.allowReplies === true
  // or if the user is not banned/muted
  return user !== null
}

/**
 * Check if a user can delete a post
 */
export function canDeletePost(user: User | null, post: ContentOwner): boolean {
  if (!user) return false
  
  // Admins can delete any post
  if (user.role === 'admin') return true
  
  // Moderators can delete any post
  if (user.role === 'moderator') return true
  
  // Regular users can only delete their own posts
  return user.display_name === post.author_name
}

/**
 * Check if a user can delete a reply
 */
export function canDeleteReply(user: User | null, reply: ContentOwner): boolean {
  if (!user) return false
  
  // Admins can delete any reply
  if (user.role === 'admin') return true
  
  // Moderators can delete any reply
  if (user.role === 'moderator') return true
  
  // Regular users can only delete their own replies
  return user.display_name === reply.author_name
}

/**
 * Check if user can ban another user
 * Only admins and moderators can ban users
 */
export function canBanUser(user: User | null): boolean {
  if (!user) return false
  return user.role === 'admin' || user.role === 'moderator'
}

/**
 * Check if user can mute another user
 * Only admins and moderators can mute users
 */
export function canMuteUser(user: User | null): boolean {
  if (!user) return false
  return user.role === 'admin' || user.role === 'moderator'
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(user: User | null): boolean {
  if (!user) return false
  return user.role === 'admin'
}

/**
 * Check if user has moderator privileges
 */
export function isModerator(user: User | null): boolean {
  if (!user) return false
  return user.role === 'moderator' || user.role === 'admin' // Admins inherit moderator powers
} 