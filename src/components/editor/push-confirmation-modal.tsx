'use client'

import { useState, useTransition } from 'react'
import { GitPullRequest, CheckCircle, XCircle, ExternalLink, Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { pushComponentAction } from '@/app/actions/push-component'
import type { DiffEntry } from '@/hooks/use-component-delta'
import type { DialKitConfig } from '@/types/dial-kit'

type ModalPhase = 'review' | 'loading' | 'success' | 'error'

interface PushConfirmationModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    workspaceId: string
    componentName: string
    owner: string
    repo: string
    branch: string
    diff: DiffEntry[]
    currentConfig: DialKitConfig
    onSuccess?: (prNumber: number, prUrl: string) => void
}

export function PushConfirmationModal({
    open,
    onOpenChange,
    workspaceId,
    componentName,
    owner,
    repo,
    branch,
    diff,
    currentConfig,
    onSuccess,
}: PushConfirmationModalProps) {
    const [phase, setPhase] = useState<ModalPhase>('review')
    const [prNumber, setPrNumber] = useState<number | null>(null)
    const [prUrl, setPrUrl] = useState<string | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const displayName = componentName.charAt(0).toUpperCase() + componentName.slice(1)
    const timestamp = Math.floor(Date.now() / 1000)
    const newBranch = `vyne/${componentName}-${timestamp}`

    const handleConfirm = () => {
        setPhase('loading')
        startTransition(async () => {
            const result = await pushComponentAction({
                workspaceId,
                componentName,
                newConfig: currentConfig,
                diff,
            })
            if (result.ok) {
                setPrNumber(result.prNumber)
                setPrUrl(result.prUrl)
                setPhase('success')
                onSuccess?.(result.prNumber, result.prUrl)
            } else {
                setErrorMsg(result.error)
                setPhase('error')
            }
        })
    }

    const handleRetry = () => {
        setPhase('review')
        setErrorMsg(null)
    }

    const handleClose = () => {
        if (phase === 'loading') return // prevent closing during push
        onOpenChange(false)
        // Reset on next open
        setTimeout(() => {
            setPhase('review')
            setErrorMsg(null)
            setPrNumber(null)
            setPrUrl(null)
        }, 300)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md bg-[var(--bg-raised)] border-[var(--border)] p-0 gap-0">
                {/* Review phase */}
                {phase === 'review' && (
                    <>
                        <DialogHeader className="px-5 pt-5 pb-4 border-b border-[var(--border)]">
                            <DialogTitle className="flex items-center gap-2 text-[var(--text-bright)]">
                                <GitPullRequest className="h-4 w-4 text-[var(--accent)]" />
                                Push {displayName} to GitHub
                            </DialogTitle>
                            <DialogDescription className="text-[var(--text)] text-xs mt-1">
                                This will open a Pull Request on{' '}
                                <span className="font-mono text-[var(--text-bright)]">{owner}/{repo}</span>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="px-5 py-4 space-y-4">
                            {/* Target info */}
                            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 space-y-1.5 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-[var(--text-dim)]">Base branch</span>
                                    <span className="font-mono text-[var(--text-bright)]">{branch}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--text-dim)]">New branch</span>
                                    <span className="font-mono text-[var(--accent)]">{newBranch}</span>
                                </div>
                            </div>

                            {/* Diff table */}
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-dim)] mb-2">
                                    Changes ({diff.length})
                                </p>
                                <div className="rounded-lg border border-[var(--border)] overflow-hidden">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                                                <th className="px-3 py-1.5 text-left text-[var(--text-dim)] font-medium">Property</th>
                                                <th className="px-3 py-1.5 text-right text-[var(--text-dim)] font-medium">Before</th>
                                                <th className="px-3 py-1.5 text-right text-[var(--text-dim)] font-medium">After</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {diff.map((d) => (
                                                <tr key={d.key} className="border-b border-[var(--border)] last:border-0">
                                                    <td className="px-3 py-1.5 font-mono text-[var(--text)]">{d.key}</td>
                                                    <td className="px-3 py-1.5 text-right font-mono text-[var(--text-dim)] line-through">
                                                        {String(d.from)}
                                                    </td>
                                                    <td className="px-3 py-1.5 text-right font-mono text-[var(--accent)]">
                                                        {String(d.to)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--border)]">
                            <Button variant="outline" size="sm" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleConfirm} className="gap-1.5 bg-[var(--accent)] hover:opacity-90">
                                <GitPullRequest className="h-3.5 w-3.5" />
                                Confirm & Push
                            </Button>
                        </div>
                    </>
                )}

                {/* Loading phase */}
                {phase === 'loading' && (
                    <div className="flex flex-col items-center gap-4 py-12 px-5">
                        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
                        <p className="text-sm font-medium text-[var(--text-bright)]">Creating Pull Request…</p>
                        <p className="text-xs text-[var(--text-dim)]">Rewriting file and opening PR on GitHub</p>
                    </div>
                )}

                {/* Success phase */}
                {phase === 'success' && prNumber && prUrl && (
                    <>
                        <div className="flex flex-col items-center gap-4 py-10 px-5">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--status-synced)]/15">
                                <CheckCircle className="h-7 w-7 text-[var(--status-synced)]" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-[var(--text-bright)]">PR #{prNumber} opened!</p>
                                <p className="mt-1 text-xs text-[var(--text)]">
                                    Your changes are ready for review on GitHub
                                </p>
                            </div>
                            <a
                                href={prUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                            >
                                <ExternalLink className="h-4 w-4" />
                                View PR on GitHub
                            </a>
                        </div>
                        <div className="border-t border-[var(--border)] px-5 py-3 flex justify-end">
                            <Button variant="outline" size="sm" onClick={handleClose}>Done</Button>
                        </div>
                    </>
                )}

                {/* Error phase */}
                {phase === 'error' && (
                    <>
                        <div className="flex flex-col items-center gap-4 py-10 px-5">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--status-error)]/15">
                                <XCircle className="h-7 w-7 text-[var(--status-error)]" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-[var(--text-bright)]">Push failed</p>
                                <p className="mt-1 text-xs text-[var(--text)] max-w-xs">{errorMsg}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--border)]">
                            <Button variant="outline" size="sm" onClick={handleClose}>Cancel</Button>
                            <Button size="sm" onClick={handleRetry}>Try Again</Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
