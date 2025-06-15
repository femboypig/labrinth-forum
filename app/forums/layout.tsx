import type React from "react"
// File path: app/forums/layout.tsx
// This is a new, simple layout for the /forums segment.
// It just passes children through but helps define the segment for the router.
export default function ForumsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
