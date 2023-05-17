import { StatusBar } from 'expo-status-bar';
import { LogBox, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { NativeBaseProvider, Text } from 'native-base';

import { Provider } from 'react-redux';
import store from './features/store/store';


//ble is imported just to be executed
import ble from './features/ble/ble'
ble // Dont delete, it force the import





import {themeNative,themeNavigation} from './theme';
import ScreenTabs from './screens/ScreenTabs';

LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message





export default function App() {
  return (
    <Provider store={store}>
      <NativeBaseProvider theme={themeNative}>
        <NavigationContainer theme={themeNavigation} >
          <ScreenTabs/>
        </NavigationContainer>
      </NativeBaseProvider>
    </Provider>


  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
