import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    ActivityIndicator,
    ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BookingCard from './BookingCard';
import { updateBookingStatus } from '../../../../../services/bookings';
import { scanQrCode } from '../../../../../services/qrCode';
import { useAlert, ALERT_TYPES } from '../../../../../components/AlertProvider';

const BookingList = ({ 
    bookings, 
    allBookings, 
    loading, 
    onRefresh, 
    onReset,
    onBookingUpdate
}) => {
    const [processingBookings, setProcessingBookings] = useState(new Set());
    const { showAlert } = useAlert();

    // Fixed status update handler with proper payload structure
    const handleStatusUpdate = async (bookingId, newStatus) => {
        if (!bookingId || !newStatus) {
            showAlert({
                type: ALERT_TYPES.ERROR,
                title: 'Error',
                message: 'Invalid booking ID or status',
            });
            return;
        }

        // Add to processing set
        setProcessingBookings(prev => new Set(prev).add(bookingId));
        
        try {
            // Create proper payload structure that matches API expectation
            const payload = { status: newStatus };
            
            console.log('Updating booking status:', { bookingId, payload });
            
            const result = await updateBookingStatus(bookingId, payload);

            console.log('Status update result:', result.data);
            
            // Check for success in the response
            if (result?.data?.success || result?.success) {
                // Show success message based on status
                const messages = {
                    confirmed: 'Booking confirmed successfully! Worker will be notified.',
                    cancelled: 'Booking cancelled successfully.',
                    completed: 'Booking marked as completed!',
                    in_progress: 'Work started successfully!'
                };

                // ✅ Use custom AlertProvider
                showAlert({
                    type: ALERT_TYPES.SUCCESS,
                    title: 'Success',
                    message: messages[newStatus] || 'Status updated successfully',
                    duration: 3000, // Auto hide after 3 seconds
                });
                
                // Refresh the booking list by calling parent's refresh function
                if (onRefresh) {
                    await onRefresh();
                }
                
                // Also call onBookingUpdate if provided for additional handling
                if (onBookingUpdate) {
                    onBookingUpdate();
                }
            } else {
                // Handle API error response
                const errorMessage = result?.data?.message || result?.message || 'Failed to update status';
                throw new Error(errorMessage);
            }

        } catch (error) {
            console.error('Status update error:', error);
            
            // Show specific error messages
            const errorMessages = {
                confirmed: 'Failed to confirm booking. Please try again.',
                cancelled: 'Failed to cancel booking. Please try again.',
                completed: 'Failed to mark booking as completed. Please try again.',
                in_progress: 'Failed to start work. Please try again.'
            };
            
            // Extract error message from different possible error structures
            let errorMessage = 'Something went wrong. Please try again.';
            
            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            
            showAlert({
                type: ALERT_TYPES.ERROR,
                title: 'Update Failed',
                message: errorMessages[newStatus] || errorMessage,
            });
        } finally {
            // Remove from processing set
            setProcessingBookings(prev => {
                const newSet = new Set(prev);
                newSet.delete(bookingId);
                return newSet;
            });
        }
    };

    // Enhanced QR scan handler with better error handling and correct payload structure
    const handleQrScan = async (qrCode, booking) => {
        if (!qrCode || !booking) {
            showAlert({
                type: ALERT_TYPES.ERROR,
                title: 'Error',
                message: 'Invalid QR code or booking data',
            });
            return;
        }

        try {
            // Determine action based on booking status
            const currentStatus = booking.status?.toLowerCase();
            const action = currentStatus === 'confirmed' ? 'checkin' : 'checkout';
            
            // Create proper payload structure that matches API expectation
            const payload = {
                qr_code: qrCode,
                action: action,
                booking_id: booking.id // Include booking ID if required by API
            };
            
            console.log('QR scan attempt:', { payload, currentStatus });
            
            const result = await scanQrCode(payload);
            
            if (result?.data?.success || result?.success) {
                const isCheckin = action === 'checkin';
                const responseData = result.data || result;
                const workerName = responseData?.worker_name || 'Worker';
                const totalHours = responseData?.total_hours || 'N/A';
                
                showAlert({
                    type: ALERT_TYPES.SUCCESS,
                    title: isCheckin ? 'Work Started!' : 'Work Completed!',
                    message: isCheckin 
                        ? `${workerName} has checked in successfully. Work is now in progress.`
                        : `${workerName} has checked out. Total hours worked: ${totalHours}`,
                });
                
                // Refresh the booking list by calling parent's refresh function
                if (onRefresh) {
                    await onRefresh();
                }
                
                // Also call onBookingUpdate if provided for additional handling
                if (onBookingUpdate) {
                    onBookingUpdate();
                }
            } else {
                const errorMessage = result?.data?.message || result?.message || 'QR scan failed';
                throw new Error(errorMessage);
            }

        } catch (error) {
            console.error('QR scan error:', error);
            
            // Extract error message from different possible error structures
            let errorMessage = 'Failed to process QR code. Please ensure the QR code is valid and try again.';
            
            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            console.log(errorMessage);
            
            showAlert({
                type: ALERT_TYPES.ERROR,
                title: 'QR Scan Failed',
                message: errorMessage,
            });
        }
    };

    // Get booking statistics with null safety
    const getBookingStats = () => {
        const stats = {
            total: 0,
            pending: 0,
            confirmed: 0,
            in_progress: 0,
            completed: 0,
            total_value: 0
        };

        if (!Array.isArray(bookings)) {
            return stats;
        }

        stats.total = bookings.length;

        bookings.forEach(booking => {
            if (!booking) return;
            
            const status = booking.status?.toLowerCase();
            if (status && stats.hasOwnProperty(status)) {
                stats[status] = stats[status] + 1;
            }
            
            const price = parseFloat(booking.total_price || 0);
            if (!isNaN(price)) {
                stats.total_value += price;
            }
        });

        return stats;
    };

    // Handle refresh with error handling
    const handleRefresh = async () => {
        try {
            if (onRefresh) {
                await onRefresh();
            }
        } catch (error) {
            console.error('Refresh error:', error);
            showAlert({
                type: ALERT_TYPES.ERROR,
                title: 'Refresh Failed',
                message: 'Unable to refresh bookings. Please try again.',
            });
        }
    };

    // Handle reset with error handling
    const handleReset = async () => {
        try {
            if (onReset) {
                await onReset();
            }
        } catch (error) {
            console.error('Reset error:', error);
            showAlert({
                type: ALERT_TYPES.ERROR,
                title: 'Reset Failed',
                message: 'Unable to reset filters. Please try again.',
            });
        }
    };

    // Loading State
    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Loading your bookings...</Text>
            </View>
        );
    }

    // Null safety checks
    const safeBookings = Array.isArray(bookings) ? bookings : [];
    const safeAllBookings = Array.isArray(allBookings) ? allBookings : [];

    // No Results State (filtered but no results)
    if (safeAllBookings.length > 0 && safeBookings.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <View style={styles.emptyIconContainer}>
                    <Icon name="filter-list-off" size={64} color="#E0E0E0" />
                </View>
                <Text style={styles.emptyTitle}>No bookings match your filters</Text>
                <Text style={styles.emptySubtitle}>
                    Try adjusting your category or time filters to see more bookings
                </Text>
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={handleReset}
                >
                    <Icon name="clear-all" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Clear Filters</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Empty State (no bookings at all)
    if (safeAllBookings.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <View style={styles.emptyIconContainer}>
                    <Icon name="work-outline" size={64} color="#E0E0E0" />
                </View>
                <Text style={styles.emptyTitle}>No bookings yet</Text>
                <Text style={styles.emptySubtitle}>
                    Your bookings will appear here once workers accept your job requests
                </Text>
            </View>
        );
    }

    // const stats = getBookingStats(); // Removed since it's not being used

    return (
        <ScrollView 
            style={styles.container} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
        >
            {/* Bookings List */}
            <View style={styles.bookingsSection}>
                {safeBookings.map((booking) => {
                    // Safety check for each booking
                    if (!booking || !booking.id) {
                        console.warn('Invalid booking data:', booking);
                        return null;
                    }

                    return (
                        <View key={booking.id} style={styles.bookingWrapper}>
                            <BookingCard 
                                booking={booking} 
                                onStatusUpdate={handleStatusUpdate}
                                onQrScan={handleQrScan}
                            />
                            
                            {/* Processing Overlay */}
                            {processingBookings.has(booking.id) && (
                                <View style={styles.processingOverlay}>
                                    <View style={styles.processingContent}>
                                        <ActivityIndicator size="small" color="#2196F3" />
                                        <Text style={styles.processingText}>Processing...</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    
    // Center Container for Empty/Loading States
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: '#F5F5F5',
    },
    emptyIconContainer: {
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2196F3',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    // Bookings Section
    bookingsSection: {
        flex: 1,
        paddingTop: 16,
    },
    bookingWrapper: {
        position: 'relative',
    },

    // Processing Overlay
    processingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        margin: 16,
    },
    processingContent: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        gap: 8,
    },
    processingText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },

    // Bottom Spacing
    bottomSpacing: {
        height: 20,
    },
});

export default BookingList;