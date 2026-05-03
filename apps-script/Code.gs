const SS = SpreadsheetApp.openById('1O3euX3-oFpBo8inmRtbGSjeuZWRlVnDZXZAL8XeAEdc')
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
    else if (data.action === 'deleteTask') result = deleteTask(data)
    else if (data.action === 'deleteMeeting') result = deleteMeeting(data)
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

function updateTask(data) {
  const { task_id, action, ...fields } = data
  const sheet = SS.getSheetByName(TASKS_SHEET)
  const rows = sheet.getDataRange().getValues()
  const headers = rows[0]
  const idCol = headers.indexOf('task_id')

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idCol] === task_id) {
      Object.entries(fields).forEach(([key, value]) => {
        const col = headers.indexOf(key)
        if (col >= 0) sheet.getRange(i + 1, col + 1).setValue(value)
      })
      return { updated: true }
    }
  }
  return { updated: false }
}

function deleteTask({ task_id }) {
  const sheet = SS.getSheetByName(TASKS_SHEET)
  const rows = sheet.getDataRange().getValues()
  const headers = rows[0]
  const idCol = headers.indexOf('task_id')
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idCol] === task_id) {
      sheet.deleteRow(i + 1)
      return { deleted: true }
    }
  }
  return { deleted: false }
}

function deleteMeeting({ meeting_id }) {
  const sheet = SS.getSheetByName(MEETINGS_SHEET)
  const rows = sheet.getDataRange().getValues()
  const headers = rows[0]
  const idCol = headers.indexOf('meeting_id')
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idCol] === meeting_id) {
      sheet.deleteRow(i + 1)
      return { deleted: true }
    }
  }
  return { deleted: false }
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
