import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { verifyOtp } from "../../services/auth";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get('window');

const OTPVerificationScreen = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(180);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { phoneNumber } = route.params;

  // Auto focus on first input when component mounts
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Format countdown to show minutes and seconds
  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (value, index) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = numericValue;
      setOtp(newOtp);
      setError(''); // Clear error when user starts typing

      // Auto focus next input
      if (numericValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace - move to previous input if current is empty
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleDelete = (index) => {
    const newOtp = [...otp];
    newOtp[index] = '';
    setOtp(newOtp);
    
    // Show validation message when deleting
    if (otp[index]) {
      setError('Please enter complete 6-digit OTP');
    }
    
    // Focus on the current input after delete
    inputRefs.current[index]?.focus();
  };

  const isValidOtp = () => {
    const otpString = otp.join('');
    return otpString.length === 6 && /^\d{6}$/.test(otpString);
  };

  const handleContinue = async () => {
    if (!isValidOtp()) {
      setError("Please enter complete 6-digit OTP");
      return;
    }

    const otpString = otp.join(""); // ['9','5','4','1','7','3'] -> "954173"
    setLoading(true);
    setError("");

    try {
      // API call with correct payload
      const res = await verifyOtp({
        mobile: phoneNumber,
        otp: otpString,
        name: "Test User", // agar user name required hai
        role: "manufacturer" // ya jo bhi role ho
      });

      if (res.data?.success === true) {
        // Token save karna
        await AsyncStorage.setItem("access_token", res.data?.token);

        // User info bhi store kar sakte ho future use ke liye
        await AsyncStorage.setItem("user", JSON.stringify(res.data?.user));

        // Navigate to home
        navigation.replace("CustomerBottomTabNavigator");
      } else {
        setError(res.data?.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.log("OTP verify error:", err?.response?.data || err.message);
      setError("OTP verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleResendOtp = () => {
    Alert.alert('OTP Sent', 'A new 6-digit OTP has been sent to +91 9315352806');
    setOtp(['', '', '', '', '', '']);
    setError('');
    setCountdown(180);
    setCanResend(false);
    // Auto focus first input after resend
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Enter the 6-digit code</Text>
        <Text style={styles.subtitle}>
          6 digit OTP has been sent to +91 9315352806
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => inputRefs.current[index] = ref}
              style={[
                styles.otpInput,
                digit ? styles.otpInputFilled : null,
                error ? styles.otpInputError : null
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              textContentType="telephoneNumber" 
              maxLength={1}
              selectTextOnFocus
              onFocus={() => setError('')}
              editable={!loading}
            />
          ))}
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <TouchableOpacity 
          style={[styles.resendContainer, !canResend && styles.resendDisabled]} 
          onPress={canResend ? handleResendOtp : null}
          disabled={loading || !canResend}
        >
          <Text style={[styles.resendText, !canResend && styles.resendTextDisabled]}>
            {canResend ? 
              "Didn't receive the OTP? Resend OTP" : 
              `Didn't receive the OTP? Resend OTP in ${formatCountdown(countdown)}`
            }
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.continueButton,
            (!isValidOtp() || loading) ? styles.continueButtonDisabled : null
          ]} 
          onPress={handleContinue}
          disabled={!isValidOtp() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.continueButtonText}>continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 40,
    lineHeight: 22,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  otpInputFilled: {
    backgroundColor: '#D0D0D0',
  },
  otpInputError: {
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  resendContainer: {
    marginBottom: 40,
  },
  resendDisabled: {
    opacity: 0.6,
  },
  resendText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'left',
  },
  resendTextDisabled: {
    color: '#666666',
  },
  continueButton: {
    backgroundColor: '#000000',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40,
  },
  continueButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
});

export default OTPVerificationScreen;