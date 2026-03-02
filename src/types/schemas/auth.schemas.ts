import { z } from 'zod'

export const userProfileSchema = z.object({
  name:  z.string().optional(),
  email: z.string().email().optional(),
})

export const sessionUserSchema = z.object({
  id:    z.string(),
  email: z.string().email().nullable().optional(),
  name:  z.string().nullable().optional(),
})

export const sessionSchema = z.object({
  user:    sessionUserSchema,
  expires: z.string(),
})
