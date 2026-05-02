import BrandTag from '../BrandTag'
import LoadingSpinner from '../LoadingSpinner'

export default function ParsedResults({ tasks, meetingMeta, onConfirm, onCancel, saving }) {
  return (
    <div className="border border-indigo-200 rounded-xl bg-indigo-50 p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-indigo-800">
          ✨ AI 解析結果 — {tasks.length} 個項目
        </h3>
        <span className="text-xs text-gray-500">
          {meetingMeta?.meeting_name} · {meetingMeta?.date}
        </span>
      </div>

      <div className="space-y-2">
        {tasks.map((task, i) => (
          <div key={i} className="bg-white rounded-lg p-3 flex flex-col gap-1.5 shadow-sm">
            <div className="flex items-center gap-2">
              <BrandTag brandId={task.brand} />
              {task.deadline && (
                <span className="text-xs text-red-500 ml-auto">📅 {task.deadline}</span>
              )}
            </div>
            <p className="text-sm text-gray-800">{task.content}</p>
            {task.future_direction && (
              <p className="text-xs text-gray-500">→ {task.future_direction}</p>
            )}
          </div>
        ))}
      </div>

      {saving ? (
        <LoadingSpinner text="儲存中..." />
      ) : (
        <div className="flex gap-2 pt-1">
          <button
            onClick={onConfirm}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            ✅ 確認儲存
          </button>
          <button
            onClick={onCancel}
            className="text-gray-500 px-4 py-2 rounded-lg text-sm hover:bg-white transition-colors"
          >
            取消
          </button>
        </div>
      )}
    </div>
  )
}
