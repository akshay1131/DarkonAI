import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('darkon_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('darkon_token');
      window.dispatchEvent(new Event('darkon:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (data) => API.post('/auth/register', data),
  getMe: () => API.get('/auth/me'),
};

export const scanAPI = {
  executeScan: (scanParams) => API.post('/scan/execute', scanParams),
  getHistory: () => API.get('/scan/history'),
  getScanDetail: (id) => API.get(`/scan/${id}`),
  downloadPdf: (id) => API.get(`/scan/${id}/pdf`, { responseType: 'blob' }),
};

export const dashboardAPI = {
  getStats: () => API.get('/dashboard/stats'),
};

export const powergridAPI = {
  getStatus: () => API.get('/power-grid/status'),
  getAssets: (params) => API.get('/power-grid/assets', { params }),
};

export const aiAPI = {
  analyzeThreat: (payload) => API.post('/ai/analyze-threat', payload),
  sendChatMessage: (message) => API.post('/ai/chatbot', { message }),
};

export const incidentAPI = {
  generateReport: (data) => API.post('/incident/generate-report', data),
  downloadReport: (filename) => API.get(`/incident/reports/${encodeURIComponent(filename)}`, { responseType: 'blob' }),
};

export const adminAPI = {
  getUsers: () => API.get('/admin/users'),
  getLogs: () => API.get('/admin/logs'),
  getConfig: () => API.get('/admin/config'),
  updateConfig: (data) => API.post('/admin/config', data),
};

export const siemAPI = {
  exportCEF: (scanId) => API.get(`/siem/export/${scanId}?format=cef`),
  exportJSON: (scanId) => API.get(`/siem/export/${scanId}?format=json`),
  forwardSyslog: (data) => API.post('/siem/forward', data),
  lookupLiveCVE: (cveId) => API.get(`/siem/nvd/lookup/${cveId}`),
};
