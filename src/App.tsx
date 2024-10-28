import { useEffect } from "react";
import { LogBox } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NativeBaseProvider, StatusBar } from "native-base";
import { Provider } from "react-redux";
import { useFonts } from "expo-font";

import AlertsManager from "./components/NotificationManager";
import ble from "./features/ble/ble";
import requestPermissions from "./features/ble/blePermissionRequest";
import { onInit } from "./features/localDB/onInit";
import {
  initializeLocation,
  isLocationWatcherActive,
  stopLocationWatch,
} from "./features/location/locationService";
import { pushNotification } from "./features/pushNotification";
import store from "./features/store/store";
import ScreenTabs from "./screens/ScreenTabs";
import { customFonts, themeNative, themeNavigation } from "./theme";
import TS from "../TS";

onInit();
ble;

LogBox.ignoreLogs(["new NativeEventEmitter"]);

export default function App() {
  const [fontLoaded] = useFonts(customFonts);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        if (mounted) {
          await initializeLocation();
          await requestPermissions();
        }
      } catch (error) {
        console.error("Error during initialization:", error);
      }
    }

    initialize();

    const checkInterval = setInterval(() => {
      if (mounted && !isLocationWatcherActive()) {
        initializeLocation();
      }
    }, 10000);

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
