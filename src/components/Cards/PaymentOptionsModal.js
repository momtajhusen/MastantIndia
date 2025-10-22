import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RazorpayCheckout from 'react-native-razorpay';

const { width, height } = Dimensions.get('window');

const PaymentOptionsModal = ({ 
  visible, 
  onClose, 
  onCashPayment,
  totalAmount,
  userDetails = {}, // { name, email, contact }
  razorpayKey = 'rzp_test_6DTE6DQT8QAGvW', // Replace with your key
  orderId = null, // Optional: Your backend order ID (will be auto-generated if not provided)
  onPaymentSuccess,
  onPaymentError
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [slideAnim] = useState(new Animated.Value(height));

  useEffect(() => {
    if (visible) {
      setSelectedOption(null);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return gestureState.dy > 10 && Math.abs(gestureState.dx) < 100;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        slideAnim.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 150 || gestureState.vy > 0.5) {
        closeModal();
      } else {
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setSelectedOption(null);
      onClose();
    });
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

// 🔹 Dummy Razorpay Payment Handler (no backend)
const handleRazorpayPayment = async () => {
  try {
    const options = {
      description: 'Payment for your order',
      image: 'https://i.imgur.com/3g7nmJC.png',
      currency: 'INR',
      key: 'rzp_test_tPhc333asPKtv6',
      amount: Number(totalAmount) * 100,  
      name: 'Mastant India',
      prefill: {
        email: 'testuser@example.com',
        contact: '9999999999',
        name: 'Test User'
      },
      theme: { color: '#000000' },
    };

    const data = await RazorpayCheckout.open(options);
    Alert.alert('✅ Payment Successful', `Payment ID: ${data.razorpay_payment_id}`);
  } catch (error) {
    console.log('Payment Error:', error);
    Alert.alert('❌ Payment Failed', 'Something went wrong. Please try again.');
  }
};

  const handleProceed = () => {
    if (!selectedOption) return;
    
    closeModal();
    
    setTimeout(() => {
      if (selectedOption === 'online') {
        handleRazorpayPayment();
      } else if (selectedOption === 'cash') {
        onCashPayment();
      }
    }, 300);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalBackground} 
          activeOpacity={1} 
          onPress={closeModal}
        />
        
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.dragHandle} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Payment Method</Text>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amountValue}>₹{totalAmount}</Text>
          </View>

          <View style={styles.optionsContainer}>
            {/* Online Payment Option */}
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedOption === 'online' && styles.selectedOption
              ]}
              onPress={() => handleOptionSelect('online')}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.iconContainer, styles.onlineIconContainer]}>
                  <Ionicons name="card-outline" size={24} color="#000" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Online Payment</Text>
                  <Text style={styles.optionSubtitle}>
                    Pay using UPI, Card, Net Banking
                  </Text>
                </View>
              </View>
              <View style={styles.optionRight}>
                <View style={[
                  styles.radioButton,
                  selectedOption === 'online' && styles.radioButtonSelected
                ]}>
                  {selectedOption === 'online' && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {/* Cash Payment Option */}
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedOption === 'cash' && styles.selectedOption
              ]}
              onPress={() => handleOptionSelect('cash')}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.iconContainer, styles.cashIconContainer]}>
                  <Ionicons name="cash-outline" size={24} color="#000" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Cash Payment</Text>
                  <Text style={styles.optionSubtitle}>
                    Pay cash when service is delivered
                  </Text>
                </View>
              </View>
              <View style={styles.optionRight}>
                <View style={[
                  styles.radioButton,
                  selectedOption === 'cash' && styles.radioButtonSelected
                ]}>
                  {selectedOption === 'cash' && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.securityContainer}>
            <Ionicons name="shield-checkmark" size={16} color="#000" />
            <Text style={styles.securityText}>
              Your payment is secured with 256-bit SSL encryption
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={closeModal}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.proceedButton,
                !selectedOption && styles.proceedButtonDisabled
              ]}
              onPress={handleProceed}
              disabled={!selectedOption}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.proceedButtonText,
                !selectedOption && styles.proceedButtonTextDisabled
              ]}>
                Proceed to Pay
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingBottom: 20,
    maxHeight: height * 0.85,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 5,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
  },
  amountContainer: {
    backgroundColor: '#000',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 5,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  optionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  selectedOption: {
    borderColor: '#000',
    backgroundColor: '#f8f8f8',
    shadowColor: '#000',
    shadowOpacity: 0.15,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 55,
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  onlineIconContainer: {
    backgroundColor: '#f5f5f5',
  },
  cashIconContainer: {
    backgroundColor: '#f5f5f5',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  optionRight: {
    marginLeft: 10,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  radioButtonSelected: {
    borderColor: '#000',
    backgroundColor: '#000',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  securityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    gap: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#000',
    flex: 1,
    lineHeight: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  proceedButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedButtonDisabled: {
    backgroundColor: '#ccc',
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  proceedButtonTextDisabled: {
    color: '#999',
  },
});

export default PaymentOptionsModal;