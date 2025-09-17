// components/ServiceDetailModal.js (Enhanced with Edit Functionality - UPDATED)
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
import { getPublicCategory, calculatePrice} from "../../services/categories";
import { addToCart, updateCartItem } from "../../services/cart";
import { useAlert, ALERT_TYPES } from '../AlertProvider';
import { useNavigation } from '@react-navigation/native';

// Import our components
import DurationTypeSelector from '../../components/Cards/ServiceDetailModalComponent/DurationTypeSelector';
import CounterControl from '../../components/Cards/ServiceDetailModalComponent/CounterControl';
import CompactCalendar from '../../components/Cards/ServiceDetailModalComponent/CompactCalendar';
import TimePicker from '../../components/Cards/ServiceDetailModalComponent/TimePicker';
import PriceDisplay from '../../components/Cards/ServiceDetailModalComponent/PriceDisplay';
import SpecialRequirementsInput from '../../components/Cards/ServiceDetailModalComponent/SpecialRequirementsInput';

const { width, height } = Dimensions.get('window');

const ServiceDetailModal = ({ 
  visible, 
  onClose, 
  serviceId, 
  onAddToCart,
  editMode = false,        // NEW: Flag to indicate edit mode
  cartItemId = null,       // NEW: Cart item ID for editing
  initialData = null       // NEW: Initial data for editing
}) => {
  const navigation = useNavigation();
  
  // State management
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDurationType, setSelectedDurationType] = useState('hour');
  const [workerCount, setWorkerCount] = useState(1);
  const [durationValue, setDurationValue] = useState(4);
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [endDate, setEndDate] = useState(new Date());
  const { showAlert } = useAlert();
  
  // API-related states
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [priceCalculation, setPriceCalculation] = useState(null);
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Duration types configuration
  const durationTypes = [
    { key: 'hour', label: 'Hourly', minValue: 4, maxValue: 12, icon: 'time-outline' },
    { key: 'day', label: 'Daily', minValue: 1, maxValue: 30, icon: 'calendar-outline' },
    { key: 'week', label: 'Weekly', minValue: 1, maxValue: 12, icon: 'calendar-number-outline' },
    { key: 'month', label: 'Monthly', minValue: 1, maxValue: 12, icon: 'calendar' },
    { key: 'full_time', label: 'Full Time', minValue: 1, maxValue: 1, icon: 'briefcase-outline' }
  ];

  // NEW: Initialize form with existing data in edit mode
  useEffect(() => {
    if (editMode && initialData) {
      console.log('Initializing edit mode with data:', initialData);
      
      // Use rawData if available (from cart), otherwise use direct properties
      const cartData = initialData.rawData || initialData;
      
      // Set initial values from cart item data
      setWorkerCount(cartData.worker_count || initialData.people || 1);
      setSelectedDurationType(cartData.duration_type || 'hour');
      setDurationValue(cartData.duration_value || initialData.duration || 4);
      setSpecialRequirements(cartData.special_requirements || initialData.specialRequirements || '');
      
      // Parse preferred date - handle both formats
      let preferredDate = cartData.preferred_date || initialData.preferredDate;
      if (preferredDate) {
        // Extract just the date part if it's a full datetime
        if (typeof preferredDate === 'string') {
          const dateOnly = preferredDate.split('T')[0];
          setSelectedDate(new Date(dateOnly));
        } else {
          setSelectedDate(new Date(preferredDate));
        }
      }
      
      // FIXED: Set preferred time - handle both formats and extract time properly
      let preferredTime = cartData.preferred_time || initialData.preferredTime;
      if (preferredTime) {
        if (typeof preferredTime === 'string') {
          let timeString = preferredTime;
          
          // If it's a full datetime string, extract just the time part
          if (preferredTime.includes('T')) {
            const timePart = preferredTime.split('T')[1];
            timeString = timePart.substring(0, 5); // Get HH:MM
          } else {
            // If it's already just time format
            timeString = preferredTime.substring(0, 5);
          }
          
          // FIXED: Validate that the extracted time exists in our timeOptions
          const timeOptions = [
            '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
            '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
            '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
          ];
          
          // Check if the time exists in our options, if not, find closest match
          if (timeOptions.includes(timeString)) {
            setSelectedTime(timeString);
            console.log('Selected time from cart data:', timeString);
          } else {
            // Find closest time option
            const [hour, minute] = timeString.split(':').map(Number);
            let closestTime = '09:00'; // Default fallback
            
            // Round to nearest 30-minute interval and find in options
            const roundedMinute = minute >= 30 ? 30 : 0;
            const formattedTime = `${hour.toString().padStart(2, '0')}:${roundedMinute.toString().padStart(2, '0')}`;
            
            if (timeOptions.includes(formattedTime)) {
              closestTime = formattedTime;
            } else {
              // Find the closest available time
              closestTime = timeOptions.find(time => {
                const [optionHour] = time.split(':').map(Number);
                return optionHour >= hour;
              }) || '09:00';
            }
            
            setSelectedTime(closestTime);
            console.log(`Original time ${timeString} not in options, using closest: ${closestTime}`);
          }
        }
      }
      
      // Set service data from cart item
      const categoryData = cartData.category || initialData.category;
      if (categoryData) {
        setService({
          id: categoryData.id,
          name: categoryData.name,
          description: categoryData.description,
          price_per_hour: categoryData.price_per_hour,
        });
      }
      
      console.log('Edit mode initialized with:', {
        duration_type: cartData.duration_type,
        preferred_time: preferredTime,
        selected_time_will_be: selectedTime
      });
    } else {
      // Reset to default values for add mode
      setWorkerCount(1);
      setSelectedDurationType('hour');
      setDurationValue(4);
      setSelectedTime('09:00');
      setSpecialRequirements('');
      setSelectedDate(new Date());
    }
  }, [editMode, initialData]);

  // Effects
  useEffect(() => {
    if (!editMode && serviceId) {
      fetchServiceDetails();
    } else if (!editMode) {
      setService(null);
      setPriceCalculation(null);
    }
  }, [serviceId, editMode]);

  useEffect(() => {
    if (service && durationValue > 0) {
      calculateServicePrice();
    }
  }, [selectedDurationType, workerCount, durationValue, service]);

  useEffect(() => {
    if (selectedDurationType && durationValue) {
      calculateEndDate();
    }
  }, [selectedDurationType, durationValue, selectedDate]);

  // Data Validation Helper
