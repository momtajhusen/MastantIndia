//import libraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';  

// create a component
const PrivacyPolicyScreen = () => {
    const testimonialText = "Priya's designs are exceptional and her attention to detail is remarkable. She delivered the project ahead of schedule and exceeded our expectations.";

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
            </View>

            {/* Content */}
            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Repeat the testimonial text 6 times as shown in the image */}
                    {[...Array(6)].map((_, index) => (
                        <Text key={index} style={styles.testimonialText}>
                            {testimonialText}
                        </Text>
                    ))}
                </View>
            </ScrollView>

        </SafeAreaView>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#000',
        marginTop: 10,
    },
    contentContainer: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    testimonialText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
        marginBottom: 20,
        textAlign: 'left',
    }
});

//make this component available to the app
export default PrivacyPolicyScreen;