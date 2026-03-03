'use client'

import { COMPONENT_PREVIEWS } from '@/components/editor'
import { useEditorStore } from '@/store/editor-store'

type Props = {
  componentName: string
}

export function Canvas({ componentName }: Props) {
  const theme = useEditorStore((s) => s.theme)
  const activePresetId = useEditorStore((s) => s.activePresetId)
  const Preview = COMPONENT_PREVIEWS[componentName]
  const previewKey = `${componentName}:${activePresetId ?? 'base'}`

  return (
    <div
      className={`flex h-full flex-col items-center justify-center px-6 py-8 transition-colors ${
        theme === 'dark'
          ? 'bg-zinc-950 text-zinc-50'
          : 'bg-muted/40 text-foreground'
      }`}
    >
      <div className="mb-6 flex w-full max-w-3xl items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Preview
          </p>
          <p className="mt-1 text-sm font-semibold">
            {componentName} component editor
          </p>
        </div>
      </div>

      <div className="flex w-full max-w-3xl items-center justify-center rounded-xl border bg-background px-8 py-10 shadow-sm">
        {Preview ? (
          <Preview key={previewKey} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No preview registered for <code>{componentName}</code>.
          </p>
        )}
      </div>
    </div>
  )
}


