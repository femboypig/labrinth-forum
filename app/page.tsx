import { getServerCategories } from "@/lib/server-data"
import { HomeClient } from "@/components/forum-client"
import Link from "next/link"
import { Shield, ChevronRight, PlusCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ForumHeader } from "@/components/forum-client"

// Server component that fetches data and renders the client component
export default async function Home() {
  const categories = await getServerCategories()
  return (
    <div className="min-h-screen bg-black text-gray-200 flex flex-col selection:bg-gray-700 selection:text-white">
      <ForumHeader />
      <main className="container mx-auto px-4 py-6 md:py-8 w-full max-w-4xl flex-grow">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Forums</h1>
          <Link href="/forums/create-post">
            <Button
              variant="outline"
              size="sm"
              className="text-white bg-black hover:bg-gray-900 hover:text-white transition-colors duration-200 text-xs px-4 py-2 h-auto rounded-xl shadow-sm hover:shadow-md border border-gray-800"
            >
              <PlusCircle className="h-3.5 w-3.5 mr-2" />
              New Post
            </Button>
          </Link>
        </div>
        
        <div className="mb-6">
          <Link 
            href="/forums/moderated" 
            className="block bg-black border border-amber-700/30 rounded-xl shadow-lg overflow-hidden hover:border-amber-600/50 transition-all duration-200"
          >
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-black border border-amber-700/30 rounded-xl mr-4">
                  <Shield className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-white mb-1">Moderated Posts</h2>
                  <p className="text-gray-400 text-sm">Official announcements and important information</p>
                </div>
              </div>
              <div className="text-amber-400">
                <ChevronRight className="h-5 w-5" />
              </div>
            </div>
          </Link>
        </div>
        
        <h2 className="text-lg font-semibold text-white mb-4">Categories</h2>
        
        <HomeClient categories={categories} />
      </main>
      <footer className="w-full py-6 text-center border-t border-gray-800">
        <p className="text-gray-700 text-xs tracking-wide">&copy; {new Date().getFullYear()} labrinth</p>
      </footer>
    </div>
  )
}
