import { configureStore } from "@reduxjs/toolkit";
import bleReducer from "./bleSlice";
import measurementReducer from "./measurementSlice";
import notificationReducer from "./notificationSlice";
import paddockReducer from "./paddockSlice";
import backendReducer from "./backendSlice";
import filterReducer from "./filterSlice";
import locationReducer from "./locationSlice";

const store = configureStore({
  reducer: {
    ble: bleReducer,
    measurement: measurementReducer,
    notification: notificationReducer,
    backend: backendReducer,
    paddock: paddockReducer,
    filter: filterReducer,
    location: locationReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// The documents says there is no problem with the circular dependency
// https://redux.js.org/tutorials/typescript-quick-start

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;
