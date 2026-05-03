import { useState } from 'react'
import TopNav from './components/TopNav'
import MeetingInput from './pages/MeetingInput'
import TaskList from './pages/TaskList'
import CalendarPage from './pages/CalendarPage'
import MeetingArchive from './pages/MeetingArchive'
import { useTasks } from './hooks/useTasks'

export default function App() {
  const [activeTab, setActiveTab] = useState('meeting')
  const { tasks, loading, error, updateTask, reload } = useTasks()

  const pages = {
    meeting: <MeetingInput onSaved={reload} />,
    tasks: <TaskList tasks={tasks} loading={loading} error={error} updateTask={updateTask} reload={reload} />,
    calendar: <CalendarPage tasks={tasks} loading={loading} reload={reload} />,
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
