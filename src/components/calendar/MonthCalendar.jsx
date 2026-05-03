import { useState } from 'react'
import { getBrand } from '../../config/brands'

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayMon(year, month) {
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1
}

const MONTHS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
const DAYS = ['一','二','三','四','五','六','日']

export default function MonthCalendar({ tasks, meetings }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [popover, setPopover] = useState(null)

  const todayStr = now.toISOString().split('T')[0]
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayMon(year, month)

  const pad = (n) => String(n).padStart(2, '0')
  const dateStr = (d) => `${year}-${pad(month + 1)}-${pad(d)}`

  const getEvents = (d) => {
    const ds = dateStr(d)
    return {
      deadlines: tasks.filter((t) => t.deadline === ds),
      meetingTasks: tasks.filter((t) => t.meeting_date?.startsWith(ds) && t.deadline !== ds),
      mtgs: (meetings ?? []).filter((m) => m.date === ds),
    }
  }

  const prev = () => month === 0 ? (setYear(y => y - 1), setMonth(11)) : setMonth(m => m - 1)
  const next = () => month === 11 ? (setYear(y => y + 1), setMonth(0)) : setMonth(m => m + 1)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 select-none" onClick={() => setPopover(null)}>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-500">‹</button>
        <span className="font-semibold text-gray-800">{year}年 {MONTHS[month]}</span>
        <button onClick={next} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-500">›</button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-lg overflow-hidden">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e${i}`} className="bg-white min-h-[64px]" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1
          const ds = dateStr(d)
          const { deadlines, meetingTasks, mtgs } = getEvents(d)
          const hasEvents = deadlines.length + meetingTasks.length + mtgs.length > 0
          const isToday = ds === todayStr

          return (
            <div
              key={d}
              onClick={(e) => { e.stopPropagation(); if (hasEvents) setPopover(popover === ds ? null : ds) }}
              className={`bg-white min-h-[64px] p-1 relative ${hasEvents ? 'cursor-pointer hover:bg-gray-50' : ''} ${isToday ? 'ring-1 ring-inset ring-indigo-400' : ''}`}
            >
              <span className={`text-xs font-medium ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>{d}</span>
              <div className="space-y-0.5 mt-0.5">
                {mtgs.map((m, idx) => (
                  <div key={idx} className="text-[10px] bg-purple-100 text-purple-700 rounded px-1 truncate">
                    📋 {m.meeting_name || '會議'}
                  </div>
                ))}
                {deadlines.map((t, idx) => {
                  const brand = getBrand(t.brand)
                  return (
                    <div key={idx} className={`text-[10px] rounded px-1 truncate ${brand.bg} ${brand.text}`}>
                      ⏰ {t.content}
                    </div>
                  )
                })}
                {meetingTasks.map((t, idx) => {
                  const brand = getBrand(t.brand)
                  return (
                    <div key={idx} className={`text-[10px] rounded px-1 truncate opacity-70 ${brand.bg} ${brand.text}`}>
                      {t.content}
                    </div>
                  )
                })}
              </div>

              {popover === ds && (
                <div
                  className="absolute top-full left-0 z-20 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-64 space-y-2 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="font-semibold text-gray-700">{ds}</p>
                  {mtgs.map((m, idx) => (
                    <div key={idx} className="bg-purple-50 rounded-lg p-2">
                      <p className="font-medium text-purple-700">📋 {m.meeting_name}</p>
                    </div>
                  ))}
                  {deadlines.map((t, idx) => {
                    const brand = getBrand(t.brand)
                    return (
                      <div key={idx} className={`rounded-lg p-2 ${brand.bg}`}>
                        <p className={`font-semibold ${brand.text}`}>⏰ {brand.label} deadline</p>
                        <p className="text-gray-700 mt-0.5">{t.content}</p>
                        {t.future_direction && <p className="text-gray-400 mt-0.5">→ {t.future_direction}</p>}
                      </div>
                    )
                  })}
                  {meetingTasks.map((t, idx) => {
                    const brand = getBrand(t.brand)
                    return (
                      <div key={idx} className={`rounded-lg p-2 ${brand.bg}`}>
                        <p className={`font-semibold ${brand.text}`}>{brand.label}</p>
                        <p className="text-gray-700 mt-0.5">{t.content}</p>
                        {t.future_direction && <p className="text-gray-400 mt-0.5">→ {t.future_direction}</p>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
