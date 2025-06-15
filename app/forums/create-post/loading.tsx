// File path: app/forums/create-post/loading.tsx
import { Loader2 } from "lucide-react"

export default function LoadingCreatePostPage() {
  return (
    <div className="min-h-screen bg-black text-gray-300 flex flex-col">
      <header className="w-full py-3 px-4 md:px-6 bg-black sticky top-0 z-50 border-b border-gray-800">
        <div className="container mx-auto flex items-center max-w-3xl">
          <span className="text-sm text-gray-400">Loading...</span>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 md:py-8 w-full max-w-3xl flex-grow flex items-center justify-center">
        <div className="flex items-center text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-3 text-lg">Loading Create Post Page...</p>
        </div>
      </main>
      <footer className="w-full py-5 text-center border-t border-gray-800">
        <p className="text-gray-600 text-xs">&copy; {new Date().getFullYear()} labrinth. All rights reserved.</p>
      </footer>
    </div>
  )
}
