import { useState } from 'react'
import MeetingForm from '../components/meeting/MeetingForm'
import ParsedResults from '../components/meeting/ParsedResults'
import { useMeetings } from '../hooks/useMeetings'

export default function MeetingInput({ onSaved }) {
  const { parsing, saving, parsedTasks, meetingMeta, error, parseNotes, confirmSave, cancelParsed } = useMeetings()
  const [saved, setSaved] = useState(false)

  const handleConfirm = async () => {
    const result = await confirmSave()
    if (result?.success) {
      setSaved(true)
      onSaved?.()
    }
  }

  if (saved) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="text-5xl">✅</div>
        <p className="text-gray-700 font-medium">會議記錄已儲存！</p>
        <button
          onClick={() => setSaved(false)}
          className="text-pink-500 text-sm hover:underline"
        >
          記錄另一個會議
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-4">
      <h1 className="text-lg font-heading font-semibold text-gray-800">開會記錄</h1>

      {!parsedTasks ? (
        <MeetingForm onSubmit={parseNotes} loading={parsing} />
      ) : (
        <ParsedResults
          tasks={parsedTasks}
          meetingMeta={meetingMeta}
          onConfirm={handleConfirm}
          onCancel={cancelParsed}
          saving={saving}
        />
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
