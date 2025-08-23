//import libraries
import React, { Component, useState } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { rw, rh, rf } from '../../../constants/responsive';

// create a component
const BookingHistoryScreen = () => {
    const [selectedCategory, setSelectedCategory] = useState('Embroidery');
    const [selectedTimeFilter, setSelectedTimeFilter] = useState('instant');

    const categories = [
        { id: 'embroidery', name: 'Embroidery', date: '28 Jan 2024' },
        { id: 'tailor', name: 'Tailor' },
        { id: 'pattern', name: 'Pattern Maker' },
        { id: 'khaka', name: 'khaka Maker' }
    ];

    const timeFilters = [
        { id: 'instant', name: 'instant' },
        { id: 'custom', name: 'custom days' },
        { id: '15days', name: '15 days' },
        { id: '1month', name: '1 month' }
    ];

    const historyItems = [
        {
            id: 1,
            image: require('../../../assets/images/profile.png'), // You'll need to add these images
            status: 'cancelled/completed',
            duration: 'duration -',
            dateTime: 'date n time -'
        },
        {
            id: 2,
            image: require('../../../assets/images/profile.png'),
            status: 'cancelled/completed',
            duration: 'duration -',
            dateTime: 'date n time -'
        },
        {
            id: 3,
            image: require('../../../assets/images/profile.png'),
            status: 'cancelled/completed',
            duration: 'duration -',
            dateTime: 'date n time -'
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>History</Text>
            </View>

            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                {/* Category Filter */}
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
                                    selectedCategory === category.name && styles.selectedCategory
                                ]}
                                onPress={() => setSelectedCategory(category.name)}
                            >
                                <Text style={[
                                    styles.categoryText,
                                    selectedCategory === category.name && styles.selectedCategoryText
                                ]}>
                                    {category.name}
                                </Text>
                                {category.date && selectedCategory === category.name && (
                                    <Text style={styles.categoryDate}>{category.date}</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Time Filter */}
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

                {/* History Items */}
                    {historyItems.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.historyItem}>
                            <Image
                                source={require('../../../assets/images/user.png')}
                                style={styles.userImages}
                            />
                            <View style={styles.historyDetails}>
                                <Text style={styles.statusText}>{item.status}</Text>
                                <Text style={styles.durationText}>{item.duration}</Text>
                                <Text style={styles.dateTimeText}>{item.dateTime}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
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
        fontWeight: '500s',
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
        height:rh(5),
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderRadius: 15,
        marginRight: 10,
        minWidth: 100,
        alignItems: 'center',
        justifyContent:'center'
    },
    selectedCategory: {
        backgroundColor: '#e8e8e8',
    },
    categoryText: {
        fontSize: 13,
        color: '#666',
    },
    selectedCategoryText: {
        color: '#000',
    },
    categoryDate: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
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
    },
    selectedTimeFilterText: {
        color: '#fff',
    },
    historyItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 5,
        alignItems: 'center',
        borderBottomWidth:1,
        borderColor:'#D9D9D9'
    },
    profileImageContainer: {
        marginRight: 15,
    },
    historyDetails: {
        flex: 1,
    },
    statusText: {
        fontSize: 16,
        // fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    durationText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    dateTimeText: {
        fontSize: 14,
        color: '#666',
    },
    userImages:{
        width:rw(20),
        height:rw(20),
        marginRight:rw(2)
    }
});

//make this component available to the app
export default BookingHistoryScreen;