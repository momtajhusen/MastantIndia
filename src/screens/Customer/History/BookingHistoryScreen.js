//import libraries
import React, { Component, useState, useEffect } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { rw, rh, rf } from '../../../constants/responsive';
import { useNavigation } from '@react-navigation/native';
import { getManufacturerBookings } from '../../../services/bookings';

// create a component
const BookingHistoryScreen = () => {
    const navigation = useNavigation();
    
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false); // Pull to refresh state
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
    const [categories, setCategories] = useState([]);
    const [timeFilters, setTimeFilters] = useState([]);

    // Generate categories from booking data
    const generateCategories = (bookingsData) => {
        const categorySet = new Set();
        bookingsData.forEach(booking => {
            // Handle different possible data structures
            const workers = booking.booking_workers || booking.workers || [];
            workers.forEach(worker => {
                const category = worker.category || worker.worker?.category;
                if (category && category.name) {
                    categorySet.add(category.name);
                }
            });
        });
        
        const dynamicCategories = [
            { id: 'all', name: 'All Services' },
            ...Array.from(categorySet).map(categoryName => ({
                id: categoryName.toLowerCase().replace(/\s+/g, '_'),
                name: categoryName
            }))
        ];
        
        setCategories(dynamicCategories);
    };

    // Generate time filters from booking dates
    const generateTimeFilters = (bookingsData) => {
        const today = new Date();
        const thisWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const last3Months = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        
        // Count bookings for each time filter
        const counts = {
            all: bookingsData.length,
            week: 0,
            month: 0,
            months3: 0
        };
        
        bookingsData.forEach(booking => {
            const bookingDate = new Date(booking.booking_date || booking.date || booking.created_at);
            
            // Last 7 days
            if (bookingDate >= thisWeek) {
                counts.week++;
            }
            
            // This month
            if (bookingDate >= thisMonth) {
                counts.month++;
            }
            
            // Last 3 months
            if (bookingDate >= last3Months) {
                counts.months3++;
            }
        });
        
        const dynamicTimeFilters = [
            { id: 'all', name: `All Time (${counts.all})` },
            { id: 'week', name: `Last 7 Days (${counts.week})` },
            { id: 'month', name: `This Month (${counts.month})` },
            { id: 'months3', name: `Last 3 Months (${counts.months3})` }
        ];
        
        setTimeFilters(dynamicTimeFilters);
    };

    // Filter bookings based on selected filters
    const filterBookings = () => {
        let filtered = [...bookings];
        
        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(booking => {
                const workers = booking.booking_workers || booking.workers || [];
                return workers.some(worker => {
                    const category = worker.category || worker.worker?.category;
                    return category && 
                           category.name.toLowerCase().replace(/\s+/g, '_') === selectedCategory;
                });
            });
        }
        
        // Time filter
        if (selectedTimeFilter !== 'all') {
            const today = new Date();
            const thisWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
            const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const last3Months = new Date(today.getFullYear(), today.getMonth() - 3, 1);
            
            filtered = filtered.filter(booking => {
                const bookingDate = new Date(booking.booking_date || booking.date || booking.created_at);
                
                switch (selectedTimeFilter) {
                    case 'week':
                        return bookingDate >= thisWeek;
                    case 'month':
                        return bookingDate >= thisMonth;
                    case 'months3':
                        return bookingDate >= last3Months;
                    default:
                        return true;
                }
            });
        }
        
        setFilteredBookings(filtered);
    };

    // Format date helper
    const formatDateTime = (dateString) => {
        if (!dateString) return 'Date not available';
        
        try {
            const date = new Date(dateString);
            const day = date.getDate().toString().padStart(2, '0');
            const month = date.toLocaleDateString('en', { month: 'short' });
            const year = date.getFullYear();
            const time = date.toLocaleTimeString('en', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
            return `${day} ${month} ${year}, ${time}`;
        } catch (error) {
            return 'Invalid date';
        }
    };

    // Format duration helper
    const formatDuration = (durationType, durationValue) => {
        if (!durationType || !durationValue) return 'Duration not specified';
        return `${durationValue} ${durationType}${durationValue !== 1 ? 's' : ''}`;
    };

    // Get status color
    const getStatusColor = (status) => {
        if (!status) return '#8E8E93';
        
        switch (status.toLowerCase()) {
            case 'completed':
                return '#34C759';
            case 'cancelled':
                return '#FF3B30';
            case 'in_progress':
                return '#FF9500';
            case 'confirmed':
                return '#007AFF';
            default:
                return '#8E8E93';
        }
    };

    // Load bookings data
    const loadBookingsData = async (isRefreshing = false) => {
        if (isRefreshing) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        
        try {
            const response = await getManufacturerBookings();
            console.log('API Response:', response);
            
            // Handle different response structures
            let bookingsData = [];
            
            if (response.data && response.data.bookings) {
                // If response has nested structure
                bookingsData = response.data.bookings.data || response.data.bookings;
            } else if (response.data && Array.isArray(response.data)) {
                // If response.data is directly an array
                bookingsData = response.data;
            } else if (Array.isArray(response)) {
                // If response is directly an array
                bookingsData = response;
            }
            
            console.log('Processed bookings data:', bookingsData);
            
            // For testing - show all bookings, later you can filter by status
            // Remove this filter or modify based on your requirements
            const historyBookings = bookingsData.filter(booking => {
                const status = booking.status || booking.booking_status;
                // Show all bookings for now (you can modify this later)
                return status && ['completed', 'cancelled', 'in_progress', 'confirmed'].includes(status.toLowerCase());
                // Original filter for only completed/cancelled:
                // return status && ['completed', 'cancelled'].includes(status.toLowerCase());
            });
            
            console.log('History bookings:', historyBookings);
            
            setBookings(historyBookings);
            setFilteredBookings(historyBookings);
            generateCategories(historyBookings);
            generateTimeFilters(historyBookings);
            
        } catch (error) {
            console.error('Error loading bookings:', error);
            // Handle empty state on error
            setBookings([]);
            setFilteredBookings([]);
            setCategories([]);
            setTimeFilters([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Pull to refresh handler
    const onRefresh = () => {
        loadBookingsData(true);
    };

    // Load data on component mount
    useEffect(() => {
        loadBookingsData();
    }, []);

    // Filter bookings when filters change
    useEffect(() => {
        filterBookings();
    }, [selectedCategory, selectedTimeFilter, bookings]);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>History</Text>
            </View>

            <ScrollView 
                style={styles.contentContainer} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#000']} // Android
                        tintColor={'#000'} // iOS
                    />
                }
            >
                {/* Category Filter */}
                {categories.length > 1 && (
                    <View style={styles.categoryContainer}>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false} 
                            contentContainerStyle={styles.categoryContentContainer}
                        >
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

                {/* Time Filter */}
                {timeFilters.length > 1 && (
                    <View style={styles.timeFilterContainer}>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false} 
                            contentContainerStyle={styles.timeFilterContentContainer}
                        >
                            {timeFilters.map((filter) => (
                                <TouchableOpacity
                                    key={filter.id}
                                    style={[
                                        styles.timeFilterItem,
                                        selectedTimeFilter === filter.id && styles.selectedTimeFilter
                                    ]}
                                    onPress={() => setSelectedTimeFilter(filter.id)}
                                >
                                    <Text style={[
                                        styles.timeFilterText,
                                        selectedTimeFilter === filter.id && styles.selectedTimeFilterText
                                    ]}>
                                        {filter.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Loading State */}
                {loading && (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading history...</Text>
                    </View>
                )}

                {/* History Items */}
                {!loading && filteredBookings.length > 0 && filteredBookings.map((booking) => {
                    const workers = booking.booking_workers || booking.workers || [];
                    const workDescription = booking.work_description || booking.description || 'Service booking';
                    const workLocation = booking.work_location || booking.location || 'Location not specified';
                    const totalPrice = booking.total_price || booking.price || booking.amount || 0;
                    const status = booking.status || booking.booking_status || 'unknown';
                    const bookingDate = booking.booking_date || booking.date || booking.created_at;
                    const durationType = booking.duration_type || 'hour';
                    const durationValue = booking.duration_value || booking.duration || 1;

                    return (
                        <TouchableOpacity 
                            key={booking.id} 
                            style={styles.historyItem} 
                            onPress={() => navigation.navigate('BookingDetailsScreen', { bookingId: booking.id })}
                        >
                            <View style={styles.profileImagesContainer}>
                                {workers.slice(0, 3).map((worker, index) => {
                                    const profileImage = worker.worker?.profile_image || worker.profile_image;
                                    return (
                                        <Image
                                            key={worker.id || index}
                                            source={
                                                profileImage 
                                                ? { uri: profileImage }
                                                : require('../../../assets/images/user.png')
                                            }
                                            style={[
                                                styles.userImages,
                                                index > 0 && { marginLeft: -10 }
                                            ]}
                                        />
                                    );
                                })}
                                {workers.length > 3 && (
                                    <View style={[styles.userImages, styles.moreWorkersIndicator, { marginLeft: -10 }]}>
                                        <Text style={styles.moreWorkersText}>
                                            +{workers.length - 3}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            
                            <View style={styles.historyDetails}>
                                <View style={styles.historyHeader}>
                                    <Text style={styles.workDescription} numberOfLines={1}>
                                        {workDescription}
                                    </Text>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
                                        <Text style={styles.statusText}>{status}</Text>
                                    </View>
                                </View>
                                
                                <Text style={styles.durationText}>
                                    Duration: {formatDuration(durationType, durationValue)}
                                </Text>
                                
                                <Text style={styles.locationText} numberOfLines={1}>
                                    {workLocation}
                                </Text>
                                
                                <Text style={styles.dateTimeText}>
                                    {formatDateTime(bookingDate)}
                                </Text>
                                
                                <View style={styles.priceContainer}>
                                    <Text style={styles.priceText}>
                                        ₹{parseFloat(totalPrice || 0).toLocaleString()}
                                    </Text>
                                    <Text style={styles.workersCountText}>
                                        {workers.length} worker{workers.length !== 1 ? 's' : ''}
                                    </Text>
                                </View>
                            </View>
                            
                            <Icon name="chevron-right" size={24} color="#ccc" />
                        </TouchableOpacity>
                    );
                })}

                {/* Empty State */}
                {!loading && filteredBookings.length === 0 && bookings.length > 0 && (
                    <View style={styles.emptyContainer}>
                        <Icon name="filter-list-off" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No bookings found</Text>
                        <Text style={styles.emptySubtext}>
                            Try adjusting your filters to see more results
                        </Text>
                    </View>
                )}

                {/* No History State */}
                {!loading && bookings.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <Icon name="history" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No bookings available</Text>
                        <Text style={styles.emptySubtext}>
                            Your booking history will appear here
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEFEFE',
    },
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 25,
        fontWeight: '500',
        color: '#000',
        marginTop: 10,
    },
    contentContainer: {
        flex: 1,
    },
    categoryContainer: {
        marginTop: 15,
    },
    categoryContentContainer: {
        paddingHorizontal: 20,
    },
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
    selectedCategory: {
        backgroundColor: '#000',
    },
    categoryText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    selectedCategoryText: {
        color: '#fff',
    },
    timeFilterContainer: {
        paddingVertical: 15,
    },
    timeFilterContentContainer: {
        paddingHorizontal: 20,
    },
    timeFilterItem: {
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
    },
    selectedTimeFilter: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    timeFilterText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    selectedTimeFilterText: {
        color: '#fff',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    historyItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginHorizontal: 15,
        marginBottom: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    profileImagesContainer: {
        flexDirection: 'row',
        marginRight: 15,
        alignItems: 'center',
    },
    historyDetails: {
        flex: 1,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    workDescription: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        flex: 1,
        marginRight: 10,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#fff',
        textTransform: 'capitalize',
    },
    durationText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    locationText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    dateTimeText: {
        fontSize: 13,
        color: '#999',
        marginBottom: 6,
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    workersCountText: {
        fontSize: 12,
        color: '#666',
    },
    userImages: {
        width: rw(12),
        height: rw(12),
        borderRadius: rw(6),
        borderWidth: 2,
        borderColor: '#fff',
    },
    moreWorkersIndicator: {
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    moreWorkersText: {
        fontSize: 10,
        color: '#666',
        fontWeight: '600',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
});

//make this component available to the app
export default BookingHistoryScreen;