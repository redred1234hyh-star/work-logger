import { useState } from 'react'
import LoadingSpinner from '../LoadingSpinner'

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export default function MeetingForm({ onSubmit, loading }) {
  const [date, setDate] = useState(todayISO())
  const [meetingName, setMeetingName] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!notes.trim()) return
    onSubmit({ date, meeting_name: meetingName, raw_notes: notes })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">會議日期</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-xs text-gray-500">會議名稱</label>
          <input
            type="text"
            value={meetingName}
            onChange={(e) => setMeetingName(e.target.value)}
            placeholder="例：品牌策略月會"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">會議內容（自由輸入）</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="例：InLife 下個月做中醫正骨推廣，五月底前出 social posts。Miris Spa 要新 banner，六月初交稿..."
          rows={9}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {loading ? (
        <LoadingSpinner text="AI 解析中..." />
      ) : (
        <button
          type="submit"
          disabled={!notes.trim()}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ✨ Save
        </button>
      )}
    </form>
  )
}
