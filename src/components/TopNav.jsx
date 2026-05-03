const TABS = [
  { id: 'meeting', label: '🎤 開會記錄' },
  { id: 'tasks', label: '📋 任務列表' },
  { id: 'calendar', label: '📅 Calendar' },
  { id: 'archive', label: '📁 會議記錄' },
]

export default function TopNav({ activeTab, onTabChange }) {
  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-10 shadow-[0_1px_8px_rgba(244,114,182,0.08)]">
      <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-shrink-0 px-5 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-pink-400 text-pink-500'
                : 'border-transparent text-gray-400 hover:text-pink-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
