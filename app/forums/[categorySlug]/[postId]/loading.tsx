import { Loader2 } from "lucide-react"

export default function LoadingPostPage() {
  return (
    <div className="min-h-screen bg-black text-gray-200 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      <p className="ml-3">Loading post...</p>
    </div>
  )
}
