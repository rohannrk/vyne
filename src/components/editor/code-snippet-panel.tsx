'use client'

import { Check, Copy } from 'lucide-react'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import type { GeneratedSnippet } from '@/lib/generate-snippet'
import { cn } from '@/lib/utils'

interface CodeSnippetPanelProps {
    componentName: string
    snippet: GeneratedSnippet
}

const TOKEN_COLORS: Record<string, string> = {
    keyword: 'text-[var(--brand)]',
    component: 'text-[var(--text-primary)] font-semibold',
    prop: 'text-[oklch(0.72_0.19_160)]',   // teal for prop names
    string: 'text-[var(--status-synced)]',  // green for string values
    number: 'text-[var(--brand)]',           // violet for numbers
    boolean: 'text-[oklch(0.75_0.15_30)]',  // amber for booleans
    punctuation: 'text-[var(--text-tertiary)]',
    comment: 'text-[var(--text-tertiary)] italic',
}

export function CodeSnippetPanel({ componentName, snippet }: CodeSnippetPanelProps) {
    const { copied, copy } = useCopyToClipboard()

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-subtle)] flex-shrink-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                    Code Snippet
                </p>
                <button
                    onClick={() => copy(snippet.raw)}
                    className={cn(
                        'flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium transition-all',
                        copied
                            ? 'bg-[var(--status-synced)]/15 text-[var(--status-synced)]'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)]',
                    )}
                    aria-label="Copy code snippet to clipboard"
                >
                    {copied ? (
                        <>
                            <Check className="h-3 w-3" />
                            Copied ✓
                        </>
                    ) : (
                        <>
                            <Copy className="h-3 w-3" />
                            Copy
                        </>
                    )}
                </button>
            </div>

            {/* Code block */}
            <div className="flex-1 overflow-auto p-4">
                <pre
                    data-snippet
                    className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap break-all"
                    aria-label={`JSX code snippet for ${componentName} component`}
                    tabIndex={0}
                >
                    <code>
                        {snippet.tokens.map((token, i) => (
                            <span
                                key={i}
                                className={TOKEN_COLORS[token.type] ?? 'text-[var(--text-secondary)]'}
                            >
                                {token.value}
                            </span>
                        ))}
                    </code>
                </pre>
            </div>
        </div>
    )
}
