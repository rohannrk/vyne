import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { SelectRepoForm } from '@/components/onboarding/select-repo-form'

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
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Select repository</h2>
        <p className="text-muted-foreground text-sm">
          Choose the GitHub repository that contains your shadcn/ui components.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <SelectRepoForm workspaceId={workspaceUser.workspaceId} />
      </div>

      <p className="text-center text-xs text-muted-foreground">Step 3 of 4</p>
    </div>
  )
}
