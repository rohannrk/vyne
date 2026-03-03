import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export type ComponentStatus = 'SYNCED' | 'MODIFIED' | 'PENDING_ADD' | 'PENDING_PUSH'

const STATUS_CONFIG: Record<
    ComponentStatus,
    { label: string; dotClass: string; badgeClass: string; spin?: boolean }
> = {
    SYNCED: {
        label: 'Synced',
        dotClass: 'bg-[var(--status-synced)]',
        badgeClass:
            'bg-[oklch(0.72_0.17_145/0.12)] text-[var(--status-synced)] border-[var(--status-synced)]/25',
    },
    MODIFIED: {
        label: 'Modified',
        dotClass: 'bg-[var(--status-modified)]',
        badgeClass:
            'bg-[oklch(0.80_0.17_70/0.12)] text-[var(--status-modified)] border-[var(--status-modified)]/25',
    },
    PENDING_ADD: {
        label: 'Not in repo',
        dotClass: 'bg-[var(--status-pending-add)]',
        badgeClass:
            'bg-[oklch(0.72_0.14_240/0.12)] text-[var(--status-pending-add)] border-[var(--status-pending-add)]/25',
    },
    PENDING_PUSH: {
        label: 'Pushing…',
        dotClass: 'bg-[var(--status-pending-push)]',
        badgeClass:
            'bg-[oklch(0.55_0_0/0.12)] text-[var(--status-pending-push)] border-[var(--status-pending-push)]/25',
        spin: true,
    },
}

interface StatusBadgeProps {
    status: ComponentStatus
    className?: string
    /** dot-only: smaller, for sidebar nav items */
    dotOnly?: boolean
}

export function StatusBadge({ status, className, dotOnly = false }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status]

    if (dotOnly) {
        return (
            <span
                className={cn('inline-block h-2 w-2 rounded-full flex-shrink-0', config.dotClass, className)}
                aria-label={config.label}
                title={config.label}
            />
        )
    }

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none',
                config.badgeClass,
                className,
            )}
        >
            {config.spin ? (
                <Loader2 className="h-2.5 w-2.5 animate-spin" aria-hidden="true" />
            ) : (
                <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', config.dotClass)} aria-hidden="true" />
            )}
            {config.label}
        </span>
    )
}
