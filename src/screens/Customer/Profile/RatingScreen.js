//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { rf, rw, rh } from '../../../constants/responsive';
import * as Animatable from 'react-native-animatable';

// create a component
const RatingScreen = () => {
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        
        for (let i = 0; i < 5; i++) {
            stars.push(
                <FontAwesome 
                    key={i}
                    name={i < fullStars ? "star" : "star-o"} 
                    size={17} 
                    color="#000000" 
                    style={styles.star}
                />
            );
        }
        return stars;
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Nike Logo and Company Info */}
                <View style={styles.companySection}>
                    <Animatable.Image
                        animation="zoomIn"    // 👈 ZoomIn animation
                        duration={1500}       // 1.5 sec animation duration
                        source={require('../../../assets/images/Applogo.png')}
                        style={{ width: rw(30), height: rw(30), borderRadius: 10 }}
                        resizeMode="contain"
                    />
                    
                    <Text style={styles.companyName}>Mastant India</Text>
                    <Text style={styles.companyType}>Company</Text>
                    <Text style={styles.rating}>4.8 • 120 reviews</Text>
                </View>

                {/* Reviews Section */}
                <View style={styles.reviewsSection}>
                    <Text style={styles.reviewsTitle}>Reviews</Text>
                    
                    {/* Review 1 */}
                    <View style={styles.reviewItem}>
                        <View style={styles.reviewHeader}>
                            <Image 
                                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face' }}
                                style={styles.avatar}
                            />
                            <View style={styles.reviewInfo}>
                                <Text style={styles.reviewerName}>Rajesh Verma</Text>
                                <Text style={styles.reviewTime}>2 months ago</Text>
                            </View>
                        </View>
                        
                        <View style={styles.starsContainer}>
                            {renderStars(5)}
                        </View>
                        
                        <Text style={styles.reviewText}>
                            Priya's designs are exceptional and her attention to detail is remarkable. She delivered the project ahead of schedule and exceeded our expectations.
                        </Text>
                        
                        <View style={styles.reviewActions}>
                            <TouchableOpacity style={styles.actionButton}>
                                <Icon name="thumb-up" size={16} color="#666666" />
                                <Text style={styles.actionText}>15</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <Icon name="thumb-down" size={16} color="#666666" />
                                <Text style={styles.actionText}>2</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Review 2 */}
                    <View style={styles.reviewItem}>
                        <View style={styles.reviewHeader}>
                            <Image 
                                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face' }}
                                style={styles.avatar}
                            />
                            <View style={styles.reviewInfo}>
                                <Text style={styles.reviewerName}>Anita Kapoor</Text>
                                <Text style={styles.reviewTime}>3 months ago</Text>
                            </View>
                        </View>
                        
                        <View style={styles.starsContainer}>
                            {renderStars(4)}
                        </View>
                        
                        <Text style={styles.reviewText}>
                            Priya is a talented designer with a great understanding of current fashion trends. Her communication was excellent throughout the project.
                        </Text>
                        
                        <View style={styles.reviewActions}>
                            <TouchableOpacity style={styles.actionButton}>
                                <Icon name="thumb-up" size={16} color="#666666" />
                                <Text style={styles.actionText}>8</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <Icon name="thumb-down" size={16} color="#666666" />
                                <Text style={styles.actionText}>1</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        flex: 1,
    },
    companySection: {
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 20,
    },
    companyName: {
        fontSize: 22,
        fontWeight: '600',
        color: '#000000',
        marginTop:10
    },
    companyType: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 5,
    },
    rating: {
        fontSize: 16,
        color: '#000000',
    },
    reviewsSection: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    reviewsTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 20,
    },
    reviewItem: {
        marginBottom: 30,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 25,
        marginRight: 15,
    },
    reviewInfo: {
        flex: 1,
    },
    reviewerName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#000000',
        marginBottom: 2,
    },
    reviewTime: {
        fontSize: 14,
        color: '#666666',
    },
    starsContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    star: {
        marginRight: 2,
    },
    reviewText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#000000',
        marginBottom: 15,
    },
    reviewActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 30,
    },
    actionText: {
        fontSize: 14,
        color: '#666666',
        marginLeft: 5,
    },
});

//make this component available to the app
export default RatingScreen;