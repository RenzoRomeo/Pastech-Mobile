import store from "../store/store";
import * as Location from "expo-location";
import { pushNotification } from "../pushNotification";
import TS from "../../../TS";
import { setLocation } from "../store/locationSlice";

export async function getLocation() {
  try {
    // First try to get from Redux store
    let location = store.getState().location.location;

    // If location exists in store and is recent (less than 10 seconds old)
    if (location && Date.now() - location.timestamp < 10000) {
      return location;
    }

    // If no recent location, get current position
    console.log("Getting fresh location..."); // Debug log
    location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    // Update Redux store with new location
    store.dispatch(setLocation(location));
    return location;
  } catch (error) {
    console.error("Error getting location:", error);
    pushNotification(TS.t("location_error"), "error");
    throw error;
  }
}
