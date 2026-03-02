'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'

interface SelectRepoFormProps {
  workspaceId: string
}

export function SelectRepoForm({ workspaceId }: SelectRepoFormProps) {
  const router = useRouter()
  const [selectedRepo, setSelectedRepo] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('')
  const [error, setError] = useState('')

  const { data: repos, isLoading: reposLoading, error: reposError } =
    trpc.github.listRepos.useQuery()

  const selectedRepoData = repos?.find((r) => r.fullName === selectedRepo)

  const { data: branches, isLoading: branchesLoading } =
    trpc.github.listBranches.useQuery(
      {
        owner: selectedRepoData?.owner ?? '',
        repo: selectedRepoData?.name ?? '',
      },
      { enabled: !!selectedRepoData },
    )

  const saveRepoBranch = trpc.github.saveRepoBranch.useMutation({
    onSuccess: () => {
      router.push('/onboarding/select-directory')
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  function handleRepoChange(fullName: string) {
    setSelectedRepo(fullName)
    setSelectedBranch('')
  }

  function handleContinue() {
    if (!selectedRepo || !selectedBranch || !selectedRepoData) return
    setError('')
    saveRepoBranch.mutate({
      workspaceId,
      repoOwner: selectedRepoData.owner,
      repoName: selectedRepoData.name,
      branch: selectedBranch,
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="repo-select" className="text-sm font-medium">
          Repository
        </label>
        {reposError && (
          <p className="text-sm text-destructive">{reposError.message}</p>
        )}
        <select
          id="repo-select"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          value={selectedRepo}
          onChange={(e) => handleRepoChange(e.target.value)}
          disabled={reposLoading}
        >
          <option value="">
            {reposLoading ? 'Loading repositories…' : 'Select a repository'}
          </option>
          {repos?.map((repo) => (
            <option key={repo.id} value={repo.fullName}>
              {repo.fullName}
              {repo.private ? ' 🔒' : ''}
            </option>
          ))}
        </select>
      </div>

      {selectedRepo && (
        <div className="space-y-2">
          <label htmlFor="branch-select" className="text-sm font-medium">
            Branch
          </label>
          <select
            id="branch-select"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:outline-none"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            disabled={branchesLoading}
          >
            <option value="">
              {branchesLoading ? 'Loading branches…' : 'Select a branch'}
            </option>
            {branches?.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
                {branch === selectedRepoData?.defaultBranch ? ' (default)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        className="w-full"
        onClick={handleContinue}
        disabled={!selectedRepo || !selectedBranch || saveRepoBranch.isPending}
      >
        {saveRepoBranch.isPending ? 'Saving…' : 'Continue'}
      </Button>
    </div>
  )
}
