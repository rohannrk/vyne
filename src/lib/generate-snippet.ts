// Pure function — no hooks, no async, no side effects.
// Used by CodeSnippetPanel and unit-testable in isolation.

import type { DialKitConfig } from '@/types/dial-kit'

interface SnippetToken {
    type: 'component' | 'prop' | 'string' | 'number' | 'boolean' | 'punctuation' | 'keyword' | 'comment'
    value: string
}

export interface GeneratedSnippet {
    raw: string
    tokens: SnippetToken[]
}

const PASCAL = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function generateSnippet(componentName: string, config: DialKitConfig, defaults: DialKitConfig): GeneratedSnippet {
    const name = PASCAL(componentName)
    const importPath = `@/components/ui/${componentName}`

    // Collect props — omit values that match default to reduce noise
    const codeProps: Array<[string, unknown]> = []
    const styleEntries: Array<[string, unknown]> = []

    // Code props
    if (config.variant && config.variant !== defaults.variant) codeProps.push(['variant', config.variant])
    if (config.size && config.size !== defaults.size) codeProps.push(['size', config.size])
    if (config.shape && config.shape !== defaults.shape) codeProps.push(['shape', config.shape])
    if (config.disabled && config.disabled !== defaults.disabled) codeProps.push(['disabled', config.disabled])
    if (config.isLoading && config.isLoading !== defaults.isLoading) codeProps.push(['isLoading', config.isLoading])

    // Design props → style object
    const designKeys: Array<keyof DialKitConfig> = [
        'borderRadius', 'paddingX', 'paddingY', 'gap',
        'fontSize', 'fontWeight', 'letterSpacing', 'opacity', 'shadow',
    ]
    for (const key of designKeys) {
        const val = config[key]
        const def = defaults[key]
        if (val !== undefined && val !== def) {
            styleEntries.push([key, val])
        }
    }

    const hasChildren = componentName !== 'input' && componentName !== 'slider' && componentName !== 'progress' && componentName !== 'skeleton'
    const childrenLabel = config.label ?? defaults.label ?? name
    const allProps = [...codeProps]
    const multiLine = allProps.length + (styleEntries.length > 0 ? 1 : 0) > 2

    // Build raw string
    let raw = `import { ${name} } from "${importPath}"\n\nexport function Example() {\n  return (\n`

    if (multiLine) {
        raw += `    <${name}\n`
        for (const [k, v] of allProps) {
            if (typeof v === 'boolean') {
                raw += v ? `      ${k}\n` : `      ${k}={false}\n`
            } else {
                raw += `      ${k}="${v}"\n`
            }
        }
        if (styleEntries.length > 0) {
            const styleStr = styleEntries.map(([k, v]) => `${k}: ${v}`).join(', ')
            raw += `      style={{ ${styleStr} }}\n`
        }
        if (hasChildren) {
            raw += `    >\n      ${childrenLabel}\n    </${name}>\n`
        } else {
            raw += `    />\n`
        }
    } else {
        const propStr = allProps.map(([k, v]) => {
            if (typeof v === 'boolean') return v ? k : `${k}={false}`
            return `${k}="${v}"`
        }).join(' ')
        const styleStr = styleEntries.length > 0
            ? ` style={{ ${styleEntries.map(([k, v]) => `${k}: ${v}`).join(', ')} }}`
            : ''
        const allStr = [propStr, styleStr.trim()].filter(Boolean).join(' ')
        if (hasChildren) {
            raw += `    <${name}${allStr ? ' ' + allStr : ''}>${childrenLabel}</${name}>\n`
        } else {
            raw += `    <${name}${allStr ? ' ' + allStr : ''} />\n`
        }
    }

    raw += `  )\n}`

    // Build tokens for syntax highlighting
    const tokens: SnippetToken[] = [
        { type: 'keyword', value: 'import' },
        { type: 'punctuation', value: ' { ' },
        { type: 'component', value: name },
        { type: 'punctuation', value: ' } ' },
        { type: 'keyword', value: 'from' },
        { type: 'punctuation', value: ' ' },
        { type: 'string', value: `"${importPath}"` },
        { type: 'punctuation', value: '\n\n' },
        { type: 'keyword', value: 'export function' },
        { type: 'punctuation', value: ' Example() {\n  return (\n    <' },
        { type: 'component', value: name },
    ]

    for (const [k, v] of allProps) {
        tokens.push({ type: 'punctuation', value: '\n      ' })
        tokens.push({ type: 'prop', value: k })
        if (typeof v === 'boolean') {
            if (!v) {
                tokens.push({ type: 'punctuation', value: '={' })
                tokens.push({ type: 'boolean', value: 'false' })
                tokens.push({ type: 'punctuation', value: '}' })
            }
        } else {
            tokens.push({ type: 'punctuation', value: '="' })
            tokens.push({ type: 'string', value: String(v) })
            tokens.push({ type: 'punctuation', value: '"' })
        }
    }

    if (styleEntries.length > 0) {
        tokens.push({ type: 'punctuation', value: '\n      ' })
        tokens.push({ type: 'prop', value: 'style' })
        tokens.push({ type: 'punctuation', value: '={{ ' })
        styleEntries.forEach(([k, v], i) => {
            tokens.push({ type: 'prop', value: k })
            tokens.push({ type: 'punctuation', value: ': ' })
            tokens.push({ type: 'number', value: String(v) })
            if (i < styleEntries.length - 1) tokens.push({ type: 'punctuation', value: ', ' })
        })
        tokens.push({ type: 'punctuation', value: ' }}' })
    }

    if (hasChildren) {
        tokens.push({ type: 'punctuation', value: '\n    >\n      ' })
        tokens.push({ type: 'string', value: childrenLabel })
        tokens.push({ type: 'punctuation', value: `\n    </${name}>` })
    } else {
        tokens.push({ type: 'punctuation', value: '\n    />' })
    }

    tokens.push({ type: 'punctuation', value: '\n  )\n}' })

    return { raw, tokens }
}
