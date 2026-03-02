import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { createTRPCRouter, protectedProcedure } from '@/server/trpc'
import { connectGitHubSchema, saveRepoBranchSchema } from '@/types/schemas/github.schemas'
import { getOctokitForUser } from '@/lib/github/client'

function toTRPCError(err: unknown, fallback: string): TRPCError {
  if (err instanceof Error) {
    const status = (err as { status?: number }).status
    if (status === 401 || status === 403) {
      return new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'GitHub token is invalid or has been revoked. Please reconnect.',
      })
    }
    if (status === 404) {
      return new TRPCError({
        code: 'NOT_FOUND',
        message: 'Repository or path not found. Check your selection.',
      })
    }
    if (status === 429) {
      return new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'GitHub API rate limit reached. Please wait a moment and try again.',
      })
    }
  }
  return new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: fallback })
}

export const githubRouter = createTRPCRouter({
  listRepos: protectedProcedure.query(async ({ ctx }) => {
    try {
      const octokit = await getOctokitForUser(ctx.user.id)
      const { data } = await octokit.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100,
      })
      return data.map((repo) => ({
        id: repo.id,
        fullName: repo.full_name,
        owner: repo.owner.login,
        name: repo.name,
        private: repo.private,
        defaultBranch: repo.default_branch,
      }))
    } catch (err) {
      throw toTRPCError(err, 'Failed to load repositories.')
    }
  }),

  listBranches: protectedProcedure
    .input(z.object({ owner: z.string(), repo: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const octokit = await getOctokitForUser(ctx.user.id)
        const { data } = await octokit.repos.listBranches({
          owner: input.owner,
          repo: input.repo,
          per_page: 100,
        })
        return data.map((branch) => branch.name)
      } catch (err) {
        throw toTRPCError(err, 'Failed to load branches.')
      }
    }),

  listDirectories: protectedProcedure
    .input(
      z.object({
        owner: z.string(),
        repo: z.string(),
        branch: z.string(),
        path: z.string().default(''),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const octokit = await getOctokitForUser(ctx.user.id)
        const { data } = await octokit.repos.getContent({
          owner: input.owner,
          repo: input.repo,
          ref: input.branch,
          path: input.path,
        })
        if (!Array.isArray(data)) return []
        return data
          .filter((item) => item.type === 'dir')
          .map((item) => ({ name: item.name, path: item.path }))
      } catch (err) {
        throw toTRPCError(err, 'Failed to load directory contents.')
      }
    }),

  // Persists repo + branch at Step 3 so Step 4 is refresh-safe
  saveRepoBranch: protectedProcedure
    .input(saveRepoBranchSchema)
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.prisma.workspaceUser.findFirst({
        where: {
          workspaceId: input.workspaceId,
          userId: ctx.user.id,
          role: 'ADMIN',
        },
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to configure this workspace.',
        })
      }

      // Placeholder directory — overwritten when user confirms in Step 4
      return ctx.prisma.gitHubConnection.upsert({
        where: { workspaceId: input.workspaceId },
        create: {
          workspaceId: input.workspaceId,
          repoOwner: input.repoOwner,
          repoName: input.repoName,
          branch: input.branch,
          componentDirectoryPath: '.',
        },
        update: {
          repoOwner: input.repoOwner,
          repoName: input.repoName,
          branch: input.branch,
        },
      })
    }),

  // C-1 fix: verify the calling user owns the workspace before writing
  connect: protectedProcedure
    .input(connectGitHubSchema)
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.prisma.workspaceUser.findFirst({
        where: {
          workspaceId: input.workspaceId,
          userId: ctx.user.id,
          role: 'ADMIN',
        },
      })

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to configure this workspace.',
        })
      }

      try {
        const connection = await ctx.prisma.gitHubConnection.upsert({
          where: { workspaceId: input.workspaceId },
          create: {
            workspaceId: input.workspaceId,
            repoOwner: input.repoOwner,
            repoName: input.repoName,
            branch: input.branch,
            componentDirectoryPath: input.componentDirectoryPath,
          },
          update: {
            repoOwner: input.repoOwner,
            repoName: input.repoName,
            branch: input.branch,
            componentDirectoryPath: input.componentDirectoryPath,
          },
        })
        return connection
      } catch (err) {
        throw toTRPCError(err, 'Failed to save GitHub connection.')
      }
    }),
})
