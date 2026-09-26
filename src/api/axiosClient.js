import axios from 'axios'
import { store } from '../store/store.js'
import { logout } from '../store/authSlice.js'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      store.dispatch(logout())
    }
    return Promise.reject(err)
  }
)

export default api
