import { configureStore } from '@reduxjs/toolkit'
import themeReducer from './slices/themeSlice'
import interpretationReducer from './slices/interpretationSlice'

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    interpretation: interpretationReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
