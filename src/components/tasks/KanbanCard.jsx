import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import BrandTag from '../BrandTag'

export default function KanbanCard({ task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.task_id,
    data: { task },
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : 1 }}
      {...listeners}
      {...attributes}
      className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm cursor-grab active:cursor-grabbing space-y-2 touch-none select-none"
    >
      <BrandTag brandId={task.brand} size="xs" />
      <p className="text-xs text-gray-700 leading-relaxed">{task.content}</p>
      {task.deadline && (
        <p className={`text-xs ${new Date(task.deadline) < new Date() ? 'text-red-500' : 'text-gray-400'}`}>
          📅 {task.deadline}
        </p>
      )}
      {task.remark && (
        <p className="text-xs text-gray-400 italic truncate">{task.remark}</p>
      )}
    </div>
  )
}
