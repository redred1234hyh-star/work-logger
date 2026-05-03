import { Mic, ClipboardList, CalendarDays, FolderOpen } from 'lucide-react'

const TABS = [
  { id: 'meeting', label: '開會記錄', Icon: Mic },
  { id: 'tasks', label: '任務列表', Icon: ClipboardList },
  { id: 'calendar', label: 'Calendar', Icon: CalendarDays },
  { id: 'archive', label: '會議記錄', Icon: FolderOpen },
]

export default function TopNav({ activeTab, onTabChange }) {
  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-10 shadow-[0_1px_8px_rgba(244,114,182,0.08)]">
      <div className="flex justify-center overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-5 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === id
                ? 'border-pink-400 text-pink-500'
                : 'border-transparent text-gray-400 hover:text-pink-400'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>
    </nav>
  )
}
