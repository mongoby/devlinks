import api from './api.js'

export const tilService = {
  getTILs: (params) => api.get('/til', { params }),
  getTIL: (id) => api.get(`/til/${id}`),
  createTIL: (data) => api.post('/til', data),
  updateTIL: (id, data) => api.put(`/til/${id}`, data),
  deleteTIL: (id) => api.delete(`/til/${id}`),
  likeTIL: (id) => api.post(`/til/${id}/like`)
}
