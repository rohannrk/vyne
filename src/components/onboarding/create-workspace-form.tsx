'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function CreateWorkspaceForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const createWorkspace = trpc.workspace.create.useMutation({
    onSuccess: () => {
      router.push('/onboarding/connect-github')
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Workspace name is required.')
      return
    }
    createWorkspace.mutate({ name: trimmed })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="workspace-name" className="text-sm font-medium">
          Workspace name
        </label>
        <Input
          id="workspace-name"
          placeholder="e.g. Acme Design System"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          autoFocus
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={createWorkspace.isPending}
      >
        {createWorkspace.isPending ? 'Creating…' : 'Continue'}
      </Button>
    </form>
  )
}
