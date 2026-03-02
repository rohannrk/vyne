import { TRPCError } from '@trpc/server'
import { createTRPCRouter, protectedProcedure } from '@/server/trpc'
import { listComponentsSchema } from '@/types/schemas/component.schemas'

export const componentsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(listComponentsSchema)
    .query(async ({ ctx, input }) => {
      const membership = await ctx.prisma.workspaceUser.findFirst({
        where: {
          workspaceId: input.workspaceId,
          userId: ctx.user.id,
        },
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this workspace.',
        })
      }

      const configs = await ctx.prisma.componentConfig.findMany({
        where: { workspaceId: input.workspaceId },
        orderBy: { componentName: 'asc' },
      })

      return configs.map((config) => ({
        id: config.id,
        name: config.componentName,
        description: `Config for ${config.componentName}`,
        source: config.githubFilePath ? 'shadcn' : 'local',
        lastUpdated: config.lastPushedAt ?? config.lastSyncedAt,
        status: config.status,
      }))
    }),
})
