import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/shared/sidebar'
import { WorkspaceSwitcher } from '@/components/shared/workspace-switcher'
import type { ComponentStatus } from '@/components/shared/status-badge'

interface WorkspaceLayoutProps {
    children: React.ReactNode
    params: Promise<{ workspaceId: string }>
}

export default async function WorkspaceLayout({ children, params }: WorkspaceLayoutProps) {
    const { workspaceId } = await params
    const session = await auth()
    if (!session?.user) redirect('/login')

    const userId = session.user.id as string

    // Primary workspace membership check
    const workspaceUser = await prisma.workspaceUser.findFirst({
        where: { userId, workspaceId },
        include: { workspace: true },
    })
    if (!workspaceUser) redirect('/')

    // Update lastVisitedAt (fire-and-forget — don't await)
    prisma.workspaceUser
        .update({
            where: { id: workspaceUser.id },
            data: { lastVisitedAt: new Date() },
        })
        .catch(() => { /* non-critical, swallow */ })

    // Fetch all workspaces the user belongs to — for the switcher dropdown
    const allWorkspaceUsers = await prisma.workspaceUser.findMany({
        where: { userId },
        include: { workspace: { select: { id: true, name: true } } },
        orderBy: [{ lastVisitedAt: 'desc' }, { workspace: { createdAt: 'desc' } }],
    })

    const switcherWorkspaces = allWorkspaceUsers.map((wu) => ({
        id: wu.workspaceId,
        name: wu.workspace.name,
        role: wu.role as 'ADMIN' | 'EDITOR' | 'VIEWER',
    }))

    // Fetch component configs for sidebar nav dots
    const dbComponents = await prisma.componentConfig.findMany({
        where: { workspaceId },
        select: { componentName: true, status: true },
    })

    const components = dbComponents.map((c) => ({
        name: c.componentName,
        displayName: c.componentName.charAt(0).toUpperCase() + c.componentName.slice(1),
        status: c.status as ComponentStatus,
    }))

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
            <Sidebar
                workspaceId={workspaceId}
                workspaceName={workspaceUser.workspace.name}
                components={components}
                userImage={session.user.image}
                userName={session.user.name}
                switcherWorkspaces={switcherWorkspaces}
            />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
