import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  TextInput, 
  TouchableOpacity, 
  Image,
  StatusBar,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { rh, rw } from '../../../constants/responsive';
import ServiceDetailModal from '../../../components/Cards/ServiceDetailModal';
import { useNavigation } from '@react-navigation/native';
import { getCategories } from "../../../services/categories";

const CustomerHomeScreen = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null); // Changed to store only ID

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCategories();
      
      if (response.data && response.data.success) {
        // Map the categories to match your service card structure
        const categoriesData = response.data.categories.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description,
          image: category.icon_url || category.banner_image || 'https://via.placeholder.com/150', // Fallback image
          price_per_hour: category.price_per_hour,
          price_per_day: category.price_per_day,
          price_per_week: category.price_per_week,
          price_per_month: category.price_per_month,
          price_full_time: category.price_full_time,
          requirements: category.requirements,
          average_completion_time: category.average_completion_time,
          tools_required: category.tools_required,
          is_active: category.is_active
        }));
        
        // Filter only active categories
        const activeCategories = categoriesData.filter(category => category.is_active);
        setServices(activeCategories);
      } else {
        setError('Failed to fetch categories');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load services. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCategories();
  };

  const handleServicePress = (service) => {
    setSelectedServiceId(service.id); // Pass only the ID
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedServiceId(null); // Reset to null
  };

  // Function to handle adding items to cart
  const handleAddToCart = (cartItem) => {
    // Here you can implement your cart logic
    // For example, save to AsyncStorage or send to your cart management system
    console.log('Item added to cart:', cartItem);
    
    // You might want to show a toast or update cart count in header
    // Example: updateCartCount(cartItem);
  };

  // Function to handle retry
  const handleRetry = () => {
    fetchCategories();
  };

  const ServiceCard = ({ service }) => (
    <TouchableOpacity 
      style={styles.serviceCard}
      onPress={() => handleServicePress(service)}
    >
      <View style={styles.serviceImageContainer}>
        <Image 
          source={{ uri: service.image }}
          style={styles.serviceImage}
          resizeMode="cover"
          onError={() => {
            // Handle image load error - you could set a default image here
            console.log('Failed to load image for:', service.name);
          }}
        />
      </View>
      <Text style={styles.serviceTitle}>{service.name}</Text>
      {service.price_per_hour && (
        <Text style={styles.servicePrice}>₹{service.price_per_hour}/hr</Text>
      )}
    </TouchableOpacity>
  );

  // Error state
  if (error && !loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        
        {/* Fixed Header */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
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

        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderContent = () => (
    <View>
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionLine} />
          <Text style={styles.sectionTitle}>all services</Text>
          <View style={styles.sectionLine} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loadingText}>Loading services...</Text>
          </View>
        ) : services.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No services available</Text>
          </View>
        ) : (
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </View>
        )}
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
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Fixed Header */}
      <View style={styles.header}>
        <View style={styles.brandContainer}>
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

      {/* Scrollable content with Pull-to-Refresh */}
      <FlatList
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#000']} // Android
            tintColor="#000" // iOS
          />
        }
        data={[{ key: 'content' }]} // Single item to render all content
        renderItem={renderContent}
        keyExtractor={(item) => item.key}
      />

      {/* Service Detail Modal - Pass only service ID */}
      <ServiceDetailModal
        visible={modalVisible}
        onClose={handleCloseModal}
        serviceId={selectedServiceId} // Pass only the service ID
        onAddToCart={handleAddToCart} // Add cart handler
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  scrollArea: { flex: 1, backgroundColor: '#f5f5f5' },
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
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cartButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
  },
  searchContainer: { paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#f5f5f5' },
  searchBar: {
    backgroundColor: '#EFEFF0',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  sectionContainer: { paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionLine: { flex: 1, height: 1, backgroundColor: '#ccc' },
  sectionTitle: { marginHorizontal: 15, fontSize: 16, fontWeight: '500', color: '#333' },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  serviceCard: { width: '30%', marginBottom: 20, alignItems: 'center' },
  serviceImageContainer: { width: '100%', aspectRatio: 1, borderRadius: 15, overflow: 'hidden', marginBottom: 8 },
  serviceImage: { width: '100%', height: '100%' },
  serviceTitle: { fontSize: 12, fontWeight: '500', color: '#333', textAlign: 'center', lineHeight: 16 },
  servicePrice: { fontSize: 10, color: '#666', textAlign: 'center', marginTop: 2 },
  packageContainer: { borderRadius: 15, overflow: 'hidden', marginBottom: 20 },
  packageImage: { width: '100%', height: 200, backgroundColor: '#ddd' },
  
  // Loading states
  loadingContainer: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 10, color: '#666', fontSize: 14 },
  
  // Empty state
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#666', fontSize: 16 },
  
  // Error state
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  errorText: { color: '#666', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  retryButton: { backgroundColor: '#000', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontSize: 14, fontWeight: '500' },
});

export default CustomerHomeScreen;