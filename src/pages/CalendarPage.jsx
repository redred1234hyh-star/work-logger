import { useState, useEffect } from 'react'
import { sheetsApi } from '../api/sheets'
import MonthCalendar from '../components/calendar/MonthCalendar'
import Timeline from '../components/calendar/Timeline'
import LoadingSpinner from '../components/LoadingSpinner'

const VIEWS = [
  { id: 'month', label: '📆 月曆' },
  { id: 'timeline', label: '📋 時間線' },
]

export default function CalendarPage({ tasks, loading, reload }) {
  const [meetings, setMeetings] = useState([])
  const [view, setView] = useState(() => window.innerWidth < 768 ? 'timeline' : 'month')

  useEffect(() => {
    sheetsApi.getMeetings()
      .then(({ meetings: data }) => setMeetings(data ?? []))
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-gray-800">📅 Calendar</h1>
          <button onClick={reload} disabled={loading} className="text-xs text-gray-400 hover:text-indigo-500 disabled:opacity-40 transition-colors">↺ 更新</button>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                view === v.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <LoadingSpinner text="載入中..." />}
      {!loading && (
        <>
          {view === 'month' && <MonthCalendar tasks={tasks} meetings={meetings} />}
          {view === 'timeline' && <Timeline tasks={tasks} meetings={meetings} />}
        </>
      )}
    </div>
  )
}
