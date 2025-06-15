// This Server Component fetches data and passes it to the client component
import { getServerPostDetails } from "@/lib/server-data"
import PostPageClient from "./page" // The client component we just defined
import { notFound } from "next/navigation"

export default async function PostPageLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { postId: string; categorySlug: string } // categorySlug might be useful for breadcrumbs or context
}) {
  // In Next.js 15, params need to be awaited
  const { postId, categorySlug } = await params;
  
  if (!postId || typeof postId !== 'string') {
    return notFound();
  }

  // Fetch the post details
  const post = await getServerPostDetails(postId);

  if (!post) {
    return notFound();
  }

  return <PostPageClient initialPost={post} />
}
