import { useState } from 'react'
import FilterTable from '../components/tasks/FilterTable'
import BrandGroups from '../components/tasks/BrandGroups'
import KanbanBoard from '../components/tasks/KanbanBoard'
import LoadingSpinner from '../components/LoadingSpinner'
import { LayoutList, Tag, Kanban, RefreshCw } from 'lucide-react'

const VIEWS = [
  { id: 'table', label: '表格', Icon: LayoutList },
  { id: 'groups', label: '品牌分組', Icon: Tag },
  { id: 'kanban', label: 'Kanban', Icon: Kanban },
]

export default function TaskList({ tasks, loading, error, updateTask, deleteTask, reload }) {
  const [view, setView] = useState('table')

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-heading font-semibold text-gray-800">任務列表</h1>
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

      {loading && <LoadingSpinner text="載入任務中..." />}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {!loading && !error && (
        <>
          {view === 'table' && <FilterTable tasks={tasks} onUpdateTask={updateTask} onDeleteTask={deleteTask} />}
          {view === 'groups' && <BrandGroups tasks={tasks} onUpdateTask={updateTask} />}
          {view === 'kanban' && <KanbanBoard tasks={tasks} onUpdateTask={updateTask} />}
        </>
      )}
    </div>
  )
}
