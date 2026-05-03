import api from './api.js'

export const linkService = {
  getLinks: (params) => api.get('/links', { params }),
  getLink: (id) => api.get(`/links/${id}`),
  createLink: (data) => api.post('/links', data),
  updateLink: (id, data) => api.put(`/links/${id}`, data),
  deleteLink: (id) => api.delete(`/links/${id}`),
  batchDeleteLinks: (ids) => api.delete('/links/batch', { data: ids }),
  checkLinks: () => api.post('/links/check')
}
