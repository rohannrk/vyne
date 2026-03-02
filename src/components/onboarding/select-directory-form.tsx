'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'

interface SelectDirectoryFormProps {
  workspaceId: string
  owner: string
  repo: string
  branch: string
}

export function SelectDirectoryForm({
  workspaceId,
  owner,
  repo,
  branch,
}: SelectDirectoryFormProps) {
  const router = useRouter()
  const [currentPath, setCurrentPath] = useState('')
  const [selectedPath, setSelectedPath] = useState('')
  const [error, setError] = useState('')

  const { data: dirs, isLoading, error: dirsError } = trpc.github.listDirectories.useQuery(
    { owner, repo, branch, path: currentPath },
  )

  const connect = trpc.github.connect.useMutation({
    onSuccess: () => {
      router.push(`/${workspaceId}`)
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  useEffect(() => {
    setSelectedPath(currentPath)
  }, [currentPath])

  function handleConfirm() {
    setError('')
    connect.mutate({
      workspaceId,
      repoOwner: owner,
      repoName: repo,
      branch,
      componentDirectoryPath: selectedPath || '.',
    })
  }

  const pathParts = currentPath ? currentPath.split('/') : []

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
        <button
          className="hover:text-foreground transition-colors"
          onClick={() => setCurrentPath('')}
        >
          {repo}
        </button>
        {pathParts.map((part, i) => {
          const partPath = pathParts.slice(0, i + 1).join('/')
          return (
            <span key={partPath} className="flex items-center gap-1">
              <span>/</span>
              <button
                className="hover:text-foreground transition-colors"
                onClick={() => setCurrentPath(partPath)}
              >
                {part}
              </button>
            </span>
          )
        })}
      </div>

      {/* Directory listing */}
      <div className="rounded-md border divide-y max-h-56 overflow-y-auto">
        {isLoading && (
          <div className="px-3 py-2 text-sm text-muted-foreground">Loading…</div>
        )}
        {dirsError && (
          <div className="px-3 py-2 text-sm text-destructive">{dirsError.message}</div>
        )}
        {!isLoading && !dirsError && (!dirs || dirs.length === 0) && (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No subdirectories — select the current folder.
          </div>
        )}
        {dirs?.map((dir) => (
          <button
            key={dir.path}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
            onClick={() => setCurrentPath(dir.path)}
          >
            <FolderIcon />
            {dir.name}
          </button>
        ))}
      </div>

      <div className="rounded-md bg-muted px-3 py-2 text-sm">
        <span className="text-muted-foreground">Selected: </span>
        <code className="font-mono">{selectedPath || '/'}</code>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        className="w-full"
        onClick={handleConfirm}
        disabled={connect.isPending}
      >
        {connect.isPending ? 'Saving…' : 'Confirm & finish'}
      </Button>
    </div>
  )
}

function FolderIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-none stroke-current"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v8.25A2.25 2.25 0 0 0 4.5 16.5h15a2.25 2.25 0 0 0 2.25-2.25v-5.25A2.25 2.25 0 0 0 19.5 6.75h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
      />
    </svg>
  )
}
