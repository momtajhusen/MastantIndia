// components/ServiceDetailModal.js (Complete with Dynamic Pricing)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCategoryById, calculatePrice } from "../../services/categories";
import { addToCart, updateCartItem } from "../../services/cart";
import { useAlert, ALERT_TYPES } from '../AlertProvider';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const ServiceDetailModal = ({ 
  visible, 
  onClose, 
  serviceId, 
  onAddToCart,
  editMode = false,
  cartItemId = null,
  initialData = null
}) => {
  const navigation = useNavigation();
  const { showAlert } = useAlert();
  
  // State management
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDurationType, setSelectedDurationType] = useState('hour');
  const [workerCount, setWorkerCount] = useState(1);
  const [durationValue, setDurationValue] = useState(4);
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [priceCalculation, setPriceCalculation] = useState(null);
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Duration options with dynamic pricing from API
  const getDurationOptions = () => {
    if (!service || !service.price_per_hour) {
      return [
        { key: 'instant', label: 'get instant', price: 'Rs 0/ph', durationType: 'hour', value: 4 },
        { key: 'custom', label: 'custom days', price: 'Rs 0/pd', durationType: 'day', value: 1 },
        { key: 'week', label: '1 week', price: 'Rs 0/pw', durationType: 'week', value: 1 },
        { key: 'monthly', label: '- monthly +', price: 'Rs 0/pm', durationType: 'month', value: 1 }
      ];
    }

    const hourlyPrice = parseFloat(service.price_per_hour || 0);
    const dailyPrice = parseFloat(service.price_per_day || 0);
    const weeklyPrice = parseFloat(service.price_per_week || 0);
    const monthlyPrice = parseFloat(service.price_per_month || 0);

    return [
      { 
        key: 'instant', 
        label: 'get instant', 
        price: `Rs ${hourlyPrice.toFixed(0)}/ph`, 
        durationType: 'hour', 
        value: 4 
      },
      { 
        key: 'custom', 
        label: 'custom days', 
        price: `Rs ${dailyPrice.toFixed(0)}/pd`, 
        durationType: 'day', 
        value: 1 
      },
      { 
        key: 'week', 
        label: '1 week', 
        price: `Rs ${weeklyPrice.toFixed(0)}/pw`, 
        durationType: 'week', 
        value: 1 
      },
      { 
        key: 'monthly', 
        label: '- monthly +', 
        price: `Rs ${monthlyPrice.toFixed(0)}/pm`, 
        durationType: 'month', 
        value: 1 
      }
    ];
  };

  const durationOptions = getDurationOptions();

  // Calendar generation
  const generateCalendar = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Adjust starting day (Monday = 0, Sunday = 6)
    const adjustedStartDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    
    // Add previous month's trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = adjustedStartDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    // Add next month's leading days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  };

  const calendarDays = generateCalendar();

  // Time options
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  // Initialize form with existing data in edit mode
  useEffect(() => {
    if (editMode && initialData) {
      const cartData = initialData.rawData || initialData;
      
      setWorkerCount(cartData.worker_count || 1);
      setSelectedDurationType(cartData.duration_type || 'hour');
      setDurationValue(cartData.duration_value || initialData.duration || 4);
      
      let preferredDate = cartData.preferred_date || initialData.preferredDate;
      if (preferredDate) {
        if (typeof preferredDate === 'string') {
          const dateOnly = preferredDate.split('T')[0];
          const parsedDate = new Date(dateOnly);
          setSelectedDate(parsedDate);
          setCalendarMonth(new Date(parsedDate));
        } else {
          setSelectedDate(new Date(preferredDate));
          setCalendarMonth(new Date(preferredDate));
        }
      }
      
      if (cartData.preferred_time || initialData.preferredTime) {
        setSelectedTime(cartData.preferred_time || initialData.preferredTime);
      }
      
      const categoryData = cartData.category || initialData.category;
      if (categoryData) {
        setService({
          id: categoryData.id,
          name: categoryData.name,
          description: categoryData.description,
          price_per_hour: categoryData.price_per_hour,
          price_per_day: categoryData.price_per_day,
          price_per_week: categoryData.price_per_week,
          price_per_month: categoryData.price_per_month,
          price_full_time: categoryData.price_full_time,
        });
      }
    } else {
      setWorkerCount(1);
      setSelectedDurationType('hour');
      setDurationValue(4);
      setSelectedTime('09:00');
      setSelectedDate(new Date());
      setCalendarMonth(new Date());
    }
  }, [editMode, initialData]);

  // Fetch service details
  useEffect(() => {
    if (!editMode && serviceId) {
      fetchServiceDetails();
    } else if (!editMode) {
      setService(null);
      setPriceCalculation(null);
    }
  }, [serviceId, editMode]);

  // Calculate price whenever parameters change
  useEffect(() => {
    if (service && durationValue > 0 && workerCount > 0) {
      const timer = setTimeout(() => {
        calculateServicePrice();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedDurationType, durationValue, workerCount, service]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const response = await getCategoryById(serviceId);

      console.log("Services Data");
      console.log(response.data);
      
      if (response.data && response.data.success) {
        const categoryData = response.data.category;
        setService({
          id: categoryData.id,
          name: categoryData.name,
          description: categoryData.description,
          price_per_hour: categoryData.price_per_hour,
          price_per_day: categoryData.price_per_day,
          price_per_week: categoryData.price_per_week,
          price_per_month: categoryData.price_per_month,
          price_full_time: categoryData.price_full_time,
        });
      } else {
        Alert.alert('Error', 'Failed to fetch service details');
      }
    } catch (err) {
      console.error('Error fetching service details:', err);
      Alert.alert('Error', 'Failed to load service details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateServicePrice = async () => {
    if (!service || !service.id) {
      console.log('Service not available for calculation');
      return;
    }

    try {
      setCalculatingPrice(true);
      
      const requestBody = {
        category_id: Number(service.id),
        duration_type: selectedDurationType,
        duration_value: Number(durationValue),
        worker_count: Number(workerCount)
      };

      console.log('Calculating price with:', requestBody);
      const response = await calculatePrice(requestBody);
      
      console.log('Full API response:', response);
      
      if (response.data && response.data.success && response.data.calculation) {
        const calculation = response.data.calculation;
        console.log('Setting price calculation:', calculation);
        console.log('Total amount:', calculation.final_price);
        
        // Force state update with new object reference
        setPriceCalculation({
          category: calculation.category,
          discount_amount: calculation.discount_amount,
          discount_percentage: calculation.discount_percentage,
          duration_type: calculation.duration_type,
          duration_value: calculation.duration_value,
          final_price: calculation.final_price,
          subtotal: calculation.subtotal,
          unit_price: calculation.unit_price,
          worker_count: calculation.worker_count,
          total_amount: calculation.final_price // Adding explicit total_amount
        });
      } else {
        console.error('Price calculation failed or no data:', response);
        setPriceCalculation(null);
      }
    } catch (err) {
      console.error('Error calculating price:', err);
      console.error('Error details:', err.response?.data);
      setPriceCalculation(null);
    } finally {
      setCalculatingPrice(false);
    }
  };

  const handleSubmit = async () => {
    if (!priceCalculation) {
      Alert.alert('Price Calculation', 'Please wait for price calculation to complete');
      return;
    }

    try {
      setAddingToCart(true);

      const preferredDate = selectedDate.toISOString().split('T')[0];
      
      let cartData;
      
      if (editMode) {
        cartData = {
          worker_count: Number(workerCount),
          duration_type: selectedDurationType,
          duration_value: Number(durationValue),
          preferred_date: preferredDate,
          preferred_time: selectedTime,
          special_requirements: null
        };
      } else {
        cartData = {
          category_id: Number(service.id),
          worker_count: Number(workerCount),
          duration_type: selectedDurationType,
          duration_value: Number(durationValue),
          preferred_date: preferredDate,
          preferred_time: selectedTime,
          special_requirements: null
        };
      }

      console.log('Submitting cart data:', cartData);

      let response;
      
      if (editMode && cartItemId) {
        response = await updateCartItem(cartItemId, cartData);
      } else {
        response = await addToCart(cartData);
      }

      if (response.data.success) {
        showAlert({
          type: ALERT_TYPES.SUCCESS,
          title: editMode ? 'Item Updated! ✨' : 'Service Added! ✨',
          message: editMode 
            ? 'Your cart item has been successfully updated.' 
            : 'Your service has been successfully added to cart.',
          actions: [
            {
              text: 'View Cart',
              style: 'primary',
              onPress: () => {
                navigation.navigate('Cart');
              },
            }
          ],
        });
        
        if (onAddToCart) {
          onAddToCart(response.data.cart_item);
        }
        
        onClose();
      } else {
        Alert.alert('Error', response.data.message || `Failed to ${editMode ? 'update' : 'add'} cart item`);
      }
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'adding'} cart item:`, error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors || 
                          `Failed to ${editMode ? 'update' : 'add'} service. Please try again.`;
      
      Alert.alert('Error', typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
    } finally {
      setAddingToCart(false);
    }
  };

  const changeMonth = (direction) => {
    const newMonth = new Date(calendarMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCalendarMonth(newMonth);
  };

  if (loading) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#000" />
              <Text style={styles.loadingText}>Loading service details...</Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  if (!service) return null;

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.serviceTitle}>{service.name}</Text>
              <Text style={styles.serviceSubtitle}>Professional {service.name}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Top Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>8 hrs</Text>
                <Text style={styles.statLabel}>estimated time</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>Rs {service.price_per_hour}</Text>
                <Text style={styles.statLabel}>starting price</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>4.8/5</Text>
                <Text style={styles.statLabel}>rating</Text>
              </View>
            </View>

            {/* Duration Options */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.durationContainer}
            >
              {durationOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.durationOption,
                    selectedDurationType === option.durationType && 
                    durationValue === option.value && 
                    styles.durationOptionActive
                  ]}
                  onPress={() => {
                    setSelectedDurationType(option.durationType);
                    setDurationValue(option.value);
                  }}
                >
                  <Text style={styles.durationLabel}>{option.label}</Text>
                  <Text style={styles.durationPrice}>{option.price}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Controls Row */}
            <View style={styles.controlsRow}>
              {/* Partners */}
              <View style={styles.controlBox}>
                <View style={styles.controlHeader}>
                  <Ionicons name="people-outline" size={16} color="#000" />
                  <Text style={styles.controlLabel}>Partners</Text>
                </View>
                <View style={styles.counterContainer}>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => setWorkerCount(Math.max(1, workerCount - 1))}
                  >
                    <Text style={styles.counterButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{workerCount}</Text>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => setWorkerCount(workerCount + 1)}
                  >
                    <Text style={styles.counterButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Hour/Duration */}
              <View style={styles.controlBox}>
                <View style={styles.controlHeader}>
                  <Ionicons name="time-outline" size={16} color="#000" />
                  <Text style={styles.controlLabel}>
                    {selectedDurationType === 'hour' ? 'Hour' : 
                     selectedDurationType === 'day' ? 'Days' : 
                     selectedDurationType === 'week' ? 'Week' : 
                     selectedDurationType === 'month' ? 'Month' : 'Duration'}
                  </Text>
                </View>
                <View style={styles.counterContainer}>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => setDurationValue(Math.max(1, durationValue - 1))}
                  >
                    <Text style={styles.counterButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{durationValue}</Text>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => setDurationValue(durationValue + 1)}
                  >
                    <Text style={styles.counterButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Timing */}
              <View style={styles.controlBox}>
                <Text style={styles.controlLabel}>Timing</Text>
                <TouchableOpacity 
                  style={styles.timeSelector}
                  onPress={() => setShowTimeModal(true)}
                >
                  <Text style={styles.timeValue}>
                    {parseInt(selectedTime.split(':')[0]) > 11 
                      ? `${parseInt(selectedTime.split(':')[0]) === 12 ? 12 : parseInt(selectedTime.split(':')[0]) - 12} pm`
                      : `${parseInt(selectedTime.split(':')[0]) === 0 ? 12 : parseInt(selectedTime.split(':')[0])} am`}
                  </Text>
                  <Text style={styles.timeSelectorIcon}>∨</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Calendar */}
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarMonth}>
                  {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                </Text>
                <View style={styles.calendarNav}>
                  <TouchableOpacity onPress={() => changeMonth(-1)}>
                    <Text style={styles.navArrow}>‹</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => changeMonth(1)}>
                    <Text style={styles.navArrow}>›</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.weekDays}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <Text key={day} style={styles.weekDay}>{day}</Text>
                ))}
              </View>

              <View style={styles.calendarGrid}>
                {calendarDays.map((day, index) => {
                  const isInRange = () => {
                    if (selectedDurationType === 'hour') {
                      return day.date.getDate() === selectedDate.getDate() &&
                             day.date.getMonth() === selectedDate.getMonth() &&
                             day.date.getFullYear() === selectedDate.getFullYear();
                    }
                    
                    const startDate = new Date(selectedDate);
                    startDate.setHours(0, 0, 0, 0);
                    
                    let endDate = new Date(selectedDate);
                    
                    if (selectedDurationType === 'day') {
                      endDate.setDate(endDate.getDate() + durationValue - 1);
                    } else if (selectedDurationType === 'week') {
                      endDate.setDate(endDate.getDate() + (durationValue * 7) - 1);
                    } else if (selectedDurationType === 'month') {
                      endDate.setMonth(endDate.getMonth() + durationValue);
                      endDate.setDate(endDate.getDate() - 1);
                    }
                    
                    endDate.setHours(23, 59, 59, 999);
                    
                    const currentDay = new Date(day.date);
                    currentDay.setHours(12, 0, 0, 0);
                    
                    return currentDay >= startDate && currentDay <= endDate;
                  };
                  
                  const isSelected = isInRange();
                  const isStartDate = day.date.getDate() === selectedDate.getDate() &&
                    day.date.getMonth() === selectedDate.getMonth() &&
                    day.date.getFullYear() === selectedDate.getFullYear();
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.calendarDay,
                        !day.isCurrentMonth && styles.calendarDayInactive,
                        isSelected && styles.calendarDaySelected,
                        isStartDate && styles.calendarDayStart
                      ]}
                      onPress={() => {
                        setSelectedDate(new Date(day.date));
                        setCalendarMonth(new Date(day.date));
                      }}
                      disabled={!day.isCurrentMonth}
                    >
                      <Text style={[
                        styles.calendarDayText,
                        !day.isCurrentMonth && styles.calendarDayTextInactive,
                        isSelected && styles.calendarDayTextSelected
                      ]}>
                        {day.date.getDate()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {calculatingPrice ? (
                  'Calculating...'
                ) : priceCalculation ? (
                  `Rs ${priceCalculation.final_price || priceCalculation.total_amount || 0}`
                ) : (
                  'Rs 0'
                )}
              </Text>
              {priceCalculation && priceCalculation.final_price > 0 && (
                <Text style={styles.totalSubtext}>
                  {durationValue} {selectedDurationType}(s) × {workerCount} worker(s)
                </Text>
              )}
            </View>
            <TouchableOpacity 
              style={[styles.checkoutButton, (!priceCalculation || addingToCart) && styles.checkoutButtonDisabled]}
              onPress={handleSubmit}
              disabled={!priceCalculation || addingToCart}
            >
              {addingToCart ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.checkoutButtonText}>
                  {editMode ? 'update' : 'check out'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Time Picker Modal */}
        <Modal
          visible={showTimeModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowTimeModal(false)}
        >
          <TouchableOpacity 
            style={styles.timeModalBackdrop}
            activeOpacity={1}
            onPress={() => setShowTimeModal(false)}
          >
            <View style={styles.timeModalContainer} onStartShouldSetResponder={() => true}>
              <View style={styles.timeModalHeader}>
                <Text style={styles.timeModalTitle}>Select Time</Text>
                <TouchableOpacity onPress={() => setShowTimeModal(false)}>
                  <Text style={styles.timeModalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.timeModalScroll}>
                {timeOptions.map((time) => {
                  const hour = parseInt(time.split(':')[0]);
                  const displayTime = hour > 11 
                    ? `${hour === 12 ? 12 : hour - 12}:00 PM`
                    : `${hour === 0 ? 12 : hour}:00 AM`;
                  
                  return (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeOption,
                        selectedTime === time && styles.timeOptionSelected
                      ]}
                      onPress={() => {
                        setSelectedTime(time);
                        setShowTimeModal(false);
                      }}
                    >
                      <Text style={[
                        styles.timeOptionText,
                        selectedTime === time && styles.timeOptionTextSelected
                      ]}>
                        {displayTime}
                      </Text>
                      {selectedTime === time && (
                        <Ionicons name="checkmark" size={20} color="#000" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.9,
    maxHeight: height * 0.9
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  serviceTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4
  },
  serviceSubtitle: {
    fontSize: 14,
    color: '#666'
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666'
  },
  
  scrollView: {
    flex: 1
  },
  
  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  statBox: {
    alignItems: 'center'
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#666'
  },
  
  // Duration Options
  durationContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10
  },
  durationOption: {
    backgroundColor: '#EFEFF0',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 0,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f8f8f8',
    marginRight: 5,
    minWidth: 95
  },
  durationOptionActive: {
    backgroundColor: '#fff',
    borderColor: '#000'
  },
  durationLabel: {
    fontSize: 12,
    color: '#000',
    marginBottom: 4,
    fontWeight: '500',
    whiteSpace: 'nowrap'
  },
  durationPrice: {
    fontSize: 11,
    color: '#666',
    whiteSpace: 'nowrap'
  },
  
  // Controls Row
  controlsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  controlBox: {
    flex: 1
  },
  controlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 4
  },
  controlLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000'
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 8
  },
  counterButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  counterButtonText: {
    fontSize: 18,
    color: '#000',
    fontWeight: '500'
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000'
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10
  },
  timeValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000'
  },
  timeSelectorIcon: {
    fontSize: 16,
    color: '#666'
  },
  
  // Calendar
  calendarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 5
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  calendarMonth: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000'
  },
  calendarNav: {
    flexDirection: 'row',
    gap: 15
  },
  navArrow: {
    fontSize: 28,
    color: '#0066cc',
    fontWeight: 'bold'
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15
  },
  weekDay: {
    width: width / 8,
    textAlign: 'center',
    fontSize: 13,
    color: '#999',
    fontWeight: '500'
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  calendarDay: {
    width: width / 7.5,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  calendarDayInactive: {
    opacity: 0.3
  },
  calendarDaySelected: {
    backgroundColor: '#000',
    borderRadius: 8
  },
  calendarDayStart: {
    backgroundColor: '#000',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0066cc'
  },
  calendarDayText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500'
  },
  calendarDayTextInactive: {
    color: '#ccc'
  },
  calendarDayTextSelected: {
    color: '#fff',
    fontWeight: 'bold'
  },
  
  // Bottom Section
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff'
  },
  totalContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 15
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 4
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center'
  },
  totalSubtext: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 2
  },
  checkoutButton: {
    backgroundColor: '#000',
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 40,
    minWidth: 140,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkoutButtonDisabled: {
    opacity: 0.5
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  
  // Time Modal
  timeModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  timeModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: width * 0.85,
    maxHeight: height * 0.7,
    overflow: 'hidden'
  },
  timeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  timeModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000'
  },
  timeModalClose: {
    fontSize: 24,
    color: '#666',
    fontWeight: '300'
  },
  timeModalScroll: {
    maxHeight: height * 0.5
  },
  timeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5'
  },
  timeOptionSelected: {
    backgroundColor: '#f8f8f8'
  },
  timeOptionText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500'
  },
  timeOptionTextSelected: {
    fontWeight: '700',
    color: '#000'
  }
});

export default ServiceDetailModal;