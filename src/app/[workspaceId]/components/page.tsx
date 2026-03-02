import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type ComponentsPageProps = {
  params: Promise<{ workspaceId: string }>
}

export default async function ComponentsPage({ params: paramsPromise }: ComponentsPageProps) {
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

  const components = await prisma.componentConfig.findMany({
    where: { workspaceId: params.workspaceId },
    orderBy: { componentName: 'asc' },
  })

  const hasComponents = components.length > 0

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Components</h1>
        <p className="text-sm text-muted-foreground">
          Browse all components available in this workspace.
        </p>
      </header>

      {!hasComponents ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {components.map((component) => (
            <ComponentCard
              key={component.id}
              id={component.id}
              workspaceId={params.workspaceId}
              name={component.componentName}
              source={component.githubFilePath ? 'shadcn' : 'local'}
              lastUpdated={component.lastPushedAt ?? component.lastSyncedAt}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 px-8 py-12 text-center">
      <h2 className="text-base font-medium">No components yet</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Start by importing components from the shadcn registry or adding your own so they show up
        here in the component browser.
      </p>
      {/* CTA wiring will be handled in later stories (e.g. 3.3) */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" disabled>
          Add component
        </Button>
        <Button variant="outline" disabled>
          Import from shadcn
        </Button>
      </div>
    </div>
  )
}

type ComponentCardProps = {
  id: string
  workspaceId: string
  name: string
  source: 'local' | 'shadcn'
  lastUpdated: Date | null
}

function ComponentCard({ id, workspaceId, name, source, lastUpdated }: ComponentCardProps) {
  const sourceLabel = source === 'shadcn' ? 'shadcn' : 'Local'

  return (
    <Link
      href={`/${workspaceId}/components/${id}`}
      aria-label={`Open component: ${name}`}
      className="focus-visible:outline-none"
    >
      <Card className="flex h-full flex-col justify-between transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-sm capitalize">{name}</CardTitle>
            <CardDescription className="text-xs">
              Configured component for this workspace.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[11px] font-medium">
            {sourceLabel}
          </Badge>
        </CardHeader>
        <CardContent className="flex items-end justify-between pt-2">
          <p className="text-[11px] text-muted-foreground">
            {lastUpdated ? `Last updated ${lastUpdated.toLocaleDateString()}` : 'Not synced yet'}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}

