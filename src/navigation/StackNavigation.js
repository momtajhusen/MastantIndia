//import liraries
import React, { useContext } from 'react';
// import CustomerBottomTabNavigator from './CustomerBottomTabNavigator';
import SplashScreen from '../screens/Auth/SplashScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
 

import { createSharedElementStackNavigator } from 'react-navigation-shared-element';
const Stack = createSharedElementStackNavigator();

// create a component
const StackNavigation = () => {

    return (
        <Stack.Navigator> 

        <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false, animation: 'fade' }} />
 
        {/* Auth navigation  */}
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false, animation: 'fade' }} />
 
 
     </Stack.Navigator>
    );
};

//make this component available to the app
export default StackNavigation;
