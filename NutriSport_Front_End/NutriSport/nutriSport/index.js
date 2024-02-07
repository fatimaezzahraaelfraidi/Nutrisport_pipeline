/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import messaging from '@react-native-firebase/messaging';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  //add here the redirection
});

const RootComponent = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
  <App />
</GestureHandlerRootView>
);

AppRegistry.registerComponent(appName, () => RootComponent);