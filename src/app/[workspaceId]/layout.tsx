import type { ReactNode } from 'react'

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-background px-6 py-8">{children}</div>
}

