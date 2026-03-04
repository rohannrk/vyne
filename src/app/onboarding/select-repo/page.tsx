import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { SelectRepoForm } from '@/components/onboarding/select-repo-form'

export const metadata = { title: 'Select repository — VYNE' }

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

export default async function SelectRepoPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const workspaceUser = await prisma.workspaceUser.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { workspace: { createdAt: 'asc' } },
  })

  if (!workspaceUser) redirect('/onboarding')

  return (
    <div className="space-y-6">
      <StepIndicator current={3} total={4} />

      <div>
        <h2 className="text-xl font-semibold text-[var(--text-bright)]">Select repository</h2>
        <p className="mt-1 text-sm text-[var(--text)]">
          Choose the GitHub repository that contains your shadcn/ui components.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] p-6">
        <SelectRepoForm workspaceId={workspaceUser.workspaceId} />
      </div>
    </div>
  )
}
