type ComponentManifestEntry = {
  name:        string
  displayName: string
  category:    'inputs' | 'display'
  fileName:    string
}

export const SHADCN_REGISTRY_URL = 'https://registry.shadcn.io/r'

export const SHADCN_COMPONENTS = [
  { name: 'button',   displayName: 'Button',   category: 'inputs',  fileName: 'button.tsx'   },
  { name: 'input',    displayName: 'Input',    category: 'inputs',  fileName: 'input.tsx'    },
  { name: 'textarea', displayName: 'Textarea', category: 'inputs',  fileName: 'textarea.tsx' },
  { name: 'checkbox', displayName: 'Checkbox', category: 'inputs',  fileName: 'checkbox.tsx' },
  { name: 'switch',   displayName: 'Switch',   category: 'inputs',  fileName: 'switch.tsx'   },
  { name: 'slider',   displayName: 'Slider',   category: 'inputs',  fileName: 'slider.tsx'   },
  { name: 'badge',    displayName: 'Badge',    category: 'display', fileName: 'badge.tsx'    },
  { name: 'progress', displayName: 'Progress', category: 'display', fileName: 'progress.tsx' },
  { name: 'skeleton', displayName: 'Skeleton', category: 'display', fileName: 'skeleton.tsx' },
] as const satisfies ComponentManifestEntry[]
