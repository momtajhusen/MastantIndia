// import libraries
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  StatusBar,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  Platform,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { 
  getAllAddresses, 
  deleteAddress, 
  updateAddress, 
  setAddressActive,
  getActiveAddress 
} from "../../../services/address";

const AddressBookScreen = ({ navigation }) => {
  // State variables
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeLoading, setActiveLoading] = useState(null); // Track which address is being set active
  
  // Edit form states
  const [editFormData, setEditFormData] = useState({
    address_label: '',
    address_type: 'home',
    house_flat_no: '',
    area_street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    delivery_instructions: '',
    contact_person: '',
    contact_phone: ''
  });

  // Load addresses on component mount
  useEffect(() => {
    loadAddresses();
  }, []);

  // Focus listener to reload addresses when coming back from add screen
  useEffect(() => {
    const unsubscribe = navigation?.addListener('focus', () => {
      loadAddresses();
    });
    return unsubscribe;
  }, [navigation]);

  // Load all addresses
  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await getAllAddresses();
      
      if (response.data.success) {
        setAddresses(response.data.data || []);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to load addresses');
      }
    } catch (error) {
      console.error('Load addresses error:', error);
      Alert.alert('Error', 'Failed to load addresses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh addresses
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAddresses();
    setRefreshing(false);
  }, []);

  // Get address type icon
  const getAddressTypeIcon = (type) => {
    switch (type) {
      case 'home':
        return 'home';
      case 'office':
        return 'business';
      case 'other':
        return 'location';
      default:
        return 'location';
    }
  };

  // Handle card press to set active
  const handleCardPress = async (item) => {
    if (item.is_active) {
      // If already active, do nothing or show info
      Alert.alert('Active Address', 'This address is already set as active');
      return;
    }

    try {
      setActiveLoading(item.id);
      const response = await setAddressActive(item.id);
      
      if (response.data.success) {
        Alert.alert('Success', 'Address set as active successfully');
        loadAddresses(); // Reload to update active status
      } else {
        Alert.alert('Error', response.data.message || 'Failed to set address as active');
      }
    } catch (error) {
      console.error('Set active error:', error);
      Alert.alert('Error', 'Failed to set address as active');
    } finally {
      setActiveLoading(null);
    }
  };

  // Handle delete press
  const handleDeletePress = (item) => {
    setSelectedAddress(item);
    setDeleteModalVisible(true);
  };

  // Handle edit press
  const handleEditPress = (item) => {
    setSelectedAddress(item);
    setEditFormData({
      address_label: item.address_label || '',
      address_type: item.address_type || 'home',
      house_flat_no: item.house_flat_no || '',
      area_street: item.area_street || '',
      landmark: item.landmark || '',
      city: item.city || '',
      state: item.state || '',
      pincode: item.pincode || '',
      delivery_instructions: item.delivery_instructions || '',
      contact_person: item.contact_person || '',
      contact_phone: item.contact_phone || ''
    });
    setEditModalVisible(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      const response = await deleteAddress(selectedAddress.id);
      
      if (response.data.success) {
        Alert.alert('Success', 'Address deleted successfully');
        setDeleteModalVisible(false);
        loadAddresses(); // Reload addresses after deletion
      } else {
        Alert.alert('Error', response.data.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete address');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Save edit
  const saveEdit = async () => {
    try {
      // Basic validation
      if (!editFormData.address_label || !editFormData.house_flat_no || 
          !editFormData.area_street || !editFormData.city || 
          !editFormData.state || !editFormData.pincode) {
        Alert.alert('Validation Error', 'Please fill all required fields');
        return;
      }

      setEditLoading(true);
      const response = await updateAddress(selectedAddress.id, editFormData);
      
      if (response.data.success) {
        Alert.alert('Success', 'Address updated successfully');
        setEditModalVisible(false);
        loadAddresses(); // Reload addresses after update
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update address');
      }
    } catch (error) {
      console.error('Update error:', error);
      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        Alert.alert('Validation Error', errors.join('\n'));
      } else {
        Alert.alert('Error', 'Failed to update address');
      }
    } finally {
      setEditLoading(false);
    }
  };

  // Update form data
  const updateFormData = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Format address for display
  const formatAddress = (item) => {
    const parts = [
      item.house_flat_no,
      item.area_street,
      item.landmark,
      item.city,
      item.state
    ].filter(part => part && part.trim());
    
    return parts.join(', ');
  };

  // Render address item with improved design
  const renderItem = ({ item, index }) => {
    const typeIcon = getAddressTypeIcon(item.address_type);
    const isLoading = activeLoading === item.id;

    return (
      <View style={styles.cardContainer}>
        <TouchableOpacity 
          style={[
            styles.addressCard,
            item.is_active && styles.activeCard
          ]}
          onPress={() => handleCardPress(item)}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.leftHeader}>
              <View style={styles.typeIconContainer}>
                <Ionicons name={typeIcon} size={20} color="#000" />
              </View>
              <View style={styles.labelContainer}>
                <Text style={styles.labelText}>{item.address_label}</Text>
                <Text style={styles.typeText}>
                  {item.address_type.charAt(0).toUpperCase() + item.address_type.slice(1)}
                </Text>
              </View>
            </View>
            
            {/* Active Badge */}
            {item.is_active && (
              <View style={styles.activeBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#fff" />
                <Text style={styles.activeText}>Active</Text>
              </View>
            )}
            
            {/* Loading indicator for setting active */}
            {isLoading && (
              <ActivityIndicator size="small" color="#000" />
            )}
          </View>

          {/* Address Details */}
          <View style={styles.cardBody}>
            <Text style={styles.addressText}>{formatAddress(item)}</Text>
            <View style={styles.detailsRow}>
              <View style={styles.pincodeContainer}>
                <Ionicons name="location-outline" size={14} color="#666" />
                <Text style={styles.pincodeText}>{item.pincode}</Text>
              </View>
              {item.contact_person && (
                <View style={styles.contactContainer}>
                  <Ionicons name="person-outline" size={14} color="#666" />
                  <Text style={styles.contactText}>{item.contact_person}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.cardActions}>
            {!item.is_active && (
              <View style={styles.setActiveContainer}>
                <Ionicons name="radio-button-off-outline" size={16} color="#666" />
                <Text style={styles.setActiveText}>Tap to set as active</Text>
              </View>
            )}
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                onPress={() => handleEditPress(item)} 
                style={[styles.actionBtn, styles.editBtn]}
              >
                <Ionicons name="create-outline" size={18} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleDeletePress(item)} 
                style={[styles.actionBtn, styles.deleteBtn]}
              >
                <Ionicons name="trash-outline" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Loading component
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading addresses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header with Add Icon */}
      <View style={styles.header}>
        <Text style={styles.title}>Address Book</Text>
        <TouchableOpacity 
          onPress={() => navigation?.navigate("AddAddressScreen")}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {/* Address List */}
      {addresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="location-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No addresses found</Text>
          <Text style={styles.emptySubText}>Add your first address to get started</Text>
          <TouchableOpacity 
            style={styles.emptyAddButton}
            onPress={() => navigation?.navigate("AddAddressScreen")}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.emptyAddButtonText}>Add Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={addresses}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning" size={24} color="#000" />
              <Text style={styles.modalTitle}>Delete Address</Text>
            </View>
            <Text style={styles.modalText}>
              Are you sure you want to delete "{selectedAddress?.address_label}"?
              {selectedAddress?.is_active && "\n\nNote: This is your active address."}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setDeleteModalVisible(false)}
                disabled={deleteLoading}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteBtn} 
                onPress={confirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="trash" size={16} color="#fff" />
                    <Text style={styles.deleteText}>Delete</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, styles.editModalBox]}>
            <View style={styles.modalHeader}>
              <Ionicons name="create" size={24} color="#000" />
              <Text style={styles.modalTitle}>Edit Address</Text>
            </View>
            
            <TextInput
              style={styles.input}
              value={editFormData.address_label}
              onChangeText={(value) => updateFormData('address_label', value)}
              placeholder="Address Label (e.g., Home, Office)"
              placeholderTextColor="#999"
            />

            <TextInput
              style={styles.input}
              value={editFormData.house_flat_no}
              onChangeText={(value) => updateFormData('house_flat_no', value)}
              placeholder="House/Flat No *"
              placeholderTextColor="#999"
            />

            <TextInput
              style={styles.input}
              value={editFormData.area_street}
              onChangeText={(value) => updateFormData('area_street', value)}
              placeholder="Area/Street *"
              placeholderTextColor="#999"
            />

            <TextInput
              style={styles.input}
              value={editFormData.landmark}
              onChangeText={(value) => updateFormData('landmark', value)}
              placeholder="Landmark"
              placeholderTextColor="#999"
            />

            <View style={styles.rowInputs}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                value={editFormData.city}
                onChangeText={(value) => updateFormData('city', value)}
                placeholder="City *"
                placeholderTextColor="#999"
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                value={editFormData.state}
                onChangeText={(value) => updateFormData('state', value)}
                placeholder="State *"
                placeholderTextColor="#999"
              />
            </View>

            <TextInput
              style={styles.input}
              value={editFormData.pincode}
              onChangeText={(value) => updateFormData('pincode', value)}
              placeholder="Pincode *"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={6}
            />

            <TextInput
              style={styles.input}
              value={editFormData.contact_person}
              onChangeText={(value) => updateFormData('contact_person', value)}
              placeholder="Contact Person"
              placeholderTextColor="#999"
            />

            <TextInput
              style={styles.input}
              value={editFormData.contact_phone}
              onChangeText={(value) => updateFormData('contact_phone', value)}
              placeholder="Contact Phone"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={10}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              value={editFormData.delivery_instructions}
              onChangeText={(value) => updateFormData('delivery_instructions', value)}
              placeholder="Delivery Instructions"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setEditModalVisible(false)}
                disabled={editLoading}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveBtn} 
                onPress={saveEdit}
                disabled={editLoading}
              >
                {editLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                    <Text style={styles.saveText}>Save</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Enhanced styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 0 : 0,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
  },
  addButton: {
    backgroundColor: '#000000',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  cardContainer: {
    marginBottom: 16,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeCard: {
    borderColor: '#000000',
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  labelContainer: {
    flex: 1,
  },
  labelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 2,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: '#666666',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  cardBody: {
    marginBottom: 12,
  },
  addressText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pincodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pincodeText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  setActiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  setActiveText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  editBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  deleteBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    elevation: 10,
    maxHeight: '80%',
  },
  editModalBox: {
    width: "90%",
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    marginLeft: 8,
  },
  modalText: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 24,
    lineHeight: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: "#000000",
    backgroundColor: '#FFFFFF',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 8,
  },
  cancelText: {
    fontSize: 16,
    color: "#666",
    fontWeight: '500',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#000000",
    borderRadius: 8,
    minWidth: 80,
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 4,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#000000",
    borderRadius: 8,
    minWidth: 80,
    justifyContent: 'center',
  },
  saveText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 4,
  },
});

export default AddressBookScreen;