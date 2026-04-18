import { useEffect } from 'react'

import { useAppStore } from '../store/useAppStore'

export function useBootstrap() {
  const bootstrapped = useAppStore((state) => state.bootstrapped)
  const loading = useAppStore((state) => state.loading)
  const error = useAppStore((state) => state.error)
  const fetchBootstrap = useAppStore((state) => state.fetchBootstrap)

  useEffect(() => {
    if (!bootstrapped && !loading) {
      void fetchBootstrap()
    }
  }, [bootstrapped, fetchBootstrap, loading])

  return { bootstrapped, loading, error }
}
