import { useState, useEffect } from 'react'
import { sheetsApi } from '../api/sheets'
import LoadingSpinner from '../components/LoadingSpinner'
import BrandTag from '../components/BrandTag'
import { extractBrandFromText } from '../config/brands'

export default function MeetingArchive() {
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    sheetsApi.getMeetings()
      .then(({ meetings: data }) => setMeetings(data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4 py-4">
      <h1 className="text-lg font-heading font-semibold text-gray-800">會議記錄</h1>

      {loading && <LoadingSpinner text="載入會議記錄..." />}
      {!loading && meetings.length === 0 && (
        <p className="text-gray-400 text-sm py-12 text-center">暫無會議記錄</p>
      )}

      <div className="space-y-2">
        {meetings.map((m) => {
          const brands = extractBrandFromText(m.raw_notes)
          const isExpanded = expanded === m.meeting_id

          return (
            <div key={m.meeting_id} className="bg-white border border-pink-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(isExpanded ? null : m.meeting_id)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-800">
                      {m.meeting_name || '（未命名會議）'}
                    </span>
                    {brands.map((b) => <BrandTag key={b} brandId={b} size="xs" />)}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{m.date}</p>
                  {!isExpanded && (
                    <p className="text-xs text-gray-500 mt-1 truncate">{m.raw_notes}</p>
                  )}
                </div>
                <span className="text-gray-400 text-xs flex-shrink-0 mt-1">{isExpanded ? '▲' : '▼'}</span>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans bg-gray-50 rounded-lg p-3 leading-relaxed border border-gray-100">
                    {m.raw_notes}
                  </pre>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
