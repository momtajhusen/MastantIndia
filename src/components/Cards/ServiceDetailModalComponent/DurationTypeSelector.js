// components/DurationTypeSelector.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DurationTypeSelector = ({ 
  selectedDurationType, 
  onDurationTypeChange, 
  durationValue 
}) => {
  const durationTypes = [
    { key: 'hour', label: 'Hourly', minValue: 4, maxValue: 12, icon: 'time-outline' },
    { key: 'day', label: 'Daily', minValue: 1, maxValue: 30, icon: 'calendar-outline' },
    { key: 'week', label: 'Weekly', minValue: 1, maxValue: 12, icon: 'calendar-number-outline' },
    { key: 'month', label: 'Monthly', minValue: 1, maxValue: 12, icon: 'calendar' },
    { key: 'full_time', label: 'Full Time', minValue: 1, maxValue: 1, icon: 'briefcase-outline' }
  ];

  const getCurrentDurationType = () => {
    return durationTypes.find(type => type.key === selectedDurationType);
  };

  const handleDurationTypeChange = (durationType) => {
    const typeConfig = durationTypes.find(type => type.key === durationType);
    onDurationTypeChange(durationType, typeConfig?.minValue || 1);
  };

  return (
    <>
      {/* Duration Type Pills */}
      <View style={styles.durationTypeContainer}>
        {durationTypes.map((durationType) => (
          <TouchableOpacity 
            key={durationType.key}
            style={[
              styles.durationTypePill,
              selectedDurationType === durationType.key && styles.selectedDurationTypePill
            ]}
            onPress={() => handleDurationTypeChange(durationType.key)}
          >
            <Ionicons 
              name={durationType.icon} 
              size={12} 
              color={selectedDurationType === durationType.key ? '#fff' : '#666'}
              style={styles.durationTypeIcon}
            />
            <Text style={[
              styles.durationTypeText,
              selectedDurationType === durationType.key && styles.selectedDurationTypeText
            ]}>
              {durationType.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Selected Duration Type Display */}
      <View style={styles.selectedDurationDisplay}>
        <Text style={styles.selectedDurationText}>
          Selected: {getCurrentDurationType()?.label} ({durationValue} {
            selectedDurationType === 'hour' ? 'hours' : 
            selectedDurationType === 'day' ? 'days' : 
            selectedDurationType === 'week' ? 'weeks' : 
            selectedDurationType === 'month' ? 'months' : 'year'
          })
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  durationTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12
  },
  durationTypePill: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center'
  },
  selectedDurationTypePill: {
    backgroundColor: '#000',
    borderColor: '#000'
  },
  durationTypeIcon: {
    marginRight: 4
  },
  durationTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666'
  },
  selectedDurationTypeText: {
    color: '#fff'
  },
  selectedDurationDisplay: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15
  },
  selectedDurationText: {
    fontSize: 13,
    color: '#0066cc',
    fontWeight: '500',
    textAlign: 'center'
  }
});

export default DurationTypeSelector;