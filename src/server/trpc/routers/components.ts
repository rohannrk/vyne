import { TRPCError } from '@trpc/server'
import { Prisma } from '@/generated/prisma'
import { createTRPCRouter, protectedProcedure } from '@/server/trpc'
import {
  listComponentsSchema,
  getComponentSchema,
  listPresetsSchema,
  createPresetSchema,
} from '@/types/schemas/component.schemas'

// ─── Shared workspace membership guard ──────────────────────────────────────
async function assertMember(
  prisma: Parameters<Parameters<typeof protectedProcedure.query>[0]>[0]['ctx']['prisma'],
  workspaceId: string,
  userId: string,
) {
  const member = await prisma.workspaceUser.findFirst({
    where: { workspaceId, userId },
  })
  if (!member) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have access to this workspace.',
    })
  }
  return member
}

export const componentsRouter = createTRPCRouter({
  // ── E-3: List all component configs for the component browser ───────────
  list: protectedProcedure
    .input(listComponentsSchema)
    .query(async ({ ctx, input }) => {
      await assertMember(ctx.prisma, input.workspaceId, ctx.user.id)

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

  // ── E-4: Get (or lazily create) a single component's config ─────────────
  getOne: protectedProcedure
    .input(getComponentSchema)
    .query(async ({ ctx, input }) => {
      await assertMember(ctx.prisma, input.workspaceId, ctx.user.id)

      const where = {
        where: {
          workspaceId_componentName: {
            workspaceId: input.workspaceId,
            componentName: input.componentName,
          },
        },
      } as const

      let config = await ctx.prisma.componentConfig.findUnique(where)

      if (!config) {
        try {
          config = await ctx.prisma.componentConfig.create({
            data: {
              workspaceId: input.workspaceId,
              componentName: input.componentName,
              props: {},
              githubFilePath: null,
              status: 'PENDING_ADD',
            },
          })
        } catch (err) {
          // Race condition: another request created it first
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === 'P2002'
          ) {
            config = await ctx.prisma.componentConfig.findUnique(where)
          } else {
            throw err
          }
        }
      }

      if (!config) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Component configuration not found.',
        })
      }

      return config
    }),

  // ── E-4: List presets for a component ───────────────────────────────────
  listPresets: protectedProcedure
    .input(listPresetsSchema)
    .query(async ({ ctx, input }) => {
      await assertMember(ctx.prisma, input.workspaceId, ctx.user.id)

      const config = await ctx.prisma.componentConfig.findUnique({
        where: {
          workspaceId_componentName: {
            workspaceId: input.workspaceId,
            componentName: input.componentName,
          },
        },
      })

      if (!config) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Component configuration not found.',
        })
      }

      return ctx.prisma.componentPreset.findMany({
        where: {
          workspaceId: input.workspaceId,
          componentConfigId: config.id,
        },
        orderBy: { createdAt: 'asc' },
      })
    }),

  // ── E-4: Save a named preset ─────────────────────────────────────────────
  createPreset: protectedProcedure
    .input(createPresetSchema)
    .mutation(async ({ ctx, input }) => {
      await assertMember(ctx.prisma, input.workspaceId, ctx.user.id)

      const config = await ctx.prisma.componentConfig.findUnique({
        where: {
          workspaceId_componentName: {
            workspaceId: input.workspaceId,
            componentName: input.componentName,
          },
        },
      })

      if (!config) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Component configuration not found.',
        })
      }

      return ctx.prisma.componentPreset.create({
        data: {
          workspaceId: input.workspaceId,
          componentConfigId: config.id,
          name: input.name,
          values: input.values as Prisma.InputJsonValue,
        },
      })
    }),
})
