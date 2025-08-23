//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, StatusBar, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { rf, rw, rh } from '../../../constants/responsive';
import * as Animatable from 'react-native-animatable';

// create a component
const ProviderProfileDetails = () => {
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

    const onShare = async () => {
        try {
        const result = await Share.share({
            message: "Check out this amazing profile: Priya Sharma (Embroider) ⭐ 4.8/5. Highly recommended!",
            url: "https://yourapp.com/profile/priya-sharma" // <-- yaha apna profile link ya deep link dal sakte ho
        });
    
        if (result.action === Share.sharedAction) {
            if (result.activityType) {
            // shared with activity type of result.activityType
            console.log("Shared with activity type:", result.activityType);
            } else {
            // shared
            console.log("Profile shared successfully!");
            }
        } else if (result.action === Share.dismissedAction) {
            console.log("Share dismissed");
        }
        } catch (error) {
        console.log(error.message);
        }
    };
    

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Nike Logo and Company Info */}
                <View style={styles.companySection}>
                    <Image
                        animation="zoomIn"    // 👈 ZoomIn animation
                        duration={1500}       // 1.5 sec animation duration
                        source={require('../../../assets/images/user.png')}
                        style={{ width: rw(30), height: rw(30), borderRadius: 10 }}
                        resizeMode="contain"
                    />
                    
                    <Text style={styles.companyName}>Priya Sharma</Text>
                    <Text style={styles.companyType}>Embroider</Text>
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
              <View style={styles.providerActions}>
                <TouchableOpacity style={styles.bookAgainButton}>
                  <Text style={styles.bookAgainText}>Book again</Text>
                  <Icon name="refresh" size={16} color="#ddd" style={styles.refreshIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareButton} onPress={onShare}>
                  <Text style={styles.shareText}>Share Profile</Text>
                  <Icon name="share" size={16} color="#ddd" style={styles.shareIcon} />
                </TouchableOpacity>
              </View>
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

    providerActions: {
        flexDirection: 'row',
        gap: 15,
        paddingVertical:15,
        paddingHorizontal:30,
        justifyContent:'space-between',
        borderWidth:1,
        borderColor:'#ccc'
      },
      bookAgainButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingVertical: 8,
        backgroundColor:'black',
        borderRadius: 6,
      },
      bookAgainText: {
        fontSize: 14,
        color: '#ccc',
      },
      refreshIcon: {
        marginLeft: 5,
      },
      shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingVertical:8,
        backgroundColor:'black',
        borderRadius: 6,
      },
      shareText: {
        fontSize: 14,
        color: '#ccc',
      },
      shareIcon: {
        marginLeft: 5,
      },
});

//make this component available to the app
export default ProviderProfileDetails;