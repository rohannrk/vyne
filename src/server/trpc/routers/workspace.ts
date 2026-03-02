import { createTRPCRouter, protectedProcedure } from '@/server/trpc'
import { createWorkspaceSchema } from '@/types/schemas/workspace.schemas'

export const workspaceRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createWorkspaceSchema)
    .mutation(async ({ ctx, input }) => {
      const workspace = await ctx.prisma.workspace.create({
        data: {
          name: input.name,
          users: {
            create: {
              userId: ctx.user.id,
              role: 'ADMIN',
            },
          },
        },
      })
      return workspace
    }),

  getFirst: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.workspaceUser.findFirst({
      where: { userId: ctx.user.id },
      include: { workspace: true },
      orderBy: { workspace: { createdAt: 'asc' } },
    })
  }),
})
