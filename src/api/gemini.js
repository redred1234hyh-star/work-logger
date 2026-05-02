import { BRAND_NAMES } from '../config/brands.js'

const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`

const SYSTEM_PROMPT = `You are a meeting notes parser. Extract action items from the meeting notes.
The brands are: ${BRAND_NAMES.join(', ')}.
Return a JSON array. Each item must have:
- "brand": one of the brand names above, or "General" if unclear
- "content": the action item or discussion point (keep the same language as the input)
- "future_direction": next steps mentioned (same language as input), or ""
- "deadline": ISO date string YYYY-MM-DD if a date is mentioned, or null
Return ONLY a valid JSON array, no markdown, no explanation.`

export async function parseMeetingNotes(rawNotes) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nMeeting notes:\n${rawNotes}` }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  })
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]'
}

export function parseGeminiResponse(rawText, meetingDate) {
  try {
    const items = JSON.parse(rawText)
    if (!Array.isArray(items)) return []
    return items.map((item) => ({
      brand: item.brand ?? 'General',
      content: item.content ?? '',
      future_direction: item.future_direction ?? '',
      deadline: item.deadline ?? null,
      meeting_date: meetingDate,
      status: '待開始',
      remark: '',
    }))
  } catch {
    return []
  }
}
