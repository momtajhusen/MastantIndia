import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import FilterSection from './components/FilterSection';
import BookingList from './components/BookingList';
import { getManufacturerBookings } from '../../../../services/bookings';

const UpcomingScreen = () => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
    const [categories, setCategories] = useState([]);
    const [timeFilters, setTimeFilters] = useState([]);

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

    // Generate time filters based on booking dates and statuses
    const generateTimeFilters = (bookings) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Check what types of bookings we have
        const hasUpcoming = bookings.some(booking => {
            const bookingDate = new Date(booking.booking_date);
            return bookingDate > today;
        });

        const hasPast = bookings.some(booking => {
            const bookingDate = new Date(booking.booking_date);
            return bookingDate < today;
        });

        const hasInProgress = bookings.some(booking => 
            ['in_progress', 'active', 'confirmed'].includes(booking.status?.toLowerCase())
        );

        const hasToday = bookings.some(booking => {
            const bookingDate = new Date(booking.booking_date);
            return bookingDate.toDateString() === today.toDateString();
        });

        const hasThisWeek = bookings.some(booking => {
            const bookingDate = new Date(booking.booking_date);
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return bookingDate >= weekStart && bookingDate <= weekEnd;
        });

        // Build filters array based on available data
        const filtersArray = [
            { id: 'all', name: 'All Time' }
        ];

        if (hasToday) {
            filtersArray.push({ id: 'today', name: 'Today' });
        }

        if (hasThisWeek) {
            filtersArray.push({ id: 'this_week', name: 'This Week' });
        }

        if (hasUpcoming) {
            filtersArray.push({ id: 'upcoming', name: 'Upcoming' });
        }

        if (hasInProgress) {
            filtersArray.push({ id: 'in_progress', name: 'In Progress' });
        }

        if (hasPast) {
            filtersArray.push({ id: 'past', name: 'Past' });
        }

        return filtersArray;
    };

    // Filter bookings based on selected filters
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

            // Time filter
            let timeMatch = true;

            if (selectedTimeFilter !== 'all') {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const bookingDate = new Date(booking.booking_date);

                switch (selectedTimeFilter) {
                    case 'today':
                        timeMatch = bookingDate.toDateString() === today.toDateString();
                        break;
                    
                    case 'this_week':
                        const weekStart = new Date(today);
                        weekStart.setDate(today.getDate() - today.getDay());
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekStart.getDate() + 6);
                        timeMatch = bookingDate >= weekStart && bookingDate <= weekEnd;
                        break;
                    
                    case 'this_month':
                        timeMatch = bookingDate.getFullYear() === now.getFullYear() && 
                                   bookingDate.getMonth() === now.getMonth();
                        break;
                    
                    default:
                        timeMatch = true;
                }
            }

            return categoryMatch && timeMatch;
        });

        setFilteredBookings(filtered);
    };

    const resetFilters = () => {
        setSelectedCategory('all');
        setSelectedTimeFilter('all');
    };

    // Load bookings from API - This will be called after successful updates
const loadBookings = async () => {
  setLoading(true);
  try {
    console.log('Loading bookings from API...');
    const response = await getManufacturerBookings();

    if (response.data?.success && response.data?.bookings?.data) {
      // filter confirmed bookings here
      const allBookings = response.data.bookings.data;
      const confirmedBookings = allBookings.filter(
        (booking) => booking.status?.toLowerCase() === 'confirmed'
      );

      console.log(
        'Confirmed bookings loaded successfully:',
        confirmedBookings.length,
        'bookings'
      );

      // set state with only confirmed bookings
      setBookings(confirmedBookings);
      setFilteredBookings(confirmedBookings);

      // Generate filters from actual API data
      const generatedCategories = generateCategories(confirmedBookings);
      const generatedTimeFilters = generateTimeFilters(confirmedBookings);

      setCategories(generatedCategories);
      setTimeFilters(generatedTimeFilters);

      // Don't reset filters on refresh unless it's initial load
      if (bookings.length === 0) {
        resetFilters();
      }
    } else {
      console.error('Invalid API response structure:', response);
      setBookings([]);
      setFilteredBookings([]);
      setCategories([{ id: 'all', name: 'All' }]);
      setTimeFilters([{ id: 'all', name: 'All Time' }]);
    }
  } catch (error) {
    console.error('Error loading bookings:', error);
    setBookings([]);
    setFilteredBookings([]);
    setCategories([{ id: 'all', name: 'All' }]);
    setTimeFilters([{ id: 'all', name: 'All Time' }]);
  } finally {
    setLoading(false);
  }
};


    // Handle refresh - This will be called after successful booking updates
    const handleRefresh = async () => {
        console.log('Refreshing bookings...');
        setRefreshing(true);
        await loadBookings();
        setRefreshing(false);
    };

    // Handle booking update callback - called after successful status updates or QR scans
    const handleBookingUpdate = () => {
        console.log('Booking updated, triggering refresh...');
        // This will be called from BookingList after successful operations
        // The actual refresh is handled by calling handleRefresh from the BookingList
    };

    // Load bookings on component mount
    useEffect(() => {
        loadBookings();
    }, []);

    // Filter bookings when filters change
    useEffect(() => {
        filterBookings();
    }, [selectedCategory, selectedTimeFilter, bookings]);

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
                {/* Filter Section */}
                <FilterSection
                    categories={categories}
                    timeFilters={timeFilters}
                    bookings={bookings}
                    selectedCategory={selectedCategory}
                    selectedTimeFilter={selectedTimeFilter}
                    onCategorySelect={setSelectedCategory}
                    onTimeFilterSelect={setSelectedTimeFilter}
                    filteredCount={filteredBookings.length}
                    onReset={resetFilters}
                />

                {/* Booking List */}
                <BookingList
                    bookings={filteredBookings}
                    allBookings={bookings}
                    loading={loading}
                    onRefresh={handleRefresh} // Pass handleRefresh which calls getManufacturerBookings
                    onReset={resetFilters}
                    onBookingUpdate={handleBookingUpdate}
                />

                <View style={styles.bottomPadding} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    contentContainer: {
        flex: 1,
    },
    bottomPadding: {
        height: 50,
    },
});

export default UpcomingScreen;