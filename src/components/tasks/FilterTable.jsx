import { useState } from 'react'
import BrandTag from '../BrandTag'
import StatusSelect from './StatusSelect'
import TaskEditModal from './TaskEditModal'
import { BRANDS, STATUS_OPTIONS } from '../../config/brands'
import { Pencil, Trash2, X, Sparkles } from 'lucide-react'

export default function FilterTable({ tasks, onUpdateTask, onDeleteTask }) {
  const [activeBrand, setActiveBrand] = useState('All')
  const [sortKey, setSortKey] = useState('deadline')
  const [sortAsc, setSortAsc] = useState(true)
  const [editingTask, setEditingTask] = useState(null)
  const [editingDeadline, setEditingDeadline] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [bulkConfirmDelete, setBulkConfirmDelete] = useState(false)

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
    <button onClick={() => toggleSort(col)} className="flex items-center gap-0.5 hover:text-pink-500">
      {label}{sortKey === col && <span>{sortAsc ? ' ↑' : ' ↓'}</span>}
    </button>
  )

  const handleDelete = (task_id) => {
    if (confirmDelete === task_id) {
      onDeleteTask?.(task_id)
      setConfirmDelete(null)
      setSelected((prev) => { const s = new Set(prev); s.delete(task_id); return s })
    } else {
      setConfirmDelete(task_id)
    }
  }

  const allFilteredIds = filtered.map((t) => t.task_id)
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selected.has(id))
  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => { const s = new Set(prev); allFilteredIds.forEach((id) => s.delete(id)); return s })
    } else {
      setSelected((prev) => { const s = new Set(prev); allFilteredIds.forEach((id) => s.add(id)); return s })
    }
  }
  const toggleOne = (id) => {
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  const selectedTasks = tasks.filter((t) => selected.has(t.task_id))

  const handleBulkStatus = (status) => {
    selectedTasks.forEach((t) => onUpdateTask(t.task_id, { status }))
    setSelected(new Set())
  }

  const handleBulkDelete = () => {
    if (bulkConfirmDelete) {
      selectedTasks.forEach((t) => onDeleteTask?.(t.task_id))
      setSelected(new Set())
      setBulkConfirmDelete(false)
    } else {
      setBulkConfirmDelete(true)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveBrand('All')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${activeBrand === 'All' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
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

      {selected.size > 0 && (
        <div className="flex items-center gap-3 flex-wrap bg-pink-50 border border-pink-100 rounded-lg px-3 py-2">
          <span className="text-xs font-medium text-pink-600">已選 {selected.size} 項</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">改狀態：</span>
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleBulkStatus(s)}
                className="text-xs px-2 py-0.5 rounded bg-white border border-gray-200 hover:border-pink-300 hover:text-pink-500 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            {bulkConfirmDelete ? (
              <>
                <span className="text-xs text-red-500">確認刪除 {selected.size} 項？</span>
                <button onClick={handleBulkDelete} className="text-xs text-red-600 font-medium hover:text-red-700">確認</button>
                <button onClick={() => setBulkConfirmDelete(false)} className="text-xs text-gray-400 hover:text-gray-600">取消</button>
              </>
            ) : (
              <button onClick={handleBulkDelete} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"><Trash2 size={12} /> 刪除所選</button>
            )}
            <button onClick={() => { setSelected(new Set()); setBulkConfirmDelete(false) }} className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-gray-600 ml-1"><X size={12} /> 取消選擇</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-pink-100">
        <table className="w-full text-sm min-w-[820px]">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="px-3 py-2 w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded border-gray-300 text-pink-500 focus:ring-pink-400 cursor-pointer"
                />
              </th>
              <th className="px-3 py-2 text-left font-medium"><SortBtn col="brand" label="品牌" /></th>
              <th className="px-3 py-2 text-left font-medium">內容</th>
              <th className="px-3 py-2 text-left font-medium">後續方向</th>
              <th className="px-3 py-2 text-left font-medium"><SortBtn col="meeting_date" label="會議日期" /></th>
              <th className="px-3 py-2 text-left font-medium"><SortBtn col="deadline" label="Deadline" /></th>
              <th className="px-3 py-2 text-left font-medium"><SortBtn col="status" label="狀態" /></th>
              <th className="px-3 py-2 text-left font-medium">Remark</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-3 py-8 text-center text-gray-400 text-sm">暫無記錄</td></tr>
            )}
            {filtered.map((task) => (
              <tr key={task.task_id} className={`hover:bg-gray-50 ${selected.has(task.task_id) ? 'bg-pink-50/50' : ''}`}>
                <td className="px-3 py-2.5 w-8">
                  <input
                    type="checkbox"
                    checked={selected.has(task.task_id)}
                    onChange={() => toggleOne(task.task_id)}
                    className="rounded border-gray-300 text-pink-500 focus:ring-pink-400 cursor-pointer"
                  />
                </td>
                <td className="px-3 py-2.5"><BrandTag brandId={task.brand} /></td>
                <td className="px-3 py-2.5 text-gray-700 max-w-[200px]">
                  <div className="text-sm">{task.content}</div>
                </td>
                <td className="px-3 py-2.5 text-xs text-gray-500 max-w-[160px]">
                  {task.future_direction || <span className="text-gray-300">—</span>}
                </td>
                <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">
                  {task.meeting_date?.toString().split('T')[0] || task.meeting_date}
                </td>
                <td className="px-3 py-2.5 text-xs">
                  {editingDeadline === task.task_id ? (
                    <input
                      type="date"
                      defaultValue={task.deadline || ''}
                      autoFocus
                      className="border border-pink-200 rounded px-1 py-0.5 text-xs focus:outline-none"
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
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingTask(task)}
                      className="text-gray-300 hover:text-pink-400 transition-colors p-1"
                      title="編輯"
                    ><Pencil size={13} /></button>
                    {confirmDelete === task.task_id ? (
                      <span className="flex items-center gap-1">
                        <button onClick={() => handleDelete(task.task_id)} className="text-[10px] text-red-500 hover:text-red-700 font-medium">確認</button>
                        <button onClick={() => setConfirmDelete(null)} className="text-[10px] text-gray-400 hover:text-gray-600">取消</button>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDelete(task.task_id)}
                        className="text-gray-300 hover:text-red-400 transition-colors p-1"
                        title="刪除"
                      ><Trash2 size={13} /></button>
                    )}
                  </div>
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
