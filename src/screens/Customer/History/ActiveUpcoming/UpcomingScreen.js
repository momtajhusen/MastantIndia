import React, { useState, useEffect, useRef } from 'react';
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
  Alert,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { getManufacturerBookings } from '../../../../services/bookings';
import { scanQrCode } from '../../../../services/qrCode';
import { useAlert, ALERT_TYPES } from '../../../../components/AlertProvider';

const UpcomingScreen = () => {
  const navigation = useNavigation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('instant');
  const [categories, setCategories] = useState([]);
  const [categoryWorkers, setCategoryWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [timeFilters] = useState([
    { id: 'instant', name: 'instant' },
    { id: 'custom_days', name: 'custom days' },
    { id: '15_days', name: '15 days' },
    { id: '1_month', name: '1 month' },
  ]);

  // QR Scanner Modal States
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const { showAlert } = useAlert();

  // Request camera permissions
  const requestCameraPermission = async () => {
    const { status } = await requestPermission();
    if (status !== 'granted') {
      showAlert({
        type: ALERT_TYPES.ERROR,
        title: 'Permission Denied',
        message: 'Camera permission is required to scan QR codes',
      });
      return false;
    }
    return true;
  };

  // Handle barcode scanned
  const handleBarcodeScanned = async (event) => {
    if (scanning) return; // Prevent multiple scans
    
    const { data } = event;
    console.log('QR Code Scanned:', data);
    
    // Haptic feedback
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.log('Haptics error:', err);
    }
    
    await processScannedQR(data);
  };

  // Process scanned QR code
  const processScannedQR = async (qrCode) => {
    if (!selectedWorker) {
      setScanError('Invalid worker data');
      return;
    }

    setScanning(true);
    setScanError(null);

    try {
      const currentStatus = selectedWorker.bookingStatus?.toLowerCase();
      const action = currentStatus === 'confirmed' ? 'checkin' : 'checkout';

      console.log('Processing QR Code:', {
        qrCode,
        action,
        bookingId: selectedWorker.bookingId,
        bookingStatus: currentStatus,
        workerName: selectedWorker.name,
      });

      const payload = {
        qr_code: qrCode,
        action: action,
        booking_id: selectedWorker.bookingId,
      };

      const result = await scanQrCode(payload);

      if (result?.data?.success || result?.success) {
        const isCheckin = action === 'checkin';
        const responseData = result.data || result;

        const workerName = responseData?.worker_name || selectedWorker.name;
        const checkinTime = responseData?.checkin_time;
        const checkoutTime = responseData?.checkout_time;
        const totalHours = responseData?.total_hours || 'N/A';
        const regularHours = responseData?.regular_hours || '0';
        const overtimeHours = responseData?.overtime_hours || '0';

        let timeDisplay = '';
        if (isCheckin && checkinTime) {
          timeDisplay = new Date(checkinTime).toLocaleTimeString();
        } else if (!isCheckin && checkoutTime) {
          timeDisplay = new Date(checkoutTime).toLocaleTimeString();
        }

        const successMessage = isCheckin
          ? `✓ ${workerName}\nChecked in at ${timeDisplay}`
          : `✓ ${workerName}\nChecked out at ${timeDisplay}\n\nTotal: ${totalHours}h\nRegular: ${regularHours}h | OT: ${overtimeHours}h`;

        showAlert({
          type: ALERT_TYPES.SUCCESS,
          title: isCheckin ? 'Check-In Successful' : 'Check-Out Successful',
          message: successMessage,
        });

        setShowScanner(false);
        setScanning(false);
        
        // Navigate to Active tab after successful checkin/checkout
        setTimeout(() => {
          navigation.navigate('ActiveUpcomingServices', { 
            initialTab: 'Active' 
          });
        }, 1000);
      } else {
        const errorMessage =
          result?.data?.message || result?.message || 'QR scan failed';
        setScanError(errorMessage);
        setScanning(false);
      }
    } catch (error) {
      console.error('QR scan error:', error);

      let errorMessage = 'Failed to process QR code';

      if (error?.response?.status === 404) {
        errorMessage = 'QR code not found or expired';
      } else if (error?.response?.status === 403) {
        errorMessage = 'Access denied for this booking';
      } else if (error?.response?.status === 400) {
        errorMessage =
          error?.response?.data?.message ||
          'Invalid QR code status for this action';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).flat().join(', ');
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setScanError(errorMessage);
      setScanning(false);
    }
  };

  // Generate categories from bookings
  const generateCategories = (bookings) => {
    const categorySet = new Set();

    bookings.forEach((booking) => {
      booking.booking_workers?.forEach((worker) => {
        if (worker.category?.name) {
          categorySet.add(worker.category.name);
        }
      });
    });

    const categoriesArray = Array.from(categorySet).map((categoryName) => ({
      id: categoryName.toLowerCase().replace(/\s+/g, '_'),
      name: categoryName,
    }));

    return categoriesArray;
  };

  // Get workers for selected category
  const getWorkersForCategory = () => {
    if (!selectedCategory) {
      setCategoryWorkers([]);
      return;
    }

    const workers = [];

    bookings.forEach((booking) => {
      booking.booking_workers?.forEach((w) => {
        const categoryMatch =
          w.category?.name?.toLowerCase().replace(/\s+/g, '_') ===
          selectedCategory;

        // Sirf 'confirmed' status ke workers dikha (in_progress nahi)
        const bookingStatus = booking.status?.toLowerCase() || 'confirmed';
        
        if (categoryMatch && bookingStatus === 'confirmed') {
          workers.push({
            id: w.id,
            workerId: w.worker?.id || w.id,
            name: w.worker?.name || 'Worker',
            category: w.category?.name || 'Category',
            profile_image: w.worker?.profile_picture,
            rating: w.worker?.rating || '0.0',
            phone: w.worker?.phone,
            duration: selectedTimeFilter.replace(/_/g, ' '),
            bookingId: booking.id,
            bookingDate: booking.booking_date,
            bookingStatus: bookingStatus,
            qrCode: w.qr_code || booking.qr_code || 'DEMO_QR_CODE',
            qrCheckinId: w.qr_checkin_id,
            workerData: w,
            bookingData: booking,
          });
        }
      });
    });

    setCategoryWorkers(workers);

    if (workers.length > 0 && !selectedWorker) {
      setSelectedWorker(workers[0]);
    } else if (workers.length === 0) {
      setSelectedWorker(null);
    }
  };

  // Load bookings from API
  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await getManufacturerBookings();

      if (response.data?.success && response.data?.bookings?.data) {
        const allBookings = response.data.bookings.data;
        
        const activeBookings = allBookings.filter((booking) => {
          const status = booking.status?.toLowerCase();
          return status === 'confirmed' || status === 'in_progress';
        });

        setBookings(activeBookings);

        const generatedCategories = generateCategories(activeBookings);
        setCategories(generatedCategories);

        if (generatedCategories.length > 0 && !selectedCategory) {
          setSelectedCategory(generatedCategories[0].id);
        }
      } else {
        setBookings([]);
        setCategories([]);
        setSelectedCategory(null);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      showAlert({
        type: ALERT_TYPES.ERROR,
        title: 'Error',
        message: 'Failed to load bookings',
      });
      setBookings([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh bookings
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  // Select worker
  const handleWorkerSelect = (worker) => {
    setSelectedWorker(worker);
    setScanError(null);
  };

  // Open scanner modal
  const openScanner = async () => {
    if (!selectedWorker) {
      showAlert({
        type: ALERT_TYPES.ERROR,
        title: 'Error',
        message: 'Please select a worker first',
      });
      return;
    }

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    setShowScanner(true);
    setScanError(null);
  };

  // Manual QR entry
  const handleManualQREntry = () => {
    Alert.prompt(
      'Enter QR Code',
      `Paste the QR code value for ${selectedWorker?.name}:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: (value) => {
            if (value?.trim()) {
              console.log('Manual QR Entry:', {
                value: value.trim(),
                worker: selectedWorker?.name,
              });
              processScannedQR(value.trim());
            } else {
              setScanError('Please enter a valid QR code');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  // Close scanner
  const closeScanner = () => {
    setShowScanner(false);
    setScanning(false);
    setScanError(null);
  };

  // Change category
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedWorker(null);
  };

  // Initial load
  useEffect(() => {
    loadBookings();
  }, []);

  // Update workers when category/filter changes
  useEffect(() => {
    if (bookings.length > 0 && selectedCategory) {
      getWorkersForCategory();
    }
  }, [selectedCategory, selectedTimeFilter, bookings]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#000000']}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category Filter */}
        <View style={styles.categorySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => handleCategoryChange(cat.id)}
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

        {/* Time Filter */}
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
                  selectedTimeFilter === filter.id &&
                    styles.timeFilterButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.timeFilterText,
                    selectedTimeFilter === filter.id &&
                      styles.timeFilterTextActive,
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
          ) : bookings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No Upcoming Bookings</Text>
              <Text style={styles.emptySubText}>
                New bookings will appear here
              </Text>
            </View>
          ) : categoryWorkers.length > 0 ? (
            categoryWorkers.map((worker, index) => (
              <TouchableOpacity
                key={`${worker.id}-${index}`}
                style={[
                  styles.workerCard,
                  selectedWorker?.id === worker.id && styles.workerCardSelected,
                ]}
                onPress={() => handleWorkerSelect(worker)}
                activeOpacity={0.7}
              >
                {selectedWorker?.id === worker.id && (
                  <View style={styles.selectionIndicator}>
                    <Text style={styles.selectionCheckmark}>✓</Text>
                  </View>
                )}

                <View style={styles.workerImageContainer}>
                  {worker.profile_image ? (
                    <Image
                      source={{ uri: worker.profile_image }}
                      style={styles.workerImage}
                    />
                  ) : (
                    <View style={styles.workerImagePlaceholder}>
                      <Text style={styles.workerImageText}>
                        {worker.name?.charAt(0)?.toUpperCase() || 'W'}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.workerDetails}>
                  <Text style={styles.workerName}>{worker.name}</Text>
                  <Text style={styles.workerId}>ID: {worker.workerId}</Text>
                  <Text style={styles.workerDuration}>
                    Duration: {worker.duration}
                  </Text>
                  <View style={styles.statusBadge}>
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            worker.bookingStatus === 'confirmed'
                              ? '#059669'
                              : '#f59e0b',
                        },
                      ]}
                    >
                      {worker.bookingStatus === 'confirmed'
                        ? '● Ready'
                        : '● In Progress'}
                    </Text>
                  </View>
                </View>

                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingIcon}>★</Text>
                  <Text style={styles.ratingValue}>{worker.rating}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No workers found</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Action Button */}
      {selectedWorker && (
        <View style={styles.buttonContainer}>
          <View style={styles.selectedWorkerInfo}>
            <Text style={styles.selectedWorkerText}>
              {selectedWorker.name}
            </Text>
            <Text style={styles.selectedWorkerStatus}>
              {selectedWorker.bookingStatus === 'confirmed'
                ? 'Ready to Check-In'
                : 'Ready to Check-Out'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={openScanner}
            activeOpacity={0.8}
          >
            <Text style={styles.scanButtonText}>
              {selectedWorker.bookingStatus === 'confirmed'
                ? '📷 Scan QR to Check-In'
                : '📷 Scan QR to Check-Out'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Scanner Modal - Expo Camera */}
      <Modal
        visible={showScanner}
        transparent={false}
        animationType="slide"
        onRequestClose={closeScanner}
      >
        <View style={styles.scannerContainer}>
          {permission?.granted ? (
            <>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="back"
                onBarcodeScanned={scanning ? undefined : handleBarcodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ['qr'],
                }}
              >
                {/* Scanner Overlay */}
                <View style={styles.scannerOverlay}>
                  <View style={styles.topMask} />
                  
                  <View style={styles.middleRow}>
                    <View style={styles.sideMask} />
                    
                    <View style={styles.scanFrame}>
                      <View style={styles.corner + ' ' + styles.topLeft} />
                      <View style={styles.corner + ' ' + styles.topRight} />
                      <View style={styles.corner + ' ' + styles.bottomLeft} />
                      <View style={styles.corner + ' ' + styles.bottomRight} />
                    </View>
                    
                    <View style={styles.sideMask} />
                  </View>
                  
                  <View style={styles.bottomMask}>
                    <Text style={styles.scanHintText}>
                      Position QR code in frame
                    </Text>
                  </View>
                </View>

                {/* Close Button */}
                <TouchableOpacity
                  onPress={closeScanner}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>

                {/* Manual Entry Button */}
                <TouchableOpacity
                  onPress={handleManualQREntry}
                  style={styles.manualEntryButton}
                >
                  <Text style={styles.manualEntryText}>📝 Manual Entry</Text>
                </TouchableOpacity>
              </CameraView>

              {/* Error Banner */}
              {scanError && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>⚠ {scanError}</Text>
                  <TouchableOpacity onPress={() => setScanError(null)}>
                    <Text style={styles.errorDismiss}>Dismiss</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Scanning Indicator */}
              {scanning && (
                <View style={styles.scanningOverlay}>
                  <View style={styles.scanningIndicator}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.scanningText}>Processing...</Text>
                  </View>
                </View>
              )}
            </>
          ) : (
            <View style={styles.noPermissionContainer}>
              <Text style={styles.noPermissionText}>
                Camera permission is required
              </Text>
              <TouchableOpacity
                onPress={requestCameraPermission}
                style={styles.permissionButton}
              >
                <Text style={styles.permissionButtonText}>Grant Permission</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={closeScanner}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
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
    paddingBottom: 120,
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
    borderWidth: 2,
    borderColor: '#F3F4F6',
    elevation: 2,
  },
  workerCardSelected: {
    borderColor: '#111827',
    backgroundColor: '#F9FAFB',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionCheckmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  workerDuration: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  statusBadge: {
    marginTop: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ratingContainer: {
    alignItems: 'center',
    marginLeft: 12,
  },
  ratingIcon: {
    fontSize: 24,
    color: '#111827',
  },
  ratingValue: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
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
    elevation: 8,
  },
  selectedWorkerInfo: {
    marginBottom: 12,
  },
  selectedWorkerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  selectedWorkerStatus: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  scanButton: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  // Scanner Modal - Expo Camera
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topMask: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  middleRow: {
    flexDirection: 'row',
    height: 280,
  },
  sideMask: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanFrame: {
    width: 280,
    height: 280,
    borderWidth: 3,
    borderColor: '#4ade80',
    borderRadius: 20,
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
    justifyContent: 'space-between',
    padding: 10,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#4ade80',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  bottomMask: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  scanHintText: {
    color: '#fff',
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  manualEntryButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    zIndex: 10,
  },
  manualEntryText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 14,
  },
  errorBanner: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#FEE2E2',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    padding: 12,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  errorDismiss: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 8,
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  scanningIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 24,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanningText: {
    color: '#fff',
    marginTop: 12,
    fontWeight: '600',
  },
  noPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#000',
  },
  noPermissionText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  permissionButton: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  bottomPadding: {
    height: 20,
  },
});

export default UpcomingScreen;