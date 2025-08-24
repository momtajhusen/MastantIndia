//import libraries
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { useNavigation, useRoute } from '@react-navigation/native';

// Import separate screens
import ActiveScreen from './ActiveScreen';
import UpcomingScreen from './UpcomingScreen';

const ActiveUpcomingServices = () => {
    const route = useRoute();
    const [activeTab, setActiveTab] = useState('Active');

    // Agar navigation se param mile to set tab
    useEffect(() => {
        if(route.params?.initialTab) {
            setActiveTab(route.params.initialTab);
        }
    }, [route.params]);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with Tabs */}
            <View style={styles.header}>
                <View style={styles.tabContainer}>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'Active' && styles.activeTab]}
                        onPress={() => setActiveTab('Active')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Active' && styles.activeTabText]}>
                            Active
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'Upcoming' && styles.activeTab]}
                        onPress={() => setActiveTab('Upcoming')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Upcoming' && styles.activeTabText]}>
                            Upcoming
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content based on active tab */}
            <View style={styles.screenContainer}>
                {activeTab === 'Active' ? <ActiveScreen /> : <UpcomingScreen />}
            </View>
        </SafeAreaView>
    );
};

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
    tabContainer: {
        flexDirection: 'row',
        marginTop: 10,
    },
    tab: {
        paddingVertical: 15,
        paddingHorizontal: 0,
        marginRight: 40,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#000',
    },
    tabText: {
        fontSize: 24,
        fontWeight: '400',
        color: '#999',
    },
    activeTabText: {
        color: '#000',
        fontWeight: '500',
    },
    screenContainer: {
        flex: 1,
    },
});

export default ActiveUpcomingServices;
