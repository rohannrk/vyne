'use client'

import { useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { ComponentProps } from '@/types'
import { useEditorStore } from '@/store/editor-store'

type Props = {
  workspaceId: string
  componentName: string
}

export function PresetToolbar({ workspaceId, componentName }: Props) {
  const baselineProps = useEditorStore((state) => state.baselineProps)
  const currentProps = useEditorStore((state) => state.currentProps)
  const applyPreset = useEditorStore((state) => state.applyPreset)
  const theme = useEditorStore((state) => state.theme)
  const toggleTheme = useEditorStore((state) => state.toggleTheme)
  const activePresetId = useEditorStore((state) => state.activePresetId)

  const utils = trpc.useUtils()

  const { data: presets, isLoading } = trpc.components.listPresets.useQuery({
    workspaceId,
    componentName,
  })

  const createPreset = trpc.components.createPreset.useMutation({
    onSuccess: async () => {
      await utils.components.listPresets.invalidate({ workspaceId, componentName })
    },
  })

  const handleSavePreset = useCallback(() => {
    const source = (currentProps ?? baselineProps) as ComponentProps | null
    if (!source) return

    const name = window.prompt('Preset name')
    if (!name) return

    createPreset.mutate({
      workspaceId,
      componentName,
      name,
      values: source,
    })
  }, [baselineProps, componentName, createPreset, currentProps, workspaceId])

  const handleSelectPreset = useCallback(
    (presetId: string) => {
      if (!presets) return
      const selected = presets.find((p) => p.id === presetId)
      if (!selected) return

      applyPreset(selected.values as ComponentProps, selected.id)
    },
    [applyPreset, presets],
  )

  const handleExportJson = useCallback(() => {
    const source = (currentProps ?? baselineProps) as ComponentProps | null
    if (!source) return

    const json = JSON.stringify(source, null, 2)
    void navigator.clipboard
      .writeText(json)
      .then(() => {
        // Best-effort UX; avoids extra toast dependencies for now.
        window.alert('Current Dial Kit state copied as JSON.')
      })
      .catch(() => {
        window.alert('Unable to copy JSON to clipboard.')
      })
  }, [baselineProps, currentProps])

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark canvas' : 'Switch to light canvas'}
          aria-pressed={theme === 'dark'}
          className="rounded-md border px-2 py-1 text-[11px] font-medium text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {theme === 'light' ? 'Dark canvas' : 'Light canvas'}
        </button>
        <span className="font-medium text-muted-foreground">Presets</span>
        <select
          className="h-7 rounded-md border bg-background px-2 py-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={activePresetId ?? ''}
          disabled={isLoading || !presets?.length}
          onChange={(e) => {
            const v = e.target.value
            if (!v) return
            handleSelectPreset(v)
          }}
          aria-label="Select preset version"
        >
          <option value="">{isLoading ? 'Loading…' : 'Select preset'}</option>
          {presets?.map((preset, index) => (
            <option key={preset.id} value={preset.id}>
              {preset.name || `Version ${index + 1}`}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleExportJson}
          aria-label="Copy current Dial Kit state as JSON to clipboard"
          className="rounded-md border px-2 py-1 text-[11px] font-medium text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={handleSavePreset}
          aria-label="Save current state as a named preset"
          className="rounded-md bg-primary px-2 py-1 text-[11px] font-medium text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Save preset
        </button>
      </div>
    </div>
  )
}

