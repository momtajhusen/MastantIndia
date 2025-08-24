import React, { useState, useRef } from 'react';
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
    Alert
} from 'react-native';
import { rw, rh } from '../../../../constants/responsive';
import { useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { height, width } = Dimensions.get("window");

const ActiveScreen = () => {
    const navigation = useNavigation();
    const [selectedCategory, setSelectedCategory] = useState('Embroidery');
    const [qrVisible, setQrVisible] = useState(false);
    const [ratingVisible, setRatingVisible] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [detailedReview, setDetailedReview] = useState('');
    const [selectedRatingOptions, setSelectedRatingOptions] = useState([]);
    const [selectedStars, setSelectedStars] = useState(0);

    // Animation for modal content only
    const slideAnim = useRef(new Animated.Value(300)).current;
    const ratingSlideAnim = useRef(new Animated.Value(300)).current;

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

    const openRatingModal = (service) => {
        setSelectedService(service);
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
            service: selectedService?.name,
            stars: selectedStars,
            selectedOptions: selectedRatingOptions,
            detailedReview: detailedReview.trim(),
            timestamp: new Date().toISOString()
        };

        // Show success message
        Alert.alert(
            'Review Submitted!', 
            `Thank you for rating ${selectedService?.name}. Your ${selectedStars} star review has been submitted successfully.`,
            [
                {
                    text: 'OK',
                    onPress: () => {
                        closeRatingModal();
                        console.log('Review submitted:', reviewData);
                    }
                }
            ]
        );
    };

    const categories = [
        { id: 'embroidery', name: 'Embroidery', date: '26 Jan 2024' },
        { id: 'tailor', name: 'Tailor' },
        { id: 'pattern', name: 'Pattern Maker' },
        { id: 'khaka', name: 'khaka Maker' }
    ];

    const activeServices = [
        { id: 1, name: "Mamta Kumari", duration: "2 hours", image: require('../../../../assets/images/boy-user.png'), ratings: "★", service: "Embroidery" },
        { id: 2, name: "Ravi Kumar", duration: "1.5 hours", image: require('../../../../assets/images/boy-user.png'), ratings: "★", service: "Tailor" },
        { id: 3, name: "Priya Singh", duration: "3 hours", image: require('../../../../assets/images/boy-user.png'), ratings: "★", service: "Pattern Maker" },
        { id: 4, name: "Amit Sharma", duration: "2.5 hours", image: require('../../../../assets/images/boy-user.png'), ratings: "★", service: "Khaka Maker" },
    ];

    const ratingOptions = [
        "embroider was unprofessional",
        "slow speed",
        "didn't arrive on time",
        "poor quality work",
        "unfocused",
        "littering"
    ];

    return (
        <View style={styles.container}>
            {/* Scrollable Content */}
            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                {/* Category Filter */}
                <View style={styles.categoryContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContentContainer}>
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

                {/* Active Services List */}
                {activeServices.map((service) => (
                    <TouchableOpacity 
                        key={service.id} 
                        style={styles.historyItem}
                        onPress={() => openRatingModal(service)}
                    >
                        <Image source={service.image} style={styles.userImages} />
                        <View style={styles.historyDetails}>
                            <Text style={styles.statusText}>{service.name}</Text>
                            <Text style={styles.durationText}>Id: #{service.id}</Text>
                            <Text style={styles.dateTimeText}>{service.duration}</Text>
                        </View>
                        <View style={styles.ratingsContainer}>
                            <Text style={styles.ratingsIcon}>{service.ratings}</Text>
                            <Text style={styles.ratingsText}>4.5</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Sticky QR Button */}
            <View style={styles.qrButtonWrapper}>
                <TouchableOpacity style={styles.qrButton} onPress={openModal}>
                    <Text style={styles.qrButtonText}>Generate QR to start service</Text>
                </TouchableOpacity>
            </View>

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
                                <Text style={styles.ratingTitle}>Rate your service with</Text>
                                <Text style={styles.serviceProviderName}>{selectedService?.name}</Text>
                            </View>
                            
                            <View style={styles.providerImageSection}>
                                <Image source={selectedService?.image} style={styles.providerImage} />
                                <Text style={styles.providerService}>Embroider</Text>
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
                                            {option.includes('\n') ? option : option}
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
    categoryDate: { fontSize: 12, color: '#999', marginTop: 2 },
    historyItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 5,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#D9D9D9'
    },
    historyDetails: { flex: 1 },
    statusText: { fontSize: 16, color: '#333', marginBottom: 4 },
    durationText: { fontSize: 14, color: '#666', marginBottom: 2 },
    dateTimeText: { fontSize: 14, color: '#666' },
    userImages: { width: rw(20), height: rw(20), marginRight: rw(2) },
    ratingsContainer: { alignItems: 'center' },
    ratingsIcon: { fontSize: 20, color: '#000', marginBottom: 2 },
    ratingsText: { fontSize: 12, color: '#666' },

    // Sticky QR Button
    qrButtonWrapper: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#fff',
        paddingVertical: 10,
    },
    qrButton: {
        backgroundColor: '#000',
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: 'center',
        marginHorizontal: 20,
    },
    qrButtonText: { color: 'white', fontSize: 16, fontWeight: '500' },

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
        textTransform: 'lowercase',
    },
    providerImageSection: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    providerImage: {
        width: 100,
        height: 100,
        marginBottom: 3,
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