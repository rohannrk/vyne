import type { ComponentType } from 'react'
import { ButtonPreview } from './button-preview'
import { InputPreview } from './input-preview'
import { TextareaPreview } from './textarea-preview'
import { CheckboxPreview } from './checkbox-preview'
import { SwitchPreview } from './switch-preview'
import { SliderPreview } from './slider-preview'
import { BadgePreview } from './badge-preview'
import { ProgressPreview } from './progress-preview'
import { SkeletonPreview } from './skeleton-preview'

export const COMPONENT_PREVIEWS: Record<string, ComponentType> = {
  button: ButtonPreview,
  input: InputPreview,
  textarea: TextareaPreview,
  checkbox: CheckboxPreview,
  switch: SwitchPreview,
  slider: SliderPreview,
  badge: BadgePreview,
  progress: ProgressPreview,
  skeleton: SkeletonPreview,
}

