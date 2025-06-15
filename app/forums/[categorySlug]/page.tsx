import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getServerCategoryBySlug, getServerPostsForCategory } from "@/lib/server-data"
import { PostListItem } from "@/lib/data" 
import { ChevronLeft, PlusCircle, MessageSquare, FileText, Clock, User } from "lucide-react"
import { notFound } from "next/navigation"
import { formatDistanceToNow } from "date-fns" // For relative time

function PostItem({ post }: { post: PostListItem }) {
  return (
    <Link href={`/forums/${post.category_slug}/${post.id}`} className="block group">
      <div className="flex items-center p-4 sm:p-5 hover:bg-gray-900 transition-colors duration-200 border-b border-gray-800 last:border-b-0 first:rounded-t-xl last:rounded-b-xl">
        <div className="flex-shrink-0 mr-4 sm:mr-5">
          <div className="p-2 bg-gray-900 rounded-xl group-hover:bg-black transition-colors duration-200 border border-gray-800">
            <FileText className="h-5 w-5 text-gray-500 group-hover:text-gray-300 transition-colors" />
          </div>
        </div>
        <div className="flex-grow">
          <h3 className="font-medium text-sm sm:text-base text-gray-100 group-hover:text-white transition-colors line-clamp-1 mb-1">
            {post.title}
          </h3>
          <div className="flex items-center text-xs text-gray-500">
            <div className="flex items-center">
              <User className="h-3.5 w-3.5 mr-1.5" />
              <span>{post.author_name}</span>
            </div>
            <div className="flex items-center ml-4">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 text-xs text-gray-500 flex items-center ml-4 sm:ml-5 bg-black px-3 py-2 rounded-xl transition-colors duration-200 border border-gray-800">
          <MessageSquare className="h-4 w-4 mr-1.5 text-gray-500 group-hover:text-gray-400" />
          <span className="group-hover:text-gray-400">{post.reply_count}</span>
        </div>
      </div>
    </Link>
  )
}

export default async function CategoryPage({ params }: { params: { categorySlug: string } }) {
  // In Next.js 15, params need to be awaited
  const { categorySlug } = await params;
  
  if (!categorySlug || typeof categorySlug !== 'string') {
    return notFound();
  }

  const category = await getServerCategoryBySlug(categorySlug);

  if (!category) {
    return notFound();
  }

  const posts = await getServerPostsForCategory(category.id);

  return (
    <div className="min-h-screen bg-black text-gray-300 flex flex-col">
      <header className="w-full py-4 px-4 md:px-6 bg-black sticky top-0 z-50 border-b border-gray-800 shadow-md">
        <div className="container mx-auto flex justify-between items-center max-w-7xl">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center bg-black hover:bg-gray-900 px-3 py-2 rounded-xl text-gray-200 hover:text-white transition-colors duration-200 border border-gray-800 mr-5"
            >
              <ChevronLeft className="h-4 w-4 mr-2 text-gray-400" />
              <span className="font-medium">All Categories</span>
            </Link>
            <div className="flex items-center">
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
              <span className="tracking-tight text-white font-semibold text-lg">labrinth</span>
            </div>
          </div>
          <Link href={`/forums/create-post?category=${category.slug}`}>
            <Button
              className="bg-black hover:bg-gray-900 text-white border border-gray-800 text-sm px-4 py-2 h-auto rounded-xl shadow-sm hover:shadow-md transition-colors duration-200"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8 w-full max-w-7xl flex-grow">
        <div className="bg-black border border-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-5 md:p-6 border-b border-gray-800 bg-black">
            <div className="flex items-center mb-2">
              <MessageSquare className="h-4 w-4 text-gray-400 mr-2" />
              <div className="bg-gray-900 px-2.5 py-0.5 rounded-xl text-xs text-gray-300 border border-gray-800">
                Forum
              </div>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">{category.name}</h1>
            {category.description && <p className="text-sm text-gray-500">{category.description}</p>}
          </div>

          {posts.length > 0 ? (
            <div>
              {posts.map((post) => (
                <PostItem key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <div className="bg-gray-900 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-gray-800">
                <MessageSquare className="h-8 w-8 text-gray-600" />
              </div>
              <h2 className="text-lg font-medium text-white mb-2">No posts yet</h2>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">Be the first to start a discussion in {category.name}.</p>
              <Link href={`/forums/create-post?category=${category.slug}`}>
                <Button className="bg-black hover:bg-gray-900 text-white border border-gray-800 text-sm px-4 py-2 h-auto rounded-xl shadow-sm hover:shadow-md transition-colors duration-200">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Post
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <footer className="w-full py-5 text-center border-t border-gray-800">
        <p className="text-gray-600 text-xs">&copy; {new Date().getFullYear()} labrinth. All rights reserved.</p>
      </footer>
    </div>
  )
}
