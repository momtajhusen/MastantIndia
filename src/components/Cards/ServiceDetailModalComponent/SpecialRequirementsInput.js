// components/SpecialRequirementsInput.js
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SpecialRequirementsInput = ({ 
  value, 
  onChangeText, 
  placeholder = "Any specific requirements..." 
}) => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Ionicons name="clipboard-outline" size={16} color="#666" />
        <Text style={styles.sectionTitle}>Special Requirements (Optional)</Text>
      </View>
      <TextInput
        style={styles.compactTextInput}
        placeholder={placeholder}
        multiline={true}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#999"
        textAlignVertical="top"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 6
  },
  compactTextInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 60,
    textAlignVertical: 'top'
  }
});

export default SpecialRequirementsInput;