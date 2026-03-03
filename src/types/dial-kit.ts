// DialKitConfig — the shape shared between the editor, DB (props JSON), preview components, and code snippet generation.
// Matches the PRD property tables exactly.

export interface CodeProps {
    variant?: string
    size?: string
    shape?: string
    label?: string
    disabled?: boolean
    isLoading?: boolean
}

export interface DesignProps {
    borderRadius?: number  // default 8, range 0–48
    paddingX?: number      // default 16, range 0–64
    paddingY?: number      // default 8, range 0–32
    gap?: number           // default 8, range 0–32
    fontSize?: number      // default 14, range 10–24
    fontWeight?: 400 | 500 | 600 | 700  // select
    letterSpacing?: number // default 0, range -2–4
    opacity?: number       // default 100, range 0–100
    shadow?: number        // default 2, range 0–10
}

export interface DialKitConfig extends CodeProps, DesignProps { }

// Defaults per-component — seeded when there is no DB record yet
export const COMPONENT_DEFAULTS: Record<string, DialKitConfig> = {
    button: {
        variant: 'default',
        size: 'md',
        shape: 'rounded',
        label: 'Click me',
        disabled: false,
        isLoading: false,
        borderRadius: 6,
        paddingX: 16,
        paddingY: 9,
        gap: 8,
        fontSize: 14,
        fontWeight: 500,
        letterSpacing: 0,
        opacity: 100,
        shadow: 2,
    },
    input: {
        variant: 'default',
        size: 'md',
        shape: 'rounded',
        label: 'Label',
        disabled: false,
        borderRadius: 6,
        paddingX: 12,
        paddingY: 8,
        fontSize: 14,
        fontWeight: 400,
        letterSpacing: 0,
        opacity: 100,
        shadow: 1,
    },
    textarea: {
        variant: 'default',
        size: 'md',
        label: 'Placeholder…',
        disabled: false,
        borderRadius: 6,
        paddingX: 12,
        paddingY: 8,
        fontSize: 14,
        fontWeight: 400,
        letterSpacing: 0,
        opacity: 100,
        shadow: 1,
    },
    checkbox: {
        variant: 'default',
        size: 'md',
        label: 'Accept terms',
        disabled: false,
        borderRadius: 4,
        gap: 8,
        fontSize: 14,
        fontWeight: 400,
        opacity: 100,
    },
    switch: {
        variant: 'default',
        size: 'md',
        label: 'Enable feature',
        disabled: false,
        gap: 8,
        fontSize: 14,
        fontWeight: 400,
        opacity: 100,
    },
    slider: {
        variant: 'default',
        size: 'md',
        disabled: false,
        borderRadius: 4,
        paddingX: 0,
        paddingY: 0,
        opacity: 100,
    },
    badge: {
        variant: 'default',
        size: 'sm',
        shape: 'rounded',
        label: 'Badge',
        borderRadius: 4,
        paddingX: 10,
        paddingY: 2,
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: 0,
        opacity: 100,
    },
    progress: {
        variant: 'default',
        size: 'md',
        borderRadius: 4,
        opacity: 100,
    },
    skeleton: {
        variant: 'default',
        size: 'md',
        borderRadius: 4,
        opacity: 100,
    },
}
