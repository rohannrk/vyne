import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import { SHADCN_COMPONENTS } from '@/lib/config'
import { EditorClient } from '@/components/editor/editor-client'
import type { DialKitConfig } from '@/types/dial-kit'
import type { ComponentStatus } from '@/components/shared/status-badge'
import type { Role } from '@/generated/prisma'

interface ComponentEditorPageProps {
    params: Promise<{ workspaceId: string; component: string }>
}

export default async function ComponentEditorPage({ params }: ComponentEditorPageProps) {
    const { workspaceId, component: componentName } = await params
    const session = await auth()
    if (!session?.user) redirect('/login')

    // Validate component name is in our manifest
    const manifest = SHADCN_COMPONENTS.find((c) => c.name === componentName)
    if (!manifest) notFound()

    const workspaceUser = await prisma.workspaceUser.findFirst({
        where: { userId: session.user.id, workspaceId },
        include: { workspace: true },
    })

    if (!workspaceUser) redirect('/')

    const connection = await prisma.gitHubConnection.findUnique({
        where: { workspaceId },
    })

    if (!connection) redirect(`/onboarding/connect-github`)

    // Fetch component config + presets
    const componentConfig = await prisma.componentConfig.findUnique({
        where: { workspaceId_componentName: { workspaceId, componentName } },
        include: { presets: { orderBy: { createdAt: 'asc' } } },
    })

    const canPush: boolean = workspaceUser.role === 'ADMIN' || workspaceUser.role === 'EDITOR'
    const status = (componentConfig?.status ?? 'PENDING_ADD') as ComponentStatus
    const initialConfig = (componentConfig?.props ?? {}) as DialKitConfig
    const presets = (componentConfig?.presets ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        values: p.values as DialKitConfig,
    }))

    return (
        <EditorClient
            workspaceId={workspaceId}
            componentName={componentName}
            displayName={manifest.displayName}
            initialConfig={initialConfig}
            initialStatus={status}
            canPush={canPush}
            presets={presets}
            owner={connection.repoOwner}
            repo={connection.repoName}
            branch={connection.branch}
            componentConfigId={componentConfig?.id}
        />
    )
}
