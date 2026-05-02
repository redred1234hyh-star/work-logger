# Work Logger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal React web app for recording meeting notes across 5 brands, auto-parsing them with Gemini AI, and tracking tasks with list and calendar views — all backed by Google Sheets.

**Architecture:** React + Vite frontend on GitHub Pages. Google Apps Script acts as a REST-like API layer over Google Sheets (no OAuth needed). Gemini API (free, `gemini-1.5-flash`) parses free-text meeting notes into structured brand/task JSON client-side.

**Tech Stack:** React 18, Vite 5, Tailwind CSS v3, @dnd-kit/core (Kanban drag-drop), Vitest + React Testing Library, Google Apps Script, Gemini API

---

## File Structure

```
work-logger/
├── src/
│   ├── main.jsx                          # React entry point
│   ├── App.jsx                           # Root with tab state
│   ├── config/
│   │   └── brands.js                     # Brand IDs, labels, Tailwind colour classes, status options
│   ├── api/
│   │   ├── sheets.js                     # Apps Script API client (fetch wrapper)
│   │   └── gemini.js                     # Gemini API call + response parser
│   ├── hooks/
│   │   ├── useTasks.js                   # Task load/update state
│   │   └── useMeetings.js                # Parse + save meeting flow state
│   ├── pages/
│   │   ├── MeetingInput.jsx              # 開會記錄 page
│   │   ├── TaskList.jsx                  # 任務列表 page (3 views)
│   │   ├── CalendarPage.jsx              # Calendar page (2 views)
│   │   └── MeetingArchive.jsx            # 會議記錄 archive page
│   └── components/
│       ├── TopNav.jsx                    # Scrollable top tab bar
│       ├── BrandTag.jsx                  # Coloured brand pill
│       ├── LoadingSpinner.jsx            # Animated loading state
│       ├── meeting/
│       │   ├── MeetingForm.jsx           # Date / name / notes input form
│       │   └── ParsedResults.jsx         # AI parsed results confirmation panel
│       ├── tasks/
│       │   ├── StatusSelect.jsx          # Inline status dropdown
│       │   ├── FilterTable.jsx           # Mode A: brand filter chips + sortable table
│       │   ├── BrandGroups.jsx           # Mode B: collapsible brand sections
│       │   ├── KanbanCard.jsx            # Draggable task card
│       │   └── KanbanBoard.jsx           # Mode C: dnd-kit drag-drop columns
│       └── calendar/
│           ├── MonthCalendar.jsx         # Monthly grid with brand-coloured event tags
│           └── Timeline.jsx              # Chronological upcoming events list
├── apps-script/
│   └── Code.gs                          # Google Apps Script backend (paste into GAS editor)
├── src/test/
│   ├── setup.js
│   ├── sheets.test.js
│   └── gemini.test.js
├── .github/workflows/
│   └── deploy.yml                       # GitHub Pages CI/CD
├── .env.example
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `src/main.jsx`, `src/index.css`, `src/test/setup.js`, `.env.example`

- [ ] **Step 1: Initialise Vite React project**

Run in `/Users/redhui/Downloads/Claude Code/work-logger`:
```bash
npm create vite@latest . -- --template react
```
When prompted about non-empty directory, choose **Ignore files and continue**.

- [ ] **Step 2: Install all dependencies**
```bash
npm install
npm install -D tailwindcss@3 postcss autoprefixer
npm install @dnd-kit/core @dnd-kit/utilities
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
npx tailwindcss init -p
```

- [ ] **Step 3: Configure Tailwind — replace `tailwind.config.js`**
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

- [ ] **Step 4: Add Tailwind directives — replace `src/index.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5: Update `vite.config.js`**
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/work-logger/',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
```

- [ ] **Step 6: Create `src/test/setup.js`**
```js
import '@testing-library/jest-dom'
```

- [ ] **Step 7: Add test script — update `package.json` scripts section**
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:ui": "vitest --ui"
}
```

- [ ] **Step 8: Create `.env.example`**
```
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

- [ ] **Step 9: Create `.env` (local, never committed)**

Copy `.env.example` to `.env` — leave values as placeholders until Tasks 3–4 are done.

- [ ] **Step 10: Verify `.gitignore` contains**
```
.env
.env.local
dist
```

- [ ] **Step 11: Replace `src/App.jsx` with a placeholder**
```jsx
export default function App() {
  return <div className="p-4 text-gray-600">Work Logger — scaffolding OK</div>
}
```

Delete `src/assets/react.svg` and `public/vite.svg` if present.

- [ ] **Step 12: Verify dev server starts**
```bash
npm run dev
```
Expected: Server at http://localhost:5173/work-logger/ shows "Work Logger — scaffolding OK".

- [ ] **Step 13: Initialise git and commit**
```bash
git init
git add -A
git commit -m "feat: scaffold React + Vite + Tailwind project"
```

---

### Task 2: Brand Config

**Files:**
- Create: `src/config/brands.js`

- [ ] **Step 1: Write `src/config/brands.js`**
```js
export const BRANDS = [
  {
    id: 'InLife',
    label: 'InLife',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
  },
  {
    id: 'Minus Plus',
    label: 'Minus Plus',
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    border: 'border-pink-200',
  },
  {
    id: 'Miris Spa',
    label: 'Miris Spa',
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    border: 'border-amber-200',
  },
  {
    id: 'Miris Mama',
    label: 'Miris Mama',
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'border-rose-200',
  },
  {
    id: 'Consguard',
    label: 'Consguard',
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    border: 'border-slate-200',
  },
  {
    id: 'General',
    label: 'General',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-200',
  },
]

