// components/PriceDisplay.js
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PriceDisplay = ({ 
  priceCalculation, 
  calculatingPrice, 
  compact = false 
}) => {
  if (compact) {
    return (
      <View style={styles.compactPriceGroup}>
        {calculatingPrice ? (
          <ActivityIndicator size="small" color="#000" />
        ) : priceCalculation ? (
          <>
            <Text style={styles.compactPriceLabel}>
              <Ionicons name="cash-outline" size={12} color="#666" /> Total
            </Text>
            <Text style={styles.compactPrice}>Rs {priceCalculation.final_price}</Text>
          </>
        ) : (
          <Text style={styles.compactPriceLabel}>Calculating...</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.totalDisplay}>
      <Text style={styles.totalLabel}>
        <Ionicons name="calculator-outline" size={14} color="#666" /> Total
      </Text>
      <Text style={styles.bottomTotalPrice}>
        Rs {priceCalculation ? priceCalculation.final_price : '0'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  compactPriceGroup: {
    alignItems: 'center',
    flex: 1
  },
  compactPriceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center'
  },
  compactPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000'
  },
  totalDisplay: {
    alignItems: 'flex-start'
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center'
  },
  bottomTotalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000'
  }
});

export default PriceDisplay;