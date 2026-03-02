import { z } from 'zod'

export const workspaceIdSchema = z.string().cuid()

export const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(50),
})

export const inviteUserSchema = z.object({
  workspaceId: workspaceIdSchema,
  email:       z.string().email(),
  role:        z.enum(['ADMIN', 'EDITOR', 'VIEWER']),
})
