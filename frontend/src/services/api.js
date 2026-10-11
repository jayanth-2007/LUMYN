import axios from 'axios';

// API client - using relative /api/v1 so Vite proxy seamlessly routes to Flask at http://127.0.0.1:5000
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to convert cryptic network/proxy errors into clear, actionable messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let actionableMessage = '';

    if (!error.response) {
      // Browser network error / connection refused
      actionableMessage =
        'Cannot connect to the LUMYN backend server at http://127.0.0.1:5000. Please ensure the Flask server is running (run: python backend/run.py).';
    } else if (error.response.status === 502 || error.response.status === 504) {
      // Vite proxy gateway failure
      actionableMessage =
        'Backend server at http://127.0.0.1:5000 is not responding. Please make sure the Flask backend is started (run: python backend/run.py).';
    } else if (error.response.status === 413) {
      actionableMessage = 'File size exceeds the 25 MB limit. Please upload a smaller file.';
    } else {
      actionableMessage =
        error.response.data?.error ||
        error.response.data?.message ||
        error.message ||
        'An unexpected error occurred.';
    }

    error.actionableMessage = actionableMessage;
    error.message = actionableMessage; // Override generic "Network Error"
    return Promise.reject(error);
  }
);

export const api = {
  // Health & Stats
  getHealth: () => apiClient.get('/health'),
  getOverviewStats: () => apiClient.get('/overview/stats'),

  // Datasets
  uploadDataset: (formData, onProgress) => {
    return apiClient.post('/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
  },
  listDatasets: () => apiClient.get('/datasets'),
  getDataset: (id) => apiClient.get(`/datasets/${id}`),
  previewDataset: (id, page = 1, pageSize = 25, sortBy = null, sortDir = 'asc') => {
    const params = { page, page_size: pageSize };
    if (sortBy) {
      params.sort_by = sortBy;
      params.sort_dir = sortDir;
    }
    return apiClient.get(`/datasets/${id}/preview`, { params });
  },
  profileDataset: (id) => apiClient.get(`/datasets/${id}/profile`),
  deleteDataset: (id) => apiClient.delete(`/datasets/${id}`),
  loadSampleDataset: () => apiClient.post('/datasets/load-sample'),
  resetStorage: () => apiClient.post('/datasets/reset'),

  // Dashboards
  generateDashboard: (datasetId, title) =>
    apiClient.post('/dashboards/generate', { dataset_id: datasetId, title }),
  saveDashboard: (dashboardData) => apiClient.post('/dashboards', dashboardData),
  listDashboards: () => apiClient.get('/dashboards'),
  getDashboard: (id) => apiClient.get(`/dashboards/${id}`),
  updateDashboard: (id, updates) => apiClient.patch(`/dashboards/${id}`, updates),
  deleteDashboard: (id) => apiClient.delete(`/dashboards/${id}`),

  // Analytics & Chat
  queryAnalytics: (datasetId, query) =>
    apiClient.post('/analytics/query', { dataset_id: datasetId, query }),
  chatAnalytics: (datasetId, message) =>
    apiClient.post('/chat', { dataset_id: datasetId, message }),
  getDatasetInsights: (datasetId) => apiClient.get(`/datasets/${datasetId}/insights`),
};

export default api;
