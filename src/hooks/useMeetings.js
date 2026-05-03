import { useState } from 'react'
import { sheetsApi } from '../api/sheets'
import { parseMeetingNotes, parseGeminiResponse } from '../api/gemini'

export function useMeetings() {
  const [parsing, setParsing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [parsedTasks, setParsedTasks] = useState(null)
  const [meetingMeta, setMeetingMeta] = useState(null)
  const [error, setError] = useState(null)

  const parseNotes = async ({ date, meeting_name, raw_notes }) => {
    setParsing(true)
    setError(null)
    try {
      const rawText = await parseMeetingNotes(raw_notes)
      const tasks = parseGeminiResponse(rawText, date)
      setParsedTasks(tasks)
      setMeetingMeta({ date, meeting_name, raw_notes })
    } catch (e) {
      setError(`AI 解析失敗：${e.message ?? '請重試'}`)
    } finally {
      setParsing(false)
    }
  }

  const confirmSave = async () => {
    if (!meetingMeta || !parsedTasks) return { success: false }
    setSaving(true)
    try {
      const { meeting_id } = await sheetsApi.saveMeeting(meetingMeta)
      await sheetsApi.saveTasks({ meeting_id, tasks: parsedTasks })
      setParsedTasks(null)
      setMeetingMeta(null)
      return { success: true }
    } catch {
      setError('儲存失敗，請重試')
      return { success: false }
    } finally {
      setSaving(false)
    }
  }

  const cancelParsed = () => {
    setParsedTasks(null)
    setMeetingMeta(null)
  }

  return { parsing, saving, parsedTasks, meetingMeta, error, parseNotes, confirmSave, cancelParsed }
}
