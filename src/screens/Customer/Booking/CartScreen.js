// CartScreen.js - Redesigned with new UI, keeping all API functionality
import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import RazorpayPayment from '../../../components/Payment/RazorpayPayment';
import PaymentOptionsModal from '../../../components/Cards/PaymentOptionsModal';
import ServiceDetailModal from '../../../components/Cards/ServiceDetailModal';
import { getCartItems, removeCartItem, updateCartItem } from "../../../services/cart";
import { checkoutBooking } from "../../../services/bookings";
import { useAlert, ALERT_TYPES } from '../../../components/AlertProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CartScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  
  // Main state
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCartItem, setEditingCartItem] = useState(null);

const formatDateTime = (dateStr, timeStr, durationType, duration) => {
  const start = dayjs(timeStr, 'HH:mm');
  const end = durationType === 'hour' 
    ? start.add(duration, 'hour')    // exact hours
    : start.add(duration * 8, 'hour'); // 8 hrs per day

  return `${dayjs(dateStr).format('DD MMM')} ${start.format('hh:mm A')} to ${end.format('hh:mm A')}`;
};



  // Load cart items function
  const loadCartItems = async () => {
    try {
      setLoading(true);
      const response = await getCartItems();
      
      if (response.data.success) {
        const transformedItems = response.data.cart_items.map(item => ({
          id: item.id,
          title: item.category.name,
          basePrice: parseFloat(getDurationPrice(item.category, item.duration_type)),
          people: item.worker_count,
          duration: item.duration_value,
          durationType: item.duration_type === 'day' ? 'days' : item.duration_type + 's',
          type: getServiceType(item.duration_type),
          categoryId: item.category_id,
          manufacturerId: item.manufacturer_id,
          unitPrice: parseFloat(item.unit_price),
          totalPrice: parseFloat(item.total_price),
          preferredDate: item.preferred_date,
          preferredTime: item.preferred_time,
          specialRequirements: item.special_requirements,
          category: item.category,
          rawData: item
        }));

        setCartItems(transformedItems);
        setTotalAmount(response.data.total_amount);
        setItemCount(response.data.item_count);
      }
    } catch (error) {
      console.error('Error loading cart items:', error);
      showAlert({
        type: ALERT_TYPES.ERROR,
        title: 'Failed to Load Cart',
        message: 'Unable to load your cart items. Please check your connection and try again.',
        actions: [
          { text: 'Retry', style: 'primary', onPress: () => loadCartItems() },
          { text: 'Cancel', style: 'default' }
        ],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCartItems();
    }, [])
  );

  useEffect(() => {
    loadCartItems();
  }, []);

  // Helper functions
  const getDurationPrice = (category, durationType) => {
    switch (durationType) {
      case 'hour': return category.price_per_hour;
      case 'day': return category.price_per_day;
      case 'week': return category.price_per_week;
      case 'month': return category.price_per_month;
      case 'full_time': return category.price_full_time;
      default: return category.price_per_day;
    }
  };

  const getServiceType = (durationType) => {
    switch (durationType) {
      case 'hour': return 'per hour';
      case 'day': return 'custom days';
      case 'week': return 'weekly';
      case 'month': return 'monthly';
      case 'full_time': return 'full time';
      default: return 'custom days';
    }
  };

  const calculateItemPrice = (item) => {
    return item.totalPrice || (item.basePrice * item.people * item.duration);
  };

  const calculateTotal = () => {
    if (totalAmount > 0) return totalAmount;
    return cartItems.reduce((total, item) => total + calculateItemPrice(item), 0);
  };

  const calculateTax = () => {
    return Math.round(calculateTotal() * 0.03);
  };

  const calculateFinalTotal = () => {
    return calculateTotal() + calculateTax();
  };

  // Quantity update handlers
  const handleUpdateQuantity = async (item, increment) => {
    const newQuantity = item.people + increment;
    if (newQuantity < 1) return;

    try {
      const response = await updateCartItem(item.id, {
        worker_count: newQuantity,
        duration_type: item.rawData.duration_type,
        duration_value: item.duration,
      });

      if (response.data.success) {
        await loadCartItems();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      showAlert({
        type: ALERT_TYPES.ERROR,
        title: 'Update Failed',
        message: 'Failed to update quantity. Please try again.',
      });
    }
  };

  // Edit functionality
  const handleEditItem = (cartItem) => {
    setEditingCartItem(cartItem);
    setShowEditModal(true);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setEditingCartItem(null);
  };

  const handleEditSuccess = async (updatedItem) => {
    await loadCartItems();
    showAlert({
      type: ALERT_TYPES.SUCCESS,
      title: 'Item Updated!',
      message: 'Your cart item has been successfully updated.',
      duration: 2500,
    });
  };

  const handleDeleteItem = async (itemId) => {
    showAlert({
      type: ALERT_TYPES.CONFIRM,
      title: 'Remove Item',
      message: 'Are you sure you want to remove this item from your cart?',
      dismissible: false,
      actions: [
        { text: 'Keep Item', style: 'default' },
        {
          text: 'Remove',
          style: 'danger',
          onPress: async () => {
            try {
              const response = await removeCartItem(itemId);
              if (response.data.success) {
                await loadCartItems();
                showAlert({
                  type: ALERT_TYPES.SUCCESS,
                  title: 'Item Removed',
                  message: 'Item has been removed from your cart successfully.',
                  duration: 2500,
                });
              }
            } catch (error) {
              console.error('Error removing cart item:', error);
              showAlert({
                type: ALERT_TYPES.ERROR,
                title: 'Network Error',
                message: 'Failed to remove item. Please try again.',
              });
            }
          },
        },
      ],
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadCartItems();
  };

  // Payment handlers
  const handleCheckout = () => {
    if (paymentMethod === 'cash') {
      handleCashPayment();
    } else {
      setShowPaymentModal(true);
    }
  };

  const handleOnlinePayment = async () => {
    setShowPaymentModal(false);
    try {
      const response = await checkoutBooking({
        work_location: "Mumbai, Maharashtra, India",
        work_description: "Service booking from cart",
        special_instructions: "Please contact before arrival",
      });

      if (response.data.success) {
        const bookingId = response.data.bookings[0].id;
        const amount = response.data.bookings[0].total_price;
        setCurrentBookingId(bookingId);
        
        showAlert({
          type: ALERT_TYPES.SUCCESS,
          title: 'Booking Created!',
          message: 'Your booking has been created successfully. Proceeding to payment...',
          duration: 2000,
        });
        
        setTimeout(() => handleRazorpayPayment(amount, bookingId), 500);
      }
    } catch (error) {
      console.error("Error in online payment booking:", error);
      showAlert({
        type: ALERT_TYPES.ERROR,
        title: 'Booking Error',
        message: 'Something went wrong. Please try again.',
      });
    }
  };

  const handleRazorpayPayment = (amount, bookingId) => {
    Alert.alert(
      'Complete Payment',
      `Please complete the payment of ₹${amount} to confirm your booking.`,
      [
        { text: 'Pay Now', onPress: () => console.log('Payment initiated for booking:', bookingId) },
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => {
            showAlert({
              type: ALERT_TYPES.INFO,
              title: 'Payment Cancelled',
              message: 'Your booking is created but payment is pending.',
            });
          }
        }
      ]
    );
  };

  const handlePaymentSuccess = (paymentData) => {
    showAlert({
      type: ALERT_TYPES.SUCCESS,
      title: 'Payment Successful!',
      message: 'Your order has been placed successfully.',
      actions: [
        {
          text: 'View Orders',
          style: 'primary',
          onPress: () => {
            setCartItems([]);
            setTotalAmount(0);
            setItemCount(0);
            navigation.navigate("Orders");
          },
        },
      ],
    });
  };

  const handlePaymentFailure = (error) => {
    showAlert({
      type: ALERT_TYPES.ERROR,
      title: 'Payment Failed',
      message: 'Your payment could not be processed. Please try again.',
      actions: [
        { text: 'Retry Payment', style: 'primary', onPress: () => setShowPaymentModal(true) },
        { text: 'Cancel', style: 'default' }
      ],
    });
  };

  const handleCashPayment = async () => {
    try {
      const response = await checkoutBooking({
        work_location: "Mumbai, Maharashtra, India",
        work_description: "Service booking from cart",
        special_instructions: "Cash on delivery",
        payment_method: "cash",
      });

      if (response.data.success) {
        showAlert({
          type: ALERT_TYPES.SUCCESS,
          title: 'Order Confirmed!',
          message: 'Your cash payment order has been confirmed successfully.',
          actions: [
            {
              text: 'View Bookings',
              style: 'primary',
              onPress: () => {
                setCartItems([]);
                setTotalAmount(0);
                setItemCount(0);
                navigation.navigate('ActiveUpcomingServices', { initialTab: 'Upcoming' });
              },
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error in cash payment booking:", error);
      showAlert({
        type: ALERT_TYPES.ERROR,
        title: 'Network Error',
        message: 'Something went wrong. Please try again.',
      });
    }
  };

  const handleWalletPayment = async () => {
    setShowPaymentModal(false);
    showAlert({
      type: ALERT_TYPES.INFO,
      title: 'Processing Payment...',
      message: 'Please wait while we process your wallet payment.',
      duration: 2000,
    });

    try {
      const response = await checkoutBooking({
        work_location: "Mumbai, Maharashtra, India",
        work_description: "Service booking from cart",
        special_instructions: "Wallet payment",
        payment_method: "wallet",
      });

      if (response.data.success) {
        showAlert({
          type: ALERT_TYPES.SUCCESS,
          title: 'Payment Successful!',
          message: `Your wallet payment of ₹${calculateFinalTotal()} has been processed successfully.`,
          actions: [
            {
              text: 'View Bookings',
              style: 'primary',
              onPress: () => {
                setCartItems([]);
                setTotalAmount(0);
                setItemCount(0);
                navigation.navigate('ActiveUpcomingServices', { initialTab: 'Upcoming' });
              },
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error in wallet payment:", error);
      showAlert({
        type: ALERT_TYPES.ERROR,
        title: 'Payment Error',
        message: 'Something went wrong. Please try again.',
      });
    }
  };

  // Render Razorpay Payment Component
  const renderRazorpayPayment = () => {
    if (!currentBookingId) return null;
    return (
      <View style={{ display: 'none' }}>
        <RazorpayPayment
          amount={calculateFinalTotal()}
          orderDetails={{
            order_id: currentBookingId,
            email: 'user@example.com',
            contact: '9876543210',
            name: 'Customer'
          }}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
      </View>
    );
  };

  // Cart Item Component (New Design - No quantity controls, only edit/delete)
  const CartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemMainContent}>
        <View style={styles.itemLeft}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemDuration}>Duration - {item.duration} {item.durationType}</Text>
          <Text style={styles.itemDateTime}>
            Date & time - {item.preferredDate && item.preferredTime 
              ? formatDateTime(item.preferredDate, item.preferredTime, item.durationType, item.duration)
              : 'Not scheduled'}
          </Text>

          <Text style={styles.itemHours}>
            {item.durationType === 'hour' 
              ? `${item.duration} hrs` 
              : `${item.duration * 8} hrs x ${item.durationType}`}
          </Text>


        </View>
        
        <View style={styles.itemRight}>
          <Text style={styles.itemPrice}>Rs {calculateItemPrice(item)}</Text>
        </View>
      </View>
      
      <View style={styles.itemActions}>
        <TouchableOpacity 
          style={styles.editServiceButton}
          onPress={() => handleEditItem(item)}
        >
          <Text style={styles.editServiceText}>edit service</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteItem(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
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

  const LoadingScreen = () => (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <View style={{ width: 28 }} />
      </View>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    </SafeAreaView>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart</Text>
          <View style={{ width: 28 }} />
        </View>
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <EmptyCart />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <View style={{
      flex: 1,
      backgroundColor: '#fff',
      paddingTop: insets.top, // ✅ will auto handle notch + navbar
    }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Cart Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Cart Items */}
        {cartItems.map(item => (
          <CartItem key={item.id} item={item} />
        ))}

        {/* Payment Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Payment summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Item total</Text>
            <Text style={styles.summaryValue}>Rs {calculateTotal()}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxes and Fee</Text>
            <Text style={styles.summaryValue}>Rs {calculateTax()}</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total Amount</Text>
            <Text style={styles.summaryTotalValue}>Rs {calculateFinalTotal()}</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Amount to pay</Text>
            <Text style={styles.summaryTotalValue}>Rs {calculateFinalTotal()}</Text>
          </View>
        </View>

        <View style={{ height: 180 }} />
      </ScrollView>

      {/* Bottom Payment Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.paymentMethodContainer}>
          <Text style={styles.payViaLabel}>Pay via</Text>
          <TouchableOpacity 
            style={styles.paymentMethodButton}
            onPress={() => setShowPaymentModal(true)}
          >
            <Text style={styles.paymentMethodText}>
              {paymentMethod === 'cash' ? 'Cash on delivery' : 'Online Payment'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.payButton}
          onPress={handleCheckout}
        >
          <Text style={styles.payButtonText}>Pay Rs {calculateFinalTotal()}</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Options Modal */}
      <PaymentOptionsModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onOnlinePayment={handleOnlinePayment}
        onCashPayment={() => {
          setPaymentMethod('cash');
          setShowPaymentModal(false);
        }}
        onWalletPayment={handleWalletPayment}
        totalAmount={calculateFinalTotal()}
      />

      {/* Edit Cart Item Modal */}
      {editingCartItem && (
        <ServiceDetailModal
          visible={showEditModal}
          onClose={handleEditModalClose}
          serviceId={editingCartItem.categoryId}
          editMode={true}
          cartItemId={editingCartItem.id}
          initialData={{
            rawData: editingCartItem.rawData,
            worker_count: editingCartItem.rawData.worker_count,
            duration_type: editingCartItem.rawData.duration_type,
            duration_value: editingCartItem.rawData.duration_value,
            preferred_date: editingCartItem.rawData.preferred_date,
            preferred_time: editingCartItem.rawData.preferred_time,
            special_requirements: editingCartItem.rawData.special_requirements,
            category: editingCartItem.rawData.category
          }}
          onAddToCart={handleEditSuccess}
        />
      )}

      {/* Razorpay Payment Component */}
      {renderRazorpayPayment()}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  cartItem: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemMainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemLeft: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  itemDuration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemDateTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemHours: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  itemRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editServiceButton: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  editServiceText: {
    fontSize: 14,
    color: '#000',
  },
  deleteButton: {
    padding: 8,
  },
  summaryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#000',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  payViaLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginRight: 8,
  },
  paymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#000',
    marginRight: 4,
  },
  payButton: {
    backgroundColor: '#000',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    minHeight: 400,
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