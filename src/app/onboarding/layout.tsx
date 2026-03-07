export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-bright)]">VYNE</h1>
          <p className="mt-1 text-sm text-[var(--text)]">
            GitHub-native control plane for design systems
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
