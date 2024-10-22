import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./HomeScreen";
import CreatePaddock from "./CreatePaddock";
//import EditScreen from "./EditScreenGoogle";
import FiltersScreen from "./FiltersScreen";
import { LatLng } from "react-native-maps";
import TS from "../../../TS";
import { useTheme } from "native-base";

export type StackParamList = {
  PaddockHome: { activeFilter?: { from: Date; until: Date } };
  CreatePaddock: { paddockId: number; create: boolean };
  // EditScreen: {coordinates: LatLng, paddockId: number, pointId: number, onCoordsChanged: Function};
  FiltersScreen: {
    paddockId: number;
    paddockList: { name: string; id: number }[];
  };
};

const Stack = createNativeStackNavigator<StackParamList>();

export default function PaddockStackScreen() {
  const theme = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleStyle: { fontWeight: "bold", fontSize: 24 },
        headerTintColor: theme.colors.muted[400],
      }}
    >
      <Stack.Screen
        name="PaddockHome"
        component={HomeScreen}
        options={{ headerTitle: TS.t("paddock_home_title") }}
      />
      {/* <Stack.Screen
        name="CreatePaddock"
        component={CreatePaddock}
        options={{ headerTitle: "Modificar Potrero" }}
      /> */}
      {/* <Stack.Screen
        name="EditScreen"
        component={EditScreen}
        options={{ headerTitle: "Map" }}
      /> */}
      <Stack.Screen
        name="FiltersScreen"
        component={FiltersScreen}
        options={{ headerTitle: TS.t("filter_screen_title") }}
      />
    </Stack.Navigator>
  );
}