export const BRAND_IDS = BRANDS.map((b) => b.id)
export const BRAND_NAMES = BRANDS.filter((b) => b.id !== 'General').map((b) => b.label)

export function getBrand(id) {
  return BRANDS.find((b) => b.id === id) ?? BRANDS.find((b) => b.id === 'General')
}

export const STATUS_OPTIONS = ['待開始', '進行中', '待審批', '已完成']
```

- [ ] **Step 2: Commit**
```bash
git add src/config/brands.js
git commit -m "feat: add brand config and status options"
```

---

### Task 3: Google Apps Script Backend

**Files:**
- Create: `apps-script/Code.gs`

- [ ] **Step 1: Create `apps-script/Code.gs`**
```javascript
const SS = SpreadsheetApp.getActiveSpreadsheet()
const MEETINGS_SHEET = 'raw_meetings'
const TASKS_SHEET = 'tasks'

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents)
    let result

    if (data.action === 'saveMeeting') result = saveMeeting(data)
    else if (data.action === 'saveTasks') result = saveTasks(data)
    else if (data.action === 'getTasks') result = getTasks(data)
    else if (data.action === 'updateTask') result = updateTask(data)
    else if (data.action === 'getMeetings') result = getMeetings()
    else result = { error: 'Unknown action' }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON)
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function saveMeeting({ date, meeting_name, raw_notes }) {
  const sheet = SS.getSheetByName(MEETINGS_SHEET)
  const meeting_id = makeId()
  sheet.appendRow([meeting_id, date, meeting_name, raw_notes, new Date().toISOString()])
  return { meeting_id }
}

function saveTasks({ meeting_id, tasks }) {
  const sheet = SS.getSheetByName(TASKS_SHEET)
  tasks.forEach(task => {
    sheet.appendRow([
      makeId(),
      meeting_id,
      task.brand,
      task.content,
      task.future_direction ?? '',
      task.deadline ?? '',
      task.meeting_date,
      '待開始',
      '',
      new Date().toISOString(),
    ])
  })
  return { saved: tasks.length }
}

function getTasks({ filters } = {}) {
  const sheet = SS.getSheetByName(TASKS_SHEET)
  const rows = sheet.getDataRange().getValues()
  if (rows.length <= 1) return { tasks: [] }
  const headers = rows[0]
  let tasks = rows.slice(1).map(row => {
    const obj = {}
    headers.forEach((h, i) => { obj[h] = row[i] })
    return obj
  })
  if (filters?.brand && filters.brand !== 'All') tasks = tasks.filter(t => t.brand === filters.brand)
  if (filters?.status) tasks = tasks.filter(t => t.status === filters.status)
  return { tasks }
}

function updateTask({ task_id, status, remark }) {
  const sheet = SS.getSheetByName(TASKS_SHEET)
  const rows = sheet.getDataRange().getValues()
  const headers = rows[0]
  const idCol = headers.indexOf('task_id')
  const statusCol = headers.indexOf('status')
  const remarkCol = headers.indexOf('remark')
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idCol] === task_id) {
      if (status !== undefined) sheet.getRange(i + 1, statusCol + 1).setValue(status)
      if (remark !== undefined) sheet.getRange(i + 1, remarkCol + 1).setValue(remark)
      return { updated: true }
    }
  }
  return { updated: false }
}

function getMeetings() {
  const sheet = SS.getSheetByName(MEETINGS_SHEET)
  const rows = sheet.getDataRange().getValues()
  if (rows.length <= 1) return { meetings: [] }
  const headers = rows[0]
  const meetings = rows.slice(1).map(row => {
    const obj = {}
    headers.forEach((h, i) => { obj[h] = row[i] })
    return obj
  }).reverse()
  return { meetings }
}
```

- [ ] **Step 2: Manual Google Sheets + Apps Script setup**

> ⚠️ **USER ACTION REQUIRED** — do this once before running the app:
>
> 1. Go to https://sheets.new — create a spreadsheet named **"Work Logger"**
> 2. Rename Sheet1 to `raw_meetings`
> 3. Add a second sheet named `tasks`
> 4. In `raw_meetings` row 1, add these headers in columns A–E:
>    `meeting_id | date | meeting_name | raw_notes | created_at`
> 5. In `tasks` row 1, add headers in columns A–J:
>    `task_id | meeting_id | brand | content | future_direction | deadline | meeting_date | status | remark | created_at`
> 6. Click **Extensions → Apps Script**
> 7. Replace all default code with the full contents of `apps-script/Code.gs`
> 8. Click **Deploy → New deployment → Web App**
>    - Execute as: **Me**
>    - Who has access: **Anyone**
> 9. Copy the deployment URL (looks like `https://script.google.com/macros/s/ABC.../exec`)
> 10. Paste it into `.env` as `VITE_APPS_SCRIPT_URL`

- [ ] **Step 3: Commit**
```bash
git add apps-script/Code.gs
git commit -m "feat: add Google Apps Script backend"
```

---

### Task 4: API Client — Sheets

**Files:**
- Create: `src/api/sheets.js`
- Create: `src/test/sheets.test.js`

- [ ] **Step 1: Write failing test — create `src/test/sheets.test.js`**
```js
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
```

- [ ] **Step 2: Run test — confirm it fails**
```bash
npm test
```
Expected: FAIL — `Cannot find module '../api/sheets.js'`

