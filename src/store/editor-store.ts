'use client'

import { create } from 'zustand'
import type { ComponentProps } from '@/types/index.d.ts'

type Theme = 'light' | 'dark'

type EditorState = {
  selectedComponent: string | null
  activePresetId: string | null
  theme: Theme
  isPanelOpen: boolean
  hasUnsavedChanges: boolean
  baselineProps: ComponentProps | null
  currentProps: ComponentProps | null
  setSelectedComponent: (component: string) => void
  setActivePresetId: (presetId: string | null) => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setPanelOpen: (open: boolean) => void
  togglePanel: () => void
  setBaselineProps: (props: ComponentProps) => void
  setCurrentProps: (props: ComponentProps) => void
  applyPreset: (props: ComponentProps, presetId: string) => void
}

function areComponentPropsEqual(a: ComponentProps, b: ComponentProps): boolean {
  return (
    a.variant === b.variant &&
    a.size === b.size &&
    a.shape === b.shape &&
    a.label === b.label &&
    a.disabled === b.disabled &&
    a.isLoading === b.isLoading &&
    a.borderRadius === b.borderRadius &&
    a.paddingX === b.paddingX &&
    a.paddingY === b.paddingY &&
    a.gap === b.gap &&
    a.fontSize === b.fontSize &&
    a.fontWeight === b.fontWeight &&
    a.letterSpacing === b.letterSpacing &&
    a.opacity === b.opacity &&
    a.shadow === b.shadow
  )
}

export const useEditorStore = create<EditorState>((set) => ({
  selectedComponent: null,
  activePresetId: null,
  theme: 'light',
  isPanelOpen: true,
  hasUnsavedChanges: false,
  baselineProps: null,
  currentProps: null,

  setSelectedComponent: (component) =>
    set({
      selectedComponent: component,
      activePresetId: null,
      baselineProps: null,
      currentProps: null,
      hasUnsavedChanges: false,
    }),

  setActivePresetId: (presetId) =>
    set({
      activePresetId: presetId,
    }),

  setTheme: (theme) =>
    set({
      theme,
    }),

  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    })),

  setPanelOpen: (open) =>
    set({
      isPanelOpen: open,
    }),

  togglePanel: () =>
    set((state) => ({
      isPanelOpen: !state.isPanelOpen,
    })),

  setBaselineProps: (props) =>
    set((state) => ({
      baselineProps: props,
      currentProps: state.currentProps ?? props,
      hasUnsavedChanges:
        state.currentProps != null && !areComponentPropsEqual(props, state.currentProps),
    })),

  setCurrentProps: (props) =>
    set((state) => ({
      currentProps: props,
      hasUnsavedChanges:
        state.baselineProps != null && !areComponentPropsEqual(state.baselineProps, props),
    })),

  applyPreset: (props, presetId) =>
    set(() => ({
      baselineProps: props,
      currentProps: props,
      activePresetId: presetId,
      hasUnsavedChanges: false,
    })),
}))

