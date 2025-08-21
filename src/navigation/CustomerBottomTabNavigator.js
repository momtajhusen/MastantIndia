import React, { useEffect, useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Pressable, Image } from 'react-native';

 
import CategoryScreen from '../screens/CommonScreen/CategorysScreen';
import { rw, rh, rf } from '../Service/responsive';
import { AppContext } from '../context/AppContext';
import { useViewCartData } from '../utility/viewCardDataUtils';

const Tab = createBottomTabNavigator();


const CustomerBottomTabNavigator = () => {
  const { state, dispatch } = useContext(AppContext);

  const cartCount = state.viewCartData?.cartProduct?.length ?? 0;

  const { isViewCartLoading, viewCartData } = useViewCartData();

  const fetchCartDetails = async () => {
    await viewCartData();
  };

  useEffect(() => {
    fetchCartDetails();
  }, []);

  return (
    <Tab.Navigator
      lazy={true}
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "#FF3131",
        tabBarInactiveTintColor: "#6C6C6C",
        tabBarStyle: {
          backgroundColor: "white",
          height: rh(10),
          paddingTop: rh(1),
          borderTopWidth: 0,
          paddingBottom: rh(1),
        },
        tabBarLabelStyle: {
          fontSize: rf(1.5),
          paddingBottom: rh(1.5),
          fontWeight: 'bold',
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            focused ? (
              <Image
                source={require('../assets/navigation-icon/home-1.png')}
                resizeMode="cover"
                style={{ width: rf(3.5), height: rf(3.5) }}
              />
            ) : (
              <Image
                source={require('../assets/navigation-icon/home-2.png')}
                resizeMode="cover"
                style={{ width: rf(3.5), height: rf(3.5) }}
              />
            )
          ),
          tabBarButton: (props) => (
            <Pressable {...props} android_ripple={null} />
          ),
        }}
      />

      <Tab.Screen
        name="Category"
        component={CategoryScreen}
        options={{
          tabBarLabel: 'Category',
          tabBarIcon: ({ focused }) => (
            focused ? (
              <Image
                source={require('../assets/navigation-icon/category-1.png')}
                resizeMode="cover"
                style={{ width: rf(3.5), height: rf(3.5) }}
              />
            ) : (
              <Image
                source={require('../assets/navigation-icon/category-2.png')}
                resizeMode="cover"
                style={{ width: rf(3.5), height: rf(3.5) }}
              />
            )
          ),
          tabBarButton: (props) => (
            <Pressable {...props} android_ripple={null} />
          ),
        }}
      />

      
    </Tab.Navigator>
  );
};

export default CustomerBottomTabNavigator;
