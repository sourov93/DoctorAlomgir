import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api')
})

export async function submitAppointment(payload) {
  const { data } = await api.post('/appointments', payload)
  return data
}

export async function getPublicContent() {
  const { data } = await api.get('/content')
  return data
}

export async function loginAdmin(credentials) {
  const { data } = await api.post('/auth/login', credentials)
  return data
}

const adminConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('doctor-admin-token')}` } })
export async function getAdminDashboard() { const { data } = await api.get('/admin/dashboard', adminConfig()); return data }
export async function getAdminAppointments(params = {}) { const { data } = await api.get('/admin/appointments', { ...adminConfig(), params }); return data }
export async function updateAppointmentStatus(id, status) { const { data } = await api.patch(`/admin/appointments/${id}/status`, { status }, adminConfig()); return data }

export default api
