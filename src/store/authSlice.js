import { createSlice } from '@reduxjs/toolkit'

const initialState = (() => {
  try {
    const savedAuth = JSON.parse(window.sessionStorage.getItem('stocksense-auth') || 'null')
    if (savedAuth?.user && savedAuth?.token) {
      return { user: savedAuth.user, token: savedAuth.token, isAuthenticated: true }
    }
  } catch {
    window.sessionStorage.removeItem('stocksense-auth')
  }
  return { user: null, token: null, isAuthenticated: false }
})()

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
