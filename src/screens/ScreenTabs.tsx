import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  FontAwesome,
  FontAwesome5,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { StatusBar, Text, View } from "native-base";

// Screens ================================================================
import HomeScreen from "./Home/HomeScreen";
import UserScreen from "./User/User";
import PaddockScreenStack from "./Paddocks/ScreenStack";
import CalibrationStackScreen from "./Calibrations/ScreenStack";
import StatisticsStackScreen from "./Statistics/ScreenStack";

//TODO Change screen titles

import HomeCalibration from "./Calibrations/HomeScreen";
import { RootTabsParamList } from "./Tabs.types";
import TS from "../../TS";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BatteryLevel from "../components/Battery";
import store from "../features/store/store";
import { useDispatch, useSelector } from "react-redux";
import { useTypedSelector } from "../features/store/storeHooks";
import { useEffect } from "react";
import { Accuracy, watchPositionAsync } from "expo-location";
import { setLocation } from "../features/store/locationSlice";

const Tab = createBottomTabNavigator<RootTabsParamList>();

export default function ScreenTabs() {
  const user = useTypedSelector((state) => state.backend.user || false);

  const insets = useSafeAreaInsets();

  const dispatch = useDispatch();

  useEffect(() => {
    const subscription = watchPositionAsync(
      {
        accuracy: Accuracy.BestForNavigation,
        timeInterval: 5000,
      },
      (location) => {
        dispatch(setLocation({ location }));
      },
    );
    return () => {
      subscription.then((subscription) => subscription.remove());
    };
  }, []);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      backBehavior="history"
      screenOptions={{
        tabBarStyle: { height: 60 + insets.bottom },
        headerShown: false,
        headerRight: () => (
          <View paddingRight={2}>
            <BatteryLevel />
          </View>
        ),
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "",
          tabBarLabel: ({ focused, color }) => (
            <Text fontSize="sm" color={color}>
              {TS.t("home_tab_title")}
            </Text>
          ),
          tabBarIcon: ({ focused, color, size }) => (
            <FontAwesome
              size={45}
              name="home"
              color={color}
              focused={focused}
              style={{ marginBottom: -10 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Calibration"
        component={CalibrationStackScreen}
        options={{
          tabBarLabel: ({ focused, color }) => (
            <Text fontSize="sm" color={color} noOfLines={1}>
              {TS.t("calibration_tab_title")}
            </Text>
          ),
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              size={45}
              name="ruler-square-compass"
              color={color}
              focused={focused}
              style={{ marginBottom: -3 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsStackScreen}
        options={{
          tabBarLabel: ({ focused, color }) => (
            <Text fontSize="sm" color={color}>
              {TS.t("statistics_tab_title")}
            </Text>
          ),
          tabBarIcon: ({ focused, color, size }) => (
            <FontAwesome
              size={40}
              name="pie-chart"
              color={color}
              focused={focused}
              style={{ marginBottom: -9 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Paddocks"
        component={PaddockScreenStack}
        options={{
          tabBarLabel: ({ focused, color }) => (
            <Text fontSize="sm" color={color}>
              {TS.t("paddock_tab_title")}
            </Text>
          ),
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              size={45}
              name="map"
              color={color}
              focused={focused}
              style={{ marginBottom: -5 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="User"
        component={UserScreen}
        options={{
          tabBarLabel: ({ focused, color }) => (
            <Text fontSize="sm" color={color}>
              {TS.t("user_tab_title")}
            </Text>
          ),
          tabBarIcon: ({ focused, color, size }) => (
            <FontAwesome5
              size={37}
              name="user-alt"
              color={color}
              focused={focused}
              style={{ marginBottom: -5 }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
