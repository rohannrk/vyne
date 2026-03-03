import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { CreateWorkspaceForm } from '@/components/onboarding/create-workspace-form'

export const metadata = { title: 'Create workspace — VYNE' }

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const workspaceUser = await prisma.workspaceUser.findFirst({
    where: { userId: session.user.id },
    include: { workspace: { include: { connection: true } } },
  })

  if (workspaceUser?.workspace.connection) {
    redirect(`/${workspaceUser.workspaceId}`)
  }

  return (
    <div className="space-y-6">
      <StepIndicator current={1} total={4} />

      <div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Create your workspace</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Give your workspace a name — you can change it later.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-6">
        <CreateWorkspaceForm />
      </div>
    </div>
  )
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`h-1.5 w-6 rounded-full transition-colors ${i + 1 <= current ? 'bg-[var(--brand)]' : 'bg-[var(--border-subtle)]'
              }`}
          />
        </div>
      ))}
      <span className="ml-1 text-xs text-[var(--text-tertiary)]">
        Step {current} of {total}
      </span>
    </div>
  )
}
