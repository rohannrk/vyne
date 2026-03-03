'use client'

import { useRouter } from 'next/navigation'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface WorkspaceItem {
    id: string
    name: string
    role: 'ADMIN' | 'EDITOR' | 'VIEWER'
}

interface WorkspaceSwitcherProps {
    currentWorkspaceId: string
    currentWorkspaceName: string
    workspaces: WorkspaceItem[]
}

const ROLE_LABELS: Record<string, string> = {
    ADMIN: 'Admin',
    EDITOR: 'Editor',
    VIEWER: 'Viewer',
}

export function WorkspaceSwitcher({
    currentWorkspaceId,
    currentWorkspaceName,
    workspaces,
}: WorkspaceSwitcherProps) {
    const router = useRouter()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-[var(--surface-overlay)] focus:outline-none"
                    aria-label="Switch workspace"
                    id="workspace-switcher-trigger"
                >
                    {/* Workspace icon */}
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[var(--brand)] text-[10px] font-bold text-white">
                        {currentWorkspaceName.charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1 truncate text-sm font-semibold text-[var(--text-primary)]">
                        {currentWorkspaceName}
                    </span>
                    <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)]" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="start"
                sideOffset={6}
                className="w-[210px] rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-1.5 shadow-xl"
            >
                {/* Header label */}
                <p className="px-2 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                    Workspaces
                </p>

                {/* Workspace list */}
                {workspaces.map((ws) => {
                    const isActive = ws.id === currentWorkspaceId
                    return (
                        <DropdownMenuItem
                            key={ws.id}
                            onClick={() => {
                                if (!isActive) router.push(`/${ws.id}`)
                            }}
                            className={cn(
                                'flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm outline-none transition-colors',
                                isActive
                                    ? 'bg-[var(--brand-subtle)] text-[var(--brand)]'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)]',
                            )}
                        >
                            {/* Workspace letter avatar */}
                            <div
                                className={cn(
                                    'flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold',
                                    isActive ? 'bg-[var(--brand)] text-white' : 'bg-[var(--surface-overlay)] text-[var(--text-secondary)]',
                                )}
                            >
                                {ws.name.charAt(0).toUpperCase()}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="truncate text-xs font-medium leading-none">{ws.name}</p>
                                <p className="mt-0.5 text-[10px] text-[var(--text-tertiary)]">
                                    {ROLE_LABELS[ws.role]}
                                </p>
                            </div>

                            {/* Active checkmark */}
                            {isActive && <Check className="h-3.5 w-3.5 shrink-0" />}
                        </DropdownMenuItem>
                    )
                })}

                <DropdownMenuSeparator className="my-1 border-[var(--border-subtle)]" />

                {/* All workspaces link */}
                <DropdownMenuItem
                    onClick={() => router.push('/workspaces')}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs text-[var(--text-secondary)] outline-none transition-colors hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)]"
                >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-dashed border-[var(--border-subtle)]">
                        <span className="text-[10px]">⊞</span>
                    </div>
                    All workspaces
                </DropdownMenuItem>

                {/* Create new */}
                <DropdownMenuItem
                    onClick={() => router.push('/onboarding')}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs text-[var(--text-secondary)] outline-none transition-colors hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)]"
                >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-dashed border-[var(--border-subtle)]">
                        <Plus className="h-3 w-3" />
                    </div>
                    Create workspace
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
