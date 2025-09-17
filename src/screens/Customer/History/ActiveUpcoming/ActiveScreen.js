import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Modal,
    Animated,
    Dimensions,
    TextInput,
    Alert,
    RefreshControl
} from 'react-native';
import { rw, rh } from '../../../../constants/responsive';
import { useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getManufacturerBookings } from '../../../../services/bookings';
import { checkoutWorker } from '../../../../services/workers'; 
import { scanQrCode } from '../../../../services/qrCode'; // Add QR scan service
import BookingCard from './components/BookingCard';
import { useAlert, ALERT_TYPES } from '../../../../components/AlertProvider';

const { height, width } = Dimensions.get("window");

const ActiveScreen = () => {
    const navigation = useNavigation();
    
    // API Data States
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [categories, setCategories] = useState([]);
    const [processingWorkers, setProcessingWorkers] = useState(new Set());
    
    // UI States
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [qrVisible, setQrVisible] = useState(false);
    const [ratingVisible, setRatingVisible] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [detailedReview, setDetailedReview] = useState('');
    const [selectedRatingOptions, setSelectedRatingOptions] = useState([]);
    const [selectedStars, setSelectedStars] = useState(0);

    // Animation for modal content only
    const slideAnim = useRef(new Animated.Value(300)).current;
    const ratingSlideAnim = useRef(new Animated.Value(300)).current;

    // Alert provider
    const { showAlert } = useAlert();

    // Generate categories from API response data
    const generateCategories = (bookings) => {
        const categorySet = new Set();
        
        bookings.forEach(booking => {
            booking.booking_workers.forEach(worker => {
                if (worker.category?.name) {
                    categorySet.add(worker.category.name);
                }
            });
        });

        // Convert to required format with id and name
        const categoriesArray = [
            { id: 'all', name: 'All' }
        ];

        Array.from(categorySet).forEach(categoryName => {
            categoriesArray.push({
                id: categoryName.toLowerCase().replace(/\s+/g, '_'),
                name: categoryName
            });
        });

        return categoriesArray;
    };

    // Filter bookings based on selected category
    const filterBookings = () => {
        const filtered = bookings.filter(booking => {
            // Category filter
            let categoryMatch = selectedCategory === 'all';
            
            if (!categoryMatch) {
                categoryMatch = booking.booking_workers.some(worker => {
                    if (!worker.category?.name) return false;
                    const categoryId = worker.category.name.toLowerCase().replace(/\s+/g, '_');
                    return categoryId === selectedCategory;
                });
            }

            return categoryMatch;
        });

        setFilteredBookings(filtered);
    };

    // Load bookings from API - Filter for in_progress bookings
    const loadBookings = async () => {
        setLoading(true);
        try {
            console.log('Loading in-progress bookings from API...');
            const response = await getManufacturerBookings();

            if (response.data?.success && response.data?.bookings?.data) {
                // Filter for in_progress bookings here
                const allBookings = response.data.bookings.data;
                const inProgressBookings = allBookings.filter(
                    (booking) => booking.status?.toLowerCase() === 'in_progress'
                );

                console.log(
                    'In-progress bookings loaded successfully:',
                    inProgressBookings.length,
                    'bookings'
                );

                // Set state with only in_progress bookings
                setBookings(inProgressBookings);
                setFilteredBookings(inProgressBookings);

                // Generate categories from actual API data
                const generatedCategories = generateCategories(inProgressBookings);
                setCategories(generatedCategories);

                // Reset category filter if it's initial load
                if (bookings.length === 0) {
                    setSelectedCategory('all');
                }
            } else {
                console.error('Invalid API response structure:', response);
                setBookings([]);
                setFilteredBookings([]);
                setCategories([{ id: 'all', name: 'All' }]);
            }
        } catch (error) {
            console.error('Error loading bookings:', error);
            setBookings([]);
            setFilteredBookings([]);
            setCategories([{ id: 'all', name: 'All' }]);
        } finally {
            setLoading(false);
        }
    };

    // Handle refresh
    const handleRefresh = async () => {
        console.log('Refreshing in-progress bookings...');
        setRefreshing(true);
        await loadBookings();
        setRefreshing(false);
    };

    // Handle status update - Similar to BookingList pattern
    const handleStatusUpdate = async (bookingId, newStatus) => {
        if (!bookingId || !newStatus) {
            showAlert({
                type: ALERT_TYPES.ERROR,
                title: 'Error',
                message: 'Invalid booking ID or status',
            });
            return;
        }
        
        try {
            console.log(`Updating booking ${bookingId} to status: ${newStatus}`);
            // Create proper payload structure that matches API expectation
            const payload = { status: newStatus };
            
            // Add your API call here to update booking status
            // const result = await updateBookingStatus(bookingId, payload);
            
            // Show success message based on status
            const messages = {
                confirmed: 'Booking confirmed successfully! Worker will be notified.',
                cancelled: 'Booking cancelled successfully.',
                completed: 'Booking marked as completed!',
                in_progress: 'Work started successfully!'
            };

            showAlert({
                type: ALERT_TYPES.SUCCESS,
                title: 'Success',
                message: messages[newStatus] || 'Status updated successfully',
                duration: 3000,
            });
            
            // Refresh the bookings after successful update
            await handleRefresh();
        } catch (error) {
            console.error('Error updating booking status:', error);
            
            const errorMessages = {
                confirmed: 'Failed to confirm booking. Please try again.',
                cancelled: 'Failed to cancel booking. Please try again.',
                completed: 'Failed to mark booking as completed. Please try again.',
                in_progress: 'Failed to start work. Please try again.'
            };
            
            showAlert({
                type: ALERT_TYPES.ERROR,
                title: 'Update Failed',
                message: errorMessages[newStatus] || 'Failed to update booking status',
            });
        }
    };

    // Handle QR scan - Similar to BookingList pattern with actual API call
    const handleQrScan = async (qrData, booking) => {
        if (!qrData || !booking) {
            showAlert({
                type: ALERT_TYPES.ERROR,
                title: 'Error',
                message: 'Invalid QR code or booking data',
            });
            return;
        }

        try {
            console.log('QR Code scanned:', qrData, 'for booking:', booking.id);
            
            // Determine action based on booking status
            const currentStatus = booking.status?.toLowerCase();
            let action;
            
            if (currentStatus === 'confirmed') {
                action = 'checkin'; // Start work
            } else if (currentStatus === 'in_progress') {
                action = 'checkout'; // End work
            } else {
                throw new Error('Invalid booking status for QR scan');
            }
            
            // Create proper payload structure that matches API expectation
            const payload = {
                qr_code: qrData,
                action: action, // 'checkin' or 'checkout'
                booking_id: booking.id
            };
            
            console.log('QR scan attempt:', { payload, currentStatus });
            
            // Make actual API call to /api/qr/process-scan
            const result = await scanQrCode(payload);
            
            console.log('QR scan result:', result.data);
            
            // Check for success in the response
            if (result?.data?.success || result?.success) {
                const responseData = result.data || result;
                const workerName = responseData?.worker_name || 'Worker';
                const totalHours = responseData?.total_hours || 'N/A';
                const bookingStatus = responseData?.booking_status || 'updated';
                
                const isCheckin = action === 'checkin';
                
                showAlert({
                    type: ALERT_TYPES.SUCCESS,
                    title: isCheckin ? 'Work Started!' : 'Work Completed!',
                    message: isCheckin 
                        ? `${workerName} has checked in successfully. Work is now in progress.`
                        : `${workerName} has checked out. Total hours worked: ${totalHours}`,
                    duration: 3000,
                });
                
                // Refresh the bookings after successful scan
                await handleRefresh();
                
            } else {
                // Handle API error response
                const errorMessage = result?.data?.message || result?.message || 'QR scan failed';
                throw new Error(errorMessage);
            }
            
        } catch (error) {
            console.error('Error processing QR scan:', error);
            
            // Extract detailed error message from API response
            let errorMessage = 'Failed to process QR code. Please ensure the QR code is valid and try again.';
            
            if (error?.response?.data) {
                const errorData = error.response.data;
                console.log('API Error Details:', errorData);
                
                if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData.errors) {
                    // Handle validation errors
                    const validationErrors = Object.values(errorData.errors).flat();
                    errorMessage = validationErrors.join(', ');
                }
                
                // Add specific QR-related error context
                if (errorData.current_status) {
                    errorMessage += ` (Current QR status: ${errorData.current_status})`;
                }
            } else if (error?.message) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            
            // Add status code to error message for debugging
            if (error?.response?.status) {
                errorMessage += ` [Error ${error.response.status}]`;
            }
            
            showAlert({
                type: ALERT_TYPES.ERROR,
                title: 'QR Scan Failed',
                message: errorMessage,
            });
        }
    };

    // Handle worker checkout - Similar to BookingList QR scan pattern
    const handleWorkerCheckoutAction = async (bookingId, workerId) => {
        if (!bookingId || !workerId) {
            showAlert({
                type: ALERT_TYPES.ERROR,
                title: 'Error',
                message: 'Invalid booking ID or worker ID',
            });
            return;
        }

        // Add to processing set
        setProcessingWorkers(prev => new Set(prev).add(`${bookingId}-${workerId}`));
        
        try {
            // Create proper payload structure that matches API expectation
            const payload = {
                booking_id: bookingId,
                worker_id: workerId,
                action: 'checkout', // Similar to QR scan action
                checkout_time: new Date().toISOString()
            };
            
            console.log('Worker checkout attempt:', { payload });
            
            const result = await checkoutWorker(payload);
            
            console.log('Worker checkout result:', result.data);
            
            // Check for success in the response
            if (result?.data?.success || result?.success) {
                const responseData = result.data || result;
                const workerName = responseData?.worker_name || 'Worker';
                const totalHours = responseData?.total_hours || 'N/A';
                
                showAlert({
                    type: ALERT_TYPES.SUCCESS,
                    title: 'Worker Checked Out!',
                    message: `${workerName} has been checked out successfully. Total hours worked: ${totalHours}`,
                    duration: 3000,
                });
                
                // Refresh the bookings after successful checkout
                await handleRefresh();
                
            } else {
                // Handle API error response
                const errorMessage = result?.data?.message || result?.message || 'Failed to checkout worker';
                throw new Error(errorMessage);
            }

        } catch (error) {
            console.error('Worker checkout error:', error);
            
            // Extract error message from different possible error structures
            let errorMessage = 'Failed to checkout worker. Please try again.';
            
            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            
            showAlert({
                type: ALERT_TYPES.ERROR,
                title: 'Checkout Failed',
                message: errorMessage,
            });
        } finally {
            // Remove from processing set
            setProcessingWorkers(prev => {
                const newSet = new Set(prev);
                newSet.delete(`${bookingId}-${workerId}`);
                return newSet;
            });
        }
    };

    // Load bookings on component mount
    useEffect(() => {
        loadBookings();
    }, []);

    // Filter bookings when category changes
    useEffect(() => {
        filterBookings();
    }, [selectedCategory, bookings]);

    const openModal = () => {
        setQrVisible(true);
        // Animate modal content from bottom
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeModal = () => {
        // Animate modal content to bottom
        Animated.timing(slideAnim, {
            toValue: 300,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            setQrVisible(false);
            slideAnim.setValue(300); // Reset for next open
        });
    };

    const openRatingModal = (booking) => {
        setSelectedService(booking);
        setRatingVisible(true);
        // Reset states when opening modal
        setDetailedReview('');
        setSelectedRatingOptions([]);
        setSelectedStars(0);
        
        // Start from complete bottom position
        ratingSlideAnim.setValue(400);
        // Animate to top with proper timing
        Animated.timing(ratingSlideAnim, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
        }).start();
    };

    const closeRatingModal = () => {
        // Animate rating modal content to bottom
        Animated.timing(ratingSlideAnim, {
            toValue: 400,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setRatingVisible(false);
            setSelectedService(null);
            setDetailedReview('');
            setSelectedRatingOptions([]);
            setSelectedStars(0);
        });
    };

    // Handle rating option selection/deselection
    const toggleRatingOption = (optionText) => {
        setSelectedRatingOptions(prev => {
            if (prev.includes(optionText)) {
                // Remove if already selected
                return prev.filter(option => option !== optionText);
            } else {
                // Add if not selected
                return [...prev, optionText];
            }
        });
    };

    // Handle star rating
    const handleStarPress = (starNumber) => {
        setSelectedStars(starNumber);
    };

    // Handle submit
    const handleSubmit = () => {
        if (selectedStars === 0) {
            Alert.alert('Rating Required', 'Please select a star rating before submitting.');
            return;
        }

        const reviewData = {
            bookingId: selectedService?.id,
            bookingCode: selectedService?.booking_code,
            stars: selectedStars,
            selectedOptions: selectedRatingOptions,
            detailedReview: detailedReview.trim(),
            timestamp: new Date().toISOString()
        };

        // Show success message
        Alert.alert(
            'Review Submitted!', 
            `Thank you for rating booking #${selectedService?.booking_code}. Your ${selectedStars} star review has been submitted successfully.`,
            [
                {
                    text: 'OK',
                    onPress: () => {
                        closeRatingModal();
                        console.log('Review submitted:', reviewData);
                        // Optionally refresh the list
                        handleRefresh();
                    }
                }
            ]
        );
    };

    // Format booking date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Get worker names from booking
    const getWorkerNames = (booking) => {
        if (booking.booking_workers && booking.booking_workers.length > 0) {
            return booking.booking_workers.map(worker => 
                worker.worker?.name || 'Unknown Worker'
            ).join(', ');
        }
        return 'No workers assigned';
    };

    // Get service categories from booking
    const getServiceCategories = (booking) => {
        if (booking.booking_workers && booking.booking_workers.length > 0) {
            return booking.booking_workers.map(worker => 
                worker.category?.name || 'Unknown Category'
            ).join(', ');
        }
        return 'No category';
    };

    const ratingOptions = [
        "worker was unprofessional",
        "slow speed",
        "didn't arrive on time",
        "poor quality work",
        "unfocused",
        "littering"
    ];

    // Render loading state
    if (loading && bookings.length === 0) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.loadingText}>Loading in-progress bookings...</Text>
            </View>
        );
    }

    // Render empty state
    if (!loading && filteredBookings.length === 0) {
        return (
            <View style={styles.container}>
                <ScrollView 
                    style={styles.contentContainer} 
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={['#000000']}
                            tintColor="#000000"
                        />
                    }
                >
                    {/* Category Filter - Show even when empty */}
                    {categories.length > 1 && (
                        <View style={styles.categoryContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContentContainer}>
                                {categories.map((category) => (
                                    <TouchableOpacity
                                        key={category.id}
                                        style={[
                                            styles.categoryItem,
                                            selectedCategory === category.id && styles.selectedCategory
                                        ]}
                                        onPress={() => setSelectedCategory(category.id)}
                                    >
                                        <Text style={[
                                            styles.categoryText,
                                            selectedCategory === category.id && styles.selectedCategoryText
                                        ]}>
                                            {category.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No active bookings found</Text>
                        <Text style={styles.emptySubText}>Pull down to refresh</Text>
                    </View>
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Scrollable Content */}
            <ScrollView 
                style={styles.contentContainer} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#000000']}
                        tintColor="#000000"
                    />
                }
            >
                {/* Category Filter */}
                {categories.length > 1 && (
                    <View style={styles.categoryContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContentContainer}>
                            {categories.map((category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.categoryItem,
                                        selectedCategory === category.id && styles.selectedCategory
                                    ]}
                                    onPress={() => setSelectedCategory(category.id)}
                                >
                                    <Text style={[
                                        styles.categoryText,
                                        selectedCategory === category.id && styles.selectedCategoryText
                                    ]}>
                                        {category.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Active Services List - Using BookingCard Component */}
                {filteredBookings.map((booking) => (
                    <BookingCard
                        key={booking.id}
                        booking={booking}
                        onStatusUpdate={handleStatusUpdate}
                        onQrScan={handleQrScan}
                        onWorkerCheckout={handleWorkerCheckoutAction}
                        onShowRating={openRatingModal}
                    />
                ))}
            </ScrollView>

            {/* QR Modal - Fade overlay with animated modal */}
            <Modal transparent visible={qrVisible} animationType="fade" onRequestClose={closeModal}>
                {/* Fade Overlay */}
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={closeModal} />
                    
                    {/* Animated Bottom Sheet */}
                    <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
                        {/* Close button top-right */}
                        <TouchableOpacity style={styles.closeIcon} onPress={closeModal}>
                            <Icon name="close" size={28} color="#333" />
                        </TouchableOpacity>

                        <Text style={styles.modalTitle}>Your QR Code</Text>
                        <QRCode value="Service-12345" size={200} />
                    </Animated.View>
                </View>
            </Modal>

            {/* Rating Modal */}
            <Modal transparent visible={ratingVisible} animationType="none" onRequestClose={closeRatingModal}>
                {/* Fade Overlay */}
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={closeRatingModal} />
                </View>
                
                {/* Animated Rating Modal - Outside overlay for proper positioning */}
                <Animated.View style={[styles.ratingModalContainer, { transform: [{ translateY: ratingSlideAnim }] }]}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.ratingModalContent}>
                        {/* Close button */}
                        <TouchableOpacity style={styles.closeIcon} onPress={closeRatingModal}>
                            <Icon name="close" size={28} color="#333" />
                        </TouchableOpacity>

                        {/* Header Section with text on left and image on right */}
                        <View style={styles.headerSection}>
                            <View style={styles.headerTextSection}>
                                <Text style={styles.ratingTitle}>Rate your service</Text>
                                <Text style={styles.serviceProviderName}>
                                    #{selectedService?.booking_code}
                                </Text>
                            </View>
                            
                            <View style={styles.providerImageSection}>
                                <Image 
                                    source={require('../../../../assets/images/boy-user.png')} 
                                    style={styles.providerImage} 
                                />
                                <Text style={styles.providerService}>
                                    {selectedService ? getServiceCategories(selectedService) : ''}
                                </Text>
                            </View>
                        </View>

                        {/* Star Rating */}
                        <View style={styles.starRatingContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity 
                                    key={star} 
                                    style={styles.starButton}
                                    onPress={() => handleStarPress(star)}
                                >
                                    <Text style={[
                                        styles.starIcon, 
                                        { color: star <= selectedStars ? '#FFD700' : '#000' }
                                    ]}>★</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Rating Options */}
                        <View style={styles.ratingOptionsContainer}>
                            <View style={styles.ratingRow}>
                                {ratingOptions.slice(0, 3).map((option, index) => (
                                    <TouchableOpacity 
                                        key={index}
                                        style={[
                                            styles.ratingOption,
                                            selectedRatingOptions.includes(option) && styles.selectedRatingOption
                                        ]}
                                        onPress={() => toggleRatingOption(option)}
                                    >
                                        <Text style={[
                                            styles.ratingOptionText,
                                            selectedRatingOptions.includes(option) && styles.selectedRatingOptionText
                                        ]}>
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <View style={styles.ratingRow}>
                                {ratingOptions.slice(3, 6).map((option, index) => (
                                    <TouchableOpacity 
                                        key={index + 3}
                                        style={[
                                            styles.ratingOption,
                                            selectedRatingOptions.includes(option) && styles.selectedRatingOption
                                        ]}
                                        onPress={() => toggleRatingOption(option)}
                                    >
                                        <Text style={[
                                            styles.ratingOptionText,
                                            selectedRatingOptions.includes(option) && styles.selectedRatingOptionText
                                        ]}>
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Detailed Review Input */}
                        <View style={styles.reviewInputContainer}>
                            <TextInput
                                style={styles.reviewInput}
                                placeholder="Add detailed review..."
                                placeholderTextColor="#888"
                                multiline={true}
                                value={detailedReview}
                                onChangeText={setDetailedReview}
                                textAlignVertical="top"
                                maxLength={500}
                            />
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                            <Text style={styles.submitButtonText}>Submit</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </Animated.View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FEFEFE' },
    contentContainer: { flex: 1 },
    centerContent: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: 16, color: '#666' },
    
    // Empty State
    emptyContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        paddingVertical: 100
    },
    emptyText: { 
        fontSize: 18, 
        color: '#333', 
        marginBottom: 10,
        fontWeight: '500'
    },
    emptySubText: { 
        fontSize: 14, 
        color: '#666' 
    },

    categoryContainer: { marginTop: 15 },
    categoryContentContainer: { paddingHorizontal: 20 },
    categoryItem: {
        backgroundColor: '#f0f0f0',
        height: rh(5),
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderRadius: 15,
        marginRight: 10,
        minWidth: 100,
        alignItems: 'center',
        justifyContent: 'center'
    },
    selectedCategory: { backgroundColor: '#e8e8e8' },
    categoryText: { fontSize: 13, color: '#666' },
    selectedCategoryText: { color: '#000' },

    // Modal Styles - Fade overlay with animated bottom sheet
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: 'flex-end',
    },
    overlayTouchable: {
        flex: 1,
    },
    modalContainer: {
        backgroundColor: "#fff",
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        alignItems: "center",
        minHeight: 300,
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
    closeIcon: {
        position: 'absolute',
        top: 15,
        right: 15,
        padding: 5,
        zIndex: 1000,
    },

    // Rating Modal Styles - Updated Layout
    ratingModalContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        width: '100%',
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -5,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },

    ratingModalContent: {
        padding: 25,
        alignItems: "center",
        paddingBottom: 30,
    },

    // New Header Section Layout - Text left, Image right
    headerSection: {
        flexDirection: 'row',
        width: '100%',
        marginTop: 15,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    headerTextSection: {
        flex: 1,
        paddingRight: 20,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    ratingTitle: {
        fontSize: 20,
        color: '#333',
        fontWeight: '400',
        textAlign: 'left',
    },
    serviceProviderName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'left',
    },
    providerImageSection: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    providerImage: {
        width: 100,
        height: 100,
        marginBottom: 3,
        borderRadius: 50,
    },
    providerService: {
        fontSize: 14,
        color: '#000000',
        paddingHorizontal: 15,
        textAlign: 'center',
        fontWeight: '400',
    },
    starRatingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 25,
    },
    starButton: {
        marginHorizontal: 5,
        padding: 2,
    },
    starIcon: {
        fontSize: 40,
        color: '#000',
    },
    ratingOptionsContainer: {
        width: '100%',
        marginBottom: 25,
    },
    ratingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    ratingOption: {
        backgroundColor: '#f8f8f8',
        borderRadius: 15,
        flex: 1,
        marginHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 80,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    selectedRatingOption: {
        backgroundColor: '#000',
    },
    ratingOptionText: {
        fontSize: 13,
        color: '#555',
        textAlign: 'center',
        lineHeight: 18,
        fontWeight: '400',
    },
    selectedRatingOptionText: {
        color: '#fff',
    },
    reviewInputContainer: {
        width: '100%',
        backgroundColor: '#f8f8f8',
        borderRadius: 15,
        marginBottom: 25,
        minHeight: 120,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    reviewInput: {
        fontSize: 15,
        color: '#333',
        fontWeight: '400',
        padding: 20,
        textAlignVertical: 'top',
        minHeight: 120,
    },
    submitButton: {
        backgroundColor: '#000',
        paddingHorizontal: 50,
        paddingVertical: 15,
        borderRadius: 30,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default ActiveScreen;