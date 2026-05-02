import { useState } from 'react'
import { BRANDS } from '../../config/brands'
import StatusSelect from './StatusSelect'

export default function BrandGroups({ tasks, onUpdateTask }) {
  const [collapsed, setCollapsed] = useState({})
  const [editingRemark, setEditingRemark] = useState(null)
  const [remarkDraft, setRemarkDraft] = useState('')

  const saveRemark = (task_id) => {
    onUpdateTask(task_id, { remark: remarkDraft })
    setEditingRemark(null)
  }

  return (
    <div className="space-y-3">
      {BRANDS.map((brand) => {
        const brandTasks = tasks.filter((t) => t.brand === brand.id)
        if (brandTasks.length === 0) return null
        const isCollapsed = collapsed[brand.id]

        return (
          <div key={brand.id} className={`rounded-xl border-2 ${brand.border} overflow-hidden`}>
            <button
              onClick={() => setCollapsed((p) => ({ ...p, [brand.id]: !p[brand.id] }))}
              className={`w-full flex items-center justify-between px-4 py-3 ${brand.bg} hover:opacity-90 transition-opacity`}
            >
              <div className="flex items-center gap-2">
                <span className={`font-semibold text-sm ${brand.text}`}>{brand.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full bg-white bg-opacity-70 ${brand.text}`}>
                  {brandTasks.length}
                </span>
              </div>
              <span className={`text-xs ${brand.text}`}>{isCollapsed ? '▶' : '▼'}</span>
            </button>

            {!isCollapsed && (
              <div className="divide-y divide-gray-100 bg-white">
                {brandTasks.map((task) => (
                  <div key={task.task_id} className="px-4 py-3 space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-gray-800 flex-1 leading-relaxed">{task.content}</p>
                      <StatusSelect value={task.status} onChange={(val) => onUpdateTask(task.task_id, { status: val })} />
                    </div>
                    {task.future_direction && (
                      <p className="text-xs text-gray-400">→ {task.future_direction}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                      <span>📋 {task.meeting_date}</span>
                      {task.deadline && (
                        <span className={new Date(task.deadline) < new Date() ? 'text-red-500 font-medium' : ''}>
                          截止 {task.deadline}
                        </span>
                      )}
                      {editingRemark === task.task_id ? (
                        <div className="flex gap-1 ml-auto">
                          <input
                            autoFocus
                            value={remarkDraft}
                            onChange={(e) => setRemarkDraft(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveRemark(task.task_id); if (e.key === 'Escape') setEditingRemark(null) }}
                            className="border border-gray-300 rounded px-1.5 py-0.5 text-xs w-36 focus:outline-none"
                          />
                          <button onClick={() => saveRemark(task.task_id)} className="text-indigo-600">✓</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingRemark(task.task_id); setRemarkDraft(task.remark ?? '') }}
                          className="ml-auto text-gray-300 hover:text-gray-500 transition-colors"
                        >
                          {task.remark || '+ remark'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
