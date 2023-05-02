import { configureStore } from '@reduxjs/toolkit'
import bleReducer from './features/ble/bleSlice'
// ...

const store = configureStore({
  reducer: {
    ble: bleReducer
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// The documents says there is no problem with the circular dependency
// https://redux.js.org/tutorials/typescript-quick-start

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default store