'use client'

import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import {
    GitBranch,
    Plus,
    LayoutGrid,
    CheckCircle2,
    Clock,
    LogOut,
    ArrowRight,
    Layers,
    Github,
    Users,
    Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Workspace {
    id: string
    name: string
    role: 'ADMIN' | 'EDITOR' | 'VIEWER'
    lastVisitedAt: Date | null
    connection: {
        repoOwner: string
        repoName: string
        branch: string
        lastPulledAt: Date | null
    } | null
    componentCount: number
    syncedCount: number
}

interface Props {
    workspaces: Workspace[]
    userName: string | null
    userImage: string | null
    userEmail: string | null
}

const ROLE_CONFIG = {
    ADMIN: { label: 'Admin', color: 'text-[var(--accent)] bg-[var(--accent-muted-bg)]', Icon: Shield },
    EDITOR: { label: 'Editor', color: 'text-[oklch(0.72_0.19_160)] bg-[oklch(0.72_0.19_160)]/10', Icon: Users },
    VIEWER: { label: 'Viewer', color: 'text-[var(--text-dim)] bg-[var(--bg-row)]', Icon: Users },
} as const

function formatRelativeTime(date: Date | null | undefined): string {
    if (!date) return 'Never'
    const d = new Date(date)
    const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return d.toLocaleDateString()
}

function WorkspaceCard({ workspace }: { workspace: Workspace }) {
    const router = useRouter()
    const roleConfig = ROLE_CONFIG[workspace.role]
    const syncPercent = workspace.componentCount > 0
        ? Math.round((workspace.syncedCount / workspace.componentCount) * 100)
        : 0

    return (
        <div
            onClick={() => router.push(`/${workspace.id}`)}
            className="group relative flex cursor-pointer flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] p-5 transition-all duration-150 hover:border-[var(--accent)]/40 hover:shadow-[0_0_0_1px_var(--accent)] hover:shadow-[var(--accent)]/10"
            aria-label={`Open ${workspace.name} workspace`}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[oklch(0.6_0.25_280)] text-sm font-bold text-white shadow-sm">
                        {workspace.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold text-[var(--text-bright)] group-hover:text-[var(--accent)] transition-colors">
                            {workspace.name}
                        </h2>
                        <p className="text-xs text-[var(--text-dim)]">
                            {workspace.lastVisitedAt
                                ? `Visited ${formatRelativeTime(workspace.lastVisitedAt)}`
                                : 'Never visited'}
                        </p>
                    </div>
                </div>

                {/* Role badge */}
                <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', roleConfig.color)}>
                    {roleConfig.label}
                </span>
            </div>

            {/* GitHub connection */}
            {workspace.connection ? (
                <div className="flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5">
                    <Github className="h-3 w-3 shrink-0 text-[var(--text-dim)]" />
                    <span className="text-xs font-mono text-[var(--text)] truncate">
                        {workspace.connection.repoOwner}/{workspace.connection.repoName}
                    </span>
                    <span className="ml-auto shrink-0 text-[10px] text-[var(--text-dim)] font-mono">
                        {workspace.connection.branch}
                    </span>
                </div>
            ) : (
                <div className="flex items-center gap-1.5 rounded-md border border-dashed border-[var(--border)] px-2.5 py-1.5">
                    <Github className="h-3 w-3 shrink-0 text-[var(--text-dim)]" />
                    <span className="text-xs text-[var(--text-dim)]">GitHub not connected</span>
                </div>
            )}

            {/* Stats row */}
            <div className="flex items-center gap-4 text-xs text-[var(--text-dim)]">
                <div className="flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    <span>{workspace.componentCount} components</span>
                </div>
                {workspace.componentCount > 0 && (
                    <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-[var(--status-synced)]" />
                        <span>{workspace.syncedCount} synced</span>
                    </div>
                )}
                {workspace.connection?.lastPulledAt && (
                    <div className="ml-auto flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatRelativeTime(workspace.connection.lastPulledAt)}</span>
                    </div>
                )}
            </div>

            {/* Sync progress bar */}
            {workspace.componentCount > 0 && (
                <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--bg-row)]">
                    <div
                        className="h-full rounded-full bg-[var(--status-synced)] transition-all duration-500"
                        style={{ width: `${syncPercent}%` }}
                    />
                </div>
            )}

            {/* Arrow indicator */}
            <ArrowRight className="absolute bottom-5 right-5 h-4 w-4 text-[var(--text-dim)] opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-[var(--accent)]" />
        </div>
    )
}

export function WorkspaceHubClient({ workspaces, userName, userImage, userEmail }: Props) {
    return (
        <div className="flex h-screen flex-col bg-[var(--bg)]">
            {/* Top bar */}
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-raised)] px-6">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] text-xs font-bold text-white">
                        V
                    </div>
                    <span className="text-sm font-semibold text-[var(--text-bright)]">VYNE</span>
                </div>

                <div className="flex items-center gap-3">
                    {/* User info */}
                    <div className="flex items-center gap-2.5">
                        {userImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={userImage} alt={userName ?? ''} className="h-7 w-7 rounded-full" />
                        ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-muted-bg)] text-xs font-medium text-[var(--accent)]">
                                {userName?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="hidden sm:block">
                            <p className="text-xs font-medium text-[var(--text-bright)]">{userName}</p>
                            {userEmail && <p className="text-[10px] text-[var(--text-dim)]">{userEmail}</p>}
                        </div>
                    </div>

                    <div className="h-5 w-px bg-[var(--border)]" />

                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-[var(--text)] transition-colors hover:bg-[var(--bg-row)] hover:text-[var(--status-error)]"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign out
                    </button>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-4xl px-6 py-10">
                    {/* Page title */}
                    <div className="mb-8 flex items-end justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--text-bright)]">
                                Your Workspaces
                            </h1>
                            <p className="mt-1 text-sm text-[var(--text)]">
                                {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''} — select one to continue
                            </p>
                        </div>
                        <Link
                            href="/onboarding"
                            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-raised)] px-3.5 py-2 text-sm font-medium text-[var(--text-bright)] transition-colors hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
                        >
                            <Plus className="h-4 w-4" />
                            New workspace
                        </Link>
                    </div>

                    {/* Workspace grid */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {workspaces.map((ws) => (
                            <WorkspaceCard key={ws.id} workspace={ws} />
                        ))}

                        {/* Create new card */}
                        <Link
                            href="/onboarding"
                            className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-raised)]/50 text-[var(--text-dim)] transition-all duration-150 hover:border-[var(--accent)]/50 hover:text-[var(--accent)] hover:bg-[var(--accent-muted-bg)]/20"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-current">
                                <Plus className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-medium">Create workspace</span>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}
