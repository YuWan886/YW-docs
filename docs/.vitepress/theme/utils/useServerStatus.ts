import { ref, onMounted } from 'vue'
import type { ServerStatus } from './server'

export function useServerStatus(serverIp: string) {
  const serverStatus = ref<ServerStatus | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchServerStatus = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`https://api.mcsrvstat.us/2/${serverIp}`)
      const data = await response.json()
      serverStatus.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch server status'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchServerStatus()
  })

  return {
    serverStatus,
    loading,
    error,
    refreshStatus: fetchServerStatus
  }
}
