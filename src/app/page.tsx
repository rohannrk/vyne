import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const workspaceUser = await prisma.workspaceUser.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { workspace: { createdAt: 'asc' } },
  })

  if (!workspaceUser) {
    redirect('/onboarding')
  }

  redirect(`/${workspaceUser.workspaceId}`)
}
