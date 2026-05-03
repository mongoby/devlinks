import api from './api.js'

export const mockService = {
  getProjects: () => api.get('/mock/projects'),
  createProject: (data) => api.post('/mock/projects', data),
  updateProject: (id, data) => api.put(`/mock/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/mock/projects/${id}`),
  
  getSchemas: () => api.get('/mock/schemas'),
  getSchema: (id) => api.get(`/mock/schemas/${id}`),
  createSchema: (data) => api.post('/mock/schemas', data),
  updateSchema: (id, data) => api.put(`/mock/schemas/${id}`, data),
  deleteSchema: (id) => api.delete(`/mock/schemas/${id}`),
  
  generateMockData: (schema) => api.post('/mock/generate', schema),
  
  getLogs: (schemaId) => api.get(`/mock/logs?schema_id=${schemaId || ''}`),
  clearLogs: () => api.delete('/mock/logs')
}
