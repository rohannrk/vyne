import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { createTRPCRouter, protectedProcedure } from '@/server/trpc'
import { prisma } from '@/lib/db'
import { Prisma } from '@/generated/prisma'

// Workspace membership guard — using prisma singleton for simpler typing
async function assertMember(workspaceId: string, userId: string) {
    const member = await prisma.workspaceUser.findFirst({
        where: { workspaceId, userId },
    })
    if (!member) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not a member of this workspace.' })
    }
    return member
}

export const componentsRouter = createTRPCRouter({
    // Fetch a single component's config (with presets)
    getOne: protectedProcedure
        .input(z.object({ workspaceId: z.string(), componentName: z.string() }))
        .query(async ({ ctx, input }) => {
            await assertMember(input.workspaceId, ctx.user.id)
            return ctx.prisma.componentConfig.findUnique({
                where: {
                    workspaceId_componentName: {
                        workspaceId: input.workspaceId,
                        componentName: input.componentName,
                    },
                },
                include: { presets: { orderBy: { createdAt: 'asc' } } },
            })
        }),

    // List presets for a component config
    listPresets: protectedProcedure
        .input(z.object({ workspaceId: z.string(), componentConfigId: z.string() }))
        .query(async ({ ctx, input }) => {
            await assertMember(input.workspaceId, ctx.user.id)
            return ctx.prisma.componentPreset.findMany({
                where: { componentConfigId: input.componentConfigId, workspaceId: input.workspaceId },
                orderBy: { createdAt: 'asc' },
            })
        }),

    // Save current Dial Kit values as a named preset
    savePreset: protectedProcedure
        .input(
            z.object({
                workspaceId: z.string(),
                componentConfigId: z.string(),
                name: z.string().min(1).max(80),
                values: z.record(z.string(), z.unknown()),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await assertMember(input.workspaceId, ctx.user.id)
            return ctx.prisma.componentPreset.create({
                data: {
                    workspaceId: input.workspaceId,
                    componentConfigId: input.componentConfigId,
                    name: input.name,
                    values: input.values as Prisma.InputJsonValue,
                },
            })
        }),

    // Delete a preset (editor/admin only)
    deletePreset: protectedProcedure
        .input(z.object({ workspaceId: z.string(), presetId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const member = await assertMember(input.workspaceId, ctx.user.id)
            if (member.role === 'VIEWER') {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'Viewers cannot delete presets.' })
            }
            return ctx.prisma.componentPreset.delete({
                where: { id: input.presetId },
            })
        }),

    // List all component configs for the workspace (component browser)
    listAll: protectedProcedure
        .input(z.object({ workspaceId: z.string() }))
        .query(async ({ ctx, input }) => {
            await assertMember(input.workspaceId, ctx.user.id)
            return ctx.prisma.componentConfig.findMany({
                where: { workspaceId: input.workspaceId },
                orderBy: { componentName: 'asc' },
            })
        }),
})
