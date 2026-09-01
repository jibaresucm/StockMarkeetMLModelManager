// API connection: req has 'include' so the sessions cookies are sent automatically 
// and rejects w Error on non-ok responses handling both json and plain text error responses

async function request(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  const text = await res.text()

  if (!res.ok) {
    throw new Error(text || `Request failed with status ${res.status}`)
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

// auth: /api/auth/me uses POST and matches backend auth.post("/me", ...)
export const auth = {
  login: (email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: email, password }),
    }),

  register: (username, email, password) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),

  logout: () =>
    request('/api/auth/logout', { method: 'POST' }),

  me: () =>
    request('/api/auth/me', { method: 'POST' }),
}

// models
export const modelsApi = {
  readAll: () =>
    request('/api/models/readFromUser'),

  read: (id) =>
    request(`/api/models/${id}/read`),

  create: (model) =>
    request('/api/models/create', {
      method: 'POST',
      body: JSON.stringify(model),
    }),

  delete: (id) =>
    request(`/api/models/${id}/delete`, { method: 'POST' }),

  modify: (id, model) =>
    request(`/api/models/${id}/modify`, {
      method: 'POST',
      body: JSON.stringify(model),
    }),

  validateTicker: (ticker) =>
    request('/api/models/validate-ticker', {
      method: 'POST',
      body: JSON.stringify({ ticker }),
    }),

  featureAnalysis: (data) =>
    request('/api/models/feature-analysis', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  train: (id) =>
    request(`/api/models/${id}/train`, { method: 'POST' }),

  getOptions: () =>
    request('/api/models/options'),

  predict: (id) =>
    request(`/api/models/${id}/predict`, { method: 'POST' }),

  stats: (id) =>
    request(`/api/models/${id}/stats`),
}

// projects
export const projectsApi = {
  readAll: () =>
    request('/api/projects/readFromUser'),

  read: (id) =>
    request(`/api/projects/${id}/read`),

  create: (project) =>
    request('/api/projects/create', {
      method: 'POST',
      body: JSON.stringify(project),
    }),

  delete: (id) =>
    request(`/api/projects/${id}/delete`, { method: 'POST' }),

  modify: (id, project) =>
    request(`/api/projects/${id}/modify`, {
      method: 'POST',
      body: JSON.stringify(project),
    }),

  getModels: (id) =>
    request(`/api/projects/${id}/models`),

  linkModel: (projectId, modelId) =>
    request(`/api/projects/${projectId}/link`, {
      method: 'POST',
      body: JSON.stringify({ model_id: modelId }),
    }),

  generateReport: (id) =>
    request(`/api/projects/${id}/report`, { method: 'POST' }),
}
