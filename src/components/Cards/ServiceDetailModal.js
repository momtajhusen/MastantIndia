import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { rh, rw, rf } from '../../constants/responsive';

const { width, height } = Dimensions.get('window');

const ServiceDetailModal = ({ visible, onClose, service }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState('2000');

  // Sample calendar data
  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    const firstDay = date.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate();
      days.push({
        day: prevMonthDays - firstDay + i + 1,
        isCurrentMonth: false,
        date: new Date(prevYear, prevMonth, prevMonthDays - firstDay + i + 1)
      });
    }
    
    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }
    
    // Add days from next month to complete the grid
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(nextYear, nextMonth, i)
      });
    }
    
    return days;
  };

  const calendarDays = getDaysInMonth(2000, 0); // January 2000
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const additionalServices = [
    { id: 2, title: 'Machine Embroider', image: require('../../assets/images/services/machine-embroider.png') },
    { id: 3, title: 'Tailor', image: require('../../assets/images/services/tailor.png') },
    { id: 4, title: 'Khaka Maker', image: require('../../assets/images/services/khaka-maker.png') },
    { id: 6, title: 'Ironing Master', image: require('../../assets/images/services/ironing-master.png') },
    { id: 7, title: 'Cutting Master', image: require('../../assets/images/services/cutting-master.png') },
    { id: 8, title: 'Trimming lady', image: require('../../assets/images/services/trimming-lady.png') },
    { id: 5, title: 'Pattern Maker', image: require('../../assets/images/services/pattern-maker.png') },
    { id: 9, title: 'Helpers', image: require('../../assets/images/services/helpers.png') },
  ];

  if (!service) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.serviceSubtitle}>Professional Hand Embroiders</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {/* Service Info Cards */}
            <View style={styles.infoContainer}>
              <View style={styles.infoCard}>
                <Text style={styles.infoValue}>8 hrs</Text>
                <Text style={styles.infoLabel}>estimated time</Text>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoValue}>Rs 650</Text>
                <Text style={styles.infoLabel}>starting price</Text>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoValue}>4.8/5</Text>
                <Text style={styles.infoLabel}>rating</Text>
              </View>
            </View>

            {/* Pricing Options */}
            <View style={styles.pricingContainer}>
              <View style={styles.pricingCard}>
                <Text style={styles.pricingTitle}>get instant</Text>
                <Text style={styles.pricingPrice}>Rs 100/ph</Text>
              </View>
              <View style={styles.pricingCard}>
                <Text style={styles.pricingTitle}>custom days</Text>
                <Text style={styles.pricingPrice}>Rs 750/pd</Text>
              </View>
              <View style={styles.pricingCard}>
                <Text style={styles.pricingTitle}>15 days</Text>
                <Text style={styles.pricingPrice}>Rs 700/pd</Text>
              </View>
              <View style={styles.pricingCard}>
                <Text style={styles.pricingTitle}>- monthly +</Text>
                <Text style={styles.pricingPrice}>Rs 600/pd</Text>
              </View>
            </View>

            {/* Calendar */}
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <Text style={styles.monthTitle}>Month {currentMonth}</Text>
                <View style={styles.calendarNavigation}>
                  <TouchableOpacity style={styles.navButton}>
                    <Ionicons name="chevron-back" size={20} color="#333" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.navButton}>
                    <Ionicons name="chevron-forward" size={20} color="#333" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Week Days */}
              <View style={styles.weekDaysContainer}>
                {weekDays.map((day, index) => (
                  <Text key={index} style={styles.weekDay}>{day}</Text>
                ))}
              </View>

              {/* Calendar Grid */}
              <View style={styles.calendarGrid}>
                {calendarDays.map((dayObj, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.calendarDay,
                      !dayObj.isCurrentMonth && styles.inactiveDay,
                      selectedDate === dayObj.day && dayObj.isCurrentMonth && styles.selectedDay
                    ]}
                    onPress={() => dayObj.isCurrentMonth && setSelectedDate(dayObj.day)}
                  >
                    <Text style={[
                      styles.calendarDayText,
                      !dayObj.isCurrentMonth && styles.inactiveDayText,
                      selectedDate === dayObj.day && dayObj.isCurrentMonth && styles.selectedDayText
                    ]}>
                      {dayObj.day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Add Services Section */}
            <View style={styles.addServicesContainer}>
              <Text style={styles.addServicesTitle}>add services</Text>
              
              <View style={styles.servicesGrid}>
                {additionalServices.map((item) => (
                  <View key={item.id} style={styles.additionalServiceCard}>
                    <Image 
                      source={item.image} 
                      style={styles.additionalServiceImage}
                      resizeMode="cover"
                    />
                    <Text style={styles.additionalServiceTitle}>{item.title}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Fixed Bottom Checkout Section */}
          <View style={styles.checkoutSection}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>Rs 20000</Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton}>
              <Text style={styles.checkoutButtonText}>check out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.85,
    maxHeight: height * 0.85,
    flex: 0, // Important change
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  serviceSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 20, // Added for better spacing
    flexGrow: 1, // Important change
  },
  infoContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoCard: {
    flex: 1,
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  pricingContainer: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pricingCard: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  pricingTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  pricingPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  calendarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  calendarNavigation: {
    flexDirection: 'row',
  },
  navButton: {
    marginLeft: 10,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  inactiveDay: {
    opacity: 0.3,
  },
  selectedDay: {
    backgroundColor: '#000',
    borderRadius: 20,
  },
  calendarDayText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  inactiveDayText: {
    color: '#ccc',
  },
  selectedDayText: {
    color: '#fff',
  },
  addServicesContainer: {
    paddingHorizontal: 20,
  },
  addServicesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 15,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  additionalServiceCard: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 20,
  },
  additionalServiceImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  additionalServiceTitle: {
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 12,
  },
  checkoutSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  totalContainer: {
    alignItems: 'flex-start',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  checkoutButton: {
    backgroundColor: '#000',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 10,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ServiceDetailModal;