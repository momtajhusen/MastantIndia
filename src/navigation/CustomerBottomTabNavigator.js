import React, { useEffect, useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { rw, rh, rf } from '../constants/responsive';
import { AppContext } from '../context/AppContext';

// Dummy screens (replace later with actual screens)
import CustomerHomeScreen from '../screens/Customer/Dashboard/CustomerHomeScreen';
import CustomerProfileScreen from '../screens/Customer/Profile/CustomerProfileScreen';
import BookingHistoryScreen from '../screens/Customer/Profile/BookingHistoryScreen';

const Tab = createBottomTabNavigator();

const CustomerBottomTabNavigator = () => {
  const { state, dispatch } = useContext(AppContext);

  const fetchCartDetails = async () => {
    await viewCartData();
  };

  useEffect(() => {
    fetchCartDetails();
  }, []);

  return (
    <Tab.Navigator
      lazy={true}
      screenOptions={{
        tabBarShowLabel: false, // ✅ hide labels
        tabBarActiveTintColor: "#000000", // ✅ active = black
        tabBarInactiveTintColor: "#757575", // ✅ inactive = grey
        tabBarStyle: {
          backgroundColor: "white",
          height: rh(10),
          paddingTop: rh(1),
          borderTopWidth: 0,
          paddingBottom: rh(1),
        },
        headerShown: false,
      }}
    >
      {/* Home */}
      <Tab.Screen
        name="Home"
        component={CustomerHomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={rf(3.5)} color={color} />
          ),
          tabBarButton: (props) => <Pressable {...props} android_ripple={null} />,
        }}
      />

      {/* Calendar */}
      <Tab.Screen
        name="Calendar"
        component={CustomerHomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar-outline" size={rf(3.5)} color={color} />
          ),
          tabBarButton: (props) => <Pressable {...props} android_ripple={null} />,
        }}
      />

      {/* Cart */}
      <Tab.Screen
        name="Cart"
        component={CustomerHomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="cart-outline" size={rf(3.5)} color={color} />
          ),
          tabBarButton: (props) => <Pressable {...props} android_ripple={null} />,
        }}
      />

      {/* History */}
      <Tab.Screen
        name="History"
        component={BookingHistoryScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="time-outline" size={rf(3.5)} color={color} />
          ),
          tabBarButton: (props) => <Pressable {...props} android_ripple={null} />,
        }}
      />

      {/* Profile */}
      <Tab.Screen
        name="Profile"
        component={CustomerProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={rf(3.5)} color={color} />
          ),
          tabBarButton: (props) => <Pressable {...props} android_ripple={null} />,
        }}
      />

    </Tab.Navigator>
  );
};

export default CustomerBottomTabNavigator;
