// components/CounterControl.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CounterControl = ({ 
  icon, 
  label, 
  value, 
  onIncrement, 
  onDecrement, 
  disabled = false,
  minValue = 1 
}) => {
  const handleIncrement = () => {
    if (!disabled && onIncrement) {
      onIncrement();
    }
  };

  const handleDecrement = () => {
    if (!disabled && onDecrement && value > minValue) {
      onDecrement();
    }
  };

  return (
    <View style={styles.compactControlGroup}>
      <Text style={styles.controlLabel}>
        <Ionicons name={icon} size={12} color="#666" /> {label}
      </Text>
      <View style={styles.controlButtons}>
        <TouchableOpacity 
          style={[
            styles.controlButton,
            (disabled || value <= minValue) && styles.disabledButton
          ]}
          onPress={handleDecrement}
          disabled={disabled || value <= minValue}
        >
          <Ionicons 
            name="remove" 
            size={14} 
            color={(disabled || value <= minValue) ? "#ccc" : "#666"} 
          />
        </TouchableOpacity>
        <Text style={styles.controlValue}>{value}</Text>
        <TouchableOpacity 
          style={[
            styles.controlButton,
            disabled && styles.disabledButton
          ]}
          onPress={handleIncrement}
          disabled={disabled}
        >
          <Ionicons 
            name="add" 
            size={14} 
            color={disabled ? "#ccc" : "#666"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  compactControlGroup: {
    alignItems: 'center',
    flex: 1
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  controlButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  disabledButton: {
    opacity: 0.5
  },
  controlValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    minWidth: 25,
    textAlign: 'center'
  }
});

export default CounterControl;