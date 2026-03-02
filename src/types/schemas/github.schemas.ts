import { z } from 'zod'
import { workspaceIdSchema } from './workspace.schemas'

export const connectGitHubSchema = z.object({
  workspaceId:            workspaceIdSchema,
  repoOwner:              z.string().min(1),
  repoName:               z.string().min(1),
  branch:                 z.string().min(1),
  componentDirectoryPath: z.string().min(1),
})

// Saves repo + branch at Step 3 before directory is chosen (makes Step 4 refresh-safe)
export const saveRepoBranchSchema = z.object({
  workspaceId: workspaceIdSchema,
  repoOwner:   z.string().min(1),
  repoName:    z.string().min(1),
  branch:      z.string().min(1),
})

export const pullFromGitHubSchema = z.object({
  workspaceId: workspaceIdSchema,
})

export const pushToGitHubSchema = z.object({
  workspaceId:   workspaceIdSchema,
  componentName: z.string().min(1),
})
