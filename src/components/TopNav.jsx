const TABS = [
  { id: 'meeting', label: '🎤 開會記錄' },
  { id: 'tasks', label: '📋 任務列表' },
  { id: 'calendar', label: '📅 Calendar' },
  { id: 'archive', label: '📁 會議記錄' },
]

export default function TopNav({ activeTab, onTabChange }) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-shrink-0 px-5 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
