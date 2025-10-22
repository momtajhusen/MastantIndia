//import libraries
import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ImageBackground, 
    TextInput, 
    TouchableOpacity,
    StatusBar,
    Image,
    Keyboard,
    Animated,
    Dimensions,
    Easing,
    ActivityIndicator
} from 'react-native';
import { rh, rw, rf } from '../../constants/responsive';
import { sendOtp } from "../../services/auth";


const { height: screenHeight } = Dimensions.get('window');

// create a component
const LoginScreen = ({ navigation }) => {
    const [keyboardHeight] = useState(new Animated.Value(0));
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isValidNumber, setIsValidNumber] = useState(false);
    const [validationMessage, setValidationMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
        // Keyboard ki height ke hisab se upar move karega
        const keyboardOffset = -event.endCoordinates.height;
        
        // Smooth animation ke sath upar jaega
        Animated.timing(keyboardHeight, {
            duration: 250,
            toValue: keyboardOffset,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
            useNativeDriver: false,
        }).start();
    });
    
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        // Keyboard hide hone par original position pe aayega
        Animated.timing(keyboardHeight, {
            duration: 250,
            toValue: 0,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
            useNativeDriver: false,
        }).start();
    });

    return () => {
        keyboardDidHideListener?.remove();
        keyboardDidShowListener?.remove();
    };
}, []);

    // Phone number validation for Indian numbers
    const validatePhoneNumber = (number) => {
        // Remove any non-digit characters
        const cleanNumber = number.replace(/[^0-9]/g, '');
        
        // Indian mobile number validation
        if (cleanNumber.length === 10) {
            // Check if first digit is valid (6, 7, 8, or 9)
            const firstDigit = cleanNumber[0];
            if (['6', '7', '8', '9'].includes(firstDigit)) {
                setIsValidNumber(true);
            } else {
                setIsValidNumber(false);
            }
        } else {
            setIsValidNumber(false);
        }
    };

    const handlePhoneInputChange = (text) => {
        // Remove +91 if user tries to type it
        let cleanText = text.replace('+91', '').replace(/[^0-9]/g, '');
        
        // Limit to 10 digits
        if (cleanText.length > 10) {
            cleanText = cleanText.substring(0, 10);
        }
        
        setPhoneNumber(cleanText);
        validatePhoneNumber(cleanText);
        
        // Clear any previous validation message when user types
        if (validationMessage) {
            setValidationMessage('');
        }
    };

    const handleSkip = () => {
        navigation.navigate('CustomerBottomTabNavigator');
    };

    const handleGetVerificationCode = async () => {
    if (isValidNumber) {
        setIsLoading(true);
        setValidationMessage('');

        try {
        // API call with correct payload
        const res = await sendOtp({
            mobile: phoneNumber,
            purpose: "login"
        });

        console.log(res.data);
        if (res.data?.success === true) {
            // OTP send ho gaya to OTP screen pe navigate
            navigation.navigate("OTPVerificationScreen", {
            phoneNumber: phoneNumber,
            otp: res.data?.otp,
            expiresAt: res.data?.expires_at,
            });
        } else {
            setValidationMessage(res.data?.message || "Something went wrong");
        }

        } catch (error) {
        console.log("OTP request error:", error?.response?.data || error.message);
        setValidationMessage("Failed to send OTP. Please try again.");
        } finally {
        setIsLoading(false);
        }
    } else {
        if (phoneNumber.length === 0) {
        setValidationMessage("Please enter your mobile number");
        } else if (phoneNumber.length < 10) {
        setValidationMessage("Please enter a valid 10-digit mobile number");
        } else {
        setValidationMessage("Please enter a valid mobile number");
        }
    }
    };

      
      

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            
            {/* Background Image Section - Fixed, ye kabhi change nahi hoga */}
            <View style={styles.imageContainer}>
                <ImageBackground
                    source={require('../../assets/images/LoginBanner.png')}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                >
                    {/* Overlay */}
                    <View style={styles.overlay} />
                    
                    {/* Header Content */}
                    <View style={styles.headerContent}>
                        {/* <TouchableOpacity onPress={handleSkip} style={styles.skipButtonContainer}>
                            <Text style={styles.skipButton}>skip</Text>
                        </TouchableOpacity> */}
                        
                        <View style={[styles.brandContainer]}>
                            <Image
                                source={require('../../assets/images/Applogo.png')}
                                style={{ width: rw(5), height: rw(5) }}
                            />
                            <Text style={styles.brandName}>astant India</Text>
                        </View>
                    </View>
                </ImageBackground>
            </View>

            {/* Bottom Login Container - Smooth animation */}
            <Animated.View 
                style={[
                    styles.bottomContainer, 
                    { 
                        transform: [{ translateY: keyboardHeight }]
                    }
                ]}
            >
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Get professional embroiders {'\n'} and masters in 60 minutes</Text>
                </View>
                
                <View style={{flexDirection:'row', gap:10}}>
                  <View style={styles.lineLogin}></View>
                  <Text style={styles.loginText}>log in or sign up</Text>
                  <View style={styles.lineLogin}></View>
                </View>
                
                <View style={styles.phoneInputContainer}>
                    {/* Country Code */}
                    <View style={styles.countryCodeContainer}>
                        <Image 
                            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Flag_of_India.png/1599px-Flag_of_India.png?20230815162632' }}
                            style={styles.flag}
                            resizeMode="contain"
                        />
                    </View>
                    
                    {/* Phone Number Input */}
                    <View style={styles.phoneInputWrapper}>
                        <Text style={styles.countryCode}>+91</Text>
                        <TextInput
                            style={styles.phoneInput}
                            placeholder="Enter mobile number"
                            placeholderTextColor="#666"
                            keyboardType="number-pad"    // <-- change from numeric
                            textContentType="telephoneNumber" // helps iOS recognize it as a phone input
                            value={phoneNumber}
                            onChangeText={handlePhoneInputChange}
                            maxLength={10}
                        />
                    </View>
                </View>

                {/* Validation Message */}
                {validationMessage ? (
                    <Text style={[
                        styles.validationMessage,
                        { color: isValidNumber ? '#4CAF50' : '#FF5722' }
                    ]}>
                        {validationMessage}
                    </Text>
                ) : null}

                {/* Verification Button */}
                <TouchableOpacity 
                    style={[
                        styles.verificationButton,
                        { 
                            backgroundColor: isValidNumber ? '#4CAF50' : '#666',
                            opacity: isLoading ? 0.7 : 1
                        }
                    ]}
                    onPress={handleGetVerificationCode}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="white" />
                            <Text style={styles.verificationButtonText}></Text>
                        </View>
                    ) : (
                        <Text style={styles.verificationButtonText}>Get Verification Code</Text>
                    )}
                </TouchableOpacity>

                {/* Terms Text */}
                <Text style={styles.termsText}>
                    By continuing, You agree to Mastant India's{'\n'}
                    <Text style={styles.linkText}>Term of service</Text> and <Text style={styles.linkText}>Privacy policy</Text>.
                </Text>
            </Animated.View>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    imageContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: screenHeight * 0.5,
        width: '100%',
        zIndex: 1,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'space-between',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    headerContent: {
        flex: 1,
        paddingHorizontal: rw(5),
        paddingTop: rh(6),
    },
    skipButtonContainer: {
        position: 'absolute',
        right: rw(5),
        top: rh(6),
        padding: rw(2),
    },
    skipButton: {
        color: 'white',
        fontSize: rf(2),
        textAlign: 'right',
    },
    brandContainer: {
        flexDirection:'row',
        alignItems:'center',
        position: 'absolute',
        top: rh(9),
        left: rw(3),
        backgroundColor: 'black',
        paddingHorizontal: rw(4),
        paddingVertical: rh(1),
        borderRadius: 20,
    },
    brandName: {
        color: 'white',
        fontSize: rf(2),
        fontWeight: '800',
        fontFamily: 'Afacad',
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: screenHeight * 0.5,
        backgroundColor: '#000',
        paddingHorizontal: rw(5),
        paddingVertical: rh(3),
        justifyContent: 'flex-start',
        zIndex: 2,
    },
    titleContainer: {
        marginBottom: rh(2),
        alignItems: 'center',
        
    },
    title: {
        color: '#FFFFFF',
        fontSize: rf(3),
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: rf(4),
        fontFamily: 'Afacad',
    },
    lineLogin:{
      marginTop:12,
      height:0.5,
      width:100,
      backgroundColor:'#FFFFFF'
    },
    loginText: {
        color: '#D9D9D9',
        fontSize: rf(2),
        textAlign: 'center',
        marginBottom: rh(2),
    },
    phoneInputContainer: {
        flexDirection: 'row',
        marginBottom: rh(1),
    },
    countryCodeContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginRight: rw(2),
        justifyContent: 'center',
        alignItems: 'center',
        width: rw(15),
        height: rh(6),
    },
    flag: {
        width: rw(6),
        height: rh(3),
    },
    phoneInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        alignItems: 'center',
        height: rh(6),
        paddingHorizontal: rw(3),
    },
    countryCode: {
        fontSize: rf(2),
        color: '#000',
        marginRight: rw(2),
        fontWeight: '600',
    },
    phoneInput: {
        flex: 1,
        fontSize: rf(2),
        color: '#000',
        height: '100%',
    },
    validationMessage: {
        fontSize: rf(1.5),
        paddingHorizontal: rw(2),
    },
    verificationButton: {
        backgroundColor: '#666',
        borderRadius: 8,
        paddingVertical: rh(2),
        alignItems: 'center',
        marginBottom: rh(2),
        justifyContent: 'center',
        height: rh(6),
        marginTop:rh(1)
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rw(2),
    },
    verificationButtonText: {
        color: 'white',
        fontSize: rf(2),
        fontWeight: '600',
    },
    termsText: {
        color: '#999',
        fontSize: rf(1.5),
        textAlign: 'center',
        lineHeight: rf(2),
        position: 'absolute',
        bottom: rh(5),
        left: rw(5),
        right: rw(5),
    },
    linkText: {
        color: '#999',
       fontWeight:'500'
    },
});

//make this component available to the app
export default LoginScreen;