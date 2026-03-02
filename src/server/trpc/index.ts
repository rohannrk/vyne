import 'server-only'
import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import type { Session } from 'next-auth'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export type Context = {
  session: Session | null
  user: Session['user'] | null
  prisma: typeof prisma
}

// Narrowed context guaranteed by protectedProcedure middleware
type AuthenticatedContext = Context & {
  session: Session
  user: Session['user'] & { id: string }
}

export async function createTRPCContext(): Promise<Context> {
  const session = await auth()
  return {
    session,
    user: session?.user ?? null,
    prisma,
  }
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory
export const publicProcedure = t.procedure

const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.user?.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' })
  }
  return next({
    ctx: ctx as AuthenticatedContext,
  })
})

export const protectedProcedure = t.procedure.use(enforceAuth)
