//import libraries
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';  
import { rw , rh } from '../../../constants/responsive';
import { useNavigation } from '@react-navigation/native';
import { getProfile } from "../../../services/auth";

// create a component
const CustomerProfileScreen = () => {
    const navigation = useNavigation();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Fetch profile data
    const fetchProfileData = useCallback(async () => {
        try {
            console.log('🔄 Fetching customer profile...');
            setError(null);
            
            const response = await getProfile();
            
            console.log('✅ Customer API Response received:', {
                status: response?.status,
                hasData: !!response?.data,
                hasUser: !!response?.data?.user,
                userName: response?.data?.user?.name
            });

            if (!response || !response.data) {
                throw new Error('No response data received');
            }

            if (!response.data.user) {
                throw new Error('User profile not found in response');
            }

            setProfileData(response.data.user);
            console.log('✅ Profile data set successfully for:', response.data.user.name);
            
        } catch (error) {
            console.error('❌ Customer Profile API Error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            setError(error);
            
            let errorMessage = 'Failed to load profile data';
            
            if (error.code === 'NETWORK_ERROR' || error.message.includes('Network')) {
                errorMessage = 'Network connection error. Please check your internet connection.';
            } else if (error.response?.status === 401) {
                errorMessage = 'Authentication failed. Please login again.';
            } else if (error.response?.status === 403) {
                errorMessage = 'Access denied. You may not have permission to view this profile.';
            } else if (error.response?.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        console.log('🚀 CustomerProfileScreen mounted, fetching profile...');
        fetchProfileData();
    }, [fetchProfileData]);

    const onRefresh = useCallback(() => {
        console.log('🔄 Manual refresh triggered');
        setRefreshing(true);
        fetchProfileData();
    }, [fetchProfileData]);

    // Helper function to get initials for profile image placeholder
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Format phone number
    const formatPhoneNumber = (phone) => {
        if (!phone) return 'No phone number';
        if (phone.startsWith('+91')) return phone;
        return `+91${phone.replace(/^\+91/, '')}`;
    };

    // Loading screen
    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                <View style={styles.header}>
                    <View style={styles.profileSection}>
                        <View style={styles.profileImagePlaceholder}>
                            <ActivityIndicator size="small" color="#ffffff" />
                        </View>
                        <View>
                            <Text style={{color:'white', fontWeight:'500'}}>Loading...</Text>
                            <Text style={{color:'white'}}>Please wait</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.helpsupport}>
                        <Text style={{color:'white', fontSize:14, fontWeight:'bold'}}>help & support</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#000000" />
                    <Text style={styles.loadingText}>Loading your profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error screen
    if (!profileData || error) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                <View style={styles.header}>
                    <View style={styles.profileSection}>
                        <View style={styles.profileImagePlaceholder}>
                            <Ionicons name="person" size={24} color="#ffffff" />
                        </View>
                        <View>
                            <Text style={{color:'white', fontWeight:'500'}}>Profile Error</Text>
                            <Text style={{color:'white'}}>Failed to load</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.helpsupport}>
                        <Text style={{color:'white', fontSize:14, fontWeight:'bold'}}>help & support</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={60} color="#ff4444" />
                    <Text style={styles.errorTitle}>Unable to Load Profile</Text>
                    <Text style={styles.errorMessage}>
                        {error?.message || 'Failed to load profile data'}
                    </Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchProfileData}>
                        <Ionicons name="refresh" size={16} color="#ffffff" style={{ marginRight: 8 }} />
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Header Section with Dynamic Data */}
            <View style={styles.header}>
               <View style={styles.profileSection}>
                    {profileData.profile_image ? (
                        <Image
                            source={{ uri: profileData.profile_image }}
                            style={styles.profileImage}
                            onError={(e) => console.log('Profile image load error:', e.nativeEvent.error)}
                        />
                    ) : (
                        <View style={styles.profileImagePlaceholder}>
                            <Text style={styles.initialsText}>{getInitials(profileData.name)}</Text>
                        </View>
                    )}
                    <View>
                        <Text style={{color:'white', fontWeight:'500'}}>{profileData.name || 'No Name'}</Text>
                        <Text style={{color:'white'}}>{formatPhoneNumber(profileData.mobile)}</Text>
                    </View>
               </View>
               <TouchableOpacity style={styles.helpsupport}>
                 <Text style={{color:'white', fontSize:14, fontWeight:'bold'}}>help & support</Text>
               </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Wallet and Bookings Cards */}
                <View style={styles.cardsContainer}>
                    <View style={styles.card}>
                        <Ionicons name="wallet-outline" size={32} color="#000" style={{marginBottom: 10}} />
                        <Text style={styles.cardTitle}>My Wallet</Text>
                        <Text style={styles.walletAmount}>Rs 200</Text>
                        <TouchableOpacity style={styles.addAmountButton} onPress={() => navigation.navigate('PaymentMethodScreen')}>
                            <Text style={styles.addAmountText}>add amount</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.card}>
                        <Ionicons name="calendar-outline" size={32} color="#000" style={{marginBottom: 10}} />
                        <Text style={styles.cardTitle}>My Bookings</Text>
                        <View style={styles.bookingButtons}>
                        <TouchableOpacity 
                            style={styles.activeButton} 
                            onPress={() => navigation.navigate('ActiveUpcomingServices', { initialTab: 'Active' })}
                        >
                            <Text style={styles.activeButtonText}>Active</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.upcomingButton} 
                            onPress={() => navigation.navigate('ActiveUpcomingServices', { initialTab: 'Upcoming' })}
                        >
                            <Text style={styles.upcomingButtonText}>Upcoming</Text>
                        </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Profile Information Card */}
                <View style={styles.profileInfoCard}>
                    <Text style={styles.profileInfoTitle}>Profile Information</Text>
                    <View style={styles.profileInfoGrid}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Name</Text>
                            <Text style={styles.infoValue}>{profileData.name || 'Not provided'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue}>{profileData.email || 'Not provided'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Mobile</Text>
                            <Text style={styles.infoValue}>{formatPhoneNumber(profileData.mobile)}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Address</Text>
                            <Text style={styles.infoValue}>{profileData.address || 'Not provided'}</Text>
                        </View>
                        {profileData.date_of_birth && (
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Date of Birth</Text>
                                <Text style={styles.infoValue}>
                                    {new Date(profileData.date_of_birth).toLocaleDateString('en-IN')}
                                </Text>
                            </View>
                        )}
                        {profileData.gender && (
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Gender</Text>
                                <Text style={styles.infoValue}>{profileData.gender}</Text>
                            </View>
                        )}
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Mobile Verified</Text>
                            <View style={styles.verificationStatus}>
                                <Ionicons 
                                    name={profileData.mobile_verified_at ? "checkmark-circle" : "close-circle"} 
                                    size={16} 
                                    color={profileData.mobile_verified_at ? "#4CAF50" : "#f44336"} 
                                />
                                <Text style={[styles.infoValue, { 
                                    marginLeft: 4,
                                    color: profileData.mobile_verified_at ? "#4CAF50" : "#f44336"
                                }]}>
                                    {profileData.mobile_verified_at ? 'Verified' : 'Not Verified'}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Member Since</Text>
                            <Text style={styles.infoValue}>
                                {new Date(profileData.created_at).toLocaleDateString('en-IN')}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('AddressBookScreen')}>
                        <Ionicons name="book-outline" size={22} color="#555" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Address Book</Text>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>

                    {/* <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PaymentMethodScreen')}>
                        <Ionicons name="card-outline" size={22} color="#555" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Manage Payment Methods</Text>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity> */}

                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('RatingScreen')}>
                        <Ionicons name="star-outline" size={22} color="#555" style={styles.menuIcon} />
                        <Text style={styles.menuText}>My Ratings</Text>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PrivacyPolicyScreen')}>
                        <Ionicons name="shield-checkmark-outline" size={22} color="#555" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Privacy and data</Text>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>

                    {/* <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="gift-outline" size={22} color="#555" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Refer and earn</Text>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity> */}

                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('AboutScreen')}>
                        <Ionicons name="information-circle-outline" size={22} color="#555" style={styles.menuIcon} />
                        <Text style={styles.menuText}>About MI</Text>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.replace('LoginScreen')}>
                        <Ionicons name="log-out-outline" size={22} color="#ff4444" style={styles.menuIcon} />
                        <Text style={[styles.menuText, { color: '#ff4444' }]}>Log out</Text>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        height:rh(10),
        paddingHorizontal:rw(5),
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        backgroundColor:'black',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    helpsupport: {
      borderWidth:2,
      borderColor:'white',
      paddingHorizontal:13,
      paddingVertical:6,
      borderRadius:100
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    profileImagePlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#444',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    initialsText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorTitle: {
        fontSize: 18,
        color: '#000000',
        fontWeight: 'bold',
        marginTop: 10,
    },
    errorMessage: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 20,
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#000000',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    retryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    cardsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        width: '48%',
        alignItems: 'center',
        borderWidth:1,
        borderColor:'#ddd'
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 5,
    },
    walletAmount: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    addAmountButton: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    addAmountText: {
        fontSize: 12,
        color: '#333',
    },
    bookingButtons: {
        flexDirection: 'row',
        marginTop: 10,
    },
    activeButton: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    activeButtonText: {
        fontSize: 12,
        color: '#333',
    },
    upcomingButton: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    upcomingButtonText: {
        fontSize: 12,
        color: '#333',
    },
    profileInfoCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    profileInfoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15,
    },
    profileInfoGrid: {
        gap: 12,
    },
    infoItem: {
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        color: '#000',
        fontWeight: '500',
    },
    verificationStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuContainer: {
        backgroundColor: '#fff',
        borderRadius: 15,
        overflow: 'hidden',
        borderWidth:1,
        borderColor:'#ddd'
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuIcon: {
        marginRight: 15,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
});

export default CustomerProfileScreen;