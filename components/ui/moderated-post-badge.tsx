import { Shield } from 'lucide-react'

interface ModeratedPostBadgeProps {
  className?: string
}

export function ModeratedPostBadge({ className = '' }: ModeratedPostBadgeProps) {
  return (
    <div className={`inline-flex items-center bg-black border border-amber-700/30 px-2 py-0.5 rounded-md text-xs ${className}`}>
      <Shield className="h-3 w-3 text-amber-500 mr-1" />
      <span className="text-amber-400 font-medium">Mod Post</span>
    </div>
  )
} 