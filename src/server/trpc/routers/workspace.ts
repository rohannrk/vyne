import { createTRPCRouter, protectedProcedure } from '@/server/trpc'
import { createWorkspaceSchema } from '@/types/schemas/workspace.schemas'
import { SHADCN_COMPONENTS } from '@/lib/config'

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

      // Bootstrap ComponentConfig rows for all supported components in this workspace
      await ctx.prisma.componentConfig.createMany({
        data: SHADCN_COMPONENTS.map((component) => ({
          workspaceId: workspace.id,
          componentName: component.name,
          props: {},
          githubFilePath: null,
          status: 'PENDING_ADD',
        })),
        skipDuplicates: true,
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
