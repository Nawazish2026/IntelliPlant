import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' }
});

export const documentsAPI = {
  getAll: (params) => api.get('/documents', { params }),
  getStats: () => api.get('/documents/stats'),
  getById: (id) => api.get(`/documents/${id}`),
  upload: (formData, onProgress) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
  }),
  delete: (id) => api.delete(`/documents/${id}`)
};

export const knowledgeAPI = {
  getGraph: (params) => api.get('/knowledge/graph', { params }),
  getStats: () => api.get('/knowledge/stats'),
  getEntities: (params) => api.get('/knowledge/entities', { params }),
  getEntity: (id) => api.get(`/knowledge/entities/${id}`)
};

export const copilotAPI = {
  chat: (query, conversationId) => api.post('/copilot/chat', { query, conversationId }),
  getSuggestions: () => api.get('/copilot/suggestions'),
  clearConversation: (id) => api.delete(`/copilot/conversation/${id}`)
};

export const maintenanceAPI = {
  getDashboard: () => api.get('/maintenance/dashboard'),
  getRecords: (params) => api.get('/maintenance/records', { params }),
  generateRCA: (equipmentTag) => api.post('/maintenance/rca', { equipmentTag }),
  getPredictions: () => api.get('/maintenance/predictions')
};

export const complianceAPI = {
  getDashboard: () => api.get('/compliance/dashboard'),
  getRules: (params) => api.get('/compliance/rules', { params }),
  getGaps: () => api.get('/compliance/gaps'),
  generateAuditPackage: (regulation) => api.post('/compliance/audit-package', { regulation })
};

export const lessonsAPI = {
  getDashboard: () => api.get('/lessons/dashboard'),
  getIncidents: (params) => api.get('/lessons/incidents', { params }),
  analyzePatterns: () => api.post('/lessons/analyze'),
  getAlerts: () => api.get('/lessons/alerts')
};

export default api;
