import 'server-only'
import { prisma } from '@/lib/db'
import { getOctokitForUser } from './client'
import type { DialKitConfig } from '@/types/dial-kit'

export type PullErrorType = 'auth' | 'not-found' | 'transient' | null

export interface ComponentPullResult {
    componentName: string
    status: 'SYNCED' | 'PENDING_ADD'
    props: DialKitConfig | null
    error?: PullErrorType
}

export interface WorkspacePullResult {
    success: boolean
    errorType: PullErrorType
    pulledAt: Date | null
    results: ComponentPullResult[]
}

const SUPPORTED_COMPONENTS = [
    'button', 'input', 'textarea', 'checkbox', 'switch',
    'slider', 'badge', 'progress', 'skeleton',
]

/**
 * Reads a single component file from GitHub and extracts its props.
 * Returns null if the file is not found (PENDING_ADD case).
 */
async function readComponentFromGitHub(params: {
    octokit: Awaited<ReturnType<typeof getOctokitForUser>>
    owner: string
    repo: string
    branch: string
    componentDirectoryPath: string
    componentName: string
}): Promise<{ props: DialKitConfig; filePath: string } | null> {
    const { octokit, owner, repo, branch, componentDirectoryPath, componentName } = params

    // Try both lowercase and PascalCase file names
    const candidates = [
        `${componentDirectoryPath}/${componentName}.tsx`,
        `${componentDirectoryPath}/${componentName.charAt(0).toUpperCase() + componentName.slice(1)}.tsx`,
        `${componentDirectoryPath}/ui/${componentName}.tsx`,
    ]

    for (const path of candidates) {
        try {
            const { data } = await octokit.repos.getContent({ owner, repo, ref: branch, path })
            if ('content' in data && typeof data.content === 'string') {
                const content = Buffer.from(data.content, 'base64').toString('utf-8')
                const props = parseComponentProps(content)
                return { props, filePath: path }
            }
        } catch (err: unknown) {
            const status = (err as { status?: number }).status
            if (status === 404) continue // try next candidate
            throw err // re-throw auth/network errors
        }
    }

    return null
}

/**
 * Simple string-based prop extraction from TSX file content.
 * Extracts className-style design tokens and prop defaults.
 * This is the MVP approach — ts-morph AST parsing is a post-MVP escalation.
 */
function parseComponentProps(content: string): DialKitConfig {
    const props: DialKitConfig = {}

    // Extract rounded-* for borderRadius
    const rounded = content.match(/rounded-\[(\d+)px\]/)
    if (rounded) props.borderRadius = parseInt(rounded[1])

    const px = content.match(/px-\[(\d+)px\]/)
    if (px) props.paddingX = parseInt(px[1])

    const py = content.match(/py-\[(\d+)px\]/)
    if (py) props.paddingY = parseInt(py[1])

    const text = content.match(/text-\[(\d+)px\]/)
    if (text) props.fontSize = parseInt(text[1])

    // Look for vyne-props comment block: // vyne:props { ... }
    const vyneProps = content.match(/\/\/\s*vyne:props\s+(\{[^}]+\})/m)
    if (vyneProps) {
        try {
            const parsed = JSON.parse(vyneProps[1]) as Partial<DialKitConfig>
            Object.assign(props, parsed)
        } catch {
            // ignore malformed comment
        }
    }

    return props
}

/**
 * Orchestrates a Pull for all 9 supported components.
 * Uses Promise.allSettled so a single 404 never prevents the rest from syncing.
 */
export async function pullWorkspace(params: {
    workspaceId: string
    userId: string
}): Promise<WorkspacePullResult> {
    const { workspaceId, userId } = params

    const connection = await prisma.gitHubConnection.findUnique({
        where: { workspaceId },
    })

    if (!connection) {
        return { success: false, errorType: 'not-found', pulledAt: null, results: [] }
    }

    let octokit: Awaited<ReturnType<typeof getOctokitForUser>>
    try {
        octokit = await getOctokitForUser(userId)
    } catch {
        return { success: false, errorType: 'auth', pulledAt: null, results: [] }
    }

    const settled = await Promise.allSettled(
        SUPPORTED_COMPONENTS.map(async (componentName) => {
            const result = await readComponentFromGitHub({
                octokit,
                owner: connection.repoOwner,
                repo: connection.repoName,
                branch: connection.branch,
                componentDirectoryPath: connection.componentDirectoryPath,
                componentName,
            })

            if (result) {
                // Upsert into DB — SYNCED
                await prisma.componentConfig.upsert({
                    where: { workspaceId_componentName: { workspaceId, componentName } },
                    create: {
                        workspaceId,
                        componentName,
                        props: result.props as object,
                        githubFilePath: result.filePath,
                        status: 'SYNCED',
                        lastSyncedAt: new Date(),
                    },
                    update: {
                        props: result.props as object,
                        githubFilePath: result.filePath,
                        status: 'SYNCED',
                        lastSyncedAt: new Date(),
                    },
                })
                return { componentName, status: 'SYNCED' as const, props: result.props }
            } else {
                // File not found — PENDING_ADD
                await prisma.componentConfig.upsert({
                    where: { workspaceId_componentName: { workspaceId, componentName } },
                    create: {
                        workspaceId,
                        componentName,
                        props: {},
                        status: 'PENDING_ADD',
                    },
                    update: {
                        status: 'PENDING_ADD',
                    },
                })
                return { componentName, status: 'PENDING_ADD' as const, props: null }
            }
        }),
    )

    // Classify errors
    let globalError: PullErrorType = null
    const results: ComponentPullResult[] = []

    for (let i = 0; i < settled.length; i++) {
        const item = settled[i]
        const componentName = SUPPORTED_COMPONENTS[i]
        if (item.status === 'fulfilled') {
            results.push(item.value)
        } else {
            const err = item.reason as { status?: number }
            if (err?.status === 401 || err?.status === 403) globalError = 'auth'
            else if (err?.status === 404) globalError = 'not-found'
            else globalError = 'transient'
            results.push({ componentName, status: 'PENDING_ADD', props: null, error: globalError })
        }
    }

    // Update lastPulledAt
    if (!globalError || globalError === 'not-found') {
        await prisma.gitHubConnection.update({
            where: { workspaceId },
            data: { lastPulledAt: new Date() },
        })
    }

    return {
        success: globalError === null,
        errorType: globalError,
        pulledAt: globalError === null ? new Date() : null,
        results,
    }
}
