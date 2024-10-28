import * as Location from "expo-location";
import store from "../store/store";
import { setLocation } from "../store/locationSlice";
import { pushNotification } from "../pushNotification";
import TS from "../../../TS";

let locationWatcher: Location.LocationSubscription | null = null;

export async function initializeLocation() {
  try {
    // Clean up any existing watcher first
    if (locationWatcher) {
      console.log("Stopping existing location watcher");
      locationWatcher.remove();
      locationWatcher = null;
    }

    // Ensure location services are enabled
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      pushNotification(TS.t("location_services_required"), "error");
      return false;
    }

    // Start the location watcher
    locationWatcher = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 3000,
      },
      (location) => {
        store.dispatch(setLocation(location));
      },
    );

    console.log("Location watcher initialized successfully"); // Debug log
    return true;
  } catch (error) {
    console.error("Error initializing location:", error);
    return false;
  }
}

export function stopLocationWatch() {
  if (locationWatcher) {
    locationWatcher.remove();
    locationWatcher = null;
    console.log("Location watcher stopped"); // Debug log
  }
}

// Add a function to check if location watcher is active
export function isLocationWatcherActive(): boolean {
  return locationWatcher !== null;
}
