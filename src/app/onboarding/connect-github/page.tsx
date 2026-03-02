import { auth, signIn } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default async function ConnectGitHubPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  // Check token existence only — never load the token value into RSC scope
  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      provider: 'github',
      access_token: { not: null },
    },
    select: { id: true },
  })

  const isConnected = !!account

  if (isConnected) {
    redirect('/onboarding/select-repo')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Connect GitHub</h2>
        <p className="text-muted-foreground text-sm">
          VYNE needs access to your repositories to read and write component files.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
        {session.user.image && (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={session.user.image} alt={session.user.name ?? ''} />
              <AvatarFallback>{session.user.name?.[0] ?? 'U'}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">{session.user.name}</p>
              <p className="text-muted-foreground">{session.user.email}</p>
            </div>
          </div>
        )}

        <form
          action={async () => {
            'use server'
            await signIn('github', {
              redirectTo: '/onboarding/select-repo',
            })
          }}
        >
          <Button type="submit" className="w-full gap-2">
            <GitHubIcon />
            Connect GitHub
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-muted-foreground">Step 2 of 4</p>
    </div>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}
