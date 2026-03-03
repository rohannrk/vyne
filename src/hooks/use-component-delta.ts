'use client'

import { useMemo } from 'react'
import type { DialKitConfig } from '@/types/dial-kit'

export interface DiffEntry {
    key: string
    from: unknown
    to: unknown
}

interface UseComponentDeltaReturn {
    isDirty: boolean
    diff: DiffEntry[]
}

export function useComponentDelta(
    baseline: DialKitConfig,
    current: DialKitConfig,
): UseComponentDeltaReturn {
    return useMemo(() => {
        const diff: DiffEntry[] = []
        const allKeys = new Set([...Object.keys(baseline), ...Object.keys(current)]) as Set<keyof DialKitConfig>

        for (const key of allKeys) {
            const from = baseline[key]
            const to = current[key]
            // Numeric comparison: round to avoid floating-point noise from sliders
            const fromNorm = typeof from === 'number' ? Math.round(from) : from
            const toNorm = typeof to === 'number' ? Math.round(to) : to
            if (fromNorm !== toNorm) {
                diff.push({ key, from: fromNorm, to: toNorm })
            }
        }

        return { isDirty: diff.length > 0, diff }
    }, [baseline, current])
}
