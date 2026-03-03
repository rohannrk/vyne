import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { SHADCN_COMPONENTS } from '@/lib/config'
import { ComponentCard } from '@/components/browser/component-card'
import { SyncStatusBar } from '@/components/shared/sync-status-bar'
import { pullWorkspace } from '@/lib/github/pull-workspace'
import { GitBranch } from 'lucide-react'
import type { ComponentStatus } from '@/components/shared/status-badge'
import type { ConnectionStatus, SyncErrorType } from '@/components/shared/sync-status-bar'

interface WorkspacePageProps {
    params: Promise<{ workspaceId: string }>
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
    const { workspaceId } = await params
    const session = await auth()
    if (!session?.user) redirect('/login')

    const workspaceUser = await prisma.workspaceUser.findFirst({
        where: { userId: session.user.id, workspaceId },
        include: { workspace: { include: { connection: true } } },
    })

    if (!workspaceUser) redirect('/')

    const { workspace } = workspaceUser
    const connection = workspace.connection

    // Run Pull server-side before rendering — updates ComponentConfig records
    let syncStatus: ConnectionStatus = 'connected'
    let syncErrorType: SyncErrorType = null
    let lastPulledAt: Date | null = connection?.lastPulledAt ?? null

    if (connection) {
        const userId = session.user.id as string
        const pullResult = await pullWorkspace({ workspaceId, userId })
        if (!pullResult.success) {
            syncStatus = pullResult.errorType === 'auth' ? 'disconnected' : 'error'
            syncErrorType = pullResult.errorType
        } else {
            lastPulledAt = pullResult.pulledAt
        }
    } else {
        syncStatus = 'disconnected'
        syncErrorType = 'auth'
    }

    // Re-fetch fresh component data after pull
    const dbComponents = await prisma.componentConfig.findMany({
        where: { workspaceId },
        select: { componentName: true, status: true },
    })

    const componentMap = new Map(dbComponents.map((c) => [c.componentName, c]))
    const allComponents = SHADCN_COMPONENTS.map((comp) => {
        const dbComp = componentMap.get(comp.name)
        return {
            ...comp,
            status: (dbComp?.status ?? 'PENDING_ADD') as ComponentStatus,
        }
    })

    const grouped = allComponents.reduce<Record<string, typeof allComponents>>((acc, comp) => {
        const cat = comp.category
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(comp)
        return acc
    }, {})

    return (
        <div className="flex flex-col h-full">
            {/* Sync status bar */}
            {connection && (
                <SyncStatusBar
                    workspaceId={workspaceId}
                    status={syncStatus}
                    lastPulledAt={lastPulledAt}
                    errorType={syncErrorType}
                />
            )}

            {/* No GitHub connection state */}
            {!connection ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)]">
                        <GitBranch className="h-6 w-6 text-[var(--text-tertiary)]" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-[var(--text-primary)]">GitHub not connected</p>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                            Connect your repository to start managing components
                        </p>
                    </div>
                    <a
                        href="/onboarding/connect-github"
                        className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                        Connect GitHub
                    </a>
                </div>
            ) : (
                /* Component browser grid */
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-semibold text-[var(--text-primary)]">Components</h1>
                            <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                                {connection.repoOwner}/{connection.repoName} · {connection.branch}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {Object.entries(grouped).map(([category, items]) => (
                            <section key={category}>
                                <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                                    {category}
                                </h2>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                    {items.map((comp) => (
                                        <ComponentCard
                                            key={comp.name}
                                            workspaceId={workspaceId}
                                            name={comp.name}
                                            displayName={comp.displayName}
                                            category={comp.category}
                                            status={comp.status}
                                        />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
