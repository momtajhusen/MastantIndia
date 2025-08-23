// import libraries
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  StatusBar,
  SafeAreaView, 
  TouchableOpacity
} from 'react-native';

// dummy data for addresses
const addresses = [
  { id: '1', address: '64 A shahpurjat new delhi', pincode: '110017' },
  { id: '2', address: '64 A shahpurjat new delhi', pincode: '110017' },
  { id: '3', address: '64 A shahpurjat new delhi', pincode: '110017' },
  { id: '4', address: '64 A shahpurjat new delhi', pincode: '110017' },
];

const AddressBookScreen = () => {
  const renderItem = ({ item, index }) => (
    <View>
      <TouchableOpacity style={styles.addressContainer}>
        <Text style={styles.bullet}>•</Text>
        <View style={styles.addressTextContainer}>
          <Text style={styles.addressText}>{item.address}</Text>
          <Text style={styles.addressText}>pincode - {item.pincode}</Text>
        </View>
      </TouchableOpacity>
      {index < addresses.length - 1 && <View style={styles.separator} />}
    </View>
  );

  return (
     <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {/* Main Content */}
      <View style={styles.mainContent}>
        <Text style={styles.title}>Address Book</Text>
        
        <FlatList
          data={addresses}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
};

// styles
const styles = StyleSheet.create({
    container: {
        marginTop:30,
        flex: 1,
        backgroundColor: 'white',
    },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 20,
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
});

export default AddressBookScreen;