import { LogBox } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { NativeBaseProvider, StatusBar } from "native-base";
import { customFonts, themeNative, themeNavigation } from "./theme";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import AlertsManager from "./components/NotificationManager";
import ScreenTabs from "./screens/ScreenTabs";
import { Provider } from "react-redux";
import store from "./features/store/store";

//ble is imported just to be executed
import ble from "./features/ble/ble";
ble; // Dont delete, it force the import

import { onInit } from "./features/localDB/onInit";
import {
  initializeLocation,
  isLocationWatcherActive,
  stopLocationWatch,
} from "./features/location/locationService";
import { useEffect } from "react";
import requestPermissions from "./features/ble/blePermissionRequest";
import { pushNotification } from "./features/pushNotification";
import TS from "../TS";

onInit();

LogBox.ignoreLogs(["new NativeEventEmitter"]); // Ignore log notification by message

export default function App() {
  const [fontLoaded] = useFonts(customFonts);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        if (mounted) {
          console.log("Starting location initialization..."); // Debug log
          const locationInitialized = await initializeLocation();
          console.log("Location initialization result:", locationInitialized); // Debug log

          if (!locationInitialized) {
            console.warn("Location services not initialized");
            pushNotification(TS.t("location_init_failed"), "warning");
          }

          // Initialize BLE after location is set up
          const blePermissionsGranted = await requestPermissions();
          if (!blePermissionsGranted) {
            console.warn("BLE permissions not granted");
          }
        }
      } catch (error) {
        console.error("Error during initialization:", error);
      }
    }

    initialize();

    // Set up an interval to check location watcher status
    const checkInterval = setInterval(() => {
      if (mounted && !isLocationWatcherActive()) {
        console.log("Reinitializing location watcher..."); // Debug log
        initializeLocation();
      }
    }, 10000); // Check every 10 seconds

    // Cleanup function
    return () => {
      mounted = false;
      stopLocationWatch();
      clearInterval(checkInterval);
    };
  }, []);

  if (!fontLoaded) return <></>;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <StatusBar
          translucent
          backgroundColor="white"
          barStyle="dark-content"
        />

        <NativeBaseProvider theme={themeNative}>
          <NavigationContainer theme={themeNavigation}>
            <ScreenTabs />
          </NavigationContainer>
          <AlertsManager />
        </NativeBaseProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
