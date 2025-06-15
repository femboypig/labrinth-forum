"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { PlusCircle, Settings, LogIn, LogOut, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ForumCategoryList } from "@/components/forum-category-list"
import { CategoryWithStats } from "@/lib/data"

export const ForumHeader = () => {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const closeDropdown = () => setIsMenuOpen(false)
    if (isMenuOpen) {
      document.addEventListener('click', closeDropdown)
    }
    return () => document.removeEventListener('click', closeDropdown)
  }, [isMenuOpen])

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
    // Stay on the same page after logout
  }

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event from bubbling up
    setIsMenuOpen(prev => !prev)
  }

  return (
    <header className="w-full py-4 px-4 md:px-6 bg-black sticky top-0 z-50 shadow-md border-b border-gray-800">
      <div className="container mx-auto flex justify-between items-center max-w-7xl">
        <Link
          href="/"
          className="flex items-center text-lg font-medium text-white transition-colors duration-200"
        >
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
          <span className="font-semibold">labrinth</span>
        </Link>
        <nav className="flex items-center space-x-3 sm:space-x-4">
          <a
            href="http://rs.labrinthmc.ru"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-900 transition-colors duration-200 border border-transparent hover:border-gray-800"
          >
            Rules
          </a>
          <span className="text-xs text-gray-700 cursor-default hidden md:block px-3 py-1.5 bg-gray-900 rounded-xl border border-gray-800" title="Server IP">
            IP: labrinthmc.ru
          </span>
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
          
          {isLoading ? null : (
            user ? (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMenuToggle}
                  className="text-gray-300 hover:text-white bg-black hover:bg-gray-900 text-xs px-3 py-2 h-auto rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md border border-gray-800"
                >
                  <User className="h-3.5 w-3.5 mr-2" />
                  {user.display_name}
                </Button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-black border border-gray-800 rounded-xl shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 text-sm text-gray-400 border-b border-gray-800">
                      <div className="font-medium text-gray-300">{user.display_name}</div>
                      <div className="truncate">{user.email}</div>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false)
                          router.push('/profile')
                        }}
                        className="flex items-center px-4 py-2 text-sm text-gray-400 hover:bg-gray-900 hover:text-white w-full text-left"
                      >
                        <Settings className="h-3.5 w-3.5 mr-2" />
                        Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-sm text-gray-400 hover:bg-gray-900 hover:text-white w-full text-left"
                      >
                        <LogOut className="h-3.5 w-3.5 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-400 hover:text-white bg-black hover:bg-gray-900 text-xs px-3 py-2 h-auto rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md border border-gray-800"
                >
                  <LogIn className="h-3.5 w-3.5 mr-2" />
                  Login
                </Button>
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  )
}

export function HomeClient({ categories }: { categories: CategoryWithStats[] }) {
  return (
    <div className="bg-black border border-gray-800 rounded-xl p-6 shadow-md">
      <ForumCategoryList categories={categories} />
    </div>
  )
} 