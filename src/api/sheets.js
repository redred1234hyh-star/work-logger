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
