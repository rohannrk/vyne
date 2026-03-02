import 'server-only'
import { Octokit } from '@octokit/rest'
import { prisma } from '@/lib/db'

export async function getOctokitForUser(userId: string): Promise<Octokit> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: 'github' },
    select: { access_token: true },
  })

  if (!account?.access_token) {
    throw new Error('No GitHub access token found for user')
  }

  return new Octokit({ auth: account.access_token })
}
