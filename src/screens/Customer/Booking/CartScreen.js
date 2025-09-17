// CartScreen.js - Complete implementation with edit functionality
import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { rh, rw, rf } from '../../../constants/responsive';
import RazorpayPayment from '../../../components/Payment/RazorpayPayment';
import PaymentOptionsModal from '../../../components/Cards/PaymentOptionsModal';
import ServiceDetailModal from '../../../components/Cards/ServiceDetailModal';
import { getCartItems, removeCartItem, updateCartItem } from "../../../services/cart";
import { checkoutBooking } from "../../../services/bookings";
import { useAlert, ALERT_TYPES } from '../../../components/AlertProvider';

const CartScreen = ({ navigation }) => {
  const { showAlert } = useAlert();
  
  // Main state
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCartItem, setEditingCartItem] = useState(null);

  const formatDateTime = (dateStr, timeStr) => {
    return `${dayjs(dateStr).format('DD/MM/YYYY')} at ${dayjs(timeStr, 'HH:mm').format('hh:mm A')}`;
  };

  // Load cart items function
  const loadCartItems = async () => {
    try {
      setLoading(true);
      const response = await getCartItems();
      
      if (response.data.success) {
        // Transform API data to match component structure
        const transformedItems = response.data.cart_items.map(item => ({
          id: item.id,
          title: item.category.name,
          image: item.category.icon_url || require('../../../assets/images/services/helpers.png'),
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
          {
            text: 'Retry',
            style: 'primary',
            onPress: () => loadCartItems(),
          },
          {
            text: 'Cancel',
            style: 'default',
          }
        ],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Use focus effect to reload cart when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCartItems();
    }, [])
  );

  // Initial load
  useEffect(() => {
    loadCartItems();
  }, []);

  // Helper functions
  const getDurationPrice = (category, durationType) => {
    switch (durationType) {
      case 'hour':
        return category.price_per_hour;
      case 'day':
        return category.price_per_day;
      case 'week':
        return category.price_per_week;
      case 'month':
        return category.price_per_month;
      case 'full_time':
        return category.price_full_time;
      default:
        return category.price_per_day;
    }
  };

  const getServiceType = (durationType) => {
    switch (durationType) {
      case 'hour':
        return 'per hour';
      case 'day':
        return 'custom days';
      case 'week':
        return 'weekly';
      case 'month':
        return 'monthly';
      case 'full_time':
        return 'full time';
      default:
        return 'custom days';
    }
  };

  const calculateItemPrice = (item) => {
    return item.totalPrice || (item.basePrice * item.people * item.duration);
  };

  const calculateTotal = () => {
    if (totalAmount > 0) {
      return totalAmount;
    }
    return cartItems.reduce((total, item) => total + calculateItemPrice(item), 0);
  };

  const calculateTax = () => {
    return Math.round(calculateTotal() * 0.18); // 18% GST
  };

  const calculateFinalTotal = () => {
    return calculateTotal() + calculateTax();
  };

  // Edit functionality
  const handleEditItem = (cartItem) => {
    console.log('Editing cart item with rawData:', cartItem.rawData);
    console.log('Original duration_type from API:', cartItem.rawData.duration_type);
    setEditingCartItem(cartItem);
    setShowEditModal(true);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setEditingCartItem(null);
  };

  const handleEditSuccess = async (updatedItem) => {
    console.log('Cart item updated:', updatedItem);
    // Refresh the cart to show updated data
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
        {
          text: 'Keep Item',
          style: 'default',
        },
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
              } else {
                showAlert({
                  type: ALERT_TYPES.ERROR,
                  title: 'Removal Failed',
                  message: 'Failed to remove item from cart. Please try again.',
                });
              }
            } catch (error) {
              console.error('Error removing cart item:', error);
              
              showAlert({
                type: ALERT_TYPES.ERROR,
                title: 'Network Error',
                message: 'Failed to remove item. Please check your connection and try again.',
                actions: [
                  {
                    text: 'Retry',
                    style: 'primary',
                    onPress: () => handleDeleteItem(itemId),
                  },
                  {
                    text: 'Cancel',
                    style: 'default',
                  }
                ],
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
  const handleOnlinePayment = async () => {
    setShowPaymentModal(false);

    try {
      const response = await checkoutBooking({
        work_location: "Mumbai, Maharashtra, India",
        work_description: "Fashion design work for new collection",
        special_instructions: "Please bring all necessary tools and materials",
      });

      if (response.data.success) {
        showAlert({
          type: ALERT_TYPES.SUCCESS,
          title: 'Booking Created!',
          message: 'Your booking has been created successfully. Proceeding to payment...',
          duration: 2000,
        });

        const bookingId = response.data.bookings[0].id;
        const amount = response.data.bookings[0].total_price;

        RazorpayPayment(amount, async (success) => {
          if (success) {
            showAlert({
              type: ALERT_TYPES.SUCCESS,
              title: 'Payment Successful!',
              message: 'Your order has been placed successfully and payment is confirmed.',
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
          } else {
            showAlert({
              type: ALERT_TYPES.ERROR,
              title: 'Payment Failed',
              message: 'Your payment could not be processed. Please try again or choose a different payment method.',
              actions: [
                {
                  text: 'Retry Payment',
                  style: 'primary',
                  onPress: () => setShowPaymentModal(true),
                },
                {
                  text: 'Cancel',
                  style: 'default',
                }
              ],
            });
          }
        });
      } else {
        showAlert({
          type: ALERT_TYPES.ERROR,
          title: 'Booking Failed',
          message: 'Unable to create your booking. Please check your details and try again.',
          actions: [
            {
              text: 'Retry',
              style: 'primary',
              onPress: () => setShowPaymentModal(true),
            },
            {
              text: 'Cancel',
              style: 'default',
            }
          ],
        });
      }
    } catch (error) {
      console.error("Error in online payment booking:", error);
      
      showAlert({
        type: ALERT_TYPES.ERROR,
        title: 'Booking Error',
        message: 'Something went wrong while creating your booking. Please check your connection and try again.',
        actions: [
          {
            text: 'Retry',
            style: 'primary',
            onPress: () => setShowPaymentModal(true),
          },
          {
            text: 'Contact Support',
            style: 'default',
            onPress: () => {
              navigation.navigate('Support');
            },
          }
        ],
      });
    }
  };

  const handleCashPayment = async () => {
    setShowPaymentModal(false);

    try {
      const response = await checkoutBooking({
        work_location: "Mumbai, Maharashtra, India",
        work_description: "Fashion design work for new collection",
        special_instructions: "Please bring all necessary tools and materials",
        payment_method: "cash",
      });

      if (response.data.success) {
        showAlert({
          type: ALERT_TYPES.SUCCESS,
          title: 'Order Confirmed!',
          message: 'Your cash payment order has been confirmed successfully. You can pay when the service is delivered.',
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
      } else {
        showAlert({
          type: ALERT_TYPES.ERROR,
          title: 'Booking Failed',
          message: 'Failed to confirm your cash payment booking. Please try again.',
          actions: [
            {
              text: 'Retry',
              style: 'primary',
              onPress: () => setShowPaymentModal(true),
            },
            {
              text: 'Cancel',
              style: 'default',
            }
          ],
        });
      }
    } catch (error) {
      console.error("Error in cash payment booking:", error);
      
      showAlert({
        type: ALERT_TYPES.ERROR,
        title: 'Network Error',
        message: 'Something went wrong while confirming your booking. Please check your connection and try again.',
        actions: [
          {
            text: 'Retry',
            style: 'primary',
            onPress: () => setShowPaymentModal(true),
          },
          {
            text: 'Contact Support',
            style: 'default',
            onPress: () => navigation.navigate('Support'),
          }
        ],
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
        work_description: "Fashion design work for new collection",
        special_instructions: "Please bring all necessary tools and materials",
        payment_method: "wallet",
      });

      if (response.data.success) {
        showAlert({
          type: ALERT_TYPES.SUCCESS,
          title: 'Payment Successful!',
          message: `Your wallet payment of ₹${calculateFinalTotal()} has been processed successfully. Your booking is confirmed!`,
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
            {
              text: 'Check Wallet',
              style: 'default',
              onPress: () => {
                navigation.navigate('Wallet');
              },
            }
          ],
        });
      } else {
        const errorMessage = response.data.message || 'Unable to process wallet payment.';
        
        showAlert({
          type: ALERT_TYPES.ERROR,
          title: 'Wallet Payment Failed',
          message: `${errorMessage} Please check your wallet balance or try a different payment method.`,
          actions: [
            {
              text: 'Add Money to Wallet',
              style: 'primary',
              onPress: () => {
                navigation.navigate('Wallet', { action: 'add_money' });
              },
            },
            {
              text: 'Try Other Payment',
              style: 'default',
              onPress: () => setShowPaymentModal(true),
            }
          ],
        });
      }
    } catch (error) {
      console.error("Error in wallet payment booking:", error);
      
      const isInsufficientBalance = error.response?.data?.message?.includes('insufficient') || 
                                    error.response?.data?.message?.includes('balance');
      
      if (isInsufficientBalance) {
        showAlert({
          type: ALERT_TYPES.ERROR,
          title: 'Insufficient Balance',
          message: 'Your wallet doesn\'t have enough balance for this transaction. Please add money to your wallet.',
          actions: [
            {
              text: 'Add Money',
              style: 'primary',
              onPress: () => {
                navigation.navigate('Wallet', { action: 'add_money' });
              },
            },
            {
              text: 'Choose Other Payment',
              style: 'default',
              onPress: () => setShowPaymentModal(true),
            }
          ],
        });
      } else {
        showAlert({
          type: ALERT_TYPES.ERROR,
          title: 'Payment Error',
          message: 'Something went wrong while processing your wallet payment. Please try again or contact support.',
          actions: [
            {
              text: 'Retry',
              style: 'primary',
              onPress: () => setShowPaymentModal(true),
            },
            {
              text: 'Contact Support',
              style: 'default',
              onPress: () => navigation.navigate('Support'),
            }
          ],
        });
      }
    }
  };

  // Components
  const CartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemImageContainer}>
        <Image 
          source={
            item.image && typeof item.image === 'string' 
              ? { uri: item.image } 
              : item.image || require('../../../assets/images/services/helpers.png')
          } 
          style={styles.itemImage} 
          resizeMode="cover" 
        />
      </View>
      
      <View style={styles.itemDetails}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => handleEditItem(item)}
            >
              <Ionicons name="create-outline" size={18} color="#0066cc" />
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
        <Text style={styles.itemPrice}>
          ₹{item.basePrice}/{item.durationType === 'hours' ? 'hr' : 'day'}/person
        </Text>
        
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
        
        {item.preferredDate && (
          <View style={styles.scheduleInfo}>
            <Ionicons name="calendar-outline" size={12} color="#666" />
            <Text style={styles.scheduleText}>
              {formatDateTime(item.preferredDate, item.preferredTime)}
            </Text>
          </View>
        )}

        {item.specialRequirements && (
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsLabel}>Special Requirements:</Text>
            <Text style={styles.requirementsText}>{item.specialRequirements}</Text>
          </View>
        )}
        
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

  const LoadingScreen = () => (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
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
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        
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

        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#000']}
              tintColor={'#000'}
            />
          }
        >
          <EmptyCart />
        </ScrollView>
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
        <Text style={styles.headerTitle}>Cart ({itemCount || cartItems.length} items)</Text>
        <TouchableOpacity 
          style={styles.headerRight}
          onPress={handleRefresh}
        >
          <Ionicons name="refresh-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Cart Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#000']}
            tintColor={'#000'}
            progressBackgroundColor={'#f5f5f5'}
          />
        }
      >
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
            <TouchableOpacity onPress={() => navigation.navigate('AddressBookScreen')}>
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

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => setShowPaymentModal(true)}
        >
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Options Modal */}
      <PaymentOptionsModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onOnlinePayment={handleOnlinePayment}
        onCashPayment={handleCashPayment}
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
            // Pass the complete rawData object which contains the original API response
            rawData: editingCartItem.rawData,
            // Also pass individual fields for backward compatibility
            worker_count: editingCartItem.rawData.worker_count,
            duration_type: editingCartItem.rawData.duration_type, // FIXED: Use rawData
            duration_value: editingCartItem.rawData.duration_value,
            preferred_date: editingCartItem.rawData.preferred_date,
            preferred_time: editingCartItem.rawData.preferred_time,
            special_requirements: editingCartItem.rawData.special_requirements,
            category: editingCartItem.rawData.category
          }}
          onAddToCart={handleEditSuccess}
        />
      )}
    </SafeAreaView>
  );
};


// Keep the same styles as before
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
  requirementsContainer: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
  },
  requirementsLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    marginBottom: 2,
  },
  requirementsText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
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