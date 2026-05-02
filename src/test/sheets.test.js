import { describe, it, expect, vi, beforeEach } from 'vitest'

const MOCK_URL = 'https://script.google.com/mock'
vi.stubEnv('VITE_APPS_SCRIPT_URL', MOCK_URL)

describe('sheetsApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('saveMeeting sends correct action payload', async () => {
    fetch.mockResolvedValueOnce({ json: () => Promise.resolve({ meeting_id: 'abc123' }) })
    const { sheetsApi } = await import('../api/sheets.js')
    const result = await sheetsApi.saveMeeting({
      date: '2026-05-02',
      meeting_name: 'Brand Strategy',
      raw_notes: 'InLife 做推廣',
    })
    expect(fetch).toHaveBeenCalledWith(MOCK_URL, expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('"action":"saveMeeting"'),
    }))
    expect(result.meeting_id).toBe('abc123')
  })

  it('updateTask sends task_id and status', async () => {
    fetch.mockResolvedValueOnce({ json: () => Promise.resolve({ updated: true }) })
    const { sheetsApi } = await import('../api/sheets.js')
    await sheetsApi.updateTask({ task_id: 'xyz', status: '進行中' })
    expect(fetch).toHaveBeenCalledWith(MOCK_URL, expect.objectContaining({
      body: expect.stringContaining('"action":"updateTask"'),
    }))
  })
})
