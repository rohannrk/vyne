import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import {
    GitBranch,
    Plus,
    LayoutGrid,
    CheckCircle2,
    Clock,
    LogOut,
} from 'lucide-react'
import { WorkspaceHubClient } from './workspace-hub-client'

export default async function WorkspacesPage() {
    const session = await auth()
    if (!session?.user) redirect('/login')

    const workspaceUsers = await prisma.workspaceUser.findMany({
        where: { userId: session.user.id as string },
        include: {
            workspace: {
                include: {
                    connection: { select: { repoOwner: true, repoName: true, branch: true, lastPulledAt: true } },
                    components: { select: { status: true } },
                },
            },
        },
        orderBy: [{ lastVisitedAt: 'desc' }, { workspace: { createdAt: 'desc' } }],
    })

    if (workspaceUsers.length === 0) redirect('/onboarding')

    const workspaces = workspaceUsers.map((wu) => ({
        id: wu.workspaceId,
        name: wu.workspace.name,
        role: wu.role,
        lastVisitedAt: wu.lastVisitedAt,
        connection: wu.workspace.connection
            ? {
                repoOwner: wu.workspace.connection.repoOwner,
                repoName: wu.workspace.connection.repoName,
                branch: wu.workspace.connection.branch,
                lastPulledAt: wu.workspace.connection.lastPulledAt,
            }
            : null,
        componentCount: wu.workspace.components.length,
        syncedCount: wu.workspace.components.filter((c) => c.status === 'SYNCED').length,
    }))

    return (
        <WorkspaceHubClient
            workspaces={workspaces}
            userName={session.user.name ?? null}
            userImage={session.user.image ?? null}
            userEmail={session.user.email ?? null}
        />
    )
}
