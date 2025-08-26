import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { rh, rw, rf } from '../../../constants/responsive';
import RazorpayPayment from '../../../components/Payment/RazorpayPayment';

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      title: 'Hand Embroider',
      image: require('../../../assets/images/services/hand-embroider.png'),
      basePrice: 100, // per hour per person
      people: 2,
      duration: 8, // hours
      durationType: 'hours',
      type: 'per hour'
    },
    {
      id: 2,
      title: 'Machine Embroider',
      image: require('../../../assets/images/services/machine-embroider.png'),
      basePrice: 750, // per day per person
      people: 1,
      duration: 3, // days
      durationType: 'days',
      type: 'custom days'
    },
    {
      id: 3,
      title: 'Tailor',
      image: require('../../../assets/images/services/tailor.png'),
      basePrice: 600, // per day per person
      people: 2,
      duration: 15, // days
      durationType: 'days',
      type: 'monthly'
    }
  ]);

  const calculateItemPrice = (item) => {
    return item.basePrice * item.people * item.duration;
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + calculateItemPrice(item), 0);
  };

  const calculateTax = () => {
    return Math.round(calculateTotal() * 0.18); // 18% GST
  };

  const calculateFinalTotal = () => {
    return calculateTotal() + calculateTax();
  };

  const handleDeleteItem = (itemId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setCartItems(cartItems.filter(item => item.id !== itemId));
          },
        },
      ]
    );
  };

  const CartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemImageContainer}>
        <Image source={item.image} style={styles.itemImage} resizeMode="cover" />
      </View>
      
      <View style={styles.itemDetails}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {/* Handle edit - open modal or navigate to edit screen */}}
            >
              <Ionicons name="create-outline" size={18} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteItem(item.id)}
            >
              <Ionicons name="trash-outline" size={18} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.itemType}>{item.type}</Text>
        <Text style={styles.itemPrice}>₹{item.basePrice}/{item.durationType === 'hours' ? 'hr' : 'day'}/person</Text>
        
        <View style={styles.itemControls}>
          <View style={styles.controlGroup}>
            <Ionicons name="people-outline" size={14} color="#666" />
            <Text style={styles.controlValue}>{item.people} people</Text>
          </View>
          
          <View style={styles.controlGroup}>
            <Ionicons name={item.durationType === 'hours' ? 'time-outline' : 'calendar-outline'} size={14} color="#666" />
            <Text style={styles.controlValue}>{item.duration} {item.durationType}</Text>
          </View>
        </View>
        
        <Text style={styles.totalItemPrice}>Total: ₹{calculateItemPrice(item)}</Text>
      </View>
    </View>
  );

  const EmptyCart = () => (
    <View style={styles.emptyCartContainer}>
      <Ionicons name="cart-outline" size={80} color="#ccc" />
      <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
      <Text style={styles.emptyCartSubtitle}>Add some services to get started</Text>
      <TouchableOpacity 
        style={styles.shopNowButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.shopNowText}>Browse Services</Text>
      </TouchableOpacity>
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.content}>
          <EmptyCart />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart ({cartItems.length} items)</Text>
        {/* <TouchableOpacity style={styles.headerRight}>
          <Ionicons name="heart-outline" size={24} color="#fff" />
        </TouchableOpacity> */}
      </View>

      {/* Cart Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View style={styles.itemsContainer}>
          {cartItems.map(item => (
            <CartItem key={item.id} item={item} />
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{calculateTotal()}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>GST (18%)</Text>
            <Text style={styles.summaryValue}>₹{calculateTax()}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={[styles.summaryValue, styles.freeText]}>Free</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{calculateFinalTotal()}</Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.addressContainer}>
          <View style={styles.addressHeader}>
            <Text style={styles.addressTitle}>Delivery Address</Text>
            <TouchableOpacity>
              <Text style={styles.changeAddressText}>Change</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.addressText}>64 A shahpurjat new delhi</Text>
          <Text style={styles.addressText}>pincode - 110017</Text>
        </View>
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Checkout Footer */}
      <View style={styles.checkoutFooter}>
        <View style={styles.totalContainer}>
          <Text style={styles.footerTotalLabel}>Total</Text>
          <Text style={styles.footerTotalAmount}>₹{calculateFinalTotal()}</Text>
        </View>

        <RazorpayPayment
          amount={calculateFinalTotal()}
          orderDetails={{
            description: `Payment for ${cartItems.length} services`,
            razorpayKey: 'rzp_test_your_key_here',
            orderId: 'order_' + Date.now(),
            name: 'Mastant India',
            email: 'customer@example.com',
            phone: '9999999999',
          }}
          onSuccess={(data) => {
            Alert.alert(
              'Payment Successful',
              'Your order has been placed successfully!',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    setCartItems([]);
                    navigation.navigate('Orders');
                  }
                }
              ]
            );
          }}
          onFailure={(error) => {
            Alert.alert('Payment Failed', error.description || 'Please try again');
          }}
          buttonStyle={styles.checkoutButton}
          buttonText="Proceed to Pay"
          buttonTextStyle={styles.checkoutButtonText}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  itemsContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'flex-start',
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 15,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  itemType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  itemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 15,
  },
  controlGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  controlValue: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  totalItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  freeText: {
    color: '#4CAF50',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  addressContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  changeAddressText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  promoContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoText: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    marginLeft: 10,
  },
  bottomPadding: {
    height: 100,
  },
  checkoutFooter: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  totalContainer: {
    alignItems: 'flex-start',
  },
  footerTotalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  footerTotalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  checkoutButton: {
    backgroundColor: '#000',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 150,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyCartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyCartSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  shopNowButton: {
    backgroundColor: '#000',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shopNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CartScreen;