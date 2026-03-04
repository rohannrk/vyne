import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { GitBranch, FolderOpen, User, Shield } from 'lucide-react'

interface SettingsPageProps {
    params: Promise<{ workspaceId: string }>
}

export default async function SettingsPage({ params }: SettingsPageProps) {
    const { workspaceId } = await params
    const session = await auth()
    if (!session?.user) redirect('/login')

    const workspaceUser = await prisma.workspaceUser.findFirst({
        where: { userId: session.user.id, workspaceId },
        include: {
            workspace: {
                include: { connection: true, users: { include: { user: true } } },
            },
        },
    })

    if (!workspaceUser) redirect('/')

    const { workspace } = workspaceUser
    const connection = workspace.connection

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <header className="flex h-12 items-center border-b border-[var(--border)] px-6">
                <h1 className="text-sm font-semibold text-[var(--text-bright)]">Settings</h1>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6 max-w-2xl space-y-8">
                {/* Workspace section */}
                <section>
                    <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                        Workspace
                    </h2>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] divide-y divide-[var(--border)]">
                        <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-[var(--text-dim)]" aria-hidden="true" />
                                <span className="text-sm text-[var(--text-bright)]">{workspace.name}</span>
                            </div>
                            <span className="text-xs text-[var(--text-dim)] font-mono">{workspaceId.slice(0, 8)}…</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-3">
                            <User className="h-4 w-4 text-[var(--text-dim)]" aria-hidden="true" />
                            <span className="text-sm text-[var(--text)]">
                                Your role:{' '}
                                <span className="font-medium text-[var(--text-bright)] capitalize">
                                    {workspaceUser.role.toLowerCase()}
                                </span>
                            </span>
                        </div>
                    </div>
                </section>

                {/* GitHub connection section */}
                <section>
                    <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                        GitHub Connection
                    </h2>
                    {connection ? (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] divide-y divide-[var(--border)]">
                            <div className="flex items-center gap-2 px-4 py-3">
                                <GitBranch className="h-4 w-4 text-[var(--text-dim)]" aria-hidden="true" />
                                <div>
                                    <p className="text-sm text-[var(--text-bright)]">
                                        {connection.repoOwner}/{connection.repoName}
                                    </p>
                                    <p className="text-xs text-[var(--text-dim)]">Branch: {connection.branch}</p>
                                </div>
                                <div className="ml-auto flex h-1.5 w-1.5 rounded-full bg-[var(--status-synced)]" />
                            </div>
                            <div className="flex items-center gap-2 px-4 py-3">
                                <FolderOpen className="h-4 w-4 text-[var(--text-dim)]" aria-hidden="true" />
                                <div>
                                    <p className="text-xs text-[var(--text-dim)]">Component directory</p>
                                    <p className="text-sm font-mono text-[var(--text-bright)]">
                                        {connection.componentDirectoryPath ?? 'Not set'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] px-4 py-6 text-center">
                            <p className="text-sm text-[var(--text)]">No repository connected.</p>
                            <a
                                href="/onboarding/select-repo"
                                className="mt-3 inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                            >
                                <GitBranch className="h-4 w-4" aria-hidden="true" />
                                Connect GitHub
                            </a>
                        </div>
                    )}
                </section>

                {/* Team section */}
                <section>
                    <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                        Team
                    </h2>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] divide-y divide-[var(--border)]">
                        {workspace.users.map((wu) => (
                            <div key={wu.userId} className="flex items-center gap-3 px-4 py-3">
                                {wu.user.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={wu.user.image}
                                        alt={wu.user.name ?? 'Team member'}
                                        className="h-7 w-7 rounded-full flex-shrink-0"
                                    />
                                ) : (
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-muted-bg)] flex-shrink-0">
                                        <span className="text-[11px] font-medium text-[var(--accent)]">
                                            {wu.user.name?.[0]?.toUpperCase() ?? '?'}
                                        </span>
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm text-[var(--text-bright)]">{wu.user.name ?? 'Unknown'}</p>
                                    <p className="truncate text-xs text-[var(--text-dim)]">{wu.user.email}</p>
                                </div>
                                <span className="text-xs capitalize text-[var(--text-dim)]">
                                    {wu.role.toLowerCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
