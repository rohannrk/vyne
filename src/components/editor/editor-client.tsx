'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, RotateCcw, GitPullRequest, Settings2, Sun, Moon, Save, Trash2, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { StatusBadge } from '@/components/shared/status-badge'
import { CodeSnippetPanel } from '@/components/editor/code-snippet-panel'
import { PushConfirmationModal } from '@/components/editor/push-confirmation-modal'
import { useEditorStore } from '@/store/editor-store'
import { useComponentDelta } from '@/hooks/use-component-delta'
import { generateSnippet } from '@/lib/generate-snippet'
import { COMPONENT_DEFAULTS } from '@/types/dial-kit'
import type { DialKitConfig } from '@/types/dial-kit'
import type { DiffEntry } from '@/hooks/use-component-delta'
import type { ComponentStatus } from '@/components/shared/status-badge'
import { cn } from '@/lib/utils'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Preset {
    id: string
    name: string
    values: DialKitConfig
}

interface Props {
    workspaceId: string
    componentName: string
    displayName: string
    initialConfig: DialKitConfig
    initialStatus: ComponentStatus
    canPush: boolean
    presets: Preset[]
    owner?: string
    repo?: string
    branch?: string
    componentConfigId?: string
}

// PanelRow Wrapper
function PanelRow({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
    return (
        <div className={cn("flex items-center justify-between h-[var(--row-height)] px-[14px]", !last && "border-b border-[var(--border)]")}>
            <span className="text-[12px] text-[var(--text-dim)] flex-shrink-0">{label}</span>
            <div className="flex-1 flex justify-end items-center">{children}</div>
        </div>
    )
}

// Slider component
function SliderControl({
    label,
    value,
    min,
    max,
    unit = '',
    onChange,
    last
}: {
    label: string
    value: number
    min: number
    max: number
    unit?: string
    onChange: (v: number) => void
    last?: boolean
}) {
    return (
        <div className={cn("relative flex items-center h-[var(--row-height)] px-[14px]", !last && "border-b border-[var(--border)]")}>
            <div className="absolute inset-x-0 h-full overflow-hidden pointer-events-none">
                <div className="h-full bg-[var(--bg-slider)] transition-all" style={{ width: `${Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))}%` }} />
            </div>
            <span className="relative z-10 text-[12px] text-[var(--text-dim)] w-[80px] flex-shrink-0 pointer-events-none">{label}</span>
            <div className="relative z-10 flex-1 flex items-center justify-end pointer-events-none">
                <span className="text-[12px] text-[var(--text-soft)] font-variant-numeric tabular-nums font-mono text-right">
                    {value}{unit}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                aria-label={`${label}: ${value}${unit}`}
            />
        </div>
    )
}

// Select component
function SelectControl({
    label,
    value,
    options,
    onChange,
    last
}: {
    label: string
    value: string
    options: string[]
    onChange: (v: string) => void
    last?: boolean
}) {
    return (
        <div className={cn("relative flex items-center justify-between h-[var(--row-height)] px-[14px]", !last && "border-b border-[var(--border)]")}>
            <span className="text-[12px] text-[var(--text-dim)]">{label}</span>
            <div className="relative flex items-center">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="appearance-none bg-transparent text-[12px] text-[var(--text-soft)] pr-4 pl-2 py-1 cursor-pointer focus:outline-none text-right hover:bg-white/[0.05] rounded transition-colors"
                >
                    {options.map((o) => (
                        <option key={o} value={o} className="bg-[var(--bg-raised)] text-[var(--text-soft)]">{o}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 text-[var(--border-muted)] pointer-events-none" />
            </div>
        </div>
    )
}

// Toggle control
function ToggleControl({
    label,
    value,
    onChange,
    last
}: {
    label: string
    value: boolean
    onChange: (v: boolean) => void
    last?: boolean
}) {
    return (
        <PanelRow label={label} last={last}>
            <div className="flex items-center rounded-sm border border-[var(--border)] p-0.5 overflow-hidden">
                <button
                    onClick={() => onChange(false)}
                    className={cn(
                        "px-2 py-0.5 text-[11px] font-medium transition-colors outline-none",
                        !value ? "bg-[var(--bg-row)] text-[var(--text)] rounded-sm" : "bg-transparent text-[var(--text-dim)] hover:bg-white/[0.05]"
                    )}
                >
                    Off
                </button>
                <button
                    onClick={() => onChange(true)}
                    className={cn(
                        "px-2 py-0.5 text-[11px] font-medium transition-colors outline-none",
                        value ? "bg-[var(--bg-row)] text-[var(--text)] rounded-sm" : "bg-transparent text-[var(--text-dim)] hover:bg-white/[0.05]"
                    )}
                >
                    On
                </button>
            </div>
        </PanelRow>
    )
}

// Text control
function TextControl({
    label,
    value,
    onChange,
    last
}: {
    label: string
    value: string
    onChange: (v: string) => void
    last?: boolean
}) {
    return (
        <PanelRow label={label} last={last}>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-24 bg-transparent text-right text-[12px] text-[var(--text-soft)] focus:outline-none focus:text-[var(--text-bright)] placeholder:text-[var(--text-muted)]"
                placeholder="..."
            />
        </PanelRow>
    )
}

// Canvas preview for the component
function LivePreview({ componentName, config }: { componentName: string; config: DialKitConfig }) {
    const style: React.CSSProperties = {
        borderRadius: config.borderRadius !== undefined ? `${config.borderRadius}px` : undefined,
        paddingLeft: config.paddingX !== undefined ? `${config.paddingX}px` : undefined,
        paddingRight: config.paddingX !== undefined ? `${config.paddingX}px` : undefined,
        paddingTop: config.paddingY !== undefined ? `${config.paddingY}px` : undefined,
        paddingBottom: config.paddingY !== undefined ? `${config.paddingY}px` : undefined,
        fontSize: config.fontSize !== undefined ? `${config.fontSize}px` : undefined,
        fontWeight: config.fontWeight,
        letterSpacing: config.letterSpacing !== undefined ? `${config.letterSpacing}px` : undefined,
        opacity: config.opacity !== undefined ? config.opacity / 100 : undefined,
        gap: config.gap !== undefined ? `${config.gap}px` : undefined,
    }

    switch (componentName) {
        case 'button':
            return (
                <button
                    disabled={config.disabled}
                    style={style}
                    className={cn(
                        'flex items-center font-medium text-white transition-opacity',
                        config.variant === 'destructive' ? 'bg-[var(--status-error)]' :
                            config.variant === 'outline' ? 'border border-[var(--border)] bg-transparent text-[var(--text-bright)]' :
                                config.variant === 'ghost' ? 'bg-transparent text-[var(--text-bright)] hover:bg-[var(--bg-row)]' :
                                    'bg-[var(--accent)]',
                        config.disabled && 'opacity-50 cursor-not-allowed',
                        config.isLoading && 'cursor-wait',
                    )}
                >
                    {config.isLoading && (
                        <span className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    )}
                    {config.label ?? 'Click me'}
                </button>
            )

        case 'input':
            return (
                <input
                    type="text"
                    placeholder={config.label ?? 'Type something…'}
                    disabled={config.disabled}
                    style={{ ...style, width: '200px' }}
                    className="border border-[var(--border)] bg-[var(--bg)] text-[var(--text-bright)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
            )

        case 'textarea':
            return (
                <textarea
                    placeholder={config.label ?? 'Type something…'}
                    disabled={config.disabled}
                    rows={3}
                    style={{ ...style, width: '220px' }}
                    className="border border-[var(--border)] bg-[var(--bg)] text-[var(--text-bright)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
                />
            )

        case 'checkbox':
            return (
                <label className="flex items-center cursor-pointer" style={{ gap: style.gap }}>
                    <span className={cn(
                        'flex h-4 w-4 items-center justify-center border-2 transition-colors',
                        config.disabled ? 'border-[var(--border)] opacity-50' : 'border-[var(--accent)] bg-[var(--accent)]',
                    )} style={{ borderRadius: style.borderRadius }}>
                        <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 text-white fill-none stroke-white stroke-2">
                            <path d="M1.5 5l2.5 2.5 4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                    <span className="text-[var(--text-bright)]" style={{ fontSize: style.fontSize, fontWeight: style.fontWeight }}>
                        {config.label ?? 'Accept terms'}
                    </span>
                </label>
            )

        case 'switch':
            return (
                <label className="flex items-center cursor-pointer" style={{ gap: style.gap }}>
                    <span className="flex h-5 w-9 items-center rounded-full bg-[var(--accent)] px-0.5" style={{ opacity: config.disabled ? 0.5 : 1 }}>
                        <span className="h-4 w-4 translate-x-4 rounded-full bg-white shadow" />
                    </span>
                    <span className="text-[var(--text-bright)]" style={{ fontSize: style.fontSize }}>
                        {config.label ?? 'Enable feature'}
                    </span>
                </label>
            )

        case 'slider':
            return (
                <div style={{ width: '180px', opacity: style.opacity }}>
                    <div className="relative h-1.5 rounded-full bg-[var(--bg-row)]">
                        <div className="absolute inset-y-0 left-0 w-2/3 rounded-full bg-[var(--accent)]" />
                        <div className="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-[var(--accent)] bg-[var(--bg)] shadow" />
                    </div>
                </div>
            )

        case 'badge':
            return (
                <span
                    style={style}
                    className="inline-flex items-center font-medium bg-[var(--accent-muted-bg)] border border-[var(--accent)]/30 text-[var(--accent)]"
                >
                    {config.label ?? 'Badge'}
                </span>
            )

        case 'progress':
            return (
                <div style={{ width: '200px', opacity: style.opacity }}>
                    <div className="h-2 rounded-full bg-[var(--bg-row)]" style={{ borderRadius: style.borderRadius }}>
                        <div className="h-full w-2/3 rounded-full bg-[var(--accent)]" style={{ borderRadius: style.borderRadius }} />
                    </div>
                </div>
            )

        case 'skeleton':
            return (
                <div className="space-y-2" style={{ opacity: style.opacity }}>
                    <div className="h-3 w-40 animate-pulse rounded bg-[var(--bg-row)]" style={{ borderRadius: style.borderRadius }} />
                    <div className="h-3 w-28 animate-pulse rounded bg-[var(--bg-row)]" style={{ borderRadius: style.borderRadius }} />
                    <div className="h-3 w-36 animate-pulse rounded bg-[var(--bg-row)]" style={{ borderRadius: style.borderRadius }} />
                </div>
            )

        default:
            return <p className="text-sm text-[var(--text)]">{componentName} preview</p>
    }
}

export function EditorClient({
    workspaceId,
    componentName,
    displayName,
    initialConfig,
    initialStatus,
    canPush,
    presets,
    owner = '',
    repo = '',
    branch = 'main',
    componentConfigId,
}: Props) {
    const baseline = { ...COMPONENT_DEFAULTS[componentName] ?? {}, ...initialConfig }
    const [config, setConfig] = useState<DialKitConfig>(baseline)
    const [status, setStatus] = useState<ComponentStatus>(initialStatus)
    const [isPushModalOpen, setIsPushModalOpen] = useState(false)
    const [savedPresets, setSavedPresets] = useState<Preset[]>(presets)
    const [presetName, setPresetName] = useState('')
    const [activePresetId, setActivePresetId] = useState<string | null>(null)

    const { canvasTheme, setCanvasTheme } = useEditorStore()
    const { isDirty, diff } = useComponentDelta(baseline, config)

    // Derived current status
    const currentStatus: ComponentStatus = isDirty ? 'MODIFIED' : status

    // beforeunload guard
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (isDirty) e.preventDefault()
        }
        window.addEventListener('beforeunload', handler)
        return () => window.removeEventListener('beforeunload', handler)
    }, [isDirty])

    const handleReset = useCallback(() => {
        setConfig(baseline)
        setActivePresetId(null)
    }, [baseline])

    const updateConfig = (patch: Partial<DialKitConfig>) => {
        setConfig((prev) => ({ ...prev, ...patch }))
        setActivePresetId(null)
    }

    const snippet = generateSnippet(componentName, config, COMPONENT_DEFAULTS[componentName] ?? {})

    const defaults = COMPONENT_DEFAULTS[componentName] ?? {}

    return (
        <div className="flex h-full flex-col">
            {/* Editor header */}
            <header className="flex h-[var(--topbar-height)] items-center justify-between border-b border-[var(--border)] px-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/${workspaceId}`}
                        className="flex items-center gap-1.5 text-[var(--text)] opacity-70 transition-opacity hover:opacity-100"
                        aria-label="Back to Component Browser"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <h1 className="text-sm font-semibold text-[var(--text-bright)]">{displayName}</h1>
                        <StatusBadge status={currentStatus} />
                    </div>

                    {/* Unsaved indicator */}
                    {isDirty && (
                        <span className="rounded-full bg-[var(--status-modified)]/15 px-2 py-0.5 text-[10px] font-medium text-[var(--status-modified)]">
                            Unsaved changes
                        </span>
                    )}
                </div>

                {/* Header actions */}
                <div className="flex items-center gap-2">
                    {isDirty && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-[var(--text)] transition-colors hover:bg-[var(--bg-raised)]">
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Reset
                                </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[var(--bg-raised)] border-[var(--border)]">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-[var(--text-bright)]">Reset changes?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-[var(--text)]">
                                        This will discard all unsaved changes and restore to the last pulled values from GitHub.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="border-[var(--border)]">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleReset} className="bg-[var(--status-error)] hover:opacity-90">
                                        Reset
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}

                    {isDirty && canPush && (
                        <button
                            onClick={() => setIsPushModalOpen(true)}
                            className="flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                        >
                            <GitPullRequest className="h-3.5 w-3.5" />
                            Push to GitHub
                        </button>
                    )}
                </div>
            </header>

            {/* Editor body */}
            <div className="flex flex-1 overflow-hidden">
                {/* Dial Kit panel */}
                <div className="w-[var(--panel-width)] flex-shrink-0 border-r border-[var(--border)] bg-[var(--bg-raised)] overflow-y-auto flex flex-col">
                    {/* Presets */}
                    {componentConfigId && (
                        <div className="border-b border-[var(--border)]">
                            <button className="flex w-full items-center justify-between h-[var(--row-height-xl)] px-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                                Presets
                            </button>
                            <div className="px-3 pb-3 space-y-1">
                                {savedPresets.map((preset) => (
                                    <button
                                        key={preset.id}
                                        onClick={() => {
                                            setConfig({ ...baseline, ...preset.values })
                                            setActivePresetId(preset.id)
                                        }}
                                        className={cn(
                                            'w-full text-left rounded px-2 py-1 text-xs transition-colors',
                                            activePresetId === preset.id
                                                ? 'bg-[var(--accent-muted-bg)] text-[var(--accent)]'
                                                : 'text-[var(--text)] hover:bg-[var(--bg-row)]',
                                        )}
                                    >
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-2 flex gap-1">
                                <input
                                    type="text"
                                    value={presetName}
                                    onChange={(e) => setPresetName(e.target.value)}
                                    placeholder="Preset name…"
                                    className="flex-1 rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-[11px] text-[var(--text-bright)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                />
                                <button
                                    onClick={async () => {
                                        if (!presetName.trim() || !componentConfigId) return
                                        // Save via API — fire and forget, update local state optimistically
                                        const res = await fetch('/api/trpc/components.savePreset', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                json: {
                                                    workspaceId,
                                                    componentConfigId,
                                                    name: presetName.trim(),
                                                    values: config,
                                                },
                                            }),
                                        })
                                        if (res.ok) {
                                            const data = await res.json() as { result?: { data?: { json?: Preset } } }
                                            const newPreset = data?.result?.data?.json
                                            if (newPreset) {
                                                setSavedPresets((prev) => [...prev, newPreset])
                                                setActivePresetId(newPreset.id)
                                            }
                                            setPresetName('')
                                        }
                                    }}
                                    className="rounded border border-[var(--border)] px-2 py-1 text-[11px] text-[var(--text)] hover:bg-[var(--bg-row)] transition-colors"
                                >
                                    <Save className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Code Properties */}
                    <div className="border-b border-[var(--border)]">
                        <button className="flex w-full items-center justify-between h-[var(--row-height-xl)] px-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                            Code Properties
                        </button>
                        <div className="flex flex-col">
                            {defaults.variant !== undefined && (
                                <SelectControl
                                    label="Variant"
                                    value={config.variant ?? defaults.variant ?? 'default'}
                                    options={['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']}
                                    onChange={(v) => updateConfig({ variant: v })}
                                />
                            )}
                            {defaults.size !== undefined && (
                                <SelectControl
                                    label="Size"
                                    value={config.size ?? defaults.size ?? 'md'}
                                    options={['sm', 'md', 'lg', 'xl', '2xl']}
                                    onChange={(v) => updateConfig({ size: v })}
                                />
                            )}
                            {defaults.shape !== undefined && (
                                <SelectControl
                                    label="Shape"
                                    value={config.shape ?? defaults.shape ?? 'rounded'}
                                    options={['rounded', 'square', 'pill']}
                                    onChange={(v) => updateConfig({ shape: v })}
                                />
                            )}
                            {defaults.label !== undefined && (
                                <TextControl
                                    label="Label"
                                    value={config.label ?? defaults.label ?? ''}
                                    onChange={(v) => updateConfig({ label: v })}
                                />
                            )}
                            {defaults.disabled !== undefined && (
                                <ToggleControl
                                    label="Disabled"
                                    value={config.disabled ?? false}
                                    onChange={(v) => updateConfig({ disabled: v })}
                                />
                            )}
                            {defaults.isLoading !== undefined && (
                                <ToggleControl
                                    label="Loading"
                                    value={config.isLoading ?? false}
                                    onChange={(v) => updateConfig({ isLoading: v })}
                                />
                            )}
                        </div>
                    </div>

                    {/* Design Properties */}
                    <div className="border-b border-[var(--border)]">
                        <button className="flex w-full items-center justify-between h-[var(--row-height-xl)] px-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                            Design Tokens
                        </button>
                        <div className="flex flex-col">
                            {defaults.borderRadius !== undefined && (
                                <SliderControl label="Border Radius" value={config.borderRadius ?? defaults.borderRadius ?? 8} min={0} max={48} unit="px" onChange={(v) => updateConfig({ borderRadius: v })} />
                            )}
                            {defaults.paddingX !== undefined && (
                                <SliderControl label="Padding X" value={config.paddingX ?? defaults.paddingX ?? 16} min={0} max={64} unit="px" onChange={(v) => updateConfig({ paddingX: v })} />
                            )}
                            {defaults.paddingY !== undefined && (
                                <SliderControl label="Padding Y" value={config.paddingY ?? defaults.paddingY ?? 8} min={0} max={32} unit="px" onChange={(v) => updateConfig({ paddingY: v })} />
                            )}
                            {defaults.gap !== undefined && (
                                <SliderControl label="Gap" value={config.gap ?? defaults.gap ?? 8} min={0} max={32} unit="px" onChange={(v) => updateConfig({ gap: v })} />
                            )}
                            {defaults.fontSize !== undefined && (
                                <SliderControl label="Font Size" value={config.fontSize ?? defaults.fontSize ?? 14} min={10} max={24} unit="px" onChange={(v) => updateConfig({ fontSize: v })} />
                            )}
                            {defaults.fontWeight !== undefined && (
                                <SelectControl
                                    label="Font Weight"
                                    value={String(config.fontWeight ?? defaults.fontWeight ?? 400)}
                                    options={['400', '500', '600', '700']}
                                    onChange={(v) => updateConfig({ fontWeight: Number(v) as 400 | 500 | 600 | 700 })}
                                />
                            )}
                            {defaults.letterSpacing !== undefined && (
                                <SliderControl label="Letter Spacing" value={config.letterSpacing ?? 0} min={-2} max={4} unit="px" onChange={(v) => updateConfig({ letterSpacing: v })} />
                            )}
                            {defaults.opacity !== undefined && (
                                <SliderControl label="Opacity" value={config.opacity ?? 100} min={0} max={100} unit="%" onChange={(v) => updateConfig({ opacity: v })} />
                            )}
                            {defaults.shadow !== undefined && (
                                <SliderControl label="Shadow" value={config.shadow ?? 2} min={0} max={10} onChange={(v) => updateConfig({ shadow: v })} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Canvas */}
                <div
                    className={cn(
                        'flex flex-1 items-center justify-center relative',
                        canvasTheme === 'dark' ? 'bg-[var(--bg)]' : 'bg-white',
                    )}
                >
                    {/* Canvas theme toggle */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg-raised)] px-2 py-1">
                        <button
                            onClick={() => setCanvasTheme('light')}
                            className={cn(
                                'flex items-center gap-1 px-2 py-0.5 text-xs rounded transition-colors',
                                canvasTheme === 'light' ? 'bg-white/[0.05] text-[var(--text-bright)] font-medium' : 'text-[var(--text)] hover:bg-white/[0.02]',
                            )}
                        >
                            <Sun className="h-3 w-3" />
                            Light
                        </button>
                        <div className="h-3 w-px bg-[var(--border)]" />
                        <button
                            onClick={() => setCanvasTheme('dark')}
                            className={cn(
                                'flex items-center gap-1 px-2 py-0.5 text-xs rounded transition-colors',
                                canvasTheme === 'dark' ? 'bg-white/[0.05] text-[var(--text-bright)] font-medium' : 'text-[var(--text)] hover:bg-white/[0.02]',
                            )}
                        >
                            <Moon className="h-3 w-3" />
                            Dark
                        </button>
                    </div>

                    {/* Component preview */}
                    <div
                        className={cn(
                            'rounded-xl border border-[var(--border)] p-12',
                            canvasTheme === 'dark' ? 'bg-[var(--bg-raised)]' : 'bg-gray-50',
                        )}
                    >
                        <LivePreview componentName={componentName} config={config} />
                    </div>
                </div>

                {/* Code snippet panel */}
                <div className="w-[280px] flex-shrink-0 border-l border-[var(--border)] bg-[var(--bg-raised)]">
                    <CodeSnippetPanel componentName={componentName} snippet={snippet} />
                </div>
            </div>

            {/* Push confirmation modal */}
            <PushConfirmationModal
                open={isPushModalOpen}
                onOpenChange={setIsPushModalOpen}
                workspaceId={workspaceId}
                componentName={componentName}
                owner={owner}
                repo={repo}
                branch={branch}
                diff={diff}
                currentConfig={config}
                onSuccess={(prNumber, prUrl) => {
                    setStatus('PENDING_PUSH')
                }}
            />
        </div>
    )
}
