import { useState, useEffect, useCallback } from 'react'
import { sheetsApi } from '../api/sheets'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try {
      const { tasks: data } = await sheetsApi.getTasks()
      setTasks(data ?? [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadTasks() }, [loadTasks])

  const updateTask = useCallback(async (task_id, updates) => {
    await sheetsApi.updateTask({ task_id, ...updates })
    setTasks((prev) =>
      prev.map((t) => (t.task_id === task_id ? { ...t, ...updates } : t))
    )
  }, [])

  return { tasks, loading, error, reload: loadTasks, updateTask }
}
