import 'server-only'
import { getOctokitForUser } from './client'
import type { DialKitConfig } from '@/types/dial-kit'
import type { DiffEntry } from '@/hooks/use-component-delta'

export interface PushResult {
    prNumber: number
    prUrl: string
}

export interface PushError {
    message: string
}

/**
 * Rewrites a component file's vyne:props comment block with new values.
 * This is surgical string replacement — the MVP approach.
 * Symmetric with the Pull parser in pull-workspace.ts.
 */
export function rewriteComponentFile(content: string, newProps: Partial<DialKitConfig>): string {
    const vyneComment = `// vyne:props ${JSON.stringify(newProps)}`

    // If an existing vyne:props block exists, replace it
    if (/\/\/\s*vyne:props\s+\{[^}]+\}/m.test(content)) {
        return content.replace(/\/\/\s*vyne:props\s+\{[^}]+\}/m, vyneComment)
    }

    // Otherwise prepend the comment after the first import block
    const lastImportMatch = [...content.matchAll(/^import .+$/gm)].pop()
    if (lastImportMatch?.index !== undefined) {
        const insertAt = lastImportMatch.index + lastImportMatch[0].length
        return content.slice(0, insertAt) + '\n\n' + vyneComment + content.slice(insertAt)
    }

    // Fallback: prepend to file
    return vyneComment + '\n' + content
}

/**
 * Creates a GitHub PR with the rewritten component file.
 * Branch naming: vyne/[component]-[unix-timestamp]
 */
export async function createComponentPR(params: {
    userId: string
    owner: string
    repo: string
    branch: string           // default branch to PR into
    filePath: string
    componentName: string
    newContent: string
    diff: DiffEntry[]
}): Promise<PushResult> {
    const { userId, owner, repo, branch, filePath, componentName, newContent, diff } = params

    const octokit = await getOctokitForUser(userId)
    const timestamp = Math.floor(Date.now() / 1000)
    const newBranch = `vyne/${componentName}-${timestamp}`

    // Get the SHA of the default branch tip
    const { data: refData } = await octokit.git.getRef({
        owner, repo, ref: `heads/${branch}`,
    })
    const baseSha = refData.object.sha

    // Create new branch from base
    await octokit.git.createRef({
        owner, repo,
        ref: `refs/heads/${newBranch}`,
        sha: baseSha,
    })

    // Get current file SHA for the update
    const { data: fileData } = await octokit.repos.getContent({
        owner, repo, path: filePath, ref: branch,
    })
    const fileSha = 'sha' in fileData ? fileData.sha : undefined

    // Commit rewritten file
    await octokit.repos.createOrUpdateFileContents({
        owner, repo,
        path: filePath,
        message: `chore: update ${componentName} via VYNE`,
        content: Buffer.from(newContent).toString('base64'),
        branch: newBranch,
        sha: fileSha,
    })

    // Build human-readable diff for PR body
    const diffBody = diff
        .map((d) => `- **${d.key}**: \`${d.from}\` → \`${d.to}\``)
        .join('\n')

    // Open PR
    const { data: pr } = await octokit.pulls.create({
        owner, repo,
        title: `chore: update ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} via VYNE`,
        body: `## Changes made via VYNE\n\n${diffBody}\n\n---\n*This PR was created automatically by [VYNE](https://github.com/rohannrk/vyne).*`,
        head: newBranch,
        base: branch,
    })

    return { prNumber: pr.number, prUrl: pr.html_url }
}