- [ ] **Step 3: Write `src/api/sheets.js`**
```js
const URL = import.meta.env.VITE_APPS_SCRIPT_URL

async function post(payload) {
  const res = await fetch(URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.json()
}

export const sheetsApi = {
  saveMeeting: (data) => post({ action: 'saveMeeting', ...data }),
  saveTasks: (data) => post({ action: 'saveTasks', ...data }),
  getTasks: (filters) => post({ action: 'getTasks', filters }),
  updateTask: (data) => post({ action: 'updateTask', ...data }),
  getMeetings: () => post({ action: 'getMeetings' }),
}
```

- [ ] **Step 4: Run tests — confirm they pass**
```bash
npm test
```
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**
```bash
git add src/api/sheets.js src/test/sheets.test.js
git commit -m "feat: add Sheets API client with tests"
```

---

### Task 5: API Client — Gemini

**Files:**
- Create: `src/api/gemini.js`
- Create: `src/test/gemini.test.js`

- [ ] **Step 1: Write failing test — create `src/test/gemini.test.js`**
```js
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
```

- [ ] **Step 2: Run test — confirm it fails**
```bash
npm test
```
Expected: FAIL — `Cannot find module '../api/gemini.js'`

- [ ] **Step 3: Write `src/api/gemini.js`**
```js
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
```

- [ ] **Step 4: Run tests — confirm they pass**
```bash
npm test
```
Expected: PASS (4 tests)

- [ ] **Step 5: Get Gemini API key**

> ⚠️ **USER ACTION REQUIRED:**
> 1. Go to https://aistudio.google.com/app/apikey
> 2. Click **Create API key**
> 3. Paste the key into `.env` as `VITE_GEMINI_API_KEY`

- [ ] **Step 6: Commit**
```bash
git add src/api/gemini.js src/test/gemini.test.js
git commit -m "feat: add Gemini API client with parsing tests"
```

---

### Task 6: App Shell + TopNav

**Files:**
- Create: `src/components/TopNav.jsx`
- Create: `src/pages/MeetingInput.jsx` (placeholder)
- Create: `src/pages/TaskList.jsx` (placeholder)
- Create: `src/pages/CalendarPage.jsx` (placeholder)
- Create: `src/pages/MeetingArchive.jsx` (placeholder)
- Modify: `src/App.jsx`

- [ ] **Step 1: Write `src/components/TopNav.jsx`**
```jsx
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
```

- [ ] **Step 2: Create placeholder pages**

Create `src/pages/MeetingInput.jsx`:
```jsx
export default function MeetingInput() {
  return <div className="py-8 text-gray-400 text-sm">開會記錄 — coming soon</div>
}
```

Create `src/pages/TaskList.jsx`:
```jsx
export default function TaskList() {
  return <div className="py-8 text-gray-400 text-sm">任務列表 — coming soon</div>
}
```

Create `src/pages/CalendarPage.jsx`:
```jsx
export default function CalendarPage() {
  return <div className="py-8 text-gray-400 text-sm">Calendar — coming soon</div>
}
```

Create `src/pages/MeetingArchive.jsx`:
```jsx
export default function MeetingArchive() {
  return <div className="py-8 text-gray-400 text-sm">會議記錄 — coming soon</div>
}
```

- [ ] **Step 3: Replace `src/App.jsx`**
```jsx
import { useState } from 'react'
import TopNav from './components/TopNav'
import MeetingInput from './pages/MeetingInput'
import TaskList from './pages/TaskList'
import CalendarPage from './pages/CalendarPage'
import MeetingArchive from './pages/MeetingArchive'

export default function App() {
  const [activeTab, setActiveTab] = useState('meeting')

  const pages = {
    meeting: <MeetingInput />,
    tasks: <TaskList />,
    calendar: <CalendarPage />,
    archive: <MeetingArchive />,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-5xl mx-auto px-4 py-2">
        {pages[activeTab]}
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Verify in browser**
```bash
npm run dev
```
Open http://localhost:5173/work-logger/ — 4 tabs visible at top, clicking switches the content area.

- [ ] **Step 5: Commit**
```bash
git add src/components/TopNav.jsx src/App.jsx src/pages/
git commit -m "feat: add app shell with top tab navigation"
```

---

### Task 7: Shared UI Components

**Files:**
- Create: `src/components/BrandTag.jsx`
- Create: `src/components/LoadingSpinner.jsx`
- Create: `src/components/tasks/StatusSelect.jsx`

- [ ] **Step 1: Write `src/components/BrandTag.jsx`**
```jsx
import { getBrand } from '../config/brands'

export default function BrandTag({ brandId, size = 'sm' }) {
  const brand = getBrand(brandId)
  const cls = size === 'xs' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'
  return (
    <span className={`inline-block rounded-full font-medium ${cls} ${brand.bg} ${brand.text}`}>
      {brand.label}
    </span>
  )
}
```

- [ ] **Step 2: Write `src/components/LoadingSpinner.jsx`**
```jsx
export default function LoadingSpinner({ text = '處理中...' }) {
  return (
    <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      {text}
    </div>
  )
}
```

- [ ] **Step 3: Write `src/components/tasks/StatusSelect.jsx`**
```jsx
import { STATUS_OPTIONS } from '../../config/brands'

const STYLE = {
  '待開始': 'bg-gray-100 text-gray-600',
  '進行中': 'bg-yellow-50 text-yellow-700',
  '待審批': 'bg-blue-50 text-blue-700',
  '已完成': 'bg-green-50 text-green-700',
}

