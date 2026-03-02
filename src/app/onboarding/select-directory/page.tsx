import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { SelectDirectoryForm } from '@/components/onboarding/select-directory-form'
import { Skeleton } from '@/components/ui/skeleton'

export default async function SelectDirectoryPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const workspaceUser = await prisma.workspaceUser.findFirst({
    where: { userId: session.user.id },
    include: {
      workspace: {
        include: { connection: true },
      },
    },
    orderBy: { workspace: { createdAt: 'asc' } },
  })

  if (!workspaceUser) redirect('/onboarding')

  const connection = workspaceUser.workspace.connection

  // Guard: repo + branch must be persisted (saved in Step 3) before reaching this page
  if (!connection?.repoOwner || !connection?.repoName || !connection?.branch) {
    redirect('/onboarding/select-repo')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Select component directory</h2>
        <p className="text-muted-foreground text-sm">
          Pick the folder where your shadcn/ui component files live (e.g.{' '}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">
            src/components/ui
          </code>
          ).
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <Suspense fallback={<Skeleton className="h-48 w-full" />}>
          <SelectDirectoryForm
            workspaceId={workspaceUser.workspaceId}
            owner={connection.repoOwner}
            repo={connection.repoName}
            branch={connection.branch}
          />
        </Suspense>
      </div>

      <p className="text-center text-xs text-muted-foreground">Step 4 of 4</p>
    </div>
  )
}
