'use client'

import { useEffect, useMemo } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { ComponentProps } from '@/types'
import { useEditorStore } from '@/store/editor-store'
import { Canvas } from './canvas'
import { DialKitPanel } from './dial-kit-panel'
import { PresetToolbar } from './preset-toolbar'

type Props = {
  workspaceId: string
  componentName: string
}

export function EditorPage({ workspaceId, componentName }: Props) {
  const setSelectedComponent = useEditorStore((s) => s.setSelectedComponent)
  const setBaselineProps = useEditorStore((s) => s.setBaselineProps)

  const { data, isLoading, error } = trpc.components.getOne.useQuery({
    workspaceId,
    componentName,
  })

  const initialProps: ComponentProps | null = useMemo(() => {
    if (!data) return null
    // ComponentConfig.props is a JSON blob; trust shape from earlier stories.
    return data.props as ComponentProps
  }, [data])

  useEffect(() => {
    if (initialProps) {
      setSelectedComponent(componentName)
      setBaselineProps(initialProps)
    }
  }, [componentName, initialProps, setBaselineProps, setSelectedComponent])

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading component…</p>
      </div>
    )
  }

  if (error || !initialProps) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="space-y-2 text-center">
          <p className="text-sm font-medium">Unable to load component</p>
          <p className="text-xs text-muted-foreground">
            {error?.message ?? 'Component configuration was not found.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="border-b bg-background/80 px-4 py-2">
        <PresetToolbar workspaceId={workspaceId} componentName={componentName} />
      </div>
      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex-1 border-r bg-background">
          <Canvas componentName={componentName} />
        </div>
        <div className="w-full border-t bg-background/80 p-4 backdrop-blur lg:w-80 lg:border-t-0 lg:border-l">
          <DialKitPanel componentName={componentName} />
        </div>
      </div>
    </div>
  )
}

