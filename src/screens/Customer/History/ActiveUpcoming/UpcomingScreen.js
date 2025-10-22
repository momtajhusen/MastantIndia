import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { getManufacturerBookings } from '../../../../services/bookings';

const UpcomingScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('instant');
  const [categories, setCategories] = useState([]);
  const [timeFilters] = useState([
    { id: 'instant', name: 'instant' },
    { id: 'custom_days', name: 'custom days' },
    { id: '15_days', name: '15 days' },
    { id: '1_month', name: '1 month' },
  ]);
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Generate categories from API response data
  const generateCategories = (bookings) => {
    const categorySet = new Set();

    bookings.forEach((booking) => {
      booking.booking_workers.forEach((worker) => {
        if (worker.category?.name) {
          categorySet.add(worker.category.name);
        }
      });
    });

    const categoriesArray = [{ id: 'all', name: 'All' }];

    Array.from(categorySet).forEach((categoryName) => {
      categoriesArray.push({
        id: categoryName.toLowerCase().replace(/\s+/g, '_'),
        name: categoryName,
      });
    });

    return categoriesArray;
  };

  // Filter workers based on selected category and time filter
  const filterWorkers = () => {
    let workers = [];

    bookings.forEach((booking) => {
      booking.booking_workers.forEach((worker) => {
        // Category filter
        const categoryMatch =
          selectedCategory === 'all' ||
          worker.category?.name.toLowerCase().replace(/\s+/g, '_') === selectedCategory;

        // Time filter - you can add duration field in your worker data
        const timeMatch = selectedTimeFilter === 'instant'; // Modify based on your data structure

        if (categoryMatch && timeMatch) {
          workers.push({
            id: worker.id,
            name: worker.worker?.name || worker.name || 'Worker Name',
            workerId: worker.worker?.id || worker.id,
            category: worker.category?.name || 'Category',
            profile_image: worker.worker?.profile_picture || worker.profile_picture,
            rating: worker.worker?.rating || worker.rating || '0.0',
            phone: worker.worker?.phone || worker.phone,
            duration: selectedTimeFilter.replace(/_/g, ' '),
            bookingId: booking.id,
            bookingDate: booking.booking_date,
            bookingStatus: booking.status,
          });
        }
      });
    });

    setFilteredWorkers(workers);
  };

  // Load bookings from API
  const loadBookings = async () => {
    setLoading(true);
    try {
      console.log('Loading bookings from API...');
      const response = await getManufacturerBookings();

      if (response.data?.success && response.data?.bookings?.data) {
        const allBookings = response.data.bookings.data;
        const confirmedBookings = allBookings.filter(
          (booking) => booking.status?.toLowerCase() === 'confirmed'
        );

        console.log('Confirmed bookings loaded:', confirmedBookings.length);

        setBookings(confirmedBookings);

        // Generate categories from actual API data
        const generatedCategories = generateCategories(confirmedBookings);
        setCategories(generatedCategories);
      } else {
        console.error('Invalid API response structure:', response);
        setBookings([]);
        setCategories([{ id: 'all', name: 'All' }]);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
      setCategories([{ id: 'all', name: 'All' }]);
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    console.log('Refreshing bookings...');
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  // Handle QR Scan
  const handleScanQR = () => {
    setShowScanner(true);
    setScanning(true);

    // Simulate QR scanning - Replace with actual QR scanner implementation
    setTimeout(() => {
      setScanning(false);
      setShowScanner(false);
      
      if (filteredWorkers.length > 0) {
        const worker = filteredWorkers[0];
        alert(
          `QR Scanned!\nWorker: ${worker.name}\nService Started Successfully!`
        );
        // Add your service start logic here
      }
    }, 2000);
  };

  // Load bookings on mount
  useEffect(() => {
    loadBookings();
  }, []);

  // Filter workers when filters change
  useEffect(() => {
    if (bookings.length > 0) {
      filterWorkers();
    }
  }, [selectedCategory, selectedTimeFilter, bookings]);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#000000']}
            tintColor="#000000"
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category Section */}
        <View style={styles.categorySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat.id && styles.categoryButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat.id && styles.categoryTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Time Filter Section */}
        <View style={styles.timeFilterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.timeFilterScroll}
          >
            {timeFilters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                onPress={() => setSelectedTimeFilter(filter.id)}
                style={[
                  styles.timeFilterButton,
                  selectedTimeFilter === filter.id && styles.timeFilterButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.timeFilterText,
                    selectedTimeFilter === filter.id && styles.timeFilterTextActive,
                  ]}
                >
                  {filter.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Workers List */}
        <View style={styles.workersSection}>
          {loading ? (
            <ActivityIndicator size="large" color="#000" style={styles.loader} />
          ) : filteredWorkers.length > 0 ? (
            filteredWorkers.map((worker, index) => (
              <View key={`${worker.id}-${index}`} style={styles.workerCard}>
                {/* Worker Image */}
                <View style={styles.workerImageContainer}>
                  {worker.profile_image ? (
                    <Image
                      source={{ uri: worker.profile_image }}
                      style={styles.workerImage}
                    />
                  ) : (
                    <View style={styles.workerImagePlaceholder}>
                      <Text style={styles.workerImageText}>
                        {worker.name?.charAt(0) || 'W'}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Worker Details */}
                <View style={styles.workerDetails}>
                  <Text style={styles.workerName}>{worker.name || 'Worker'}</Text>
                  <Text style={styles.workerId}>Id: {worker.id}</Text>
                  <Text style={styles.workerDuration}>Duration: {worker.duration}</Text>
                </View>

                {/* Rating */}
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingIcon}>★</Text>
                  <Text style={styles.ratingLabel}>ratings</Text>
                  <Text style={styles.ratingValue}>
                    {worker.rating || '4.5'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No workers found for selected filters
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Scan QR Button - Fixed at Bottom */}
      {filteredWorkers.length > 0 && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleScanQR}
            disabled={scanning}
          >
            <Text style={styles.scanButtonText}>
              {scanning ? 'Scanning...' : 'Scan QR to start service'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* QR Scanner Modal */}
      <Modal
        visible={showScanner}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowScanner(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Scan QR Code</Text>
              <TouchableOpacity
                onPress={() => setShowScanner(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.scannerContainer}>
              <View style={styles.scannerBox}>
                {scanning ? (
                  <ActivityIndicator size="large" color="#000" />
                ) : (
                  <Text style={styles.scannerText}>📷</Text>
                )}
              </View>
            </View>

            <Text style={styles.scannerInstruction}>
              Position QR code within the frame
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  
  // Category Section
  categorySection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryScroll: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 25,
    marginRight: 12,
  },
  categoryButtonActive: {
    backgroundColor: '#111827',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  categoryTextActive: {
    color: '#fff',
  },

  // Time Filter Section
  timeFilterSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  timeFilterScroll: {
    paddingHorizontal: 16,
  },
  timeFilterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  timeFilterButtonActive: {
    borderColor: '#111827',
    backgroundColor: '#fff',
  },
  timeFilterText: {
    fontSize: 13,
    color: '#6B7280',
  },
  timeFilterTextActive: {
    color: '#111827',
    fontWeight: '500',
  },

  // Workers Section
  workersSection: {
    padding: 16,
  },
  workerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  workerImageContainer: {
    marginRight: 16,
  },
  workerImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  workerImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workerImageText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  workerDetails: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  workerId: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  workerDuration: {
    fontSize: 13,
    color: '#6B7280',
  },
  ratingContainer: {
    alignItems: 'center',
    marginLeft: 12,
  },
  ratingIcon: {
    fontSize: 32,
    color: '#111827',
  },
  ratingLabel: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
    marginTop: 2,
  },
  ratingValue: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Bottom Button
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  scanButton: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#374151',
  },
  scannerContainer: {
    aspectRatio: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scannerBox: {
    width: 200,
    height: 200,
    borderWidth: 4,
    borderColor: '#111827',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerText: {
    fontSize: 64,
  },
  scannerInstruction: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6B7280',
  },
  bottomPadding: {
    height: 20,
  },
});

export default UpcomingScreen;