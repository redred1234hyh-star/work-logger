import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import KanbanCard from './KanbanCard'
import { STATUS_OPTIONS } from '../../config/brands'

const COLUMN_STYLE = {
  '待開始': 'bg-gray-50 border-gray-200',
  '進行中': 'bg-yellow-50 border-yellow-200',
  '待審批': 'bg-blue-50 border-blue-200',
  '已完成': 'bg-green-50 border-green-200',
}

function Column({ status, tasks }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  return (
    <div className={`flex-1 min-w-[200px] rounded-xl border-2 ${COLUMN_STYLE[status]} ${isOver ? 'ring-2 ring-pink-300 ring-offset-1' : ''} transition-all`}>
      <div className="px-3 py-2.5 border-b border-inherit">
        <span className="text-xs font-semibold text-gray-600">{status}</span>
        <span className="ml-2 text-xs text-gray-400">{tasks.length}</span>
      </div>
      <div ref={setNodeRef} className="p-2 space-y-2 min-h-[160px]">
        {tasks.map((task) => <KanbanCard key={task.task_id} task={task} />)}
      </div>
    </div>
  )
}

export default function KanbanBoard({ tasks, onUpdateTask }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  const handleDragEnd = ({ active, over }) => {
    if (!over) return
    const task = active.data.current?.task
    if (task && task.status !== over.id) {
      onUpdateTask(task.task_id, { status: over.id })
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STATUS_OPTIONS.map((status) => (
          <Column key={status} status={status} tasks={tasks.filter((t) => t.status === status)} />
        ))}
      </div>
    </DndContext>
  )
}
