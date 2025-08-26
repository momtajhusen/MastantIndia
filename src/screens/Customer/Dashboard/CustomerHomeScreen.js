import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Image,
  StatusBar,
  SafeAreaView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { rh, rw, rf } from '../../../constants/responsive';
import ServiceDetailModal from '../../../components/Cards/ServiceDetailModal';
import { useNavigation } from '@react-navigation/native';

const CustomerHomeScreen = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    { id: 1, title: 'Hand Embroider', image: require('../../../assets/images/services/hand-embroider.png') },
    { id: 2, title: 'Machine Embroider', image: require('../../../assets/images/services/machine-embroider.png') },
    { id: 3, title: 'Tailor', image: require('../../../assets/images/services/tailor.png') },
    { id: 4, title: 'Khaka Maker', image: require('../../../assets/images/services/khaka-maker.png') },
    { id: 5, title: 'Pattern Maker', image: require('../../../assets/images/services/pattern-maker.png') },
    { id: 6, title: 'Ironing master', image: require('../../../assets/images/services/ironing-master.png') },
    { id: 7, title: 'Cutting Master', image: require('../../../assets/images/services/cutting-master.png') },
    { id: 8, title: 'Trimming lady', image: require('../../../assets/images/services/trimming-lady.png') },
    { id: 9, title: 'Helpers', image: require('../../../assets/images/services/helpers.png') },
  ];

  const handleServicePress = (service) => {
    setSelectedService(service);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedService(null);
  };

  const ServiceCard = ({ service }) => (
    <TouchableOpacity 
      style={styles.serviceCard}
      onPress={() => handleServicePress(service)}
    >
      <View style={styles.serviceImageContainer}>
        <Image 
          source={service.image} 
          style={styles.serviceImage}
          resizeMode="cover"
        />
      </View>
      <Text style={styles.serviceTitle}>{service.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Fixed Header */}
      <View style={styles.header}>
        <View style={[styles.brandContainer]}>
            <Image
                source={require('../../../assets/images/Applogo.png')}
                style={{ width: rw(5), height: rw(5) }}
            />
          <Text style={styles.headerTitle}>astant India</Text>
        </View>
        <TouchableOpacity 
          style={styles.cartButton} 
          onPress={() => navigation.navigate('Cart')}
        >
          <Ionicons name="cart-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Fixed Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            placeholderTextColor="#666"
          />
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* All Services Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionTitle}>all services</Text>
            <View style={styles.sectionLine} />
          </View>

          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </View>
        </View>

        {/* Popular Packages Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionTitle}>popular packages</Text>
            <View style={styles.sectionLine} />
          </View>

          <View style={styles.packageContainer}>
            <Image 
              source={require('../../../assets/images/services/popular-package.png')}
              style={styles.packageImage}
              resizeMode="cover"
            />
          </View>
        </View>
      </ScrollView>

      {/* Service Detail Modal */}
      <ServiceDetailModal
        visible={modalVisible}
        onClose={handleCloseModal}
        service={selectedService}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  brandContainer: {
    flexDirection:'row',
    alignItems:'center',
    backgroundColor: 'black',
    paddingHorizontal: rw(4),
    paddingVertical: rh(1),
    borderRadius: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    backgroundColor: '#EFEFF0',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  sectionContainer: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  sectionTitle: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '30%',
    marginBottom: 20,
    alignItems: 'center',

  },
  serviceImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 8,
  },
  serviceImage: {
    width: '100%',
    height: '100%',
    // backgroundColor: 'red',
  },
  serviceTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    lineHeight: 16,
  },
  packageContainer: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom:20
  },
  packageImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#ddd',
  },
});

export default CustomerHomeScreen;