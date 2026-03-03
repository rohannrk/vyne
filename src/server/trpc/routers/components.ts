import { TRPCError } from '@trpc/server'
import { Prisma } from '@/generated/prisma'
import { createTRPCRouter, protectedProcedure } from '@/server/trpc'
import {
  getComponentSchema,
  listPresetsSchema,
  createPresetSchema,
} from '@/types'

export const componentsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(getComponentSchema)
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

  listPresets: protectedProcedure
    .input(listPresetsSchema)
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

  createPreset: protectedProcedure
    .input(createPresetSchema)
    .mutation(async ({ ctx, input }) => {
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
          values: input.values,
        },
      })
    }),
})
