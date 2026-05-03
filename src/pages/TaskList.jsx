import { useState } from 'react'
import FilterTable from '../components/tasks/FilterTable'
import BrandGroups from '../components/tasks/BrandGroups'
import KanbanBoard from '../components/tasks/KanbanBoard'
import LoadingSpinner from '../components/LoadingSpinner'

const VIEWS = [
  { id: 'table', label: '📊 表格' },
  { id: 'groups', label: '🏷 品牌分組' },
  { id: 'kanban', label: '📌 Kanban' },
]

export default function TaskList({ tasks, loading, error, updateTask, reload }) {
  const [view, setView] = useState('table')

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-gray-800">📋 任務列表</h1>
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

      {loading && <LoadingSpinner text="載入任務中..." />}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {!loading && !error && (
        <>
          {view === 'table' && <FilterTable tasks={tasks} onUpdateTask={updateTask} />}
          {view === 'groups' && <BrandGroups tasks={tasks} onUpdateTask={updateTask} />}
          {view === 'kanban' && <KanbanBoard tasks={tasks} onUpdateTask={updateTask} />}
        </>
      )}
    </div>
  )
}
