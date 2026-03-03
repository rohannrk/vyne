import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Check if the user has any workspaces at all
  const count = await prisma.workspaceUser.count({
    where: { userId: session.user.id },
  })

  if (count === 0) {
    redirect('/onboarding')
  }

  // Always go through the workspace hub — consistent entry point for all users
  redirect('/workspaces')
}
