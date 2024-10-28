import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LocationObject } from "expo-location";

interface LocationState {
  location: LocationObject | null;
}

const initialState: LocationState = {
  location: null,
};

export const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setLocation: (state, action: PayloadAction<LocationObject>) => {
      state.location = action.payload;
    },
  },
});

export const { setLocation } = locationSlice.actions;
export default locationSlice.reducer;
