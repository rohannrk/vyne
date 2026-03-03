import { auth, signIn } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Sign in — VYNE',
}

export default async function LoginPage() {
  const session = await auth()
  if (session?.user) redirect('/')

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-base)] px-4">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand)] shadow-[0_0_32px_oklch(0.72_0.19_260/0.35)] mb-4">
            <span className="text-xl font-bold text-white">V</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">VYNE</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            GitHub-native control plane for design systems
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-6 shadow-[0_4px_32px_oklch(0_0_0/0.4)]">
          <div className="mb-6 text-center">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Sign in to continue</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Connect your GitHub account to get started
            </p>
          </div>

          <form
            action={async () => {
              'use server'
              await signIn('github', { redirectTo: '/' })
            }}
          >
            <button
              type="submit"
              id="github-signin-btn"
              className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-[var(--surface-overlay)] border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-all duration-150 hover:border-[var(--brand)]/50 hover:bg-[var(--surface-overlay)] hover:shadow-[0_0_0_1px_oklch(0.72_0.19_260/0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
            >
              <GitHubIcon />
              Continue with GitHub
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-[var(--text-tertiary)]">
            By signing in, you agree to our{' '}
            <span className="text-[var(--text-secondary)]">Terms of Service</span>
            {' '}and{' '}
            <span className="text-[var(--text-secondary)]">Privacy Policy</span>
          </p>
        </div>

        {/* Feature hints */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Live canvas', desc: 'See real props update instantly' },
            { label: 'GitHub PRs', desc: 'Push changes without touching code' },
            { label: 'shadcn/ui', desc: 'Works with your existing components' },
          ].map(({ label, desc }) => (
            <div key={label} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-3">
              <p className="text-[11px] font-semibold text-[var(--text-primary)]">{label}</p>
              <p className="mt-0.5 text-[10px] text-[var(--text-tertiary)] leading-tight">{desc}</p>
            </div>
          ))}
        </div>
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
