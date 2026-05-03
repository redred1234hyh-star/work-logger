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
  const [meetings, setMeetings] = useState([])

  const loadMeetings = useCallback(async () => {
    sheetsApi.getMeetings()
      .then(({ meetings: data }) => setMeetings(data ?? []))
      .catch(() => {})
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
    calendar: <CalendarPage tasks={tasks} meetings={meetings} loading={loading} reload={reloadAll} updateTask={updateTask} />,
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
