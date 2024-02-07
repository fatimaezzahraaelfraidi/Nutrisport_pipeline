// App.jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StripeProvider } from '@stripe/stripe-react-native';  // Import StripeProvider
import Chef from './pages/Chef';
import Sportif from './pages/Sportif';
import Index from './pages/Index';
import PostRequest from './pages/sportif/PostRequest'
import PostOffer from './pages/preparator/PostOffer'
import Demands from './pages/preparator/Demands'
import Offres from './pages/sportif/Offers';
import ZoneMap from './pages/preparator/ZoneMap';

import MyOffers from './pages/preparator/MyOffers';
import DemandsMap from './pages/preparator/DemandsMap';

import Orders from './pages/sportif/Orders';
import DemandsS from './pages/sportif/Demands';
import DemandDevis from './pages/sportif/DemandDevis';

import OrderTrackingComponent from './pages/sportif/OrderTrackingComponent';
 
import DeliveryMap from './pages/sportif/DeliveryMap';
import UserSigninScreen from './pages/Login/UserSigninScreen';
import UserRegistrationScreen from './pages/Login/UserRegistrationScreen';
 


import Rating from './pages/sportif/RateOrder';
import MyOrders from './pages/preparator/MyOrders';
import Settings from './pages/Settings';
import DemandHistory  from './pages/sportif/DemandHistory';


const Stack = createNativeStackNavigator();

const App = () => {
  return (

    <StripeProvider
      publishableKey="pk_test_51OcZ5LKHpj4IFRMyoJksWNToWx7wsBFlEuupLo5GzMlMAUwRxvoLObkcnkCmN6C1w7Pdy2gwTcTTWqL0QdCZYfkQ00Do34fmes"  // Replace with your actual Stripe publishable key
    
    >
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Index">
          <Stack.Screen name="Index" options={{ title: 'Index' , headerShown: false}} component={Index} />
          <Stack.Screen name="Chef" options={{ title: 'Je suis un préparateur' }} component={Chef} />
          <Stack.Screen name="Sportif" options={{ title: 'Je suis un sportif' }} component={Sportif} />
          <Stack.Screen name="Home" component={Offres} options={{ headerShown: false }} />
          <Stack.Screen name="Orders" component={Orders} options={{ headerShown: false }} />
          <Stack.Screen name="DemandsS" component={DemandsS} options={{ headerShown: false }}/>
          <Stack.Screen name="DemandDevis" options={{ headerShown: false }} component={DemandDevis}/>
          <Stack.Screen name="PostRequest" options={{ title: 'PostRequest', headerShown: false }} component={PostRequest} />

        <Stack.Screen name="OrderTrackingComponent" options={{ title: 'OrderTrackingComponent' , headerShown: false}} component={OrderTrackingComponent} />
   
        <Stack.Screen name="DeliveryMap" component={DeliveryMap} />
        <Stack.Screen name="MyOrders" options={{ headerShown: false }} component={MyOrders} />
        <Stack.Screen name="UserSigninScreen"  options={{ title: 'UserSigninScreen' , headerShown: false}} component={UserSigninScreen} />
        <Stack.Screen name="UserRegistrationScreen"  options={{ title: 'UserRegistrationScreen' , headerShown: false}} component={UserRegistrationScreen} />
          <Stack.Screen name="PostOffer" options={{ title: 'PostOffer', headerShown: false }} component={PostOffer} />
          <Stack.Screen name="Demands" options={{ title: 'Demands', headerShown: false }} component={Demands} />
          <Stack.Screen name="ZoneMap" component={ZoneMap} />
          <Stack.Screen name="MyOffers" options={{ title: 'MyOffers', headerShown: false }} component={MyOffers} />
          <Stack.Screen name="DemandsMap" options={{ title: 'DemandsMap', headerShown: false }}  component={DemandsMap}/>

          <Stack.Screen name="DemandHistory" options={{ title: 'DemandHistory', headerShown: false }}  component={DemandHistory}/>



          <Stack.Screen name="Settings"  options={{ title: 'Settings' , headerShown: false}} component={Settings} />

      </Stack.Navigator>
    </NavigationContainer>
    </StripeProvider>


  );
};


export default App;