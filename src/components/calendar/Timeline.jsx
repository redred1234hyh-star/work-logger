import BrandTag from '../BrandTag'

export default function Timeline({ tasks, meetings }) {
  const todayStr = new Date().toISOString().split('T')[0]

  const events = [
    ...(meetings ?? []).map((m) => ({
      date: m.date,
      type: 'meeting',
      label: m.meeting_name || '會議',
      brand: null,
      meta: null,
    })),
    ...tasks
      .filter((t) => t.deadline)
      .map((t) => ({
        date: t.deadline,
        type: 'deadline',
        label: t.content,
        brand: t.brand,
        meta: t.future_direction || null,
      })),
  ]
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))

  if (events.length === 0) {
    return <p className="text-gray-400 text-sm py-12 text-center">暫無即將到來的事項 ✨</p>
  }

  let lastDate = null

  return (
    <div className="space-y-0.5">
      {events.map((event, i) => {
        const showDate = event.date !== lastDate
        lastDate = event.date
        const isToday = event.date === todayStr

        return (
          <div key={i}>
            {showDate && (
              <div className="flex items-center gap-2 pt-4 pb-1">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isToday ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                  {isToday ? '今日' : event.date}
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
            )}
            <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg ${event.type === 'meeting' ? 'bg-purple-50' : 'bg-white border border-gray-100'}`}>
              {event.type === 'meeting'
                ? <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex-shrink-0">會議</span>
                : event.brand && <BrandTag brandId={event.brand} size="xs" />
              }
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">{event.label}</p>
                {event.meta && <p className="text-xs text-gray-400 mt-0.5 truncate">→ {event.meta}</p>}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
