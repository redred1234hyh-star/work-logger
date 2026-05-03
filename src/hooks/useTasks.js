import { useState, useEffect, useCallback } from 'react'
import { sheetsApi } from '../api/sheets'

const fmtDate = (v) => {
  if (!v) return ''
  if (typeof v === 'string') return v.split('T')[0]
  try { return new Date(v).toISOString().split('T')[0] } catch { return '' }
}

const normalizeDates = (t) => ({
  ...t,
  deadline: fmtDate(t.deadline),
  meeting_date: fmtDate(t.meeting_date),
})

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try {
      const { tasks: data } = await sheetsApi.getTasks()
      setTasks((data ?? []).map(normalizeDates))
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

  const deleteTask = useCallback(async (task_id) => {
    await sheetsApi.deleteTask({ task_id })
    setTasks((prev) => prev.filter((t) => t.task_id !== task_id))
  }, [])

  return { tasks, loading, error, reload: loadTasks, updateTask, deleteTask }
}
