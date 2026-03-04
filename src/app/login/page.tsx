import { auth, signIn } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SubmitButton } from './submit-button'

export const metadata = {
  title: 'Sign in — VYNE',
}

export default async function LoginPage() {
  const session = await auth()
  if (session?.user) redirect('/')

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(var(--text-bright) 1px, transparent 1px), linear-gradient(90deg, var(--text-bright) 1px, transparent 1px)',
          backgroundSize: '4px 4px',
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-bright)]">VYNE</h1>
          <p className="mt-1 text-sm text-[var(--text)]">
            GitHub-native control plane for design systems
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-6 shadow-[0_4px_32px_oklch(0_0_0/0.4)]">
          <div className="mb-6 text-center">
            <h2 className="text-base font-semibold text-[var(--text-bright)]">Sign in to continue</h2>
            <p className="mt-1 text-sm text-[var(--text)]">
              Connect your GitHub account to get started
            </p>
          </div>

          <form
            action={async () => {
              'use server'
              await signIn('github', { redirectTo: '/' })
            }}
          >
            <SubmitButton />
          </form>

          <p className="mt-4 text-center text-xs text-[var(--text-dim)]">
            By signing in, you agree to our{' '}
            <span className="text-[var(--text)]">Terms of Service</span>
            {' '}and{' '}
            <span className="text-[var(--text)]">Privacy Policy</span>
          </p>
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
