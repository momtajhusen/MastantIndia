import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { rw } from '../../constants/responsive';

const nameSlideAnimation = {
  from: { 
    translateX: -rw(40), 
    opacity: 0 
  }, 
  to: { 
    translateX: 0, 
    opacity: 1 
  },
};

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('LoginScreen');
    }, 3000); 

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.mainContentWrapper}>
        <Animatable.Image
          animation="fadeIn"      
          duration={1000}         
          delay={200}             
          source={require('../../assets/images/Applogo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />

        <View style={styles.textClipContainer}>
          
          <View style={styles.appNameTextContainer}>
            <Animatable.Text
              animation={nameSlideAnimation}
              duration={1000}
              delay={900} 
              style={styles.appNameText}
            >
              Mastant
            </Animatable.Text>

            <Animatable.Text
              animation={nameSlideAnimation}
              duration={1000}
              delay={1300} 
              style={styles.appNameText}
            >
              India
            </Animatable.Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000', 
  },
  mainContentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: rw(20),
    height: rw(20),
    zIndex: 2, 
    position: 'relative',
  },
  textClipContainer: {
    overflow: 'hidden', 
    height: rw(14),
    position: 'absolute', 
    left: rw(20), 
    zIndex: 1, 
  },
  appNameTextContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
    paddingLeft: rw(2), 
  },
  appNameText: {
    fontSize: rw(6),
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: rw(7),
  },
});

export default SplashScreen;