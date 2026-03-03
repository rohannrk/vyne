'use client'

import { useState, useCallback, useRef } from 'react'

interface UseCopyToClipboardReturn {
    copied: boolean
    copy: (text: string) => Promise<void>
}

export function useCopyToClipboard(): UseCopyToClipboardReturn {
    const [copied, setCopied] = useState(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const copy = useCallback(async (text: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)

        try {
            await navigator.clipboard.writeText(text)
        } catch {
            // Fallback: select all text in the pre element
            const pre = document.querySelector('pre[data-snippet]')
            if (pre) {
                const range = document.createRange()
                range.selectNodeContents(pre)
                const sel = window.getSelection()
                sel?.removeAllRanges()
                sel?.addRange(range)
            }
        }

        setCopied(true)
        timeoutRef.current = setTimeout(() => setCopied(false), 2000)
    }, [])

    return { copied, copy }
}
