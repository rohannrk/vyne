'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createComponentPR, rewriteComponentFile } from '@/lib/github/write-component'
import { getOctokitForUser } from '@/lib/github/client'
import type { DialKitConfig } from '@/types/dial-kit'
import type { DiffEntry } from '@/hooks/use-component-delta'

export type PushActionResult =
    | { ok: true; prNumber: number; prUrl: string }
    | { ok: false; error: string }

export async function pushComponentAction(params: {
    workspaceId: string
    componentName: string
    newConfig: DialKitConfig
    diff: DiffEntry[]
}): Promise<PushActionResult> {
    const session = await auth()
    if (!session?.user) return { ok: false, error: 'Not authenticated.' }

    const userId = session.user.id as string
    const { workspaceId, componentName, newConfig, diff } = params


    // Check workspace membership and role (EDITOR or ADMIN only)
    const membership = await prisma.workspaceUser.findFirst({
        where: {
            userId,
            workspaceId,
            role: { in: ['EDITOR', 'ADMIN'] },
        },
    })

    if (!membership) {
        return { ok: false, error: 'You do not have permission to push changes.' }
    }

    // Fetch connection
    const connection = await prisma.gitHubConnection.findUnique({
        where: { workspaceId },
    })

    if (!connection) {
        return { ok: false, error: 'GitHub is not connected to this workspace.' }
    }

    // Fetch the component config to get the file path
    const componentConfig = await prisma.componentConfig.findUnique({
        where: { workspaceId_componentName: { workspaceId, componentName } },
    })

    const filePath = componentConfig?.githubFilePath
    if (!filePath) {
        return { ok: false, error: 'Component file path is not known — pull from GitHub first.' }
    }

    try {
        // Read current file content from GitHub
        const octokit = await getOctokitForUser(userId)
        const { data: fileData } = await octokit.repos.getContent({
            owner: connection.repoOwner,
            repo: connection.repoName,
            path: filePath,
            ref: connection.branch,
        })

        if (!('content' in fileData) || typeof fileData.content !== 'string') {
            return { ok: false, error: 'Could not read existing file from GitHub.' }
        }

        const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8')
        const newContent = rewriteComponentFile(currentContent, newConfig)

        // Create PR
        const { prNumber, prUrl } = await createComponentPR({
            userId,
            owner: connection.repoOwner,
            repo: connection.repoName,
            branch: connection.branch,
            filePath,
            componentName,
            newContent,
            diff,
        })

        // Update DB status to PENDING_PUSH
        await prisma.componentConfig.update({
            where: { workspaceId_componentName: { workspaceId, componentName } },
            data: {
                props: newConfig as object,
                status: 'PENDING_PUSH',
                lastPushedAt: new Date(),
            },
        })

        return { ok: true, prNumber, prUrl }
    } catch (err: unknown) {
        const error = err as { message?: string; status?: number }
        if (error?.status === 401 || error?.status === 403) {
            return { ok: false, error: 'GitHub token has expired. Please reconnect GitHub.' }
        }
        if (error?.status === 422) {
            return { ok: false, error: 'A branch with these changes already exists. Try again.' }
        }
        return { ok: false, error: error?.message ?? 'Something went wrong. Please try again.' }
    }
}

export async function pullNowAction(params: { workspaceId: string }): Promise<{ ok: boolean; error?: string }> {
    const session = await auth()
    if (!session?.user) return { ok: false, error: 'Not authenticated.' }

    const userId = session.user.id as string
    const { pullWorkspace } = await import('@/lib/github/pull-workspace')
    const result = await pullWorkspace({ workspaceId: params.workspaceId, userId })
    const errStr = result.errorType !== null ? (result.errorType ?? undefined) : undefined
    return { ok: result.success, error: errStr }
}
