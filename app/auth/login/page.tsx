"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, User, KeyRound, LogIn } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { login, user } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await login(formData.username, formData.password)
    
    setIsLoading(false)
    
    if (result.success) {
      router.push('/')
    } else {
      setError(result.error || 'An error occurred during login')
    }
  }

  if (user) {
    return (
      <div className="min-h-screen bg-black text-gray-200 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p className="ml-3">Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 flex flex-col">
      <div className="flex-grow flex flex-col items-center justify-center px-4">
        <Link
          href="/"
          className="flex flex-col items-center text-lg font-medium text-gray-100 hover:text-white transition-all duration-300 mb-10"
        >
          <svg width="80" height="80" viewBox="0 0 512 514" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
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
          <span className="tracking-tight bg-gradient-to-r from-gray-100 to-gray-300 text-transparent bg-clip-text font-semibold text-2xl">labrinth</span>
        </Link>
        
        <div className="w-full max-w-md bg-gradient-to-b from-[#0C0C0C] to-[#080808] border border-gray-800/60 rounded-3xl shadow-lg p-7 md:p-9 transform transition-all duration-300 hover:shadow-xl">
          <h1 className="text-xl md:text-2xl text-white font-semibold mb-7 text-center">Welcome Back</h1>
          
          {error && (
            <div className="bg-red-900/20 border border-red-900/40 text-red-400 px-5 py-4 rounded-2xl mb-6 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="bg-gradient-to-br from-gray-900/90 to-gray-900/70 border-gray-700/50 text-gray-200 focus:border-gray-600 pl-12 py-6 text-sm rounded-xl shadow-inner shadow-black/10"
                  placeholder="Enter your username"
                  autoComplete="username"
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-400">
                  Password
                </label>
                <Link href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-500" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-gradient-to-br from-gray-900/90 to-gray-900/70 border-gray-700/50 text-gray-200 focus:border-gray-600 pl-12 py-6 text-sm rounded-xl shadow-inner shadow-black/10"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-7 bg-gradient-to-br from-gray-200 to-gray-300 text-black hover:from-gray-300 hover:to-gray-400 text-sm px-5 py-5 h-auto rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Logging in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" /> Login
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-7 text-center text-sm">
            <span className="text-gray-500">Don't have an account?</span>{' '}
            <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Create Account
            </Link>
          </div>
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-600">
          By logging in, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
      <footer className="w-full py-5 text-center border-t border-gray-800/50">
        <p className="text-gray-600 text-xs">&copy; {new Date().getFullYear()} labrinth. All rights reserved.</p>
      </footer>
    </div>
  )
} 