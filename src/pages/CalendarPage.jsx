import { useState } from 'react'
import MonthCalendar from '../components/calendar/MonthCalendar'
import Timeline from '../components/calendar/Timeline'
import LoadingSpinner from '../components/LoadingSpinner'
import BrandTag from '../components/BrandTag'
import { getBrand } from '../config/brands'
import { CalendarDays, AlignLeft, RefreshCw } from 'lucide-react'

const VIEWS = [
  { id: 'month', label: '月曆', Icon: CalendarDays },
  { id: 'timeline', label: '時間線', Icon: AlignLeft },
]

function PendingCard({ task }) {
  const brand = getBrand(task.brand)
  const handleDragStart = (e) => {
    e.dataTransfer.setData('task_id', task.task_id)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`rounded-lg p-2.5 cursor-grab active:cursor-grabbing border ${brand.border} ${brand.bg} select-none`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`text-[10px] font-semibold ${brand.text}`}>{brand.label}</span>
      </div>
      <p className="text-xs text-gray-700 leading-relaxed">{task.content}</p>
      {task.future_direction && (
        <p className="text-[10px] text-gray-400 mt-0.5">→ {task.future_direction}</p>
      )}
    </div>
  )
}

export default function CalendarPage({ tasks, meetings, loading, reload, updateTask, deleteTask, deleteMeeting }) {
  const [view, setView] = useState(() => window.innerWidth < 768 ? 'timeline' : 'month')
  const [dragOverConfirmed, setDragOverConfirmed] = useState(false)
  const [dragOverPending, setDragOverPending] = useState(false)

  const pendingTasks = tasks.filter((t) => !t.deadline || t.deadline === '')
  const confirmedTasks = tasks
    .filter((t) => t.status === '已確定')
    .sort((a, b) => (a.deadline ?? '9999') > (b.deadline ?? '9999') ? 1 : -1)

  const handleDropTask = async (task_id, dateStr) => {
    await updateTask(task_id, { deadline: dateStr })
  }

  const handleDropToConfirmed = (e) => {
    e.preventDefault()
    setDragOverConfirmed(false)
    const task_id = e.dataTransfer.getData('task_id')
    if (task_id) updateTask(task_id, { status: '已確定' })
  }

  const handleDropToPending = (e) => {
    e.preventDefault()
    setDragOverPending(false)
    const task_id = e.dataTransfer.getData('task_id')
    if (task_id) updateTask(task_id, { status: '待開始' })
  }

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-heading font-semibold text-pink-800">Calendar</h1>
          <button onClick={reload} disabled={loading} className="text-gray-400 hover:text-pink-400 disabled:opacity-40 transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {VIEWS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                view === id ? 'bg-white text-pink-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && <LoadingSpinner text="載入中..." />}
      {!loading && (
        <>
          {view === 'month' && <MonthCalendar tasks={tasks} meetings={meetings} onDropTask={handleDropTask} onUpdateTask={updateTask} onDeleteTask={deleteTask} onDeleteMeeting={deleteMeeting} />}
          {view === 'timeline' && <Timeline tasks={tasks} meetings={meetings} />}

          <div
            className={`mt-4 rounded-xl border-2 transition-colors ${dragOverConfirmed ? 'border-emerald-400 bg-emerald-50' : 'border-transparent'}`}
            onDragOver={(e) => { e.preventDefault(); setDragOverConfirmed(true) }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverConfirmed(false) }}
            onDrop={handleDropToConfirmed}
          >
            <div className="flex items-center gap-2 mb-2 px-1">
              <h2 className="text-sm font-heading font-semibold text-pink-700">本月確定事項</h2>
              <span className="text-xs text-gray-400">({confirmedTasks.length}) 拖入標記已確定，拖出至待定區取消</span>
            </div>
            <div className={`bg-white rounded-xl border divide-y divide-emerald-50 min-h-[48px] ${dragOverConfirmed ? 'border-emerald-400' : 'border-emerald-200'}`}>
              {confirmedTasks.length === 0 && (
                <p className="text-xs text-gray-300 text-center py-3">拖入任務以標記為已確定</p>
              )}
              {confirmedTasks.map((task) => (
                <div
                  key={task.task_id}
                  draggable
                  onDragStart={(e) => { e.dataTransfer.setData('task_id', task.task_id); e.dataTransfer.effectAllowed = 'move' }}
                  className="flex items-start gap-3 px-4 py-2.5 cursor-grab active:cursor-grabbing hover:bg-gray-50"
                >
                  <BrandTag brandId={task.brand} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">{task.content}</p>
                    {task.future_direction && (
                      <p className="text-xs text-gray-400 mt-0.5">→ {task.future_direction}</p>
                    )}
                  </div>
                  {task.deadline && (
                    <span className="text-xs text-emerald-600 font-medium shrink-0">{task.deadline}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div
            className={`mt-4 rounded-xl border-2 transition-colors ${dragOverPending ? 'border-gray-400 bg-gray-50' : 'border-transparent'}`}
            onDragOver={(e) => { e.preventDefault(); setDragOverPending(true) }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverPending(false) }}
            onDrop={handleDropToPending}
          >
            <div className="flex items-center gap-2 mb-2 px-1">
              <h2 className="text-sm font-semibold text-gray-600">待定</h2>
              <span className="text-xs text-gray-400">({pendingTasks.length}) 拖曳到日期設定 deadline，或拖入此區取消已確定</span>
            </div>
            {pendingTasks.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {pendingTasks.map((task) => (
                  <PendingCard key={task.task_id} task={task} />
                ))}
              </div>
            )}
            {pendingTasks.length === 0 && (
              <div className={`rounded-xl border border-dashed min-h-[48px] flex items-center justify-center ${dragOverPending ? 'border-gray-400' : 'border-gray-200'}`}>
                <p className="text-xs text-gray-300">拖入已確定任務以取消確定狀態</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
