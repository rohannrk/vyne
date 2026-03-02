import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { CreateWorkspaceForm } from '@/components/onboarding/create-workspace-form'

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  // Guard: if user already has a GitHubConnection, skip to workspace
  const workspaceUser = await prisma.workspaceUser.findFirst({
    where: { userId: session.user.id },
    include: { workspace: { include: { connection: true } } },
  })

  if (workspaceUser?.workspace.connection) {
    redirect(`/${workspaceUser.workspaceId}`)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Create your workspace</h2>
        <p className="text-muted-foreground text-sm">
          Give your workspace a name — you can change it later.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <CreateWorkspaceForm />
      </div>

      <p className="text-center text-xs text-muted-foreground">Step 1 of 4</p>
    </div>
  )
}
