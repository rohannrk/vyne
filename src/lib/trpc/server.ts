import 'server-only'
import { createCallerFactory, createTRPCContext } from '@/server/trpc'
import { appRouter } from '@/server/trpc/router'

const createCaller = createCallerFactory(appRouter)

export const trpc = createCaller(createTRPCContext)
