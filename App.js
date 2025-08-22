import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigation from './src/navigation/StackNavigation';
import { AppProvider } from './src/context/AppContext';
import { MenuProvider } from 'react-native-popup-menu';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { StatusBar } from 'react-native'; // 👈 import StatusBar

// prevent auto hide
SplashScreen.preventAutoHideAsync();

const App = () => {
  const [fontsLoaded] = useFonts({
    Afacad: require('./src/assets/fonts/Afacad/Afacad-VariableFont_wght.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <AppLoading />; // ya null bhi return kar sakte ho
  }

  return (
    <MenuProvider>
      <AppProvider>
        <NavigationContainer>
          {/* 👇 yaha black status bar set kar diya */}
          <StatusBar backgroundColor="black" barStyle="light-content" />
          <StackNavigation />
        </NavigationContainer>
      </AppProvider>
    </MenuProvider>
  );
};

export default App;
