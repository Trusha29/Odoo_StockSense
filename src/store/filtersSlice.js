import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  docType: 'all',      // receipt | delivery | internal | adjustment | all
  status: 'all',        // draft | waiting | ready | done | cancelled | all
  warehouse: 'all',
  category: 'all',
  search: '',
}

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      const { key, value } = action.payload
      state[key] = value
    },
    resetFilters: () => initialState,
  },
})

export const { setFilter, resetFilters } = filtersSlice.actions
export default filtersSlice.reducer
