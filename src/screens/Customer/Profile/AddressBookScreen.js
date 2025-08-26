// import libraries
import React, { useState } from 'react';
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
  Platform
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// dummy data for addresses
const addresses = [
  { id: '1', address: '64 A shahpurjat new delhi', pincode: '110017' },
  { id: '2', address: '45 B south ex new delhi', pincode: '110049' },
  { id: '3', address: '12 Connaught Place, Delhi', pincode: '110001' },
];

const AddressBookScreen = ({ navigation }) => {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [editAddress, setEditAddress] = useState("");
  const [editPincode, setEditPincode] = useState("");

  const handleDeletePress = (item) => {
    setSelectedAddress(item);
    setDeleteModalVisible(true);
  };

  const handleEditPress = (item) => {
    setSelectedAddress(item);
    setEditAddress(item.address);
    setEditPincode(item.pincode);
    setEditModalVisible(true);
  };

  const confirmDelete = () => {
    Alert.alert("Deleted", `${selectedAddress?.address} deleted successfully`);
    setDeleteModalVisible(false);
  };

  const saveEdit = () => {
    Alert.alert("Updated", `Address updated to:\n${editAddress}, ${editPincode}`);
    setEditModalVisible(false);
  };

  const renderItem = ({ item, index }) => (
    <View>
      <View style={styles.addressContainer}>
        <Text style={styles.bullet}>•</Text>
        <View style={styles.addressTextContainer}>
          <Text style={styles.addressText}>{item.address}</Text>
          <Text style={styles.addressText}>pincode - {item.pincode}</Text>
        </View>

        {/* Edit & Delete Icons */}
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => handleEditPress(item)} style={styles.iconBtn}>
            <Ionicons name="create-outline" size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeletePress(item)} style={styles.iconBtn}>
            <Ionicons name="trash-outline" size={20} color="red" />
          </TouchableOpacity>
        </View>
      </View>

      {index < addresses.length - 1 && <View style={styles.separator} />}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header with Add Icon */}
      <View style={styles.header}>
        <Text style={styles.title}>Address Book</Text>
        <TouchableOpacity onPress={() => navigation?.navigate("AddAddressScreen")}>
          <Ionicons name="add-circle-outline" size={28} color="#000" />
        </TouchableOpacity>
      </View>
      
      {/* Address List */}
      <FlatList
        data={addresses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Delete Address</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete this address?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Address</Text>
            
            <TextInput
              style={styles.input}
              value={editAddress}
              onChangeText={setEditAddress}
              placeholder="Enter Address"
              placeholderTextColor="#aaa"
            />

            <TextInput
              style={styles.input}
              value={editPincode}
              onChangeText={setEditPincode}
              placeholder="Enter Pincode"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </View>
  );
};

// styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight+20 : 0, // ✅ StatusBar ke jitna padding
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  bullet: {
    fontSize: 25,
    color: '#757575',
    marginRight: 12,
    marginTop: 2,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 22,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginLeft: 30,
  },
  iconContainer: {
    flexDirection: "row",
  },
  iconBtn: {
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#000",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: "#000",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  cancelText: {
    fontSize: 15,
    color: "#333",
  },
  deleteBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "red",
    borderRadius: 6,
  },
  deleteText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "bold",
  },
  saveBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#007BFF",
    borderRadius: 6,
  },
  saveText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default AddressBookScreen;
