//import liraries
import React, { useContext } from 'react';
import CustomerBottomTabNavigator from './CustomerBottomTabNavigator';
import SplashScreen from '../screens/Auth/SplashScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import OTPVerificationScreen from '../screens/Auth/OTPVerificationScreen';
import AddressBookScreen from '../screens/Customer/Profile/AddressBookScreen';
import PaymentMethodScreen from '../screens/Customer/Payment/PaymentMethodScreen';
import RatingScreen from '../screens/Customer/Profile/RatingScreen';
import PrivacyPolicyScreen from '../screens/Shared/PrivacyPolicyScreen';
import AboutScreen from '../screens/Shared/AboutScreen';
import BookingDetailsScreen from '../screens/Customer/History/BookingDetailsScreen';
import ProviderProfileDetails from '../screens/Customer/History/ProviderProfileDetails';
import ActiveUpcomingServices from '../screens/Customer/History/ActiveUpcoming/ActiveUpcomingServces';
 

import { createSharedElementStackNavigator } from 'react-navigation-shared-element';
const Stack = createSharedElementStackNavigator();

// create a component
const StackNavigation = () => {

    return (
        <Stack.Navigator> 

        <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false, animation: 'fade' }} />
 
        {/* Auth navigation  */}
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="OTPVerificationScreen" component={OTPVerificationScreen} options={{ headerShown: false, animation: 'fade' }} />

        <Stack.Screen name="CustomerBottomTabNavigator" component={CustomerBottomTabNavigator} options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="AddressBookScreen" component={AddressBookScreen} options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="PaymentMethodScreen" component={PaymentMethodScreen} options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="RatingScreen" component={RatingScreen} options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="AboutScreen" component={AboutScreen} options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="BookingDetailsScreen" component={BookingDetailsScreen} options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="ProviderProfileDetails" component={ProviderProfileDetails} options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="ActiveUpcomingServices" component={ActiveUpcomingServices} options={{ headerShown: false, animation: 'fade' }} />



     </Stack.Navigator>
    );
};

//make this component available to the app
export default StackNavigation;