export default function StatusSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`text-xs rounded px-2 py-1 border-0 font-medium cursor-pointer focus:ring-1 focus:ring-indigo-300 ${STYLE[value] ?? 'bg-gray-100'}`}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  )
}
```

- [ ] **Step 4: Commit**
```bash
git add src/components/BrandTag.jsx src/components/LoadingSpinner.jsx src/components/tasks/StatusSelect.jsx
git commit -m "feat: add BrandTag, LoadingSpinner, StatusSelect components"
```

---

### Task 8: useTasks + useMeetings Hooks

**Files:**
- Create: `src/hooks/useTasks.js`
- Create: `src/hooks/useMeetings.js`

- [ ] **Step 1: Write `src/hooks/useTasks.js`**
```js
import { useState, useEffect, useCallback } from 'react'
import { sheetsApi } from '../api/sheets'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try {
      const { tasks: data } = await sheetsApi.getTasks()
      setTasks(data ?? [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadTasks() }, [loadTasks])

  const updateTask = useCallback(async (task_id, updates) => {
    await sheetsApi.updateTask({ task_id, ...updates })
    setTasks((prev) =>
      prev.map((t) => (t.task_id === task_id ? { ...t, ...updates } : t))
    )
  }, [])

  return { tasks, loading, error, reload: loadTasks, updateTask }
}
```

- [ ] **Step 2: Write `src/hooks/useMeetings.js`**
```js
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
    } catch {
      setError('AI 解析失敗，請重試')
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
```

- [ ] **Step 3: Commit**
```bash
git add src/hooks/useTasks.js src/hooks/useMeetings.js
git commit -m "feat: add useTasks and useMeetings hooks"
```

---

### Task 9: Meeting Input Page

**Files:**
- Create: `src/components/meeting/MeetingForm.jsx`
- Create: `src/components/meeting/ParsedResults.jsx`
- Modify: `src/pages/MeetingInput.jsx`

- [ ] **Step 1: Write `src/components/meeting/MeetingForm.jsx`**
```jsx
import { useState } from 'react'
import LoadingSpinner from '../LoadingSpinner'

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export default function MeetingForm({ onSubmit, loading }) {
  const [date, setDate] = useState(todayISO())
  const [meetingName, setMeetingName] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!notes.trim()) return
    onSubmit({ date, meeting_name: meetingName, raw_notes: notes })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">會議日期</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-xs text-gray-500">會議名稱</label>
          <input
            type="text"
            value={meetingName}
            onChange={(e) => setMeetingName(e.target.value)}
            placeholder="例：品牌策略月會"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">會議內容（自由輸入）</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="例：InLife 下個月做中醫正骨推廣，五月底前出 social posts。Miris Spa 要新 banner，六月初交稿..."
          rows={9}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {loading ? (
        <LoadingSpinner text="AI 解析中..." />
      ) : (
        <button
          type="submit"
          disabled={!notes.trim()}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ✨ AI 解析並儲存
        </button>
      )}
    </form>
  )
}
```

- [ ] **Step 2: Write `src/components/meeting/ParsedResults.jsx`**
```jsx
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
```

- [ ] **Step 3: Replace `src/pages/MeetingInput.jsx`**
```jsx
import { useState } from 'react'
import MeetingForm from '../components/meeting/MeetingForm'
import ParsedResults from '../components/meeting/ParsedResults'
import { useMeetings } from '../hooks/useMeetings'

