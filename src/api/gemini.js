import { BRANDS } from '../config/brands.js'

const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`

const BRAND_LIST = BRANDS
  .filter((b) => b.id !== 'General')
  .map((b) => b.keywords?.length ? `${b.label} (shortcuts: ${b.keywords.join(', ')})` : b.label)
  .join('\n- ')

const CURRENT_YEAR = new Date().getFullYear()

const SYSTEM_PROMPT = `You are a meeting notes parser. Extract action items from the meeting notes.
The brands and their shortcuts are:
- ${BRAND_LIST}

Today's date is ${new Date().toISOString().split('T')[0]}. Current year is ${CURRENT_YEAR}.

Return a JSON array. Each item must have:
- "brand": one of the exact brand names above (InLife, Minus Plus, Miris Spa, Miris Mama, Consguard, Multi Plus), or "General" if unclear
- "content": the action item or discussion point (keep the same language as the input)
- "future_direction": next steps mentioned (same language as input), or ""
- "deadline": ISO date string YYYY-MM-DD if a date is mentioned. If no year is specified, always use ${CURRENT_YEAR}. Or null if no date mentioned.
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
  if (data.error) throw new Error(data.error.message ?? 'Gemini API error')
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]'
}

function fixYear(deadline) {
  if (!deadline) return null
  const m = deadline.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return deadline
  const y = parseInt(m[1])
  if (y !== CURRENT_YEAR && y !== CURRENT_YEAR + 1) {
    return `${CURRENT_YEAR}-${m[2]}-${m[3]}`
  }
  return deadline
}

export function parseGeminiResponse(rawText, meetingDate) {
  try {
    const items = JSON.parse(rawText)
    if (!Array.isArray(items)) return []
    return items.map((item) => ({
      brand: item.brand ?? 'General',
      content: item.content ?? '',
      future_direction: item.future_direction ?? '',
      deadline: fixYear(item.deadline ?? null),
      meeting_date: meetingDate,
      status: '待開始',
      remark: '',
    }))
  } catch {
    return []
  }
}
