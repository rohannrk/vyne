'use client'

import { useEditorStore } from '@/store/editor-store'

type Props = {
  componentName: string
}

export function DialKitPanel({ componentName }: Props) {
  const isPanelOpen = useEditorStore((state) => state.isPanelOpen)
  const togglePanel = useEditorStore((state) => state.togglePanel)
  const hasUnsavedChanges = useEditorStore((state) => state.hasUnsavedChanges)

  return (
    <aside className="flex h-full flex-col gap-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Dial Kit
          </p>
          <p className="text-sm font-semibold">
            {componentName.charAt(0).toUpperCase() + componentName.slice(1)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-800">
              Unsaved
            </span>
          )}
          <button
            type="button"
            onClick={togglePanel}
            aria-label={isPanelOpen ? 'Hide panel section' : 'Show panel section'}
            aria-expanded={isPanelOpen}
            className="rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {isPanelOpen ? 'Hide' : 'Show'}
          </button>
        </div>
      </header>

      {isPanelOpen && (
        <div className="flex-1 space-y-2 overflow-auto rounded-md border bg-background p-3 text-[11px] text-muted-foreground">
          <p className="font-medium">Controls</p>
          <p>
            The <strong>Dial Kit floating panel</strong> (from <code>DialRoot</code> in the
            layout) shows sliders, selects, and toggles for this component. Open it from the
            Dial Kit tab or floating trigger on the page to adjust code and design
            properties. Changes update the canvas instantly with zero network calls.
          </p>
        </div>
      )}
    </aside>
  )
}