export default function MeetingInput() {
  const { parsing, saving, parsedTasks, meetingMeta, error, parseNotes, confirmSave, cancelParsed } = useMeetings()
  const [saved, setSaved] = useState(false)

  const handleConfirm = async () => {
    const result = await confirmSave()
    if (result?.success) setSaved(true)
  }

  if (saved) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="text-5xl">✅</div>
        <p className="text-gray-700 font-medium">會議記錄已儲存！</p>
        <button
          onClick={() => setSaved(false)}
          className="text-indigo-600 text-sm hover:underline"
        >
          記錄另一個會議
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-4">
      <h1 className="text-lg font-semibold text-gray-800">🎤 開會記錄</h1>

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
```

- [ ] **Step 4: Verify in browser**

Run `npm run dev`, go to 開會記錄 tab. Fill in date + name + notes, click the button. Without API keys, expect an error message to appear (not a crash). The form UI should look clean.

- [ ] **Step 5: Commit**
```bash
git add src/components/meeting/ src/pages/MeetingInput.jsx
git commit -m "feat: implement meeting input page with AI parsing flow"
```

---

### Task 10: FilterTable View (Mode A)

**Files:**
- Create: `src/components/tasks/FilterTable.jsx`

- [ ] **Step 1: Write `src/components/tasks/FilterTable.jsx`**
```jsx
import { useState } from 'react'
import BrandTag from '../BrandTag'
import StatusSelect from './StatusSelect'
import { BRANDS } from '../../config/brands'

export default function FilterTable({ tasks, onUpdateTask }) {
  const [activeBrand, setActiveBrand] = useState('All')
  const [sortKey, setSortKey] = useState('deadline')
  const [sortAsc, setSortAsc] = useState(true)
  const [editingRemark, setEditingRemark] = useState(null)
  const [remarkDraft, setRemarkDraft] = useState('')

  const filtered = tasks
    .filter((t) => activeBrand === 'All' || t.brand === activeBrand)
    .sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
    })

  const toggleSort = (key) => {
    if (sortKey === key) setSortAsc((p) => !p)
    else { setSortKey(key); setSortAsc(true) }
  }

  const saveRemark = (task_id) => {
    onUpdateTask(task_id, { remark: remarkDraft })
    setEditingRemark(null)
  }

  const SortBtn = ({ col, label }) => (
    <button onClick={() => toggleSort(col)} className="flex items-center gap-0.5 hover:text-indigo-600">
      {label}{sortKey === col && <span>{sortAsc ? ' ↑' : ' ↓'}</span>}
    </button>
  )

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveBrand('All')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${activeBrand === 'All' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          全部 ({tasks.length})
        </button>
        {BRANDS.filter((b) => b.id !== 'General').map((b) => {
          const count = tasks.filter((t) => t.brand === b.id).length
          if (count === 0) return null
          return (
            <button
              key={b.id}
              onClick={() => setActiveBrand(b.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${activeBrand === b.id ? `${b.bg} ${b.text} ring-1 ring-offset-1 ring-current` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {b.label} ({count})
            </button>
          )
        })}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="px-3 py-2 text-left font-medium"><SortBtn col="brand" label="品牌" /></th>
              <th className="px-3 py-2 text-left font-medium">內容</th>
              <th className="px-3 py-2 text-left font-medium"><SortBtn col="meeting_date" label="會議日期" /></th>
              <th className="px-3 py-2 text-left font-medium"><SortBtn col="deadline" label="Deadline" /></th>
              <th className="px-3 py-2 text-left font-medium"><SortBtn col="status" label="狀態" /></th>
              <th className="px-3 py-2 text-left font-medium">Remark</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-gray-400 text-sm">暫無記錄</td></tr>
            )}
            {filtered.map((task) => (
              <tr key={task.task_id} className="hover:bg-gray-50">
                <td className="px-3 py-2.5"><BrandTag brandId={task.brand} /></td>
                <td className="px-3 py-2.5 text-gray-700 max-w-xs">
                  <div className="text-sm">{task.content}</div>
                  {task.future_direction && (
                    <div className="text-xs text-gray-400 mt-0.5">→ {task.future_direction}</div>
                  )}
                </td>
                <td className="px-3 py-2.5 text-xs text-gray-500">{task.meeting_date}</td>
                <td className="px-3 py-2.5 text-xs">
                  {task.deadline
                    ? <span className={new Date(task.deadline) < new Date() ? 'text-red-500 font-medium' : 'text-gray-600'}>{task.deadline}</span>
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-3 py-2.5">
                  <StatusSelect value={task.status} onChange={(val) => onUpdateTask(task.task_id, { status: val })} />
                </td>
                <td className="px-3 py-2.5 text-xs">
                  {editingRemark === task.task_id ? (
                    <div className="flex gap-1">
                      <input
                        autoFocus
                        value={remarkDraft}
                        onChange={(e) => setRemarkDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveRemark(task.task_id); if (e.key === 'Escape') setEditingRemark(null) }}
                        className="border border-gray-300 rounded px-1 py-0.5 text-xs w-28 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                      />
                      <button onClick={() => saveRemark(task.task_id)} className="text-indigo-600">✓</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingRemark(task.task_id); setRemarkDraft(task.remark ?? '') }}
                      className="text-left min-w-[4rem] text-gray-400 hover:text-gray-700"
                    >
                      {task.remark || <span className="text-gray-300">+ 備注</span>}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add src/components/tasks/FilterTable.jsx
git commit -m "feat: add FilterTable task view with sorting and inline remark edit"
```

---

### Task 11: BrandGroups View (Mode B)

**Files:**
- Create: `src/components/tasks/BrandGroups.jsx`

- [ ] **Step 1: Write `src/components/tasks/BrandGroups.jsx`**
```jsx
import { useState } from 'react'
import { BRANDS } from '../../config/brands'
import StatusSelect from './StatusSelect'

export default function BrandGroups({ tasks, onUpdateTask }) {
  const [collapsed, setCollapsed] = useState({})
  const [editingRemark, setEditingRemark] = useState(null)
  const [remarkDraft, setRemarkDraft] = useState('')

  const saveRemark = (task_id) => {
    onUpdateTask(task_id, { remark: remarkDraft })
    setEditingRemark(null)
  }

  return (
    <div className="space-y-3">
      {BRANDS.map((brand) => {
        const brandTasks = tasks.filter((t) => t.brand === brand.id)
        if (brandTasks.length === 0) return null
        const isCollapsed = collapsed[brand.id]

        return (
          <div key={brand.id} className={`rounded-xl border-2 ${brand.border} overflow-hidden`}>
            <button
              onClick={() => setCollapsed((p) => ({ ...p, [brand.id]: !p[brand.id] }))}
              className={`w-full flex items-center justify-between px-4 py-3 ${brand.bg} hover:opacity-90 transition-opacity`}
            >
              <div className="flex items-center gap-2">
                <span className={`font-semibold text-sm ${brand.text}`}>{brand.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full bg-white bg-opacity-70 ${brand.text}`}>
                  {brandTasks.length}
                </span>
              </div>
              <span className={`text-xs ${brand.text}`}>{isCollapsed ? '▶' : '▼'}</span>
            </button>

            {!isCollapsed && (
              <div className="divide-y divide-gray-100 bg-white">
                {brandTasks.map((task) => (
                  <div key={task.task_id} className="px-4 py-3 space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-gray-800 flex-1 leading-relaxed">{task.content}</p>
                      <StatusSelect value={task.status} onChange={(val) => onUpdateTask(task.task_id, { status: val })} />
                    </div>
                    {task.future_direction && (
                      <p className="text-xs text-gray-400">→ {task.future_direction}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                      <span>📋 {task.meeting_date}</span>
                      {task.deadline && (
                        <span className={new Date(task.deadline) < new Date() ? 'text-red-500 font-medium' : ''}>
                          截止 {task.deadline}
                        </span>
                      )}
                      {editingRemark === task.task_id ? (
                        <div className="flex gap-1 ml-auto">
                          <input
                            autoFocus
                            value={remarkDraft}
                            onChange={(e) => setRemarkDraft(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveRemark(task.task_id); if (e.key === 'Escape') setEditingRemark(null) }}
                            className="border border-gray-300 rounded px-1.5 py-0.5 text-xs w-36 focus:outline-none"
                          />
                          <button onClick={() => saveRemark(task.task_id)} className="text-indigo-600">✓</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingRemark(task.task_id); setRemarkDraft(task.remark ?? '') }}
                          className="ml-auto text-gray-300 hover:text-gray-500 transition-colors"
                        >
                          {task.remark || '+ remark'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add src/components/tasks/BrandGroups.jsx
git commit -m "feat: add BrandGroups task view with collapsible sections"
```

---

### Task 12: KanbanBoard View (Mode C)

**Files:**
- Create: `src/components/tasks/KanbanCard.jsx`
- Create: `src/components/tasks/KanbanBoard.jsx`

- [ ] **Step 1: Write `src/components/tasks/KanbanCard.jsx`**
```jsx
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import BrandTag from '../BrandTag'

export default function KanbanCard({ task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.task_id,
    data: { task },
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : 1 }}
      {...listeners}
      {...attributes}
      className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm cursor-grab active:cursor-grabbing space-y-2 touch-none select-none"
    >
      <BrandTag brandId={task.brand} size="xs" />
      <p className="text-xs text-gray-700 leading-relaxed">{task.content}</p>
      {task.deadline && (
        <p className={`text-xs ${new Date(task.deadline) < new Date() ? 'text-red-500' : 'text-gray-400'}`}>
          📅 {task.deadline}
        </p>
      )}
      {task.remark && (
        <p className="text-xs text-gray-400 italic truncate">{task.remark}</p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Write `src/components/tasks/KanbanBoard.jsx`**
```jsx
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import KanbanCard from './KanbanCard'
import { STATUS_OPTIONS } from '../../config/brands'

const COLUMN_STYLE = {
  '待開始': 'bg-gray-50 border-gray-200',
  '進行中': 'bg-yellow-50 border-yellow-200',
  '待審批': 'bg-blue-50 border-blue-200',
  '已完成': 'bg-green-50 border-green-200',
}

function Column({ status, tasks }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  return (
    <div className={`flex-1 min-w-[200px] rounded-xl border-2 ${COLUMN_STYLE[status]} ${isOver ? 'ring-2 ring-indigo-400 ring-offset-1' : ''} transition-all`}>
      <div className="px-3 py-2.5 border-b border-inherit">
        <span className="text-xs font-semibold text-gray-600">{status}</span>
        <span className="ml-2 text-xs text-gray-400">{tasks.length}</span>
      </div>
      <div ref={setNodeRef} className="p-2 space-y-2 min-h-[160px]">
        {tasks.map((task) => <KanbanCard key={task.task_id} task={task} />)}
      </div>
    </div>
  )
}

export default function KanbanBoard({ tasks, onUpdateTask }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  const handleDragEnd = ({ active, over }) => {
    if (!over) return
    const task = active.data.current?.task
    if (task && task.status !== over.id) {
      onUpdateTask(task.task_id, { status: over.id })
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STATUS_OPTIONS.map((status) => (
          <Column key={status} status={status} tasks={tasks.filter((t) => t.status === status)} />
        ))}
      </div>
    </DndContext>
  )
}
```

- [ ] **Step 3: Commit**
```bash
git add src/components/tasks/KanbanCard.jsx src/components/tasks/KanbanBoard.jsx
git commit -m "feat: add Kanban board with touch-supported drag-and-drop"
```

---

### Task 13: TaskList Page

**Files:**
- Modify: `src/pages/TaskList.jsx`

- [ ] **Step 1: Replace `src/pages/TaskList.jsx`**
```jsx
import { useState } from 'react'
import { useTasks } from '../hooks/useTasks'
import FilterTable from '../components/tasks/FilterTable'
import BrandGroups from '../components/tasks/BrandGroups'
import KanbanBoard from '../components/tasks/KanbanBoard'
import LoadingSpinner from '../components/LoadingSpinner'

const VIEWS = [
  { id: 'table', label: '📊 表格' },
  { id: 'groups', label: '🏷 品牌分組' },
  { id: 'kanban', label: '📌 Kanban' },
]

export default function TaskList() {
  const { tasks, loading, error, updateTask } = useTasks()
  const [view, setView] = useState('table')

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-lg font-semibold text-gray-800">📋 任務列表</h1>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                view === v.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <LoadingSpinner text="載入任務中..." />}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {!loading && !error && (
        <>
          {view === 'table' && <FilterTable tasks={tasks} onUpdateTask={updateTask} />}
          {view === 'groups' && <BrandGroups tasks={tasks} onUpdateTask={updateTask} />}
          {view === 'kanban' && <KanbanBoard tasks={tasks} onUpdateTask={updateTask} />}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Go to 任務列表 tab — see 3 view toggle buttons (表格 / 品牌分組 / Kanban). Click each to confirm they switch without errors.

- [ ] **Step 3: Commit**
```bash
git add src/pages/TaskList.jsx
git commit -m "feat: implement task list page with 3 view modes"
```

---

### Task 14: MonthCalendar Component

**Files:**
- Create: `src/components/calendar/MonthCalendar.jsx`

- [ ] **Step 1: Write `src/components/calendar/MonthCalendar.jsx`**
```jsx
import { useState } from 'react'
import { getBrand } from '../../config/brands'

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayMon(year, month) {
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1
}

const MONTHS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
const DAYS = ['一','二','三','四','五','六','日']

export default function MonthCalendar({ tasks, meetings }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [popover, setPopover] = useState(null)

  const todayStr = now.toISOString().split('T')[0]
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayMon(year, month)

  const pad = (n) => String(n).padStart(2, '0')
  const dateStr = (d) => `${year}-${pad(month + 1)}-${pad(d)}`

  const getEvents = (d) => {
    const ds = dateStr(d)
    return {
      deadlines: tasks.filter((t) => t.deadline === ds),
      mtgs: (meetings ?? []).filter((m) => m.date === ds),
    }
  }

  const prev = () => month === 0 ? (setYear(y => y - 1), setMonth(11)) : setMonth(m => m - 1)
  const next = () => month === 11 ? (setYear(y => y + 1), setMonth(0)) : setMonth(m => m + 1)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 select-none" onClick={() => setPopover(null)}>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-500">‹</button>
        <span className="font-semibold text-gray-800">{year}年 {MONTHS[month]}</span>
        <button onClick={next} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-500">›</button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-lg overflow-hidden">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e${i}`} className="bg-white min-h-[64px]" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1
          const ds = dateStr(d)
          const { deadlines, mtgs } = getEvents(d)
          const hasEvents = deadlines.length + mtgs.length > 0
          const isToday = ds === todayStr

          return (
            <div
              key={d}
              onClick={(e) => { e.stopPropagation(); if (hasEvents) setPopover(popover === ds ? null : ds) }}
              className={`bg-white min-h-[64px] p-1 relative ${hasEvents ? 'cursor-pointer hover:bg-gray-50' : ''} ${isToday ? 'ring-1 ring-inset ring-indigo-400' : ''}`}
            >
              <span className={`text-xs font-medium ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>{d}</span>
              <div className="space-y-0.5 mt-0.5">
                {mtgs.map((m, idx) => (
                  <div key={idx} className="text-[10px] bg-purple-100 text-purple-700 rounded px-1 truncate">
                    📋 {m.meeting_name || '會議'}
                  </div>
                ))}
                {deadlines.map((t, idx) => {
                  const brand = getBrand(t.brand)
                  return (
                    <div key={idx} className={`text-[10px] rounded px-1 truncate ${brand.bg} ${brand.text}`}>
                      {t.content}
                    </div>
                  )
                })}
              </div>

              {popover === ds && (
                <div
                  className="absolute top-full left-0 z-20 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-64 space-y-2 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="font-semibold text-gray-700">{ds}</p>
                  {mtgs.map((m, idx) => (
                    <div key={idx} className="bg-purple-50 rounded-lg p-2">
                      <p className="font-medium text-purple-700">📋 {m.meeting_name}</p>
                    </div>
                  ))}
                  {deadlines.map((t, idx) => {
                    const brand = getBrand(t.brand)
                    return (
                      <div key={idx} className={`rounded-lg p-2 ${brand.bg}`}>
                        <p className={`font-semibold ${brand.text}`}>{brand.label}</p>
                        <p className="text-gray-700 mt-0.5">{t.content}</p>
                        {t.future_direction && <p className="text-gray-400 mt-0.5">→ {t.future_direction}</p>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add src/components/calendar/MonthCalendar.jsx
git commit -m "feat: add monthly calendar with brand-coloured event tags"
```

---

### Task 15: Timeline Component

**Files:**
- Create: `src/components/calendar/Timeline.jsx`

- [ ] **Step 1: Write `src/components/calendar/Timeline.jsx`**
```jsx
import BrandTag from '../BrandTag'

export default function Timeline({ tasks, meetings }) {
  const todayStr = new Date().toISOString().split('T')[0]

  const events = [
    ...(meetings ?? []).map((m) => ({
      date: m.date,
      type: 'meeting',
      label: m.meeting_name || '會議',
      brand: null,
      meta: null,
    })),
    ...tasks
      .filter((t) => t.deadline)
      .map((t) => ({
        date: t.deadline,
        type: 'deadline',
        label: t.content,
        brand: t.brand,
        meta: t.future_direction || null,
      })),
  ]
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))

  if (events.length === 0) {
    return <p className="text-gray-400 text-sm py-12 text-center">暫無即將到來的事項 ✨</p>
  }

  let lastDate = null

  return (
    <div className="space-y-0.5">
      {events.map((event, i) => {
        const showDate = event.date !== lastDate
        lastDate = event.date
        const isToday = event.date === todayStr

        return (
          <div key={i}>
            {showDate && (
              <div className="flex items-center gap-2 pt-4 pb-1">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isToday ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                  {isToday ? '今日' : event.date}
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
            )}
            <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg ${event.type === 'meeting' ? 'bg-purple-50' : 'bg-white border border-gray-100'}`}>
              {event.type === 'meeting'
                ? <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex-shrink-0">會議</span>
                : event.brand && <BrandTag brandId={event.brand} size="xs" />
              }
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">{event.label}</p>
                {event.meta && <p className="text-xs text-gray-400 mt-0.5 truncate">→ {event.meta}</p>}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add src/components/calendar/Timeline.jsx
git commit -m "feat: add timeline calendar component"
```

---

### Task 16: Calendar Page

**Files:**
- Modify: `src/pages/CalendarPage.jsx`

- [ ] **Step 1: Replace `src/pages/CalendarPage.jsx`**
```jsx
import { useState, useEffect } from 'react'
import { useTasks } from '../hooks/useTasks'
import { sheetsApi } from '../api/sheets'
import MonthCalendar from '../components/calendar/MonthCalendar'
import Timeline from '../components/calendar/Timeline'
import LoadingSpinner from '../components/LoadingSpinner'

const VIEWS = [
  { id: 'month', label: '📆 月曆' },
  { id: 'timeline', label: '📋 時間線' },
]

export default function CalendarPage() {
  const { tasks, loading } = useTasks()
  const [meetings, setMeetings] = useState([])
  const [view, setView] = useState(() => window.innerWidth < 768 ? 'timeline' : 'month')

  useEffect(() => {
    sheetsApi.getMeetings()
      .then(({ meetings: data }) => setMeetings(data ?? []))
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-lg font-semibold text-gray-800">📅 Calendar</h1>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                view === v.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <LoadingSpinner text="載入中..." />}
      {!loading && (
        <>
          {view === 'month' && <MonthCalendar tasks={tasks} meetings={meetings} />}
          {view === 'timeline' && <Timeline tasks={tasks} meetings={meetings} />}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add src/pages/CalendarPage.jsx
git commit -m "feat: implement calendar page with month and timeline views"
```

---

### Task 17: Meeting Archive Page

**Files:**
- Modify: `src/pages/MeetingArchive.jsx`

- [ ] **Step 1: Replace `src/pages/MeetingArchive.jsx`**
```jsx
import { useState, useEffect } from 'react'
import { sheetsApi } from '../api/sheets'
import LoadingSpinner from '../components/LoadingSpinner'
import BrandTag from '../components/BrandTag'
import { BRAND_NAMES } from '../config/brands'

function extractBrands(raw_notes) {
  return BRAND_NAMES.filter((b) => (raw_notes ?? '').includes(b))
}

export default function MeetingArchive() {
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    sheetsApi.getMeetings()
      .then(({ meetings: data }) => setMeetings(data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4 py-4">
      <h1 className="text-lg font-semibold text-gray-800">📁 會議記錄</h1>

      {loading && <LoadingSpinner text="載入會議記錄..." />}
      {!loading && meetings.length === 0 && (
        <p className="text-gray-400 text-sm py-12 text-center">暫無會議記錄</p>
      )}

      <div className="space-y-2">
        {meetings.map((m) => {
          const brands = extractBrands(m.raw_notes)
          const isExpanded = expanded === m.meeting_id

          return (
            <div key={m.meeting_id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(isExpanded ? null : m.meeting_id)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-800">
                      {m.meeting_name || '（未命名會議）'}
                    </span>
                    {brands.map((b) => <BrandTag key={b} brandId={b} size="xs" />)}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{m.date}</p>
                  {!isExpanded && (
                    <p className="text-xs text-gray-500 mt-1 truncate">{m.raw_notes}</p>
                  )}
                </div>
                <span className="text-gray-400 text-xs flex-shrink-0 mt-1">{isExpanded ? '▲' : '▼'}</span>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans bg-gray-50 rounded-lg p-3 leading-relaxed border border-gray-100">
                    {m.raw_notes}
                  </pre>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add src/pages/MeetingArchive.jsx
git commit -m "feat: implement meeting archive page"
```

---

### Task 18: GitHub Pages Deployment

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
        env:
          VITE_APPS_SCRIPT_URL: ${{ secrets.VITE_APPS_SCRIPT_URL }}
          VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Verify build passes locally**
```bash
npm run build
```
Expected: `dist/` folder created with no errors.

- [ ] **Step 3: GitHub setup instructions**

> ⚠️ **USER ACTION REQUIRED:**
>
> 1. Create a GitHub repo named `work-logger` at github.com
> 2. Push the project:
>    ```bash
>    git remote add origin https://github.com/YOUR_USERNAME/work-logger.git
>    git push -u origin main
>    ```
> 3. In GitHub repo → **Settings → Secrets and variables → Actions**, add:
>    - `VITE_APPS_SCRIPT_URL` — your Apps Script deployment URL
>    - `VITE_GEMINI_API_KEY` — your Gemini API key
> 4. In GitHub repo → **Settings → Pages**, set Source to **GitHub Actions**
> 5. Push any commit — the workflow deploys automatically
> 6. App live at: `https://YOUR_USERNAME.github.io/work-logger/`

- [ ] **Step 4: Final commit**
```bash
git add .github/
git commit -m "feat: add GitHub Pages deployment workflow"
```

---

## Setup Checklist (User)

Before the app works end-to-end:

- [ ] Create Google Sheet "Work Logger" with `raw_meetings` + `tasks` sheets and correct headers (Task 3 Step 2)
- [ ] Deploy Google Apps Script and copy URL to `.env` (Task 3 Step 2)
- [ ] Get Gemini API key and add to `.env` (Task 5 Step 5)
- [ ] Create GitHub repo and add both keys as GitHub Secrets (Task 18 Step 3)
