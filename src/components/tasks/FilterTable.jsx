import { useState } from 'react'
import BrandTag from '../BrandTag'
import StatusSelect from './StatusSelect'
import TaskEditModal from './TaskEditModal'
import { BRANDS } from '../../config/brands'

export default function FilterTable({ tasks, onUpdateTask }) {
  const [activeBrand, setActiveBrand] = useState('All')
  const [sortKey, setSortKey] = useState('deadline')
  const [sortAsc, setSortAsc] = useState(true)
  const [editingTask, setEditingTask] = useState(null)
  const [editingDeadline, setEditingDeadline] = useState(null)

  const filtered = tasks
    .filter((t) => activeBrand === 'All' || t.brand === activeBrand)
    .sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
    })

  const toggleSort = (key) => {
    if (sortKey === key) setSortAsc((p) => !p)
    else { setSortKey(key); setSortAsc(true) }
  }

  const SortBtn = ({ col, label }) => (
    <button onClick={() => toggleSort(col)} className="flex items-center gap-0.5 hover:text-indigo-600">
      {label}{sortKey === col && <span>{sortAsc ? ' ↑' : ' ↓'}</span>}
    </button>
  )

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveBrand('All')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${activeBrand === 'All' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          全部 ({tasks.length})
        </button>
        {BRANDS.map((b) => {
          const count = tasks.filter((t) => t.brand === b.id).length
          if (count === 0) return null
          return (
            <button
              key={b.id}
              onClick={() => setActiveBrand(b.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${activeBrand === b.id ? `${b.bg} ${b.text} ring-1 ring-offset-1 ring-current` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {b.label} ({count})
            </button>
          )
        })}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="px-3 py-2 text-left font-medium"><SortBtn col="brand" label="品牌" /></th>
              <th className="px-3 py-2 text-left font-medium">內容</th>
              <th className="px-3 py-2 text-left font-medium"><SortBtn col="meeting_date" label="會議日期" /></th>
              <th className="px-3 py-2 text-left font-medium"><SortBtn col="deadline" label="Deadline" /></th>
              <th className="px-3 py-2 text-left font-medium"><SortBtn col="status" label="狀態" /></th>
              <th className="px-3 py-2 text-left font-medium">Remark</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-400 text-sm">暫無記錄</td></tr>
            )}
            {filtered.map((task) => (
              <tr key={task.task_id} className="hover:bg-gray-50">
                <td className="px-3 py-2.5"><BrandTag brandId={task.brand} /></td>
                <td className="px-3 py-2.5 text-gray-700 max-w-xs">
                  <div className="text-sm">{task.content}</div>
                  {task.future_direction && (
                    <div className="text-xs text-gray-400 mt-0.5">→ {task.future_direction}</div>
                  )}
                </td>
                <td className="px-3 py-2.5 text-xs text-gray-500">{task.meeting_date}</td>
                <td className="px-3 py-2.5 text-xs">
                  {editingDeadline === task.task_id ? (
                    <input
                      type="date"
                      defaultValue={task.deadline || ''}
                      autoFocus
                      className="border border-indigo-300 rounded px-1 py-0.5 text-xs focus:outline-none"
                      onBlur={(e) => {
                        const val = e.target.value || null
                        if (val !== task.deadline) onUpdateTask(task.task_id, { deadline: val })
                        setEditingDeadline(null)
                      }}
                    />
                  ) : (
                    <span
                      onClick={() => setEditingDeadline(task.task_id)}
                      className={`cursor-pointer hover:underline decoration-dotted ${task.deadline && new Date(task.deadline) < new Date() ? 'text-red-500 font-medium' : task.deadline ? 'text-gray-600' : 'text-gray-300'}`}
                    >
                      {task.deadline || '—'}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <StatusSelect value={task.status} onChange={(val) => onUpdateTask(task.task_id, { status: val })} />
                </td>
                <td className="px-3 py-2.5 text-xs text-gray-500">
                  {task.remark || <span className="text-gray-300">—</span>}
                </td>
                <td className="px-3 py-2.5">
                  <button
                    onClick={() => setEditingTask(task)}
                    className="text-gray-300 hover:text-indigo-500 transition-colors text-base"
                    title="編輯"
                  >
                    ✏️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onSave={onUpdateTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  )
}
