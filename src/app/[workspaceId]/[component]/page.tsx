import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { EditorPage } from '@/components/editor/editor-page'

type Params = {
  workspaceId: string
  component: string
}

export default async function ComponentEditorPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { workspaceId, component } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const workspaceUser = await prisma.workspaceUser.findFirst({
    where: {
      workspaceId,
      userId: session.user.id,
    },
  })

  if (!workspaceUser) {
    redirect('/onboarding')
  }

  const connection = await prisma.gitHubConnection.findUnique({
    where: { workspaceId },
  })

  if (!connection) {
    redirect('/onboarding')
  }

  return (
    <EditorPage
      workspaceId={workspaceId}
      componentName={component}
    />
  )
}

