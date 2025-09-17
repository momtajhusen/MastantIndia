// components/TimePicker.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  StyleSheet,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const TimePicker = ({ selectedTime, onTimeSelect }) => {
  const [showTimePicker, setShowTimePicker] = useState(false);

  const timeOptions = [
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
  ];

  // Convert 24-hour to 12-hour format for display
  const formatTimeDisplay = (time24) => {
    const [hour, minute] = time24.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  const handleTimeSelect = (time) => {
    onTimeSelect(time);
    setShowTimePicker(false);
  };

  return (
    <View style={styles.timeSection}>
      <Text style={styles.timeSectionTitle}>
        <Ionicons name="time-outline" size={12} color="#666" /> Preferred Time
      </Text>
      
      <TouchableOpacity 
        style={styles.timePickerButton}
        onPress={() => setShowTimePicker(true)}
      >
        <Ionicons name="time-outline" size={20} color="#666" />
        <Text style={styles.timePickerButtonText}>
          {formatTimeDisplay(selectedTime)}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#666" />
      </TouchableOpacity>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.timePickerBackdrop}>
          <View style={styles.timePickerModal}>
            <View style={styles.timePickerHeader}>
              <Text style={styles.timePickerTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.timeOptionsContainer}>
              {timeOptions.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeOption,
                    selectedTime === time && styles.selectedTimeOption
                  ]}
                  onPress={() => handleTimeSelect(time)}
                >
                  <Text style={[
                    styles.timeOptionText,
                    selectedTime === time && styles.selectedTimeOptionText
                  ]}>
                    {formatTimeDisplay(time)}
                  </Text>
                  {selectedTime === time && (
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  timeSection: {
    flex: 1
  },
  timeSectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  timePickerButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  timePickerButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'center'
  },
  timePickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  timePickerModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 20,
    maxHeight: height * 0.6,
    width: width * 0.8
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000'
  },
  timeOptionsContainer: {
    maxHeight: height * 0.4
  },
  timeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5'
  },
  selectedTimeOption: {
    backgroundColor: '#000'
  },
  timeOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500'
  },
  selectedTimeOptionText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});

export default TimePicker;