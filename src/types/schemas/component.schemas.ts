import { z } from 'zod'
import { SHADCN_COMPONENTS } from '@/lib/config'

const componentNames = SHADCN_COMPONENTS.map((c) => c.name) as [string, ...string[]]

export const componentNameSchema = z.enum(componentNames)

export const componentPropsSchema = z.object({
  variant:       z.string().optional(),
  size:          z.string().optional(),
  shape:         z.string().optional(),
  label:         z.string().optional(),
  disabled:      z.boolean().optional(),
  isLoading:     z.boolean().optional(),
  borderRadius:  z.number().optional(),
  paddingX:      z.number().optional(),
  paddingY:      z.number().optional(),
  gap:           z.number().optional(),
  fontSize:      z.number().optional(),
  fontWeight:    z.string().optional(),
  letterSpacing: z.number().optional(),
  opacity:       z.number().min(0).max(1).optional(),
  shadow:        z.number().optional(),
})

export const getComponentSchema = z.object({
  workspaceId:   z.string().cuid(),
  componentName: componentNameSchema,
})

export const listPresetsSchema = z.object({
  workspaceId:   z.string().cuid(),
  componentName: componentNameSchema,
})

export const createPresetSchema = z.object({
  workspaceId:   z.string().cuid(),
  componentName: componentNameSchema,
  name:          z.string().min(1),
  values:        componentPropsSchema,
})

export const updateComponentPropsSchema = z.object({
  workspaceId:   z.string().cuid(),
  componentName: componentNameSchema,
  props:         componentPropsSchema,
})

export const pushComponentSchema = z.object({
  workspaceId:   z.string().cuid(),
  componentName: componentNameSchema,
})

export const addComponentSchema = z.object({
  workspaceId:   z.string().cuid(),
  componentName: componentNameSchema,
})

export const listComponentsSchema = z.object({
  workspaceId: z.string().cuid(),
})
