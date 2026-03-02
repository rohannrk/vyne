import { createTRPCRouter } from '@/server/trpc'
import { workspaceRouter } from './routers/workspace'
import { componentsRouter } from './routers/components'
import { githubRouter } from './routers/github'
import { authRouter } from './routers/auth'

export const appRouter = createTRPCRouter({
  workspace: workspaceRouter,
  components: componentsRouter,
  github: githubRouter,
  auth: authRouter,
})

export type AppRouter = typeof appRouter
