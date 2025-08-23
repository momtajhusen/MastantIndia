//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

// create a component
const PaymentMethodScreen = () => {
    const navigation = useNavigation();
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Wallet</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Payment Methods Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment methods</Text>
                    
                    {/* YBL Payment */}
                    <TouchableOpacity style={styles.paymentItem}>
                        <View style={styles.paymentLeft}>
                            <View style={[styles.paymentIcon, { backgroundColor: '#8B5CF6' }]}>
                                <Text style={styles.paymentIconText}>₹</Text>
                            </View>
                            <Text style={styles.paymentText}>9315352806@ybl</Text>
                        </View>
                        <Icon name="chevron-right" size={24} color="#666666" />
                    </TouchableOpacity>

                    {/* GPay Payment */}
                    <TouchableOpacity style={styles.paymentItem}>
                        <View style={styles.paymentLeft}>
                            <View style={[styles.paymentIcon, { backgroundColor: '#4285F4' }]}>
                                <Text style={styles.gPayText}>G Pay</Text>
                            </View>
                            <Text style={styles.paymentText}>preetiyadav4200532-1@oksbi</Text>
                        </View>
                        <Icon name="chevron-right" size={24} color="#666666" />
                    </TouchableOpacity>

                    {/* Cash Payment */}
                    <TouchableOpacity style={styles.paymentItem}>
                        <View style={styles.paymentLeft}>
                            <View style={[styles.paymentIcon, { backgroundColor: '#10B981' }]}>
                                <MaterialCommunityIcons name="cash" size={16} color="#ffffff" />
                            </View>
                            <Text style={styles.paymentText}>Cash</Text>
                        </View>
                        <Icon name="chevron-right" size={24} color="#666666" />
                    </TouchableOpacity>

                    {/* UPI Scan and Pay */}
                    <TouchableOpacity style={styles.paymentItem}>
                        <View style={styles.paymentLeft}>
                            <View style={styles.paymentIcon}>
                                <MaterialCommunityIcons name="qrcode-scan" size={16} color="#ffffff" />
                            </View>
                            <Text style={styles.paymentText}>UPI Scan and Pay</Text>
                        </View>
                        <Icon name="chevron-right" size={24} color="#666666" />
                    </TouchableOpacity>

                    {/* Add Payment Method Button */}
                    <TouchableOpacity style={styles.addPaymentButton}>
                        <Icon name="add" size={20} color="#ffffff" />
                        <Text style={styles.addPaymentText}>Add payment method</Text>
                    </TouchableOpacity>
                </View>

                {/* Trip Profiles Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Trip profiles</Text>
                    
                    {/* Personal Profile */}
                    <TouchableOpacity style={styles.profileItem}>
                        <View style={styles.profileLeft}>
                            <View style={styles.profileIcon}>
                                <Icon name="person" size={16} color="#ffffff" />
                            </View>
                            <Text style={styles.profileText}>Personal</Text>
                        </View>
                        <Icon name="chevron-right" size={24} color="#666666" />
                    </TouchableOpacity>

                    {/* Business Profile */}
                    <TouchableOpacity style={styles.profileItem}>
                        <View style={styles.profileLeft}>
                            <View style={[styles.profileIcon, { backgroundColor: '#666666' }]}>
                                <MaterialCommunityIcons name="briefcase" size={16} color="#ffffff" />
                            </View>
                            <View>
                                <Text style={styles.profileText}>Start using Uber for Business</Text>
                                <Text style={styles.profileSubtext}>Turn on business travel features</Text>
                            </View>
                        </View>
                        <Icon name="chevron-right" size={24} color="#666666" />
                    </TouchableOpacity>
                </View>

                {/* Shared with you Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Shared with you</Text>
                    
                    {/* Manage Business Rides */}
                    <TouchableOpacity style={styles.profileItem}>
                        <View style={styles.profileLeft}>
                            <View style={[styles.profileIcon, { backgroundColor: '#666666' }]}>
                                <MaterialCommunityIcons name="account-multiple" size={16} color="#ffffff" />
                            </View>
                            <View>
                                <Text style={styles.profileText}>Manage business rides for others</Text>
                                <Text style={styles.profileSubtext}>Request access to their business profile</Text>
                            </View>
                        </View>
                        <Icon name="chevron-right" size={24} color="#666666" />
                    </TouchableOpacity>
                </View>

                {/* Vouchers Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Vouchers</Text>
                    
                    {/* Vouchers Item */}
                    <TouchableOpacity style={styles.voucherItem}>
                        <View style={styles.voucherLeft}>
                            <View style={styles.voucherIcon}>
                                <MaterialCommunityIcons name="ticket" size={16} color="#ffffff" />
                            </View>
                            <Text style={styles.voucherText}>Vouchers</Text>
                        </View>
                        <View style={styles.voucherRight}>
                            <Text style={styles.voucherCount}>0</Text>
                            <Icon name="chevron-right" size={24} color="#666666" />
                        </View>
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
        backgroundColor: '#1a1a1a',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#1a1a1a',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 9,
    },
    paymentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    paymentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentIcon: {
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: '#333333',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    paymentIconText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    gPayText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    paymentText: {
        fontSize: 16,
        color: '#ffffff',
    },
    addPaymentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#333333',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        marginTop: 15,
        alignSelf: 'flex-start',
    },
    addPaymentText: {
        fontSize: 14,
        color: '#ffffff',
        marginLeft: 8,
    },
    profileItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    profileLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    profileIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#333333',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    profileText: {
        fontSize: 16,
        color: '#ffffff',
    },
    profileSubtext: {
        fontSize: 14,
        color: '#7c83bf',
        marginTop: 2,
    },
    voucherItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
    },
    voucherLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    voucherIcon: {
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: '#333333',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    voucherText: {
        fontSize: 16,
        color: '#ffffff',
    },
    voucherRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    voucherCount: {
        fontSize: 16,
        color: '#ffffff',
        marginRight: 10,
    },
});

//make this component available to the app
export default PaymentMethodScreen;