import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/api/auth/login', { username, password }),

  logout: () => api.post('/api/auth/logout'),

  checkAuth: () => api.get('/api/auth/check'),
};

// Trips API
export const tripsAPI = {
  getAll: () => api.get('/api/trips'),

  getById: (id: number) => api.get(`/api/trips/${id}`),

  getByDate: (date: string) => api.get(`/api/trips?date=${date}`),

  getMonthSummary: (month: string) => api.get(`/api/trips?month=${month}`),

  create: (tripData: any) => api.post('/api/trips', tripData),

  update: (id: number, tripData: any) => api.put(`/api/trips/${id}`, tripData),

  delete: (id: number) => api.delete(`/api/trips/${id}`),
};

// Reference data APIs
export const driversAPI = {
  getAll: () => api.get('/api/drivers'),
  getById: (id: number) => api.get(`/api/drivers/${id}`),
  create: (data: any) => api.post('/api/drivers', data),
  update: (id: number, data: any) => api.put(`/api/drivers/${id}`, data),
  delete: (id: number) => api.delete(`/api/drivers/${id}`),
};

export const vehiclesAPI = {
  getAll: () => api.get('/api/vehicles'),
  create: (data: any) => api.post('/api/vehicles', data),
  update: (id: number, data: any) => api.put(`/api/vehicles/${id}`, data),
  delete: (id: number) => api.delete(`/api/vehicles/${id}`),
};

export const clientsAPI = {
  getAll: () => api.get('/api/clients'),
  create: (data: any) => api.post('/api/clients', data),
  update: (id: number, data: any) => api.put(`/api/clients/${id}`, data),
  delete: (id: number) => api.delete(`/api/clients/${id}`),
};

export const routesAPI = {
  getAll: () => api.get('/api/routes'),
  create: (data: any) => api.post('/api/routes', data),
  delete: (id: number) => api.delete(`/api/routes/${id}`),
};

// Directions API
export const directionsAPI = {
  getAll: () => api.get('/api/directions'),
};

// Templates API
export const templatesAPI = {
  getAll: (archived: boolean | 'all' = false) => api.get(`/api/templates?archived=${archived}`),
  getById: (id: number) => api.get(`/api/templates/${id}`),
  create: (data: any) => api.post('/api/templates', data),
  update: (id: number, data: any) => api.put(`/api/templates/${id}`, data),
  delete: (id: number) => api.delete(`/api/templates/${id}`),
  deleteTrips: (id: number) => api.delete(`/api/templates/${id}/trips`),
  archive: (id: number) => api.post(`/api/templates/${id}/archive`),
  unarchive: (id: number) => api.post(`/api/templates/${id}/unarchive`),
  generateTrips: (daysAhead: number = 30) => api.post('/api/templates/generate-trips', { days_ahead: daysAhead }),
};

// Contracts API
export const contractsAPI = {
  getAll: () => api.get('/api/contracts'),
  getById: (id: number) => api.get(`/api/contracts/${id}`),
  create: (data: any) => api.post('/api/contracts', data),
  delete: (id: number) => api.delete(`/api/contracts/${id}`),
};

// Executors API
export const executorsAPI = {
  getAll: () => api.get('/api/executors'),
  getById: (id: number) => api.get(`/api/executors/${id}`),
  create: (data: any) => api.post('/api/executors', data),
  update: (id: number, data: any) => api.put(`/api/executors/${id}`, data),
  delete: (id: number) => api.delete(`/api/executors/${id}`),
};

// Contract Providers API
export const contractProvidersAPI = {
  getAll: () => api.get('/api/contract-providers'),
  getById: (id: number) => api.get(`/api/contract-providers/${id}`),
  create: (data: any) => api.post('/api/contract-providers', data),
  update: (id: number, data: any) => api.put(`/api/contract-providers/${id}`, data),
  delete: (id: number) => api.delete(`/api/contract-providers/${id}`),
};

// Users API (admin only)
export const usersAPI = {
  getAll: () => api.get('/api/users'),
  create: (data: { username: string; password: string; role: string }) =>
    api.post('/api/users', data),
  update: (id: number, data: { role?: string; password?: string }) =>
    api.put(`/api/users/${id}`, data),
  delete: (id: number) => api.delete(`/api/users/${id}`),
};

export default api;
