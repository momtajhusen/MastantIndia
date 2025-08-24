//import libraries
import React, { useState, useRef } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { rw, rh, rf } from '../../../../constants/responsive';
import { useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';

// create a component
const UpcomingScreen = () => {
    const navigation = useNavigation();
    const [selectedCategory, setSelectedCategory] = useState('Tailor');
    const [selectedTimeFilter, setSelectedTimeFilter] = useState('instant');
    const [qrVisible, setQrVisible] = useState(false);
    const [expandedServices, setExpandedServices] = useState({});
    
    // Animation values for each service
    const animationRefs = useRef({});
    
    // QR Modal slide animation
    const qrSlideAnim = useRef(new Animated.Value(300)).current;

    // Get animation value for service
    const getAnimation = (serviceId) => {
        if (!animationRefs.current[serviceId]) {
            animationRefs.current[serviceId] = new Animated.Value(0);
        }
        return animationRefs.current[serviceId];
    };

    // Accordion + Slide Animation
    const toggleServiceExpansion = (serviceId) => {
        const isExpanded = expandedServices[serviceId];
        const animation = getAnimation(serviceId);
        
        if (isExpanded) {
            // CLOSE: Slide up animation
            Animated.timing(animation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start(() => {
                setExpandedServices(prev => ({
                    ...prev,
                    [serviceId]: false
                }));
            });
        } else {
            // ACCORDION: Close all others first
            const otherAnimations = [];
            Object.keys(expandedServices).forEach(key => {
                if (key !== serviceId.toString() && expandedServices[key]) {
                    const otherAnimation = getAnimation(parseInt(key));
                    otherAnimations.push(
                        Animated.timing(otherAnimation, {
                            toValue: 0,
                            duration: 200,
                            useNativeDriver: false,
                        })
                    );
                }
            });

            // Close others and update state
            if (otherAnimations.length > 0) {
                Animated.parallel(otherAnimations).start(() => {
                    setExpandedServices({[serviceId]: true});
                });
            } else {
                setExpandedServices({[serviceId]: true});
            }

            // OPEN: Slide down animation for current
            Animated.timing(animation, {
                toValue: 1,
                duration: 350,
                useNativeDriver: false,
            }).start();
        }
    };

    const categories = [
        { id: 'embroidery', name: 'Embroidery' },
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

    // Upcoming services data
    const upcomingServices = [
        {
            id: 1,
            date: "26",
            month: "jan 2025",
            service: "Embroidery Service",
            people: "3 people",
            duration: "2-3 hours",
            address: "Sector 5, Delhi",
            workers: [
                { id: 1, name: "Mamta Kumari", duration: "2 hours", image: require('../../../../assets/images/boy-user.png'), ratings: "★", service: "Embroidery" },
                { id: 2, name: "Priya Singh", duration: "1.5 hours", image: require('../../../../assets/images/boy-user.png'), ratings: "★", service: "Embroidery" },
                { id: 3, name: "Ravi Kumar", duration: "2.5 hours", image: require('../../../../assets/images/boy-user.png'), ratings: "★", service: "Embroidery" }
            ]
        },
        {
            id: 2,
            date: "27",
            month: "jan 2025", 
            service: "Tailor Service",
            people: "2 people",
            duration: "1-2 hours",
            address: "Sector 8, Delhi",
            workers: [
                { id: 4, name: "Amit Sharma", duration: "1.5 hours", image: require('../../../../assets/images/boy-user.png'), ratings: "★", service: "Tailor" },
                { id: 5, name: "Suresh Kumar", duration: "2 hours", image: require('../../../../assets/images/boy-user.png'), ratings: "★", service: "Tailor" }
            ]
        },
        {
            id: 3,
            date: "29",
            month: "jan 2025",
            service: "Pattern Making Service", 
            people: "2 people",
            duration: "3-4 hours",
            address: "Sector 12, Delhi",
            workers: [
                { id: 6, name: "Neha Patel", duration: "3 hours", image: require('../../../../assets/images/boy-user.png'), ratings: "★", service: "Pattern Maker" },
                { id: 7, name: "Rajesh Singh", duration: "3.5 hours", image: require('../../../../assets/images/boy-user.png'), ratings: "★", service: "Pattern Maker" }
            ]
        }
    ];

    return (
        <View style={styles.container}>
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

                {/* Services with Slide Animation */}
                {upcomingServices.map((service) => {
                    const animation = getAnimation(service.id);
                    const maxHeight = service.workers.length * 90 + 60; // Increased height for proper spacing

                    return (
                        <View key={service.id} style={styles.serviceContainer}>
                            {/* Main Service Card */}
                            <TouchableOpacity 
                                style={styles.upcomingServiceItem}
                                onPress={() => toggleServiceExpansion(service.id)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.dateContainer}>
                                    <Text style={styles.dateNumber}>{service.date}</Text>
                                    <Text style={styles.dateMonth}>{service.month}</Text>
                                </View>
                                <View style={styles.upcomingServiceInfo}>
                                    <Text style={styles.upcomingServiceText}>{service.service}</Text>
                                    <Text style={styles.upcomingServiceText}>{service.people}</Text>
                                    <Text style={styles.upcomingServiceText}>{service.duration}</Text>
                                    <Text style={styles.upcomingServiceText}>{service.address}</Text>
                                </View>
                                <View style={styles.expandIconContainer}>
                                    <Animated.View
                                        style={{
                                            transform: [{
                                                rotate: animation.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['0deg', '180deg']
                                                })
                                            }]
                                        }}
                                    >
                                        <Icon name="expand-more" size={24} color="#666" />
                                    </Animated.View>
                                    <Text style={styles.knowMoreText}>know more</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Animated Expandable Content - NO OVERFLOW HIDDEN */}
                            <Animated.View
                                style={[
                                    styles.expandedWrapper,
                                    {
                                        height: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, maxHeight]
                                        }),
                                        opacity: animation.interpolate({
                                            inputRange: [0, 0.3, 1],
                                            outputRange: [0, 0.5, 1]
                                        })
                                    }
                                ]}
                            >
                                <View style={styles.expandedContent}>
                                    {service.workers.map((worker, index) => (
                                        <Animated.View
                                            key={worker.id}
                                            style={[
                                                styles.historyItem,
                                                {
                                                    transform: [{
                                                        translateY: animation.interpolate({
                                                            inputRange: [0, 1],
                                                            outputRange: [15, 0]
                                                        })
                                                    }],
                                                    opacity: animation.interpolate({
                                                        inputRange: [0, 0.4, 1],
                                                        outputRange: [0, 0, 1]
                                                    })
                                                }
                                            ]}
                                        >
                                            <Image source={worker.image} style={styles.userImages} />
                                            <View style={styles.historyDetails}>
                                                <Text style={styles.statusText}>{worker.name}</Text>
                                                <Text style={styles.durationText}>Id: #{worker.id}</Text>
                                                <Text style={styles.dateTimeText}>{worker.duration}</Text>
                                            </View>
                                            <View style={styles.ratingsContainer}>
                                                <Text style={styles.ratingsIcon}>{worker.ratings}</Text>
                                                <Text style={styles.ratingsText}>4.5</Text>
                                            </View>
                                        </Animated.View>
                                    ))}
                                </View>
                            </Animated.View>
                        </View>
                    );
                })}
                
                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Sticky QR Button */}
            <View style={styles.qrButtonWrapper}>
                <TouchableOpacity style={styles.qrButton} onPress={() => {
                    setQrVisible(true);
                    // Animate QR modal slide up from bottom
                    qrSlideAnim.setValue(300);
                    Animated.timing(qrSlideAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }).start();
                }}>
                    <Text style={styles.qrButtonText}>Generate QR to start service</Text>
                </TouchableOpacity>
            </View>

            {/* QR Modal - Bottom Slide Up Animation */}
            <Modal transparent visible={qrVisible} animationType="none" onRequestClose={() => {
                // Animate slide down then close
                Animated.timing(qrSlideAnim, {
                    toValue: 300,
                    duration: 250,
                    useNativeDriver: true,
                }).start(() => {
                    setQrVisible(false);
                });
            }}>
                <View style={styles.modalOverlay}>
                    <TouchableOpacity 
                        style={styles.overlayTouchable} 
                        activeOpacity={1} 
                        onPress={() => {
                            // Animate slide down then close
                            Animated.timing(qrSlideAnim, {
                                toValue: 300,
                                duration: 250,
                                useNativeDriver: true,
                            }).start(() => {
                                setQrVisible(false);
                            });
                        }} 
                    />
                    
                    {/* Animated Bottom Sheet Modal */}
                    <Animated.View style={[
                        styles.modalContainer,
                        {
                            transform: [{
                                translateY: qrSlideAnim
                            }]
                        }
                    ]}>
                        <TouchableOpacity 
                            style={styles.closeIcon} 
                            onPress={() => {
                                // Animate slide down then close
                                Animated.timing(qrSlideAnim, {
                                    toValue: 300,
                                    duration: 250,
                                    useNativeDriver: true,
                                }).start(() => {
                                    setQrVisible(false);
                                });
                            }}
                        >
                            <Icon name="close" size={28} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Your QR Code</Text>
                        <QRCode value="Service-12345" size={200} />
                        <Text style={styles.qrSubtext}>Scan QR to start service</Text>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEFEFE',
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
        backgroundColor: '#e8e8e8',
    },
    categoryText: {
        fontSize: 13,
        color: '#666',
    },
    selectedCategoryText: {
        color: '#000',
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
    
    // Service Container with NO overflow issues
    serviceContainer: {
        marginBottom: 15,
        marginHorizontal: 20,
        backgroundColor: '#fff',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        // REMOVED overflow: 'hidden' to prevent cutting
    },
    
    upcomingServiceItem: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateContainer: {
        alignItems: 'center',
        marginRight: 20,
    },
    dateNumber: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#000',
        lineHeight: 40,
    },
    dateMonth: {
        fontSize: 12,
        color: '#666',
        marginTop: -5,
    },
    upcomingServiceInfo: {
        flex: 1,
    },
    upcomingServiceText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    expandIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    knowMoreText: {
        color: '#666',
        fontSize: 12,
        marginTop: 5,
    },

    // Animated Expansion - NO CUTTING
    expandedWrapper: {
        backgroundColor: '#f8f8f8',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        // REMOVED overflow: 'hidden' to prevent content cutting
    },
    expandedContent: {
        padding: 15,
        paddingTop: 10,
    },
    historyItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
        alignItems: 'center',
        borderRadius: 12,
        marginHorizontal: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    historyDetails: { 
        flex: 1 
    },
    statusText: { 
        fontSize: 16, 
        color: '#333', 
        marginBottom: 4,
        fontWeight: '500'
    },
    durationText: { 
        fontSize: 14, 
        color: '#666', 
        marginBottom: 2 
    },
    dateTimeText: { 
        fontSize: 14, 
        color: '#666' 
    },
    userImages: { 
        width: rw(12), 
        height: rw(12), 
        marginRight: rw(3),
        borderRadius: rw(6)
    },
    ratingsContainer: { 
        alignItems: 'center' 
    },
    ratingsIcon: { 
        fontSize: 18, 
        color: '#000', 
        marginBottom: 2 
    },
    ratingsText: { 
        fontSize: 12, 
        color: '#666',
        fontWeight: '500'
    },

    bottomPadding: {
        height: 80,
    },

    // Sticky QR Button
    qrButtonWrapper: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#fff',
        paddingVertical: 10,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: -2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 4,
        // elevation: 5,
    },
    qrButton: {
        backgroundColor: '#000',
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: 'center',
        marginHorizontal: 20,
    },
    qrButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },

    // Modal - Bottom Sheet Style
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
        paddingTop: 25,
        paddingHorizontal: 30,
        paddingBottom: 40,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        alignItems: "center",
        minHeight: 350,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 15,
    },
    modalTitle: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        marginBottom: 30,
        color: '#333'
    },
    qrSubtext: {
        marginTop: 25,
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        lineHeight: 22,
    },
    closeIcon: {
        position: 'absolute',
        top: 20,
        right: 20,
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
    },
});

export default UpcomingScreen;