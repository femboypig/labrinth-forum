import Link from "next/link"
import * as Icons from "lucide-react"
import type { CategoryWithStats } from "@/lib/data"

function Icon({ name, ...props }: { name: string } & Icons.LucideProps) {
  const LucideIcon = Icons[name as keyof typeof Icons] as Icons.LucideIcon
  if (!LucideIcon) return <Icons.FolderKanban {...props} /> // Changed fallback for a more "structured" look
  return <LucideIcon {...props} />
}

export function ForumCategoryList({ categories }: { categories: CategoryWithStats[] }) {
  if (!categories || categories.length === 0) {
    return (
      <div className="py-20 text-center">
        <Icons.LayoutGrid className="h-16 w-16 text-gray-800 mx-auto mb-6 opacity-50" />
        <h2 className="text-lg font-medium text-gray-500 mb-1">No Categories Found</h2>
        <p className="text-sm text-gray-700">It seems there are no forum categories available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {categories.map((category, index) => (
        <Link
          key={category.id}
          href={`/forums/${category.slug}`}
          className="group flex items-center p-5 sm:p-6 bg-black hover:bg-gray-900 border border-gray-800 rounded-xl shadow-md hover:shadow-lg transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-gray-600 focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none"
        >
          <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-gray-900 group-hover:bg-black rounded-xl border border-gray-800 mr-5 sm:mr-6 transition-colors duration-200">
            <Icon
              name={category.icon_name || "FolderKanban"}
              className="h-6 w-6 sm:h-7 sm:w-7 text-gray-500 group-hover:text-gray-300 transition-colors duration-200"
            />
          </div>

          <div className="flex-grow min-w-0">
            <h2 className="font-semibold text-lg sm:text-xl text-gray-100 group-hover:text-white transition-colors duration-200 truncate">
              {category.name}
            </h2>
            <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors duration-200 mt-1 line-clamp-2">
              {category.description || "General discussions and topics."}
            </p>
          </div>

          {/* Stats are more subtle and grouped */}
          <div className="flex-shrink-0 flex items-center space-x-6 ml-4 text-xs text-gray-600 group-hover:text-gray-400 transition-colors duration-200">
            <div className="text-center hidden sm:block">
              <div className="font-medium text-base text-gray-400 group-hover:text-gray-200">{category.post_count}</div>
              <div className="text-gray-600 group-hover:text-gray-500">Threads</div>
            </div>
            <div className="text-center hidden sm:block">
              <div className="font-medium text-base text-gray-400 group-hover:text-gray-200">{category.reply_count}</div>
              <div className="text-gray-600 group-hover:text-gray-500">Messages</div>
            </div>
          </div>

          {/* Latest activity - very minimal */}
          <div className="flex-shrink-0 w-28 text-sm text-right text-gray-700 ml-4 pl-4 border-l border-gray-800 hidden lg:flex flex-col justify-center transition-colors duration-200">
            <p className="truncate text-gray-500 group-hover:text-gray-400">No activity</p> {/* Placeholder */}
          </div>
        </Link>
      ))}
    </div>
  )
}
