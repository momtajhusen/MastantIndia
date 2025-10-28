import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AboutScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>About MI</Text>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.contentContainer} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Main Title */}
          <Text style={styles.mainTitle}>About Mastant India</Text>

          {/* Tagline */}
          <Text style={styles.tagline}>
            Empowering Artisans. Redefining Indian Craft.
          </Text>

          {/* Content Sections */}
          <Text style={styles.sectionText}>
            Mastant India is reimagining the future of Indian craftsmanship. 
            We're on a mission to empower artisans, elevate traditional skills, 
            and bring Indian craft to the global stage through innovation, design, 
            and technology.
          </Text>

          <Text style={styles.sectionText}>
            We connect skilled makers with modern markets — enabling them to grow 
            sustainably, earn fairly, and take pride in their craft. Our platform 
            celebrates authenticity, transparency, and the stories behind every 
            handmade creation.
          </Text>

          <Text style={styles.sectionText}>
            By merging India's rich heritage with a contemporary vision, we're not 
            just preserving craft — we're building a new economy around it.
          </Text>

          <Text style={styles.sectionText}>
            Mastant India stands for dignity in creation, beauty in detail, and 
            progress for every artisan.
          </Text>

          {/* Closing Statement */}
          <Text style={styles.closingStatement}>
            Crafting the Future of Indian Heritage.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '600',
    // color: '#059669',
    marginBottom: 20,
    lineHeight: 24,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 26,
    color: '#374151',
    marginBottom: 18,
    textAlign: 'left',
    fontWeight: '400',
  },
  closingStatement: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 10,
    marginBottom: 30,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
});

export default AboutScreen;