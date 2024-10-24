import store from "../store/store";

export async function getLocation() {
  return store.getState().location.location;
}
