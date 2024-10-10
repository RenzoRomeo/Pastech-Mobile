import { getLastKnownPositionAsync } from "expo-location";

export async function getLocation() {
  try {
    const location = await getLastKnownPositionAsync({});
    return location;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}
