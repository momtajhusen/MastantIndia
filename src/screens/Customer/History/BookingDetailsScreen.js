import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
  Share
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import ServiceDetailModal from '../../../components/Cards/ServiceDetailModal';

const BookingDetailsScreen = ({navigation}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    const defaultService = {
      id: 1,
      title: "Embroidery Service",
      image: require('../../../assets/images/services/hand-embroider.png'),
      description: "Professional hand embroidery service with premium finishing."
    };

    const handleServicePress = (service) => {
      setSelectedService(service);
      setModalVisible(true);
    };

    const handleCloseModal = () => {
      setModalVisible(false);
      setSelectedService(null);
    };


    const onShare = async () => {
        try {
        const result = await Share.share({
            message: "Check out this amazing profile: Priya Sharma (Embroider) ⭐ 4.8/5. Highly recommended!",
            url: "https://yourapp.com/profile/priya-sharma" // <-- yaha apna profile link ya deep link dal sakte ho
        });

        if (result.action === Share.sharedAction) {
            if (result.activityType) {
            // shared with activity type of result.activityType
            console.log("Shared with activity type:", result.activityType);
            } else {
            // shared
            console.log("Profile shared successfully!");
            }
        } else if (result.action === Share.dismissedAction) {
            console.log("Share dismissed");
        }
        } catch (error) {
        console.log(error.message);
        }
    };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Embroidery</Text>
          <Text style={styles.headerSubtitle}>Sat june 28th at 1:42 pm</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>HELP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sosButton}>
            <Text style={styles.sosButtonText}>SOS</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Thank You Section */}
        <View style={styles.thankYouSection}>
          <Text style={styles.thankYouTitle}>Thanks for choosing{'\n'}mastani india</Text>
          <Text style={styles.paidAmount}>Paid Rs 1000</Text>
          <TouchableOpacity style={styles.viewReceiptButton}>
            <Text style={styles.viewReceiptText}>View Receipt</Text>
          </TouchableOpacity>
        </View>

        {/* Service Provider Card */}
        <TouchableOpacity style={styles.providerCard} onPress={() => navigation.navigate('ProviderProfileDetails')}>
          <View style={styles.providerInfo}>
            <Image
                source={require('../../../assets/images/user.png')}
                style={styles.providerImage}
            />
            <View style={styles.providerDetails}>
              <View style={styles.providerNameRow}>
                <Text style={styles.providerName}>Komal</Text>
                <Icon name="chevron-right" size={20} color="#666" />
              </View>
              <View style={styles.ratingRow}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.rating}>4.82</Text>
              </View>
              <View style={styles.providerActions}>
              <TouchableOpacity 
                  style={styles.bookAgainButton} 
                  onPress={() => handleServicePress(defaultService)}
                >
                  <Text style={styles.bookAgainText}>Book again</Text>
                  <Icon name="refresh" size={16} color="#666" style={styles.refreshIcon} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.shareButton} onPress={onShare}>
                  <Text style={styles.shareText}>Share Profile</Text>
                  <Icon name="share" size={16} color="#666" style={styles.shareIcon} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Booking Details Section */}
        <View style={styles.bookingDetailsSection}>
          <Text style={styles.sectionTitle}>Booking details</Text>
          
          {/* Phone Number */}
          <View style={styles.detailRow}>
            <Icon name="phone" size={20} color="#666" style={styles.detailIcon} />
            <Text style={styles.detailText}>preeti yadav, +91 9315352806</Text>
          </View>

          {/* Amount Paid */}
          <TouchableOpacity style={styles.detailRow}>
            <Icon name="receipt" size={20} color="#666" style={styles.detailIcon} />
            <Text style={styles.detailText}>Amount Paid: ₹545</Text>
            <Icon name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>

          {/* Location */}
          <View style={styles.detailRow}>
            <Icon name="location-on" size={20} color="#666" style={styles.detailIcon} />
            <Text style={styles.detailText}>
              D-3/b prithvi apartment room no. 10, 60 foota road, Dr Ambedkar Colony, Chhatarpur, New D...
            </Text>
          </View>

          {/* Date and Time */}
          <View style={styles.detailRow}>
            <Icon name="schedule" size={20} color="#666" style={styles.detailIcon} />
            <Text style={styles.detailText}>Sat. Jan 28th at 1:42 PM</Text>
          </View>
        </View>
      </ScrollView>
      {/* Service Detail Modal */}
      <ServiceDetailModal
        visible={modalVisible}
        onClose={handleCloseModal}
        service={selectedService}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '400',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  helpButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth:1,
    borderColor:'#D9D9D9',
    borderRadius: 20,
  },
  helpButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  sosButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth:1,
    borderColor:'#D9D9D9',
    borderRadius: 20,
  },
  sosButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DB0707',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  thankYouSection: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  thankYouTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    lineHeight: 20,
  },
  paidAmount: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  viewReceiptButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth:1,
    borderColor:'#D9D9D9',
    borderRadius: 10,
    marginTop: 15,
  },
  viewReceiptText: {
    fontSize: 14,
    color: '#000',
  },
  providerCard: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  providerInfo: {
    flexDirection: 'row',
  },
  providerImage: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  providerDetails: {
    flex: 1,
    marginLeft: 15,
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  providerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 5,
  },
  rating: {
    fontSize: 16,
    color: '#000',
    marginLeft: 4,
  },
  providerActions: {
    flexDirection: 'row',
    gap: 15,
  },
  bookAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth:1,
    borderColor:'#D9D9D9',
    borderRadius: 6,
  },
  bookAgainText: {
    fontSize: 14,
    color: '#000',
  },
  refreshIcon: {
    marginLeft: 5,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical:5,
    borderWidth:1,
    borderColor:'#D9D9D9',
    borderRadius: 6,
  },
  shareText: {
    fontSize: 14,
    color: '#000',
  },
  shareIcon: {
    marginLeft: 5,
  },
  bookingDetailsSection: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailIcon: {
    marginRight: 15,
    width: 20,
  },
  detailText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
  }
});

export default BookingDetailsScreen;