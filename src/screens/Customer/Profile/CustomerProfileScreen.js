//import libraries
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';  
import { rw , rh } from '../../../constants/responsive';
import { useNavigation } from '@react-navigation/native';

// create a component
const CustomerProfileScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Header Section */}
            <View style={styles.header}>
               <View style={styles.profileSection}>
                    <Image
                        source={require('../../../assets/images/profile.png')}
                        style={styles.profileImage}
                    />
                    <View>
                        <Text style={{color:'white', fontWeight:500}}>Preeti Yadav</Text>
                        <Text style={{color:'white'}}>+91 93153352806</Text>
                    </View>
               </View>
               <TouchableOpacity style={styles.helpsupport}>
                 <Text style={{color:'white', fontSize:14, fontWeight:'bold'}}>help & support</Text>
               </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Wallet and Bookings Cards */}
                <View style={styles.cardsContainer}>
                    <View style={styles.card}>
                        <Ionicons name="wallet-outline" size={32} color="#000" style={{marginBottom: 10}} />
                        <Text style={styles.cardTitle}>My Wallet</Text>
                        <Text style={styles.walletAmount}>Rs 200</Text>
                        <TouchableOpacity style={styles.addAmountButton}>
                            <Text style={styles.addAmountText}>add amount</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.card}>
                        <Ionicons name="calendar-outline" size={32} color="#000" style={{marginBottom: 10}} />
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
                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('AddressBookScreen')}>
                        <Ionicons name="book-outline" size={22} color="#555" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Address Book</Text>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PaymentMethodScreen')}>
                        <Ionicons name="card-outline" size={22} color="#555" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Manage Payment Methods</Text>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>

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

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="gift-outline" size={22} color="#555" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Refer and earn</Text>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="information-circle-outline" size={22} color="#555" style={styles.menuIcon} />
                        <Text style={styles.menuText}>About MI</Text>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="log-out-outline" size={22} color="#555" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Log out</Text>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
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
        borderRadius: 30,
        marginRight: 15,
    },
    profileInfo: {
        flex: 1,
    },
    name: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
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
