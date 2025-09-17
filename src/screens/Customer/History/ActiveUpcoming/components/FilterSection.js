import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions
} from 'react-native';

const rh = (percentage) => {
    const { height } = Dimensions.get('window');
    return (percentage / 100) * height;
};

const FilterSection = ({
    categories = [],
    timeFilters = [],
    selectedCategory,
    selectedTimeFilter,
    onCategorySelect,
    onTimeFilterSelect,
    filteredCount,
    onReset,
    bookings = [] // Add bookings prop to generate dynamic time filters
}) => {
    const hasActiveFilters = selectedCategory !== 'all' || selectedTimeFilter !== 'all';

    // Ensure we have valid arrays
    const validCategories = Array.isArray(categories) ? categories : [];
    
    // Generate dynamic time filters based on bookings data
    const generateTimeFilters = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (!bookings || bookings.length === 0) {
            return [{ id: 'all', name: 'All Time' }];
        }

        // Check what timeline periods have bookings
        const hasToday = bookings.some(booking => {
            const bookingDate = new Date(booking.booking_date);
            const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
            return bookingDay.getTime() === today.getTime();
        });

        const hasThisWeek = bookings.some(booking => {
            const bookingDate = new Date(booking.booking_date);
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
            
            return bookingDate >= weekStart && bookingDate <= weekEnd;
        });

        const hasThisMonth = bookings.some(booking => {
            const bookingDate = new Date(booking.booking_date);
            return bookingDate.getFullYear() === now.getFullYear() && 
                   bookingDate.getMonth() === now.getMonth();
        });

        const hasThisYear = bookings.some(booking => {
            const bookingDate = new Date(booking.booking_date);
            return bookingDate.getFullYear() === now.getFullYear();
        });

        // Build timeline-based filters array based on available data
        const filtersArray = [
            { id: 'all', name: 'All Time' }
        ];

        if (hasToday) {
            filtersArray.push({ id: 'today', name: 'Today' });
        }

        if (hasThisWeek) {
            filtersArray.push({ id: 'this_week', name: 'This Week' });
        }

        if (hasThisMonth) {
            filtersArray.push({ id: 'this_month', name: 'This Month' });
        }

        if (hasThisYear) {
            filtersArray.push({ id: 'this_year', name: 'This Year' });
        }

        return filtersArray;
    };

    // Use dynamic time filters if bookings are provided, otherwise use passed timeFilters
    const validTimeFilters = bookings.length > 0 ? generateTimeFilters() : (Array.isArray(timeFilters) ? timeFilters : []);

    return (
        <View style={styles.container}>
            {/* Filter Results Header */}
            {/* {hasActiveFilters && (
                <View style={styles.filterHeader}>
                    <Text style={styles.filterResultsText}>
                        {filteredCount} result{filteredCount !== 1 ? 's' : ''} found
                    </Text>
                    <TouchableOpacity 
                        style={styles.resetButton}
                        onPress={onReset}
                    >
                        <Text style={styles.resetButtonText}>Reset</Text>
                    </TouchableOpacity>
                </View>
            )} */}

            {/* Category Filter */}
            {validCategories.length > 1 && (
                <View style={styles.categoryContainer}>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoryContent}
                    >
                        {validCategories.map((category) => {
                            // Handle both object and string formats
                            const categoryId = typeof category === 'object' ? category.id : category;
                            const categoryName = typeof category === 'object' ? category.name : category;
                            
                            return (
                                <TouchableOpacity
                                    key={categoryId}
                                    style={[
                                        styles.categoryItem,
                                        selectedCategory === categoryId && styles.selectedCategory
                                    ]}
                                    onPress={() => onCategorySelect(categoryId)}
                                >
                                    <Text style={[
                                        styles.categoryText,
                                        selectedCategory === categoryId && styles.selectedCategoryText
                                    ]}>
                                        {categoryName}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            )}

            {/* Time Filter */}
            {validTimeFilters.length > 1 && (
                <View style={styles.timeFilterContainer}>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.timeFilterContent}
                    >
                        {validTimeFilters.map((filter) => {
                            // Handle both object and string formats
                            const filterId = typeof filter === 'object' ? filter.id : filter;
                            const filterName = typeof filter === 'object' ? filter.name : filter;
                            
                            return (
                                <TouchableOpacity
                                    key={filterId}
                                    style={[
                                        styles.timeFilterItem,
                                        selectedTimeFilter === filterId && styles.selectedTimeFilter
                                    ]}
                                    onPress={() => onTimeFilterSelect(filterId)}
                                >
                                    <Text style={[
                                        styles.timeFilterText,
                                        selectedTimeFilter === filterId && styles.selectedTimeFilterText
                                    ]}>
                                        {filterName}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F8F9FA',
    },

    // Filter Header
    filterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 10,
    },
    filterResultsText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    resetButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#FF3B30',
        borderRadius: 15,
    },
    resetButtonText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
    },

    // Category Filter
    categoryContainer: {
        marginTop: 15,
    },
    categoryContent: {
        paddingHorizontal: 20,
    },
    categoryItem: {
        backgroundColor: '#FFFFFF',
        height: rh(5),
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderRadius: 25,
        marginRight: 10,
        minWidth: 100,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    selectedCategory: {
        backgroundColor: '#000000',
        borderColor: '#000000',
    },
    categoryText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    selectedCategoryText: {
        color: '#FFFFFF',
    },

    // Time Filter
    timeFilterContainer: {
        paddingVertical: 15,
    },
    timeFilterContent: {
        paddingHorizontal: 20,
    },
    timeFilterItem: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
    },
    selectedTimeFilter: {
        backgroundColor: '#000000',
        borderColor: '#000000',
    },
    timeFilterText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    selectedTimeFilterText: {
        color: '#FFFFFF',
    },
});

export default FilterSection;