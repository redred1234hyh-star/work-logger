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

const fmtDate = (v) => {
  if (!v) return ''
  if (typeof v === 'string') return v.split('T')[0]
  try { return new Date(v).toISOString().split('T')[0] } catch { return '' }
}

export default function MonthCalendar({ tasks, meetings, onDropTask, onUpdateTask, onDeleteTask, onDeleteMeeting }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [popover, setPopover] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const todayStr = now.toISOString().split('T')[0]
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayMon(year, month)

  const pad = (n) => String(n).padStart(2, '0')
  const dateStr = (d) => `${year}-${pad(month + 1)}-${pad(d)}`

  const getEvents = (d) => {
    const ds = dateStr(d)
    return {
      deadlines: tasks.filter((t) => t.deadline === ds),
      mtgs: (meetings ?? []).filter((m) => fmtDate(m.date) === ds),
    }
  }

  const prev = () => month === 0 ? (setYear(y => y - 1), setMonth(11)) : setMonth(m => m - 1)
  const next = () => month === 11 ? (setYear(y => y + 1), setMonth(0)) : setMonth(m => m + 1)

  const handleDrop = (e, ds) => {
    e.preventDefault()
    setDragOver(null)
    const task_id = e.dataTransfer.getData('task_id')
    if (task_id && onDropTask) onDropTask(task_id, ds)
  }

  const saveEdit = (task_id) => {
    if (!editingTask || editingTask.task_id !== task_id) return
    onUpdateTask?.(task_id, { content: editingTask.content })
    setEditingTask(null)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 select-none" onClick={() => { setPopover(null); setEditingTask(null); setConfirmDelete(null) }}>
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
          const { deadlines, mtgs } = getEvents(d)
          const hasEvents = deadlines.length + mtgs.length > 0
          const isToday = ds === todayStr
          const isDragOver = dragOver === ds

          return (
            <div
              key={d}
              onClick={(e) => { e.stopPropagation(); setEditingTask(null); if (hasEvents) setPopover(popover === ds ? null : ds) }}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver(ds) }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null) }}
              onDrop={(e) => handleDrop(e, ds)}
              className={`bg-white min-h-[64px] p-1 relative transition-colors
                ${hasEvents ? 'cursor-pointer hover:bg-gray-50' : ''}
                ${isToday ? 'ring-1 ring-inset ring-pink-300' : ''}
                ${isDragOver ? 'bg-pink-50 ring-2 ring-inset ring-pink-300' : ''}`}
            >
              <span className={`text-xs font-medium ${isToday ? 'text-pink-500' : 'text-gray-700'}`}>{d}</span>
              <div className="space-y-0.5 mt-0.5">
                {mtgs.map((m, idx) => (
                  <div key={idx} className="text-[10px] bg-purple-100 text-purple-700 rounded px-1 truncate">
                    📋 {m.meeting_name || '會議'}
                  </div>
                ))}
                {deadlines.map((t, idx) => {
                  const brand = getBrand(t.brand)
                  return (
                    <div
                      key={idx}
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation()
                        e.dataTransfer.setData('task_id', t.task_id)
                        e.dataTransfer.effectAllowed = 'move'
                      }}
                      className={`text-[10px] rounded px-1 truncate cursor-grab active:cursor-grabbing ${brand.bg} ${brand.text}`}
                    >
                      {brand.shortcode} - {t.content}
                    </div>
                  )
                })}
              </div>

              {popover === ds && (
                <div
                  className="absolute top-full left-0 z-20 bg-white border border-pink-100 rounded-xl shadow-xl p-3 w-72 space-y-2 text-xs max-h-72 overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="font-semibold text-gray-700">{ds}</p>
                  {mtgs.map((m, idx) => {
                    const mid = m.meeting_id
                    const isConfirming = confirmDelete?.type === 'meeting' && confirmDelete.id === mid
                    return (
                      <div key={idx} className="bg-purple-50 rounded-lg p-2 flex items-center justify-between gap-1">
                        <p className="font-medium text-purple-700 flex-1">📋 {m.meeting_name || '會議'}</p>
                        {isConfirming ? (
                          <span className="flex items-center gap-1 shrink-0">
                            <button onClick={() => { onDeleteMeeting?.(mid); setConfirmDelete(null) }} className="text-[10px] text-red-500 hover:text-red-700 font-medium">確認</button>
                            <button onClick={() => setConfirmDelete(null)} className="text-[10px] text-gray-400 hover:text-gray-600">取消</button>
                          </span>
                        ) : (
                          <button onClick={() => setConfirmDelete({ type: 'meeting', id: mid })} className="text-gray-300 hover:text-red-400 shrink-0 text-sm">🗑</button>
                        )}
                      </div>
                    )
                  })}
                  {deadlines.map((t, idx) => {
                    const brand = getBrand(t.brand)
                    const isEditing = editingTask?.task_id === t.task_id
                    const isConfirming = confirmDelete?.type === 'task' && confirmDelete.id === t.task_id
                    return (
                      <div key={idx} className={`rounded-lg p-2 ${brand.bg}`}>
                        <div className="flex items-center justify-between gap-1">
                          <p className={`font-semibold text-[10px] ${brand.text}`}>{brand.label} deadline</p>
                          {isConfirming ? (
                            <span className="flex items-center gap-1 shrink-0">
                              <button onClick={() => { onDeleteTask?.(t.task_id); setConfirmDelete(null) }} className="text-[10px] text-red-500 hover:text-red-700 font-medium">確認</button>
                              <button onClick={() => setConfirmDelete(null)} className="text-[10px] text-gray-400 hover:text-gray-600">取消</button>
                            </span>
                          ) : (
                            <button onClick={() => setConfirmDelete({ type: 'task', id: t.task_id })} className="text-gray-300 hover:text-red-400 shrink-0 text-sm">🗑</button>
                          )}
                        </div>
                        {isEditing ? (
                          <div className="flex items-center gap-1 mt-1">
                            <input
                              autoFocus
                              className="flex-1 text-xs border border-gray-300 rounded px-1.5 py-0.5 bg-white text-gray-800 focus:outline-none focus:border-pink-300"
                              value={editingTask.content}
                              onChange={(e) => setEditingTask((prev) => ({ ...prev, content: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(t.task_id)
                                if (e.key === 'Escape') setEditingTask(null)
                              }}
                            />
                            <button onClick={() => saveEdit(t.task_id)} className="text-green-600 hover:text-green-700 font-bold">✓</button>
                            <button onClick={() => setEditingTask(null)} className="text-gray-400 hover:text-gray-600">✗</button>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-1 mt-0.5">
                            <p className="text-gray-700 flex-1">{t.content}</p>
                            <button
                              onClick={() => { setConfirmDelete(null); setEditingTask({ task_id: t.task_id, content: t.content }) }}
                              className="text-gray-300 hover:text-pink-400 transition-colors shrink-0"
                            >✏️</button>
                          </div>
                        )}
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
