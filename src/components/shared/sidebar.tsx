'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
    LayoutGrid,
    Settings,
    LogOut,
    ChevronDown,
    ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type ComponentStatus } from '@/components/shared/status-badge'
import { WorkspaceSwitcher } from '@/components/shared/workspace-switcher'
import { SHADCN_COMPONENTS } from '@/lib/config'
import { useState } from 'react'

interface ComponentNavItem {
    name: string
    displayName: string
    status: ComponentStatus
}

interface SidebarProps {
    workspaceId: string
    workspaceName: string
    components?: ComponentNavItem[]
    userImage?: string | null
    userName?: string | null
    switcherWorkspaces?: Array<{ id: string; name: string; role: 'ADMIN' | 'EDITOR' | 'VIEWER' }>
}

const CATEGORY_LABELS: Record<string, string> = {
    inputs: 'Inputs',
    display: 'Display',
}

export function Sidebar({
    workspaceId,
    workspaceName,
    components = [],
    userImage,
    userName,
    switcherWorkspaces = [],
}: SidebarProps) {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

    const grouped = SHADCN_COMPONENTS.reduce<Record<string, ComponentNavItem[]>>(
        (acc, comp) => {
            const cat = comp.category
            if (!acc[cat]) acc[cat] = []
            const found = components.find((c) => c.name === comp.name)
            acc[cat].push({
                name: comp.name,
                displayName: comp.displayName,
                status: found?.status ?? 'PENDING_ADD',
            })
            return acc
        },
        {},
    )

    const toggleCategory = (cat: string) =>
        setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }))

    return (
        <aside className="flex h-screen w-[172px] flex-shrink-0 flex-col border-r border-[var(--border)] bg-[var(--sidebar)]">
            {/* Workspace switcher header */}
            <div className="flex h-[44px] items-center border-b border-[var(--border)] px-3">
                <WorkspaceSwitcher
                    currentWorkspaceId={workspaceId}
                    currentWorkspaceName={workspaceName}
                    workspaces={switcherWorkspaces}
                />
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-[18px]">
                {/* Component Browser link */}
                <div className="px-2 pb-1">
                    <Link
                        href={`/${workspaceId}`}
                        className={cn(
                            'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors duration-150',
                            pathname === `/${workspaceId}`
                                ? 'bg-white/[0.035] text-[var(--text-bright)] font-medium'
                                : 'text-[var(--text-dim)] hover:bg-white/[0.02] font-normal',
                        )}
                    >
                        <LayoutGrid className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                        <span>Components</span>
                    </Link>
                </div>

                <div className="my-2 border-t border-[var(--border)]" />

                {/* Component categories */}
                {Object.entries(grouped).map(([category, items]) => (
                    <div key={category} className="px-2">
                        <button
                            onClick={() => toggleCategory(category)}
                            className="flex w-full items-center gap-1 px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-[var(--text)] opacity-70 hover:opacity-100 transition-opacity"
                            aria-expanded={!collapsed[category]}
                        >
                            {collapsed[category] ? (
                                <ChevronRight className="h-3 w-3" aria-hidden="true" />
                            ) : (
                                <ChevronDown className="h-3 w-3" aria-hidden="true" />
                            )}
                            {CATEGORY_LABELS[category] ?? category}
                        </button>

                        {!collapsed[category] && (
                            <ul className="mt-0.5 space-y-px" role="list">
                                {items.map((item) => {
                                    const href = `/${workspaceId}/${item.name}`
                                    const isActive = pathname === href
                                    return (
                                        <li key={item.name}>
                                            <Link
                                                href={href}
                                                className={cn(
                                                    'flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors duration-150',
                                                    isActive
                                                        ? 'bg-white/[0.035] text-[var(--text-bright)] font-medium'
                                                        : 'text-[var(--text-dim)] hover:bg-white/[0.02] font-normal',
                                                )}
                                            >
                                                <span className="truncate">{item.displayName}</span>
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </div>
                ))}
            </nav>

            {/* Bottom: settings + logout */}
            <div className="border-t border-[var(--border)] px-2 py-3 space-y-px">
                <Link
                    href={`/${workspaceId}/settings`}
                    className={cn(
                        'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors duration-150',
                        pathname === `/${workspaceId}/settings`
                            ? 'bg-white/[0.035] text-[var(--text-bright)] font-medium'
                            : 'text-[var(--text-dim)] hover:bg-white/[0.02] font-normal',
                    )}
                >
                    <Settings className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                    <span>Settings</span>
                </Link>

                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[var(--status-error)] transition-colors duration-150 hover:bg-[var(--status-error)]/10"
                    id="sidebar-logout-btn"
                >
                    <LogOut className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                    <span>Sign out</span>
                </button>

                {/* User avatar */}
                {userName && (
                    <div className="flex items-center gap-2 px-2 pt-2 mt-1 border-t border-[var(--border)]">
                        {userImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={userImage}
                                alt={userName}
                                className="h-6 w-6 rounded-full flex-shrink-0"
                            />
                        ) : (
                            <div className="h-6 w-6 rounded-full bg-[var(--accent-muted-bg)] flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] font-medium text-[var(--accent)]">
                                    {userName[0]?.toUpperCase()}
                                </span>
                            </div>
                        )}
                        <span className="truncate text-xs text-[var(--text-dim)]">{userName}</span>
                    </div>
                )}
            </div>
        </aside>
    )
}
