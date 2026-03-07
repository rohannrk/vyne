import { auth, signIn } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CheckCircle2 } from 'lucide-react'

export const metadata = { title: 'Connect GitHub — VYNE' }

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`h-1.5 w-6 rounded-full transition-colors ${i + 1 <= current ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
              }`}
          />
        </div>
      ))}
      <span className="ml-1 text-xs text-[var(--text-dim)]">
        Step {current} of {total}
      </span>
    </div>
  )
}

export default async function ConnectGitHubPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      provider: 'github',
      access_token: { not: null },
    },
    select: { id: true },
  })

  const isConnected = !!account
  if (isConnected) redirect('/onboarding/select-repo')

  return (
    <div className="space-y-6">
      <StepIndicator current={2} total={4} />

      <div>
        <h2 className="text-base font-semibold text-[var(--text-bright)]">Connect GitHub</h2>
        <p className="mt-1 text-sm text-[var(--text)]">
          VYNE needs access to your repositories to read and write component files.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-6 shadow-[0_4px_32px_oklch(0_0_0/0.4)] space-y-6">
        {session.user.image && (
          <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={session.user.image} alt={session.user.name ?? ''} />
              <AvatarFallback>{session.user.name?.[0] ?? 'U'}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium text-[var(--text-bright)] truncate">{session.user.name}</p>
              <p className="text-[var(--text-dim)] text-xs truncate">{session.user.email}</p>
            </div>
            <CheckCircle2 className="h-4 w-4 text-[var(--status-synced)] flex-shrink-0" aria-hidden="true" />
          </div>
        )}

        <form
          action={async () => {
            'use server'
            await signIn('github', { redirectTo: '/onboarding/select-repo' })
          }}
        >
          <button
            type="submit"
            id="connect-github-btn"
            className="flex w-full min-h-[40px] cursor-pointer items-center justify-center gap-2.5 rounded-lg bg-white border border-transparent px-4 py-2.5 text-sm font-medium text-black transition-[background-color,border-color,color,fill,stroke,transform] duration-150 active:scale-[0.97] hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-muted)]"
          >
            <GitHubIcon />
            Connect GitHub
          </button>
        </form>
      </div>
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
