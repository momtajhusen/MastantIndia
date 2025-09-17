import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Animated,
    Easing,
    Linking,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import QRScannerModal from './QRScannerModal';
import { useAlert, ALERT_TYPES } from '../../../../../components/AlertProvider';

const BookingCard = ({ booking, onStatusUpdate, onQrScan }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isQrModalVisible, setIsQrModalVisible] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [waveAnim] = useState(new Animated.Value(0));
    const { showAlert } = useAlert();

    // Helper functions
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
            day: date.getDate(),
            month: date.toLocaleDateString('en', { month: 'short' }),
            year: date.getFullYear(),
            formatted: date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        };
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDaysUntilBooking = (bookingDate) => {
        const today = new Date();
        const booking = new Date(bookingDate);
        const diffTime = booking - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        return `In ${diffDays} days`;
    };

    const getStatusInfo = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return { color: '#666666', label: 'PENDING' };
            case 'confirmed':
                return { color: '#000000', label: 'CONFIRMED' };
            case 'in_progress':
                return { color: '#000000', label: 'WORKING' };
            case 'completed':
                return { color: '#333333', label: 'COMPLETED' };
            case 'cancelled':
                return { color: '#999999', label: 'CANCELLED' };
            default:
                return { color: '#666666', label: 'UNKNOWN' };
        }
    };

    // Handle call worker
    const handleCallWorker = (workerMobile, workerName) => {
        if (!workerMobile) {
            Alert.alert('Error', 'No contact number available for this worker');
            return;
        }

        Alert.alert(
            'Call Worker',
            `Call ${workerName || 'Worker'}?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Call',
                    onPress: () => {
                        const phoneNumber = `tel:${workerMobile}`;
                        Linking.canOpenURL(phoneNumber)
                            .then(supported => {
                                if (supported) {
                                    return Linking.openURL(phoneNumber);
                                } else {
                                    Alert.alert('Error', 'Phone call is not supported on this device');
                                }
                            })
                            .catch(err => {
                                console.error('Error opening phone dialer:', err);
                                Alert.alert('Error', 'Failed to open phone dialer');
                            });
                    },
                },
            ],
            { cancelable: true }
        );
    };

    // Check if status should show WORKING and animate
    const isWorkingStatus = () => {
        return booking.status?.toLowerCase() === 'in_progress';
    };

    // Start wave animation for working status
    React.useEffect(() => {
        if (isWorkingStatus()) {
            const wave = Animated.loop(
                Animated.sequence([
                    Animated.timing(waveAnim, {
                        toValue: 1,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(waveAnim, {
                        toValue: 0,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            );
            wave.start();
            return () => wave.stop();
        }
    }, [booking.status, waveAnim]);

    // Get primary action based on status
    const getPrimaryAction = () => {
        const status = booking.status?.toLowerCase();
        
        switch (status) {
            case 'pending':
                return {
                    label: 'Confirm Booking',
                    action: 'confirm',
                    color: '#000000',
                    icon: 'check-circle'
                };
            case 'confirmed':
                return {
                    label: 'Start Work (Scan QR)',
                    action: 'qr_scan',
                    color: '#333333',
                    icon: 'qr-code-scanner'
                };
            case 'in_progress':
                return {
                    label: 'End Work (Scan QR)',
                    action: 'qr_scan',
                    color: '#666666',
                    icon: 'qr-code-scanner'
                };
            default:
                return null;
        }
    };

    // Handle action
    const handleAction = async (actionType) => {
        setIsUpdating(true);
        
        try {
            switch (actionType) {
                case 'confirm':
                    showAlert({
                        type: ALERT_TYPES.CONFIRM,
                        title: 'Confirm Booking',
                        message: 'Proceed to confirm this booking?',
                        dismissible: false,
                        actions: [
                            {
                                text: 'Cancel',
                                style: 'default',
                            },
                            {
                                text: 'Confirm',
                                style: 'primary',
                                onPress: async () => {
                                    await onStatusUpdate?.(booking.id, 'confirmed');
                                }
                            }
                        ]
                    });
                    break;
                
                case 'qr_scan':
                    setIsQrModalVisible(true);
                    break;
                
                case 'complete':
                    showAlert({
                        type: ALERT_TYPES.CONFIRM,
                        title: 'Mark Complete',
                        message: 'Mark this booking as completed?',
                        dismissible: false,
                        actions: [
                            {
                                text: 'Not Yet',
                                style: 'default',
                            },
                            {
                                text: 'Complete',
                                style: 'primary',
                                onPress: async () => {
                                    await onStatusUpdate?.(booking.id, 'completed');
                                }
                            }
                        ]
                    });
                    break;
                
                case 'cancel':
                    showAlert({
                        type: ALERT_TYPES.CONFIRM,
                        title: 'Cancel Booking',
                        message: 'Are you sure? This action cannot be undone.',
                        dismissible: false,
                        actions: [
                            {
                                text: 'Keep Booking',
                                style: 'default',
                            },
                            {
                                text: 'Cancel Booking',
                                style: 'danger',
                                onPress: async () => {
                                    await onStatusUpdate?.(booking.id, 'cancelled');
                                }
                            }
                        ]
                    });
                    break;
            }
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle QR scan - this will be called from QRScannerModal
    const handleQrScan = (qrData) => {
        setIsQrModalVisible(false);
        onQrScan?.(qrData, booking);
    };

    const date = formatDate(booking.booking_date);
    const statusInfo = getStatusInfo(booking.status);
    const primaryAction = getPrimaryAction();
    const canCancel = ['pending', 'confirmed'].includes(booking.status?.toLowerCase());
    const isOverdue = new Date(booking.booking_date) < new Date() && !['completed', 'cancelled'].includes(booking.status?.toLowerCase());

    return (
        <View style={[styles.container, isOverdue && styles.overdueCard]}>
            {/* Card Header */}
            <TouchableOpacity 
                style={styles.cardHeader}
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.7}
            >
                <View style={styles.headerMain}>
                    <View style={styles.headerLeft}>
                        <View style={styles.headerInfo}>
                            <Text style={styles.workTitle} numberOfLines={1}>
                                {booking.work_description}
                            </Text>
                            <Text style={styles.categoryText}>
                                {booking.booking_workers?.[0]?.category?.name || 'Service'}
                            </Text>
                            <View style={styles.quickInfo}>
                                <Text style={styles.locationQuick} numberOfLines={1}>
                                    📍 {booking.work_location.split(',')[0]}
                                </Text>
                                <Text style={[
                                    styles.dateQuick, 
                                    isOverdue && styles.overdueText
                                ]}>
                                    📅 {getDaysUntilBooking(booking.booking_date)}
                                </Text>
                            </View>
                        </View>
                    </View>
                    
                    <View style={styles.headerRight}>
                        <Text style={styles.priceTextHeader}>
                            ₹{parseFloat(booking.total_price || 0).toLocaleString('en-IN')}
                        </Text>
                        
                        {/* Status with Animation */}
                        <View style={styles.statusContainer}>
                            <View style={styles.statusRow}>
                                <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                                    <Text style={styles.statusText}>{statusInfo.label}</Text>
                                    {isWorkingStatus() && (
                                        <Animated.View style={[
                                            styles.waveAnimation,
                                            {
                                                opacity: waveAnim,
                                                transform: [{
                                                    scaleX: waveAnim.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: [0.8, 1.2],
                                                    }),
                                                }],
                                            },
                                        ]}>
                                            <Text style={styles.waveText}>~~~</Text>
                                        </Animated.View>
                                    )}
                                </View>
                            </View>
                        </View>
                        
                        <Text style={styles.expandIcon}>
                            {isExpanded ? '▼' : '▶'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Expanded Details */}
            {isExpanded && (
                <View style={styles.expandedContent}>
                    {/* Basic Work Info */}
                    <View style={styles.detailBlock}>
                        <View style={styles.workSummary}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Date & Time:</Text>
                                <Text style={[styles.detailValue, isOverdue && styles.overdueText]}>
                                    {date.formatted}
                                    {booking.preferred_start_time && ` at ${formatTime(booking.preferred_start_time)}`}
                                </Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Duration:</Text>
                                <Text style={styles.detailValue}>
                                    {booking.duration_value} {booking.duration_type}
                                    {booking.duration_value > 1 ? 's' : ''}
                                </Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Location:</Text>
                                <Text style={styles.detailValue}>{booking.work_location}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Workers:</Text>
                                <Text style={styles.detailValue}>
                                    {booking.booking_workers?.length || 0} assigned
                                </Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Total Price:</Text>
                                <Text style={styles.detailValue}>
                                    ₹{parseFloat(booking.total_price || 0).toLocaleString('en-IN')}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.expandedActions}>
                        {primaryAction && (
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: primaryAction.color }]}
                                onPress={() => handleAction(primaryAction.action)}
                                disabled={isUpdating}
                            >
                                <Text style={styles.actionButtonText}>
                                    {primaryAction.label}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {booking.status?.toLowerCase() === 'in_progress' && (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.completeButton]}
                                onPress={() => handleAction('complete')}
                                disabled={isUpdating}
                            >
                                <Text style={styles.actionButtonText}>Mark Complete</Text>
                            </TouchableOpacity>
                        )}

                        {canCancel && (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.cancelButton]}
                                onPress={() => handleAction('cancel')}
                                disabled={isUpdating}
                            >
                                <Text style={styles.actionButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Workers List */}
                    {booking.booking_workers && booking.booking_workers.length > 0 && (
                        <View style={styles.workersSection}>
                            <Text style={styles.sectionTitle}>Assigned Workers</Text>
                            {booking.booking_workers.map((bookingWorker, index) => (
                                <View key={bookingWorker.id} style={styles.workerCard}>
                                    <Image 
                                        source={
                                            bookingWorker.worker?.profile_image 
                                            ? { uri: bookingWorker.worker.profile_image } 
                                            : require('../../../../../assets/images/boy-user.png')
                                        } 
                                        style={styles.workerImage} 
                                    />
                                    <View style={styles.workerInfo}>
                                        <Text style={styles.workerName}>
                                            {bookingWorker.worker?.name || `Worker ${index + 1}`}
                                        </Text>
                                        <Text style={styles.workerDetail}>
                                            {bookingWorker.worker?.mobile || 'No contact'}
                                        </Text>
                                        <Text style={styles.workerDetail}>
                                            {bookingWorker.assigned_hours}h • ₹{parseFloat(bookingWorker.worker_price || 0).toFixed(0)}
                                        </Text>
                                    </View>
                                    <TouchableOpacity 
                                        style={styles.callButton}
                                        onPress={() => handleCallWorker(
                                            bookingWorker.worker?.mobile, 
                                            bookingWorker.worker?.name
                                        )}
                                        activeOpacity={0.7}
                                    >
                                        <Icon name="call" size={20} color="#000000" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Additional Info */}
                    {booking.special_instructions && (
                        <View style={styles.infoSection}>
                            <Text style={styles.sectionTitle}>Special Instructions</Text>
                            <Text style={styles.instructionText}>
                                {booking.special_instructions}
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* QR Scanner Modal */}
            <QRScannerModal
                visible={isQrModalVisible}
                onClose={() => setIsQrModalVisible(false)}
                onQrScanned={handleQrScan}
                booking={booking}
                title={booking.status?.toLowerCase() === 'confirmed' 
                    ? 'Scan QR to Start Work' 
                    : 'Scan QR to End Work'
                }
            />

            {/* Loading Overlay */}
            {isUpdating && (
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingContent}>
                        <Text style={styles.loadingText}>Updating...</Text>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 12,
        marginHorizontal: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        position: 'relative',
    },
    overdueCard: {
        borderWidth: 2,
        borderColor: '#000000',
    },
    cardHeader: {
        padding: 16,
        backgroundColor: '#ffffff',
    },
    headerMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
    },
    workTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 2,
    },
    categoryText: {
        fontSize: 12,
        color: '#666666',
        marginBottom: 6,
    },
    quickInfo: {
        gap: 4,
    },
    locationQuick: {
        fontSize: 11,
        color: '#888888',
    },
    dateQuick: {
        fontSize: 11,
        color: '#888888',
    },
    overdueText: {
        color: '#000000',
        fontWeight: 'bold',
    },
    headerRight: {
        alignItems: 'flex-end',
        gap: 8,
    },
    priceTextHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
    },
    statusContainer: {
        position: 'relative',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 4,
    },
    statusText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    waveAnimation: {
        position: 'absolute',
        right: -16,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    waveText: {
        color: 'white',
        fontSize: 8,
        fontWeight: 'bold',
    },
    expandIcon: {
        fontSize: 12,
        color: '#666666',
    },
    expandedContent: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: '#fafafa',
    },
    detailBlock: {
        marginBottom: 16,
    },
    workSummary: {
        backgroundColor: '#ffffff',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-start',
    },
    detailLabel: {
        fontSize: 12,
        color: '#666666',
        fontWeight: '600',
        minWidth: 80,
    },
    detailValue: {
        fontSize: 12,
        color: '#000000',
        flex: 1,
    },
    expandedActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 12,
        marginBottom: 16,
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: '30%',
        alignItems: 'center',
    },
    completeButton: {
        backgroundColor: '#000000',
    },
    cancelButton: {
        backgroundColor: '#666666',
    },
    viewDetailsButton: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: '30%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    viewDetailsButtonText: {
        color: '#000000',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },

    // Workers Section
    workersSection: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 12,
    },
    workerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    workerImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#f5f5f5',
    },
    workerInfo: {
        flex: 1,
    },
    workerName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000000',
    },
    workerDetail: {
        fontSize: 12,
        color: '#666666',
        marginTop: 2,
    },
    callButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },

    // Info Section
    infoSection: {
        marginBottom: 16,
    },
    instructionText: {
        fontSize: 14,
        color: '#666666',
        backgroundColor: '#ffffff',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#000000',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },

    // Loading Overlay
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    loadingContent: {
        padding: 16,
    },
    loadingText: {
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
    },
});

export default BookingCard;