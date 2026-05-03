import { useState, useEffect, useCallback } from 'react'
import TopNav from './components/TopNav'
import MeetingInput from './pages/MeetingInput'
import TaskList from './pages/TaskList'
import CalendarPage from './pages/CalendarPage'
import MeetingArchive from './pages/MeetingArchive'
import { useTasks } from './hooks/useTasks'
import { sheetsApi } from './api/sheets'

export default function App() {
  const [activeTab, setActiveTab] = useState('meeting')
  const { tasks, loading, error, updateTask, deleteTask, reload } = useTasks()
  const cachedMeetings = (() => { try { return JSON.parse(localStorage.getItem('wl_meetings_cache')) } catch { return null } })()
  const [meetings, setMeetings] = useState(cachedMeetings ?? [])

  const loadMeetings = useCallback(async () => {
    sheetsApi.getMeetings()
      .then(({ meetings: data }) => {
        const list = data ?? []
        setMeetings(list)
        localStorage.setItem('wl_meetings_cache', JSON.stringify(list))
      })
      .catch(() => {})
  }, [])

  const deleteMeeting = useCallback(async (meeting_id) => {
    await sheetsApi.deleteMeeting({ meeting_id })
    setMeetings((prev) => prev.filter((m) => m.meeting_id !== meeting_id))
  }, [])

  useEffect(() => { loadMeetings() }, [loadMeetings])

  const onSaved = useCallback(async () => {
    await reload()
    loadMeetings()
  }, [reload, loadMeetings])

  const reloadAll = useCallback(() => {
    reload()
    loadMeetings()
  }, [reload, loadMeetings])

  const pages = {
    meeting: <MeetingInput onSaved={onSaved} />,
    tasks: <TaskList tasks={tasks} loading={loading} error={error} updateTask={updateTask} deleteTask={deleteTask} reload={reloadAll} />,
    calendar: <CalendarPage tasks={tasks} meetings={meetings} loading={loading} reload={reloadAll} updateTask={updateTask} deleteTask={deleteTask} deleteMeeting={deleteMeeting} />,
    archive: <MeetingArchive />,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-5xl mx-auto px-4 py-2">
        {pages[activeTab]}
      </main>
    </div>
  )
}
