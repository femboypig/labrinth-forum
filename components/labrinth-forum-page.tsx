"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  MessageSquare,
  Megaphone,
  ServerCog,
  HelpCircle,
  Coffee,
  Lightbulb,
  PlusCircle,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"
// We'll import Supabase client later when setting up DB interactions

// Define a type for category items
interface Category {
  id: string // Assuming ID from database
  title: string
  description: string
  icon: LucideIcon
  slug: string // For URL routing
}

const ForumHeader = () => {
  return (
    <header className="w-full py-4 px-4 sm:py-6 md:px-8 bg-gray-950 sticky top-0 z-50 border-b border-gray-800 shadow-sm">
      <div className="container mx-auto flex flex-wrap justify-between items-center max-w-6xl">
        <Link href="/" className="text-3xl font-bold text-white tracking-tight hover:text-gray-300 transition-colors">
          labrinth
        </Link>
        <nav className="flex items-center space-x-3 sm:space-x-4 md:space-x-6 mt-2 sm:mt-0">
          <Link href="/" className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors duration-200">
            Forums
          </Link>
          <a
            href="http://rs.labrinthmc.ru"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors duration-200"
          >
            Rules
          </a>
          <Link href="/forums/create-post">
            <Button
              variant="outline"
              size="sm"
              className="text-gray-200 border-gray-700 hover:bg-gray-800 hover:text-white hover:border-gray-600 transition-colors"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </Link>
          <span className="text-sm sm:text-base text-gray-500 cursor-default" title="Server IP">
            IP: labrinthmc.ru
          </span>
        </nav>
      </div>
    </header>
  )
}

const CategoryCard = ({ title, description, icon: IconComponent, slug }: Category) => {
  return (
    <Link href={`/forums/${slug}`} className="block group">
      <Card className="bg-gray-900 border-gray-800 group-hover:border-gray-600 transition-all duration-300 ease-in-out transform group-hover:shadow-2xl group-hover:shadow-gray-900/70 flex flex-col h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <IconComponent className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors flex-shrink-0" />
            <CardTitle className="text-lg text-gray-100 group-hover:text-white transition-colors">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-grow pb-3">
          <CardDescription className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
            {description}
          </CardDescription>
        </CardContent>
        <CardFooter>
          <div className="text-gray-400 group-hover:text-white text-sm flex items-center w-full transition-colors duration-200">
            View Category{" "}
            <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

export default function LabrinthForumPage() {
  // Mock categories for now, will be replaced by DB call
  const categories: Category[] = [
    {
      id: "1",
      title: "General Discussion",
      description: "Talk about anything and everything related to labrinth.",
      icon: MessageSquare,
      slug: "general-discussion",
    },
    {
      id: "2",
      title: "Announcements",
      description: "Stay updated with the latest server news and important information.",
      icon: Megaphone,
      slug: "announcements",
    },
    {
      id: "3",
      title: "Server Updates",
      description: "Details about game updates, patches, and maintenance schedules.",
      icon: ServerCog,
      slug: "server-updates",
    },
    {
      id: "4",
      title: "Support & Help",
      description: "Need assistance? Post your questions and issues here.",
      icon: HelpCircle,
      slug: "support-help",
    },
    {
      id: "5",
      title: "Off-Topic Chat",
      description: "Discuss non-server related topics with the community.",
      icon: Coffee,
      slug: "off-topic-chat",
    },
    {
      id: "6",
      title: "Feedback & Suggestions",
      description: "Share your valuable ideas to help improve labrinth.",
      icon: Lightbulb,
      slug: "feedback-suggestions",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-gray-200 flex flex-col">
      <ForumHeader />
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12 w-full max-w-6xl">
        <section className="mb-10 sm:mb-12 text-left">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-2 text-white">labrinth Community Forums</h2>
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl">
            Join the conversation. Share your experiences, get help, and stay updated.
          </p>
        </section>

        <section>
          {/* <h3 className="text-xl sm:text-2xl font-semibold mb-5 sm:mb-6 text-gray-100">Categories</h3> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} {...cat} />
            ))}
          </div>
        </section>
      </main>
      <footer className="w-full py-6 text-center border-t border-gray-800 bg-gray-950">
        <p className="text-gray-500 text-xs">&copy; {new Date().getFullYear()} labrinth. All rights reserved.</p>
        <p className="text-gray-600 text-xs mt-1">Server IP: labrinthmc.ru</p>
      </footer>
    </div>
  )
}
