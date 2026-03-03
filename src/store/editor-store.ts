import { create } from 'zustand'

export type CanvasTheme = 'dark' | 'light'

interface EditorState {
    // Canvas
    canvasTheme: CanvasTheme
    setCanvasTheme: (theme: CanvasTheme) => void

    // Panel
    isPanelOpen: boolean
    togglePanel: () => void

    // Presets
    activePresetId: string | null
    setActivePresetId: (id: string | null) => void

    // Unsaved state
    isDirty: boolean
    setIsDirty: (dirty: boolean) => void
}

export const useEditorStore = create<EditorState>((set) => ({
    canvasTheme: 'dark',
    setCanvasTheme: (theme) => set({ canvasTheme: theme }),

    isPanelOpen: true,
    togglePanel: () => set((s) => ({ isPanelOpen: !s.isPanelOpen })),

    activePresetId: null,
    setActivePresetId: (id) => set({ activePresetId: id }),

    isDirty: false,
    setIsDirty: (dirty) => set({ isDirty: dirty }),
}))
