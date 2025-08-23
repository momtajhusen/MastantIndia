import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigation from './src/navigation/StackNavigation';
import { AppProvider } from './src/context/AppContext';
import { MenuProvider } from 'react-native-popup-menu';
import { useFonts } from 'expo-font';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
    <SafeAreaProvider>
      {/* ✅ Global StatusBar */}
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <MenuProvider>
        <AppProvider>
          <NavigationContainer>
            <StackNavigation />
          </NavigationContainer>
        </AppProvider>
      </MenuProvider>
    </SafeAreaProvider>
  );
};

export default App;