const validateCartData = (cartData) => {
  const errors = [];
  
  // Required fields validation
  if (!cartData.worker_count || cartData.worker_count < 1) errors.push('Worker count must be at least 1');
  if (!cartData.duration_value || cartData.duration_value < 1) errors.push('Duration value must be at least 1');
  if (!cartData.preferred_date) errors.push('Preferred date is required');
  if (!cartData.preferred_time) errors.push('Preferred time is required');

  // Data type validation
  if (typeof cartData.worker_count !== 'number') errors.push('Worker count must be a number');
  if (typeof cartData.duration_value !== 'number') errors.push('Duration value must be a number');

  // Date validation
  const selectedDateObj = new Date(cartData.preferred_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDateObj < today) {
    errors.push('Cannot select past dates');
  }

  // FIXED: Time validation - ensure it's in HH:MM format (24-hour)
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(cartData.preferred_time)) {
    errors.push(`Invalid time format: "${cartData.preferred_time}" - should be HH:MM (24-hour format)`);
  }

  // Special requirements should be string or null
  if (cartData.special_requirements !== null && 
      cartData.special_requirements !== undefined && 
      typeof cartData.special_requirements !== 'string') {
    errors.push('Special requirements must be a string');
  }

  return errors;
};

  // Create datetime string helper
  const createDateTime = (date, time) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      return `${dateStr}T${time}:00`;
    } catch (error) {
      console.error('Error creating datetime:', error);
      return null;
    }
  };

  // API Functions
  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const response = await getPublicCategory(serviceId);
      
      if (response.data && response.data.success) {
        const categoryData = response.data.category;
        setService({
          id: categoryData.id,
          name: categoryData.name,
          description: categoryData.description,
          price_per_hour: categoryData.price_per_hour,
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
    if (!service) return;

    try {
      setCalculatingPrice(true);
      
      const requestBody = {
        category_id: Number(service.id),
        duration_type: selectedDurationType,
        duration_value: Number(durationValue),
        worker_count: Number(workerCount)
      };

      console.log('Price calculation request:', requestBody);
      const response = await calculatePrice(requestBody);
      
      if (response.data && response.data.success) {
        setPriceCalculation(response.data.calculation);
        console.log('Price calculation success:', response.data.calculation);
      } else {
        console.error('Price calculation failed:', response);
        setPriceCalculation(null);
      }
    } catch (err) {
      console.error('Error calculating price:', err);
      console.error('Price calculation error response:', err.response?.data);
      setPriceCalculation(null);
    } finally {
      setCalculatingPrice(false);
    }
  };

  // Helper Functions
  const calculateEndDate = () => {
    if (!selectedDurationType || !durationValue) return;

    const start = new Date(selectedDate);
    let end = new Date(start);

    switch (selectedDurationType) {
      case 'hour':
        end = new Date(start);
        break;
      case 'day':
        end.setDate(start.getDate() + durationValue - 1);
        break;
      case 'week':
        end.setDate(start.getDate() + (durationValue * 7) - 1);
        break;
      case 'month':
        end.setMonth(start.getMonth() + durationValue);
        end.setDate(start.getDate() - 1);
        break;
      case 'full_time':
        end.setFullYear(start.getFullYear() + 1);
        break;
    }

    setEndDate(end);
  };

  const formatTimeDisplay = (time24) => {
    const [hour, minute] = time24.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  // Event Handlers
  const handleDurationTypeChange = (durationType, minValue) => {
    console.log('Duration type changing from', selectedDurationType, 'to', durationType);
    setSelectedDurationType(durationType);
    setDurationValue(minValue);
    console.log('Duration type state updated to:', durationType);
  };

  const updateWorkerCount = (increment = true) => {
    setWorkerCount(prev => increment ? prev + 1 : Math.max(1, prev - 1));
  };

  const updateDuration = (increment = true) => {
    const currentType = durationTypes.find(type => type.key === selectedDurationType);
    const minValue = currentType?.minValue || 1;
    const maxValue = currentType?.maxValue || 999;
    
    setDurationValue(prev => {
      if (increment) {
        return Math.min(maxValue, prev + 1);
      } else {
        return Math.max(minValue, prev - 1);
      }
    });
  };

  // UPDATED: Handle both add and update operations with duration_type changes
const handleSubmit = async () => {
  if (!priceCalculation) {
    Alert.alert('Price Calculation', 'Please wait for price calculation to complete');
    return;
  }

  try {
    setAddingToCart(true);

    // Extract preferred date in YYYY-MM-DD format
    const preferredDate = selectedDate.toISOString().split('T')[0];

    // FIXED: Ensure time is properly formatted (HH:MM in 24-hour format)
    const formattedTime = selectedTime.includes(':') ? selectedTime : `${selectedTime}:00`;
    
    // Validate time format before proceeding
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formattedTime)) {
      Alert.alert('Error', `Invalid time format: ${formattedTime}. Please select a valid time.`);
      return;
    }

    // Debug log current state before preparing data
    console.log('Current state values:', {
      selectedDurationType,
      workerCount,
      durationValue,
      preferredDate,
      formattedTime,
      specialRequirements
    });

    // Prepare cart data based on mode (add vs edit)
    let cartData;
    
    if (editMode) {
      // FOR UPDATE: Send all fields including duration_type (now changeable in edit mode)
      cartData = {
        worker_count: Number(workerCount),
        duration_type: selectedDurationType,  // FIXED: Use current state value
        duration_value: Number(durationValue),
        preferred_date: preferredDate,
        preferred_time: formattedTime,
        special_requirements: specialRequirements.trim() || null
      };
    } else {
      // FOR ADD: Send all required fields including category_id and duration_type
      cartData = {
        category_id: Number(service.id),
        worker_count: Number(workerCount),
        duration_type: selectedDurationType,
        duration_value: Number(durationValue),
        preferred_date: preferredDate,
        preferred_time: formattedTime,
        special_requirements: specialRequirements.trim() || null
      };
    }

    // Additional debug log for cart data
    console.log(`${editMode ? 'UPDATE' : 'ADD'} - Final cart data being sent:`, JSON.stringify(cartData, null, 2));
    console.log('Selected Duration Type State:', selectedDurationType);

    // Run validation before sending
    const validationErrors = validateCartData(cartData);
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      Alert.alert('Validation Error', validationErrors.join('\n'));
      return;
    }

    let response;
    
    if (editMode && cartItemId) {
      // UPDATE existing cart item
      console.log(`Updating cart item ${cartItemId} with duration_type: ${cartData.duration_type}`);
      response = await updateCartItem(cartItemId, cartData);
    } else {
      // ADD new cart item
      response = await addToCart(cartData);
    }

    console.log('API Response:', response.data);

    if (response.data.success) {
      // Show appropriate success message
      showAlert({
        type: ALERT_TYPES.SUCCESS,
        title: editMode ? 'Item Updated! ✨' : 'Service Added! ✨',
        message: editMode 
          ? 'Your cart item has been successfully updated.' 
          : 'Your service has been successfully added to cart. Continue shopping or proceed to checkout.',
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
      
      // Call parent callback if provided
      if (onAddToCart) {
        onAddToCart(response.data.cart_item);
      }
      
      onClose();
    } else {
      console.error('API Error:', response.data);
      Alert.alert('Error', response.data.message || `Failed to ${editMode ? 'update' : 'add'} cart item`);
    }
  } catch (error) {
    console.error(`Error ${editMode ? 'updating' : 'adding'} cart item:`, error);
    console.error('Error response:', error.response?.data);
    
    // Show more specific error message if available
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.errors || 
                        `Failed to ${editMode ? 'update' : 'add'} service ${editMode ? 'in' : 'to'} cart. Please try again.`;
    
    Alert.alert('Error', typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
  } finally {
    setAddingToCart(false);
  }
};

  // Loading state
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
            <View style={styles.headerLeft}>
              <Text style={styles.serviceTitle}>
                {editMode ? `Edit ${service.name}` : service.name}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Service Configuration Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Ionicons name="settings-outline" size={16} color="#666" />
                <Text style={styles.sectionTitle}>Service Configuration</Text>
              </View>
              
              {/* Duration Type Selector - Now always interactive */}
              <DurationTypeSelector
                selectedDurationType={selectedDurationType}
                onDurationTypeChange={handleDurationTypeChange}
                durationValue={durationValue}
              />

              {/* Compact Controls */}
              <View style={styles.compactControlsRow}>
                <CounterControl
                  icon="people-outline"
                  label="Workers"
                  value={workerCount}
                  onIncrement={() => updateWorkerCount(true)}
                  onDecrement={() => updateWorkerCount(false)}
                />

                <CounterControl
                  icon="timer-outline"
                  label={selectedDurationType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  value={durationValue}
                  onIncrement={() => updateDuration(true)}
                  onDecrement={() => updateDuration(false)}
                  disabled={selectedDurationType === 'full_time'}
                />

                {/* Inline Price Display */}
                <PriceDisplay
                  priceCalculation={priceCalculation}
                  calculatingPrice={calculatingPrice}
                  compact={true}
                />
              </View>
            </View>

            {/* Date & Time Selection */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.sectionTitle}>Schedule</Text>
              </View>
              
              <View style={styles.dateTimeContainer}>
                {/* Calendar Component */}
                <CompactCalendar
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  endDate={endDate}
                />

                {/* Time Picker Component */}
                <TimePicker
                  selectedTime={selectedTime}
                  onTimeSelect={setSelectedTime}
                />
              </View>

              {/* Selected Date Display */}
              <View style={styles.selectedDateDisplay}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#0066cc" />
                <Text style={styles.selectedDateText}>
                  {selectedDate.toLocaleDateString()} at {formatTimeDisplay(selectedTime)}
                </Text>
              </View>
            </View>

            {/* Special Requirements */}
            <SpecialRequirementsInput
              value={specialRequirements}
              onChangeText={setSpecialRequirements}
            />
          </ScrollView>

          {/* Bottom Action */}
          <View style={styles.bottomSection}>
            <PriceDisplay
              priceCalculation={priceCalculation}
              calculatingPrice={calculatingPrice}
            />
            
            <TouchableOpacity 
              style={[
                styles.submitButton, 
                (!priceCalculation || addingToCart) && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={!priceCalculation || addingToCart}
            >
              {addingToCart ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons 
                    name={editMode ? "checkmark-outline" : "bag-add-outline"} 
                    size={16} 
                    color="#fff" 
                    style={styles.submitIcon} 
                  />
                  <Text style={styles.submitText}>
                    {editMode ? 'Update Cart' : 'Add to Cart'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
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
    height: height * 0.85,
    maxHeight: height * 0.85
  },
  
  // Header
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerIcon: {
    marginRight: 8
  },
  serviceTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#000'
  },
  closeButton: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: '#f5f5f5', 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  
  // Content
  content: { flex: 1 },
  scrollContent: { paddingBottom: 10 },
  
  // Loading
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

  // Section Container
  sectionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 6
  },

  // Compact Controls Row
  compactControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  // Date Time Container
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 15
  },

  // Selected Date Display
  selectedDateDisplay: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectedDateText: {
    fontSize: 13,
    color: '#0066cc',
    fontWeight: '500',
    marginLeft: 6
  },

  // Bottom Section
  bottomSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  submitButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 120,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  disabledButton: {
    opacity: 0.5
  },
  submitIcon: {
    marginRight: 6
  },
  submitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  }
});

export default ServiceDetailModal;