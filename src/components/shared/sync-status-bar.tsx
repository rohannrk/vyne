'use client'

import { useState, useTransition } from 'react'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Wifi, WifiOff, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { pullNowAction } from '@/app/actions/push-component'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export type ConnectionStatus = 'connected' | 'disconnected' | 'error'
export type SyncErrorType = 'auth' | 'not-found' | 'transient' | null

interface SyncStatusBarProps {
    workspaceId: string
    status: ConnectionStatus
    lastPulledAt: Date | null
    errorType: SyncErrorType
}

function formatRelativeTime(date: Date | null): string {
    if (!date) return 'Never'
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 10) return 'just now'
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return new Date(date).toLocaleDateString()
}

export function SyncStatusBar({ workspaceId, status, lastPulledAt, errorType }: SyncStatusBarProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handlePullNow = () => {
        startTransition(async () => {
            await pullNowAction({ workspaceId })
            router.refresh()
        })
    }

    return (
        <div
            className={cn(
                'flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-2 text-xs',
                errorType === 'auth' && 'bg-[var(--status-error)]/8',
                errorType === 'not-found' && 'bg-[var(--status-modified)]/8',
            )}
        >
            {/* Status dot + label */}
            <div className="flex items-center gap-1.5">
                {status === 'connected' && <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-synced)]" />}
                {status === 'disconnected' && <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-error)]" />}
                {status === 'error' && <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-modified)]" />}

                <span className="text-[var(--text-tertiary)]">
                    {status === 'connected' && 'GitHub connected'}
                    {status === 'disconnected' && 'GitHub disconnected'}
                    {status === 'error' && 'Sync error'}
                </span>
            </div>

            {/* Last sync timestamp */}
            {status === 'connected' && lastPulledAt && (
                <span className="text-[var(--text-tertiary)]">
                    · Last synced: {formatRelativeTime(lastPulledAt)}
                </span>
            )}

            {/* Error messages */}
            {errorType === 'auth' && (
                <span className="text-[var(--status-error)]">
                    GitHub connection lost — token may have expired
                </span>
            )}
            {errorType === 'not-found' && (
                <span className="text-[var(--status-modified)]">
                    Component directory not found in repo —{' '}
                    <Link href={`/${workspaceId}/settings`} className="underline hover:opacity-80">
                        check settings
                    </Link>
                </span>
            )}
            {errorType === 'transient' && (
                <span className="text-[var(--text-secondary)]">
                    GitHub is temporarily unavailable
                </span>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Reconnect CTA for auth errors */}
            {errorType === 'auth' && (
                <Link
                    href={`/onboarding/connect-github?returnTo=/${workspaceId}`}
                    className="flex items-center gap-1 rounded-md border border-[var(--status-error)]/40 px-2 py-0.5 text-[var(--status-error)] transition-opacity hover:opacity-80"
                >
                    <WifiOff className="h-3 w-3" />
                    Reconnect GitHub
                </Link>
            )}

            {/* Pull now / Retry button */}
            {errorType !== 'auth' && (
                <button
                    onClick={handlePullNow}
                    disabled={isPending}
                    className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)] disabled:opacity-50"
                >
                    <RefreshCw className={cn('h-3 w-3', isPending && 'animate-spin')} />
                    {errorType === 'transient' ? 'Retry' : 'Pull now'}
                </button>
            )}
        </div>
    )
}
