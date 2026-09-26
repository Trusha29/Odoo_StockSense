import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice.js'
import filtersReducer from './filtersSlice.js'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    filters: filtersReducer,
  },
})

store.subscribe(() => {
  const { user, token } = store.getState().auth
  try {
    if (user && token) window.sessionStorage.setItem('stocksense-auth', JSON.stringify({ user, token }))
    else window.sessionStorage.removeItem('stocksense-auth')
  } catch {
    // Storage can be unavailable in restricted browsing contexts.
  }
})
