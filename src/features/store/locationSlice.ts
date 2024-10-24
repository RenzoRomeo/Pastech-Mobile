import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LocationObject } from "expo-location";

interface PayloadType {
  location: LocationObject;
}

export const locationSlice = createSlice({
  name: "location",
  initialState: {} as { location: LocationObject },
  reducers: {
    setLocation: (state, action: PayloadAction<PayloadType>) => {
      state.location = action.payload.location;
    },
  },
});

export const { setLocation } = locationSlice.actions;

export default locationSlice.reducer;
