import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigation from './src/navigation/StackNavigation';
import { AppProvider } from './src/context/AppContext';
import { MenuProvider } from 'react-native-popup-menu';
import { useFonts } from 'expo-font';
import { StatusBar } from 'react-native';

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
    return null;
  }

  return (
    <MenuProvider>
      <AppProvider>
        <NavigationContainer>
          <StatusBar backgroundColor="black" barStyle="light-content" />
          <StackNavigation />
        </NavigationContainer>
      </AppProvider>
    </MenuProvider>
  );
};

export default App;
