import { describe, it, expect } from 'vitest'
import { parseGeminiResponse } from '../api/gemini.js'

describe('parseGeminiResponse', () => {
  it('returns structured tasks from valid JSON', () => {
    const raw = JSON.stringify([
      { brand: 'InLife', content: '推廣計劃', future_direction: '設計視覺', deadline: '2026-05-31' },
    ])
    const result = parseGeminiResponse(raw, '2026-05-02')
    expect(result).toHaveLength(1)
    expect(result[0].brand).toBe('InLife')
    expect(result[0].meeting_date).toBe('2026-05-02')
    expect(result[0].status).toBe('待開始')
    expect(result[0].remark).toBe('')
  })

  it('falls back to General when brand is missing', () => {
    const raw = JSON.stringify([{ content: 'Some task', deadline: null }])
    const result = parseGeminiResponse(raw, '2026-05-02')
    expect(result[0].brand).toBe('General')
  })

  it('returns empty array on malformed JSON', () => {
    expect(parseGeminiResponse('not json', '2026-05-02')).toEqual([])
  })

  it('sets deadline to null when not provided', () => {
    const raw = JSON.stringify([{ brand: 'Consguard', content: '護膚品上架' }])
    const result = parseGeminiResponse(raw, '2026-05-02')
    expect(result[0].deadline).toBeNull()
  })
})
