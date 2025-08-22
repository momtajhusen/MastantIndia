// components/Payment/RazorpayPayment.js
// Mock Razorpay Component for Expo Go

import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert 
} from 'react-native';

// Detect if we are running in Expo Go
import Constants from 'expo-constants';
const isExpoGo = Constants.appOwnership === 'expo';

const RazorpayPayment = ({
  amount,
  orderDetails,
  onSuccess,
  onFailure,
  buttonText = "Pay Now",
  buttonStyle = {},
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = () => {
    if (disabled || isLoading) return;
    setIsLoading(true);

    if (isExpoGo) {
      // Mock payment flow for Expo Go
      setTimeout(() => {
        setIsLoading(false);
        Alert.alert(
          'Expo Go Mock Payment',
          `This is a mock payment of ₹${amount}. No real payment was processed.`,
          [{ text: 'OK', onPress: () => onSuccess && onSuccess({
            razorpay_payment_id: 'MOCK123456',
            razorpay_order_id: 'MOCKORDER123',
            razorpay_signature: 'MOCKSIGN',
            amount: amount,
            currency: 'INR'
          }) }]
        );
      }, 1500);
    } else {
      // Real Razorpay (for dev build / apk)
      try {
        const RazorpayCheckout = require('react-native-razorpay').default;

        var options = {
          description: orderDetails?.description || 'Payment for services',
          image: orderDetails?.logo || 'https://your-domain.com/logo.png',
          currency: orderDetails?.currency || 'INR',
          key: orderDetails?.razorpayKey || 'rzp_test_your_key_here',
          amount: amount * 100,
          name: orderDetails?.businessName || 'Your Business',
          order_id: orderDetails?.orderId,
          prefill: {
            email: orderDetails?.email || 'customer@example.com',
            contact: orderDetails?.phone || '9999999999',
            name: orderDetails?.name || 'Customer'
          },
          theme: { color: orderDetails?.themeColor || '#000000' }
        };

        RazorpayCheckout.open(options)
          .then(data => {
            setIsLoading(false);
            onSuccess && onSuccess(data);
          })
          .catch(error => {
            setIsLoading(false);
            onFailure && onFailure(error);
          });

      } catch (error) {
        setIsLoading(false);
        console.warn('Razorpay module not available. Use EAS dev build or standalone APK.', error);
        Alert.alert('Payment Not Available', 'Razorpay is not supported in Expo Go.');
      }
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.defaultButton,
        buttonStyle,
        (disabled || isLoading) && styles.disabledButton
      ]}
      onPress={handlePress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#fff" size="small" />
          <Text style={[styles.defaultButtonText, { marginLeft: 8 }]}>Processing...</Text>
        </View>
      ) : (
        <Text style={styles.defaultButtonText}>
          {buttonText.includes('₹') ? buttonText : `${buttonText}`}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  defaultButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  disabledButton: {
    opacity: 0.6,
  },
  defaultButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default RazorpayPayment;
