//import libraries
import React, { Component } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView 
} from 'react-native';

// create a component
const CustomerProfileScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <View style={styles.profileSection}>
                    <Image 
                        source={{ uri: 'https://via.placeholder.com/60x60' }} 
                        style={styles.profileImage}
                    />
                    <View style={styles.profileInfo}>
                        <Text style={styles.name}>Preeti Yadav</Text>
                        <Text style={styles.phone}>+91 9315352806</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.supportButton}>
                    <Text style={styles.supportButtonText}>help & support</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Wallet and Bookings Cards */}
                <View style={styles.cardsContainer}>
                    <View style={styles.card}>
                        <View style={styles.cardIcon}>
                            <View style={styles.walletIcon}>
                                <View style={styles.walletIconInner} />
                            </View>
                        </View>
                        <Text style={styles.cardTitle}>My Wallet</Text>
                        <Text style={styles.walletAmount}>Rs 200</Text>
                        <TouchableOpacity style={styles.addAmountButton}>
                            <Text style={styles.addAmountText}>add amount</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.cardIcon}>
                            <View style={styles.calendarIcon}>
                                <View style={styles.calendarTop} />
                                <View style={styles.calendarDots}>
                                    <View style={styles.dot} />
                                    <View style={styles.dot} />
                                    <View style={styles.dot} />
                                    <View style={styles.dot} />
                                    <View style={styles.dot} />
                                    <View style={styles.dot} />
                                </View>
                            </View>
                        </View>
                        <Text style={styles.cardTitle}>My Bookings</Text>
                        <View style={styles.bookingButtons}>
                            <TouchableOpacity style={styles.activeButton}>
                                <Text style={styles.activeButtonText}>active</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.upcomingButton}>
                                <Text style={styles.upcomingButtonText}>upcoming</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <View style={styles.contactIcon}>
                                <View style={styles.contactCard} />
                                <View style={styles.contactPerson} />
                            </View>
                        </View>
                        <Text style={styles.menuText}>Address Book</Text>
                        <View style={styles.arrow} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <View style={styles.creditCardIcon}>
                                <View style={styles.cardBody} />
                                <View style={styles.cardChip} />
                            </View>
                        </View>
                        <Text style={styles.menuText}>Manage Payment Methods</Text>
                        <View style={styles.arrow} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <View style={styles.ratingStarIcon}>
                                <View style={styles.starTop} />
                                <View style={styles.starBottom} />
                            </View>
                        </View>
                        <Text style={styles.menuText}>My Ratings</Text>
                        <View style={styles.arrow} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <View style={styles.privacyShieldIcon}>
                                <View style={styles.shieldBody} />
                                <View style={styles.shieldLock} />
                            </View>
                        </View>
                        <Text style={styles.menuText}>Privacy and data</Text>
                        <View style={styles.arrow} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <View style={styles.referGiftIcon}>
                                <View style={styles.giftBox} />
                                <View style={styles.giftRibbon} />
                            </View>
                        </View>
                        <Text style={styles.menuText}>Refer and earn</Text>
                        <View style={styles.arrow} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <View style={styles.infoCircleIcon}>
                                <View style={styles.circleOutline} />
                                <View style={styles.infoI} />
                            </View>
                        </View>
                        <Text style={styles.menuText}>About MI</Text>
                        <View style={styles.arrow} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <View style={styles.logoutExitIcon}>
                                <View style={styles.exitArrow} />
                                <View style={styles.exitDoor} />
                            </View>
                        </View>
                        <Text style={styles.menuText}>Log out</Text>
                        <View style={styles.arrow} />
                    </TouchableOpacity>
                </View>
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
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    // profileImage: {
    //     width: 60,
    //     height: 60,
    //     borderRadius: 30,
    //     marginRight: 15,
    // },
    profileInfo: {
        flex: 1,
    },
    name: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 2,
    },
    phone: {
        color: '#ccc',
        fontSize: 14,
    },
    supportButton: {
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 4,
    },
    supportButtonText: {
        color: '#fff',
        fontSize: 14,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    cardsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        width: '48%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardIcon: {
        marginBottom: 15,
    },
    walletIcon: {
        width: 40,
        height: 40,
        borderWidth: 3,
        borderColor: '#000',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    walletIconInner: {
        width: 20,
        height: 15,
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 3,
    },
    calendarIcon: {
        width: 40,
        height: 40,
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 5,
    },
    calendarTop: {
        height: 8,
        backgroundColor: '#000',
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },
    calendarDots: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    dot: {
        width: 4,
        height: 4,
        backgroundColor: '#000',
        borderRadius: 2,
        margin: 1,
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
    },
    upcomingButtonText: {
        fontSize: 12,
        color: '#333',
    },
    menuContainer: {
        backgroundColor: '#fff',
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
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
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e8e8e8',
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Contact/Address Book Icon
    contactIcon: {
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactCard: {
        width: 14,
        height: 10,
        borderWidth: 1.5,
        borderColor: '#555',
        borderRadius: 2,
        backgroundColor: 'transparent',
    },
    contactPerson: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#555',
        marginTop: -8,
    },
    // Credit Card Icon
    creditCardIcon: {
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardBody: {
        width: 16,
        height: 10,
        borderWidth: 1,
        borderColor: '#555',
        borderRadius: 2,
        backgroundColor: 'transparent',
    },
    cardChip: {
        width: 4,
        height: 3,
        backgroundColor: '#555',
        borderRadius: 1,
        position: 'absolute',
        left: 2,
        top: 2,
    },
    // Rating Star Icon  
    ratingStarIcon: {
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    starTop: {
        width: 0,
        height: 0,
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderBottomWidth: 7,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#555',
        transform: [{ rotate: '0deg' }],
    },
    starBottom: {
        width: 0,
        height: 0,
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderTopWidth: 7,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#555',
        marginTop: -3,
        transform: [{ rotate: '180deg' }],
    },
    // Privacy Shield Icon
    privacyShieldIcon: {
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shieldBody: {
        width: 12,
        height: 14,
        borderWidth: 1.5,
        borderColor: '#555',
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottomWidth: 0,
        backgroundColor: 'transparent',
    },
    shieldLock: {
        width: 6,
        height: 4,
        borderWidth: 1,
        borderColor: '#555',
        borderRadius: 3,
        marginTop: -10,
        backgroundColor: 'transparent',
    },
    // Refer Gift Icon
    referGiftIcon: {
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    giftBox: {
        width: 14,
        height: 10,
        borderWidth: 1.5,
        borderColor: '#555',
        borderRadius: 2,
        backgroundColor: 'transparent',
    },
    giftRibbon: {
        width: 14,
        height: 2,
        backgroundColor: '#555',
        marginTop: -6,
        borderRadius: 1,
    },
    // Info Circle Icon
    infoCircleIcon: {
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleOutline: {
        width: 16,
        height: 16,
        borderWidth: 1.5,
        borderColor: '#555',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    infoI: {
        width: 2,
        height: 8,
        backgroundColor: '#555',
        position: 'absolute',
        borderRadius: 1,
    },
    // Logout Exit Icon
    logoutExitIcon: {
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    exitArrow: {
        width: 0,
        height: 0,
        borderTopWidth: 3,
        borderBottomWidth: 3,
        borderLeftWidth: 6,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: '#555',
    },
    exitDoor: {
        width: 8,
        height: 12,
        borderWidth: 1.5,
        borderColor: '#555',
        borderRadius: 1,
        marginLeft: 2,
        backgroundColor: 'transparent',
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    arrow: {
        width: 8,
        height: 8,
        borderTopWidth: 2,
        borderRightWidth: 2,
        borderColor: '#ccc',
        transform: [{ rotate: '45deg' }],
    },
});

//make this component available to the app
export default CustomerProfileScreen;