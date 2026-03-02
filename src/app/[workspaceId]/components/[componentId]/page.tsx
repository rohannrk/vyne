import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

type ComponentDetailPageProps = {
  params: Promise<{ workspaceId: string; componentId: string }>
}

export default async function ComponentDetailPage({
  params: paramsPromise,
}: ComponentDetailPageProps) {
  const params = await paramsPromise
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const membership = await prisma.workspaceUser.findFirst({
    where: {
      workspaceId: params.workspaceId,
      userId: session.user.id,
    },
  })

  if (!membership) {
    notFound()
  }

  const component = await prisma.componentConfig.findFirst({
    where: {
      id: params.componentId,
      workspaceId: params.workspaceId,
    },
  })

  if (!component) {
    notFound()
  }

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight capitalize">
          {component.componentName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Component detail and editor will be implemented in a later epic.
        </p>
      </header>
    </main>
  )
}

