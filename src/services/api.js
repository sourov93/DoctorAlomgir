import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' })

export async function submitAppointment(payload) {
  const { data } = await api.post('/appointments', payload)
  return data
}

export async function getPublicContent() {
  const { data } = await api.get('/content')
  return data
}

export default api
