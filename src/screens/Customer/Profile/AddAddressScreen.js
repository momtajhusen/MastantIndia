// import libraries
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  StatusBar, 
  Platform, 
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createAddress } from "../../../services/address";

// create a component
const AddAddressScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    address_label: '',
    address_type: 'home',
    house_flat_no: '',
    area_street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    latitude: null,
    longitude: null,
    google_place_id: '',
    map_address: '',
    delivery_instructions: '',
    contact_person: '',
    contact_phone: '',
    is_active: false,
    is_default: false
  });

  // Address type options
  const addressTypes = [
    { label: 'Home', value: 'home', icon: 'home-outline' },
    { label: 'Office', value: 'office', icon: 'business-outline' },
    { label: 'Other', value: 'other', icon: 'location-outline' }
  ];

  // Update form data
  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate form data
  const validateForm = () => {
    const requiredFields = [
      { field: 'address_label', message: 'Address label is required' },
      { field: 'house_flat_no', message: 'House/Flat number is required' },
      { field: 'area_street', message: 'Area/Street is required' },
      { field: 'city', message: 'City is required' },
      { field: 'state', message: 'State is required' },
      { field: 'pincode', message: 'Pincode is required' }
    ];

    for (let item of requiredFields) {
      if (!formData[item.field] || formData[item.field].trim() === '') {
        Alert.alert('Validation Error', item.message);
        return false;
      }
    }

    // Validate pincode (6 digits)
    if (!/^\d{6}$/.test(formData.pincode)) {
      Alert.alert('Validation Error', 'Pincode must be 6 digits');
      return false;
    }

    // Validate phone number if provided
    if (formData.contact_phone && !/^\d{10}$/.test(formData.contact_phone.replace(/\D/g, ''))) {
      Alert.alert('Validation Error', 'Phone number must be 10 digits');
      return false;
    }

    return true;
  };

  // Get current location (mock implementation)
  const getCurrentLocation = () => {
    Alert.alert(
      'Use Current Location',
      'This will detect your GPS coordinates and auto-fill address details. Make sure GPS is enabled.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Get Location',
          onPress: () => {
            // Mock location detection with coordinates
            const mockLatitude = 28.6139;
            const mockLongitude = 77.2090;
            
            updateFormData('latitude', mockLatitude);
            updateFormData('longitude', mockLongitude);
            updateFormData('map_address', `${mockLatitude}, ${mockLongitude}`);
            
            // You can also mock auto-fill other fields
            if (!formData.city) updateFormData('city', 'New Delhi');
            if (!formData.state) updateFormData('state', 'Delhi');
            if (!formData.pincode) updateFormData('pincode', '110001');
            if (!formData.country) updateFormData('country', 'India');
            
            Alert.alert('Success', 'Location coordinates detected! Please verify and update address details as needed.');
          }
        }
      ]
    );
  };

  // Handle save address
  const handleSaveAddress = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Prepare data for API
      const addressData = {
        ...formData,
        latitude: formData.latitude || 28.6139, // Default Delhi coordinates
        longitude: formData.longitude || 77.2090,
        map_address: formData.map_address || `${formData.house_flat_no}, ${formData.area_street}, ${formData.city}`,
      };

      const response = await createAddress(addressData);
      
      if (response.data.success) {
        Alert.alert(
          'Success', 
          'Address saved successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Save address error:', error);
      
      if (error.response?.data?.errors) {
        // Handle Laravel validation errors
        const errors = Object.values(error.response.data.errors).flat();
        Alert.alert('Validation Error', errors.join('\n'));
      } else {
        Alert.alert('Error', 'Failed to save address. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Render address type selector
  const renderAddressTypeSelector = () => (
    <View style={styles.typeContainer}>
      <Text style={styles.sectionLabel}>Address Type</Text>
      <View style={styles.typeRow}>
        {addressTypes.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.typeButton,
              formData.address_type === type.value && styles.typeButtonActive
            ]}
            onPress={() => updateFormData('address_type', type.value)}
          >
            <Ionicons 
              name={type.icon} 
              size={20} 
              color={formData.address_type === type.value ? '#fff' : '#666'} 
            />
            <Text style={[
              styles.typeText,
              formData.address_type === type.value && styles.typeTextActive
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Add New Address</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Address Label */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address Label *</Text>
          <TextInput
            style={styles.input}
            value={formData.address_label}
            onChangeText={(value) => updateFormData('address_label', value)}
            placeholder="e.g., Home, Office, Parents House"
            placeholderTextColor="#999"
          />
        </View>

        {/* Address Type Selector */}
        {renderAddressTypeSelector()}

        {/* House/Flat Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>House/Flat Number *</Text>
          <TextInput
            style={styles.input}
            value={formData.house_flat_no}
            onChangeText={(value) => updateFormData('house_flat_no', value)}
            placeholder="e.g., A-123, Flat 205, House No. 45"
            placeholderTextColor="#999"
          />
        </View>

        {/* Area/Street */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Area/Street *</Text>
          <TextInput
            style={styles.input}
            value={formData.area_street}
            onChangeText={(value) => updateFormData('area_street', value)}
            placeholder="e.g., Sector 18, Main Market Road"
            placeholderTextColor="#999"
          />
        </View>

        {/* Landmark */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Landmark</Text>
          <TextInput
            style={styles.input}
            value={formData.landmark}
            onChangeText={(value) => updateFormData('landmark', value)}
            placeholder="e.g., Near Metro Station, Opposite Mall"
            placeholderTextColor="#999"
          />
        </View>

        {/* City & State Row */}
        <View style={styles.rowContainer}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(value) => updateFormData('city', value)}
              placeholder="City"
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>State *</Text>
            <TextInput
              style={styles.input}
              value={formData.state}
              onChangeText={(value) => updateFormData('state', value)}
              placeholder="State"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Pincode & Country Row */}
        <View style={styles.rowContainer}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Pincode *</Text>
            <TextInput
              style={styles.input}
              value={formData.pincode}
              onChangeText={(value) => updateFormData('pincode', value)}
              placeholder="110001"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={6}
            />
          </View>
          
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Country</Text>
            <TextInput
              style={styles.input}
              value={formData.country}
              onChangeText={(value) => updateFormData('country', value)}
              placeholder="Country"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Location Button */}
        <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
          <Ionicons name="location-outline" size={20} color="#000" />
          <Text style={styles.locationText}>Use Current Location</Text>
        </TouchableOpacity>

        {/* Contact Information Section */}
        <View style={styles.sectionDivider}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
        </View>

        {/* Contact Person */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact Person</Text>
          <TextInput
            style={styles.input}
            value={formData.contact_person}
            onChangeText={(value) => updateFormData('contact_person', value)}
            placeholder="Person name for delivery"
            placeholderTextColor="#999"
          />
        </View>

        {/* Contact Phone */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact Phone</Text>
          <TextInput
            style={styles.input}
            value={formData.contact_phone}
            onChangeText={(value) => updateFormData('contact_phone', value)}
            placeholder="Phone number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        {/* Delivery Instructions */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Delivery Instructions</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.delivery_instructions}
            onChangeText={(value) => updateFormData('delivery_instructions', value)}
            placeholder="Special instructions for delivery (e.g., Ring doorbell twice, Call before delivery)"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Toggle Switches */}
        <View style={styles.switchContainer}>
          <TouchableOpacity 
            style={styles.switchRow}
            onPress={() => updateFormData('is_active', !formData.is_active)}
          >
            <Text style={styles.switchLabel}>Set as Active Address</Text>
            <View style={[styles.switch, formData.is_active && styles.switchActive]}>
              <View style={[styles.switchThumb, formData.is_active && styles.switchThumbActive]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.switchRow}
            onPress={() => updateFormData('is_default', !formData.is_default)}
          >
            <Text style={styles.switchLabel}>Set as Default Address</Text>
            <View style={[styles.switch, formData.is_default && styles.switchActive]}>
              <View style={[styles.switchThumb, formData.is_default && styles.switchThumbActive]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSaveAddress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Address</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  typeContainer: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
  },
  typeButtonActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  typeText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  typeTextActive: {
    color: '#fff',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  sectionDivider: {
    marginVertical: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  switchContainer: {
    marginVertical: 20,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#CCCCCC',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchActive: {
    backgroundColor: '#000000',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
});

// make this component available to the app
export default AddAddressScreen;