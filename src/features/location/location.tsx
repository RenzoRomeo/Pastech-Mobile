import {
  Accuracy,
  getCurrentPositionAsync,
  getLastKnownPositionAsync,
} from "expo-location";

const LOCATION_TIMEOUT_MINUTES = 5;

export async function getLocation() {
  try {
    const lastKnown = await getLastKnownPositionAsync();

    if (
      lastKnown &&
      Date.now() - lastKnown.timestamp < LOCATION_TIMEOUT_MINUTES * 60 * 1000
    ) {
      return lastKnown;
    }

    return await getCurrentPositionAsync({
      accuracy: Accuracy.BestForNavigation,
    });
  } catch (err) {
    console.error(err);
    return undefined;
  }
}
