import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { SelectDirectoryForm } from '@/components/onboarding/select-directory-form'
import { Skeleton } from '@/components/ui/skeleton'

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`h-1.5 w-6 rounded-full transition-colors ${i + 1 <= current ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
              }`}
          />
        </div>
      ))}
      <span className="ml-1 text-xs text-[var(--text-dim)]">
        Step {current} of {total}
      </span>
    </div>
  )
}

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
      <StepIndicator current={4} total={4} />

      <div className="space-y-1">
        <h2 className="text-base font-semibold text-[var(--text-bright)]">Select component directory</h2>
        <p className="text-sm text-[var(--text)]">
          Pick the folder where your shadcn/ui component files live (e.g.{' '}
          <code className="rounded bg-[var(--bg-row)] px-1 py-0.5 text-xs text-[var(--text)]">
            src/components/ui
          </code>
          ).
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-6 shadow-[0_4px_32px_oklch(0_0_0/0.4)]">
        <Suspense fallback={<Skeleton className="h-48 w-full" />}>
          <SelectDirectoryForm
            workspaceId={workspaceUser.workspaceId}
            owner={connection.repoOwner}
            repo={connection.repoName}
            branch={connection.branch}
          />
        </Suspense>
      </div>
    </div>
  )
}
