'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { StatusBadge, type ComponentStatus } from '@/components/shared/status-badge'
import { Plus, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ComponentCardProps {
    workspaceId: string
    name: string
    displayName: string
    category: string
    status: ComponentStatus
}

/** Tiny placeholder preview renderings for each component type */
function ComponentPreview({ name, status }: { name: string; status: ComponentStatus }) {
    const muted = status === 'PENDING_ADD'
    const baseClass = cn('w-full h-full flex items-center justify-center', muted && 'opacity-30')

    switch (name) {
        case 'button':
            return (
                <div className={baseClass}>
                    <div className="rounded-md bg-[var(--brand)] px-4 py-1.5 text-xs font-medium text-white">
                        Button
                    </div>
                </div>
            )
        case 'input':
            return (
                <div className={baseClass}>
                    <div className="w-28 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-overlay)] px-2 py-1.5 text-xs text-[var(--text-tertiary)]">
                        Placeholder…
                    </div>
                </div>
            )
        case 'textarea':
            return (
                <div className={baseClass}>
                    <div className="w-28 h-10 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-overlay)] px-2 py-1 text-xs text-[var(--text-tertiary)]">
                        Text…
                    </div>
                </div>
            )
        case 'checkbox':
            return (
                <div className={baseClass}>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded border-2 border-[var(--brand)] bg-[var(--brand)] flex items-center justify-center">
                            <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 text-white fill-none stroke-white stroke-2">
                                <path d="M1.5 5l2.5 2.5 4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-xs text-[var(--text-secondary)]">Option</span>
                    </div>
                </div>
            )
        case 'switch':
            return (
                <div className={baseClass}>
                    <div className="flex h-5 w-9 items-center rounded-full bg-[var(--brand)] px-0.5">
                        <div className="h-4 w-4 translate-x-4 rounded-full bg-white shadow" />
                    </div>
                </div>
            )
        case 'slider':
            return (
                <div className={baseClass}>
                    <div className="relative w-24 h-1 rounded-full bg-[var(--surface-overlay)]">
                        <div className="absolute inset-y-0 left-0 w-14 rounded-full bg-[var(--brand)]" />
                        <div className="absolute top-1/2 left-14 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border-2 border-[var(--brand)] bg-[var(--surface-base)] shadow" />
                    </div>
                </div>
            )
        case 'badge':
            return (
                <div className={baseClass}>
                    <div className="rounded-full bg-[var(--brand-subtle)] border border-[var(--brand)]/30 px-2.5 py-0.5 text-[11px] font-medium text-[var(--brand)]">
                        Badge
                    </div>
                </div>
            )
        case 'progress':
            return (
                <div className={baseClass}>
                    <div className="w-24 h-1.5 rounded-full bg-[var(--surface-overlay)]">
                        <div className="h-full w-16 rounded-full bg-[var(--brand)]" />
                    </div>
                </div>
            )
        case 'skeleton':
            return (
                <div className={baseClass}>
                    <div className="space-y-1.5">
                        <div className="h-2 w-24 rounded bg-[var(--surface-overlay)] animate-pulse" />
                        <div className="h-2 w-16 rounded bg-[var(--surface-overlay)] animate-pulse" />
                        <div className="h-2 w-20 rounded bg-[var(--surface-overlay)] animate-pulse" />
                    </div>
                </div>
            )
        default:
            return (
                <div className={baseClass}>
                    <div className="text-xs text-[var(--text-tertiary)]">{name}</div>
                </div>
            )
    }
}


export function ComponentCard({
    workspaceId,
    name,
    displayName: dn,
    category,
    status,
}: ComponentCardProps) {
    const href = `/${workspaceId}/${name}`
    const isEditable = status === 'SYNCED' || status === 'MODIFIED'
    const isPendingAdd = status === 'PENDING_ADD'

    return (
        <div
            className={cn(
                'group relative flex flex-col rounded-xl border bg-[var(--surface-raised)] overflow-hidden',
                'transition-all duration-200',
                isEditable
                    ? 'border-[var(--border-subtle)] hover:border-[var(--brand)]/40 hover:shadow-[0_0_0_1px_oklch(0.72_0.19_260/0.15)]'
                    : 'border-[var(--border-subtle)] opacity-75',
            )}
        >
            {/* Preview zone */}
            <div
                className="h-[90px] w-full border-b border-[var(--border-subtle)] bg-[var(--surface-base)]"
                aria-hidden="true"
            >
                <ComponentPreview name={name} status={status} />
            </div>

            {/* Card footer */}
            <div className="flex items-center justify-between px-3 py-2.5">
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">{dn}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)] capitalize">{category}</p>
                </div>

                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    <StatusBadge status={status} />
                    {isEditable && (
                        <Link
                            href={href}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)] opacity-0 group-hover:opacity-100"
                            aria-label={`Edit ${dn}`}
                        >
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                    )}
                </div>
            </div>

            {/* Clickable overlay for editable cards */}
            {isEditable && (
                <Link
                    href={href}
                    className="absolute inset-0"
                    aria-label={`Open ${dn} editor`}
                />
            )}

            {/* Add button for PENDING_ADD */}
            {isPendingAdd && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--surface-base)]/60 backdrop-blur-[2px]">
                    <Button
                        size="sm"
                        className="gap-1.5 text-xs h-7"
                        onClick={(e) => {
                            e.stopPropagation()
                            // TODO: trigger add component flow (Epic 3.3)
                        }}
                    >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        Add to repo
                    </Button>
                </div>
            )}
        </div>
    )
}
