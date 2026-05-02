# Work Logger — Design Spec
Date: 2026-05-02

## Overview

A personal web app for Winnie (Assistant Marketing Manager) to record meeting notes during meetings, auto-parse them by brand using AI, and track tasks/deadlines across 5 brands.

**Brands managed:**
- InLife — 中醫正骨痛症療程
- Minus Plus — 八穴溫泉腳部美容院
- Miris Spa — 全身淋巴按摩
- Miris Mama — 孕婦按摩
- Consguard — 12星座護膚品

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React + Vite | Modern, fast, component-based |
| Styling | Tailwind CSS | Responsive, mobile-friendly |
| AI Parsing | Gemini API (free tier) | Extracts brands/tasks/deadlines from free text |
| Database | Google Sheets | Accessible from any device, no server needed |
| Backend API | Google Apps Script (Web App) | Handles Sheets read/write without OAuth complexity |
| Hosting | GitHub Pages | Free, accessible from any device |

---

## App Layout

**Top tab navigation** (scrollable tabs on mobile):
- 🎤 開會記錄
- 📋 任務列表
- 📅 Calendar
- 📁 會議記錄

---

## Pages & Features

### 1. 開會記錄 (Meeting Input)

**Flow:**
1. User fills in meeting date (auto-filled to today) and meeting name
2. User types free-form notes in a large text area during the meeting
3. User taps **「✨ AI 解析並儲存」**
4. Gemini API parses the text and extracts structured items
5. A confirmation panel shows the parsed results for review
6. User confirms → data saved to Google Sheets (both raw notes and parsed items)

**AI Parsing Output (per item):**
- Brand (one of the 5 brands, or "General" if unclear)
- Discussion content / action item
- Future direction / next steps
- Estimated completion date (deadline)
- Meeting date (inherited from input)

**Fallback:** If AI cannot detect a deadline, it sets it to blank (user fills manually later).

---

### 2. 任務列表 (Task List)

Three view modes toggled by buttons at the top:

**Mode A — 篩選表格 (Filter Table)**
- Brand filter chips at the top (All / InLife / Minus Plus / Miris Spa / Miris Mama / Consguard)
- Sortable table columns: Brand | Content | Meeting Date | Deadline | Status | Remark
- Inline edit for Status and Remark fields

**Mode B — 品牌分組 (Grouped by Brand)**
- Each brand has its own collapsible section with a coloured left border
- Items listed under each brand with deadline and status
- Inline edit for Status and Remark

**Mode C — Kanban 狀態板**
- Four columns: 待開始 / 進行中 / 待審批 / 已完成
- Each card shows brand tag (colour-coded), content, and deadline
- Drag-and-drop cards between columns to update status (touch-supported for mobile)

**Status options:** 待開始 / 進行中 / 待審批 / 已完成

**Remark:** Free-text field, editable inline.

---

### 3. Calendar

Two sub-views toggled by buttons:

**Sub-view A — 月曆 (Monthly Calendar)**
- Standard month grid
- Each day cell shows colour-coded brand label tags for meetings and deadlines
- Click a day to show a popover with full item details

**Sub-view B — 時間線 (Timeline List)**
- Chronological list of upcoming events (meetings + deadlines)
- Colour-coded by brand
- Nearest deadline shown first
- Best for mobile

---

### 4. 會議記錄 (Raw Meeting Archive)

- List of all past meetings sorted by date (newest first)
- Each row: Date | Meeting Name | Brands mentioned | Preview of raw notes
- Click to expand and view full raw notes
- Read-only (original text preserved exactly as typed)

---

## Google Sheets Structure

**Sheet 1: `raw_meetings`**
| meeting_id | date | meeting_name | raw_notes | created_at |
|---|---|---|---|---|

**Sheet 2: `tasks`**
| task_id | meeting_id | brand | content | future_direction | deadline | meeting_date | status | remark | created_at |
|---|---|---|---|---|---|---|---|---|---|

---

## Google Apps Script API Endpoints

All accessed via POST to the Apps Script Web App URL:

| Action | Payload |
|---|---|
| `saveMeeting` | `{ date, meeting_name, raw_notes }` → returns `meeting_id` |
| `saveTasks` | `{ meeting_id, tasks[] }` |
| `getTasks` | `{ filters?: { brand, status } }` → returns tasks array |
| `updateTask` | `{ task_id, status?, remark? }` |
| `getMeetings` | returns all raw meetings |

---

## AI Parsing (Gemini API)

**Model:** `gemini-1.5-flash` (free tier)

**Prompt strategy:** System prompt lists the 5 brand names and instructs Gemini to output structured JSON. User message is the raw meeting notes.

**Output schema:**
```json
[
  {
    "brand": "InLife",
    "content": "推廣計劃 social posts",
    "future_direction": "設計中醫正骨主題視覺",
    "deadline": "2026-05-31"
  }
]
```

If a deadline is not mentioned, `deadline` is `null`.

---

## Brand Colour System

| Brand | Colour |
|---|---|
| InLife | Orange (`#fff7ed` / `#c2410c`) |
| Minus Plus | Pink (`#fce7f3` / `#9d174d`) |
| Miris Spa | Brown (`#fdf4e7` / `#78350f`) |
| Miris Mama | Peach (`#fff1f2` / `#be185d`) |
| Consguard | Silver Grey (`#f8fafc` / `#475569`) |

---

## Mobile Responsiveness

- Top tabs become horizontally scrollable on screens < 768px
- Task table becomes a card list on mobile
- Kanban scrolls horizontally
- Calendar timeline view is the default on mobile

---

## Setup Requirements (one-time)

1. Create a Google Sheet with two sheets: `raw_meetings` and `tasks`
2. Create a Google Apps Script project linked to the sheet, paste the API code, deploy as Web App
3. Get a Gemini API key from Google AI Studio (free)
4. Add the Apps Script URL and Gemini API key to a `.env` file in the project
5. Deploy frontend to GitHub Pages

---

## Out of Scope

- Multi-user / team collaboration
- Push notifications / reminders
- File attachments to tasks
- Export to PDF/Excel
