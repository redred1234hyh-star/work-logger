import { useState } from 'react'
import MonthCalendar from '../components/calendar/MonthCalendar'
import Timeline from '../components/calendar/Timeline'
import LoadingSpinner from '../components/LoadingSpinner'
import BrandTag from '../components/BrandTag'
import { getBrand } from '../config/brands'

const VIEWS = [
  { id: 'month', label: '📆 月曆' },
  { id: 'timeline', label: '📋 時間線' },
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

  const pendingTasks = tasks.filter((t) => !t.deadline || t.deadline === '')
  const confirmedTasks = tasks
    .filter((t) => t.status === '已確定')
    .sort((a, b) => (a.deadline ?? '9999') > (b.deadline ?? '9999') ? 1 : -1)

  const handleDropTask = async (task_id, dateStr) => {
    await updateTask(task_id, { deadline: dateStr })
  }

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
          {view === 'month' && <MonthCalendar tasks={tasks} meetings={meetings} onDropTask={handleDropTask} onUpdateTask={updateTask} onDeleteTask={deleteTask} onDeleteMeeting={deleteMeeting} />}
          {view === 'timeline' && <Timeline tasks={tasks} meetings={meetings} />}

          {confirmedTasks.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-sm font-semibold text-gray-700">本月確定事項</h2>
                <span className="text-xs text-gray-400">({confirmedTasks.length})</span>
              </div>
              <div className="bg-white rounded-xl border border-emerald-200 divide-y divide-emerald-50">
                {confirmedTasks.map((task) => {
                  const brand = getBrand(task.brand)
                  return (
                    <div key={task.task_id} className="flex items-start gap-3 px-4 py-2.5">
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
                  )
                })}
              </div>
            </div>
          )}

          {pendingTasks.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-sm font-semibold text-gray-600">待定</h2>
                <span className="text-xs text-gray-400">({pendingTasks.length}) 拖曳到日期以設定 deadline</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {pendingTasks.map((task) => (
                  <PendingCard key={task.task_id} task={task} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
