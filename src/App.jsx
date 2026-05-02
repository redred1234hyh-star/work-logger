import { useState } from 'react'
import TopNav from './components/TopNav'
import MeetingInput from './pages/MeetingInput'
import TaskList from './pages/TaskList'
import CalendarPage from './pages/CalendarPage'
import MeetingArchive from './pages/MeetingArchive'

export default function App() {
  const [activeTab, setActiveTab] = useState('meeting')

  const pages = {
    meeting: <MeetingInput />,
    tasks: <TaskList />,
    calendar: <CalendarPage />,
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
