import { useState } from 'react'
import BrandTag from '../BrandTag'
import StatusSelect from './StatusSelect'
import { BRANDS } from '../../config/brands'

export default function FilterTable({ tasks, onUpdateTask }) {
  const [activeBrand, setActiveBrand] = useState('All')
  const [sortKey, setSortKey] = useState('deadline')
  const [sortAsc, setSortAsc] = useState(true)
  const [editingRemark, setEditingRemark] = useState(null)
  const [remarkDraft, setRemarkDraft] = useState('')

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

  const saveRemark = (task_id) => {
    onUpdateTask(task_id, { remark: remarkDraft })
    setEditingRemark(null)
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
        {BRANDS.filter((b) => b.id !== 'General').map((b) => {
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-gray-400 text-sm">暫無記錄</td></tr>
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
                  {task.deadline
                    ? <span className={new Date(task.deadline) < new Date() ? 'text-red-500 font-medium' : 'text-gray-600'}>{task.deadline}</span>
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-3 py-2.5">
                  <StatusSelect value={task.status} onChange={(val) => onUpdateTask(task.task_id, { status: val })} />
                </td>
                <td className="px-3 py-2.5 text-xs">
                  {editingRemark === task.task_id ? (
                    <div className="flex gap-1">
                      <input
                        autoFocus
                        value={remarkDraft}
                        onChange={(e) => setRemarkDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveRemark(task.task_id); if (e.key === 'Escape') setEditingRemark(null) }}
                        className="border border-gray-300 rounded px-1 py-0.5 text-xs w-28 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                      />
                      <button onClick={() => saveRemark(task.task_id)} className="text-indigo-600">✓</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingRemark(task.task_id); setRemarkDraft(task.remark ?? '') }}
                      className="text-left min-w-[4rem] text-gray-400 hover:text-gray-700"
                    >
                      {task.remark || <span className="text-gray-300">+ 備注</span>}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
