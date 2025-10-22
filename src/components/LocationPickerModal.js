import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { X, Crosshair, Search, MapPin, Layers } from 'lucide-react-native';

const LocationPickerModal = ({
  visible,
  onClose,
  onConfirm,
  initialLocation = null,
  initialAddress = '',
}) => {
  const [tempLocation, setTempLocation] = useState(initialLocation);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [mapType, setMapType] = useState('standard');
  const [showMapTypeSelector, setShowMapTypeSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [locationData, setLocationData] = useState({
    country: '',
    city: '',
    state: '',
    pincode: '',
  });

  const mapRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const MAP_TYPES = [
    { id: 'standard', label: 'Standard', icon: '🗺️' },
    { id: 'satellite', label: 'Satellite', icon: '🛰️' },
    { id: 'hybrid', label: 'Hybrid', icon: '🌍' },
    { id: 'terrain', label: 'Terrain', icon: '⛰️' },
  ];

  useEffect(() => {
    if (visible) {
      if (initialLocation) {
        setTempLocation(initialLocation);
        setSearchQuery(initialAddress);
      } else {
        initializeLocation();
      }
    }
  }, [visible]);

  const initializeLocation = async () => {
    setIsGettingLocation(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const { latitude, longitude } = location.coords;
        setTempLocation({ latitude, longitude });
        await reverseGeocode(latitude, longitude);
      } else {
        setTempLocation({ latitude: 28.6139, longitude: 77.2090 });
        Alert.alert('Permission Denied', 'Using default location (Delhi, India)');
      }
    } catch (error) {
      console.error('Auto location error:', error);
      setTempLocation({ latitude: 28.6139, longitude: 77.2090 });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setTempLocation({ latitude, longitude });
    reverseGeocode(latitude, longitude);
  };

  const getCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        setIsGettingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      setTempLocation({ latitude, longitude });

      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
          },
          1000
        );
      }

      await reverseGeocode(latitude, longitude);
      setIsGettingLocation(false);
    } catch (error) {
      console.error('Location error:', error);
      setIsGettingLocation(false);
      Alert.alert('Error', 'Unable to get your current location.');
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (result && result[0]) {
        const address = result[0];

        const newLocationData = {
          country: address.country || '',
          city: address.city || '',
          state: address.region || '',
          pincode: address.postalCode || '',
        };

        setLocationData(newLocationData);

        const formattedAddress = [
          address.name,
          address.street,
          address.city,
          address.region,
          address.country,
        ]
          .filter(Boolean)
          .join(', ');

        setSearchQuery(formattedAddress || 'Location selected');
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
      setSearchQuery('Location selected');
    }
  };

  const searchPlaces = async (text) => {
    setSearchQuery(text);

    if (text.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      setShowResults(false);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            text
          )}&limit=10&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'CompanyLocationApp/1.0',
            },
          }
        );

        const data = await response.json();

        if (data && data.length > 0) {
          setSearchResults(data);
          setShowResults(true);
        } else {
          setSearchResults([]);
          setShowResults(false);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 800);
  };

  const selectPlace = async (place) => {
    const latitude = parseFloat(place.lat);
    const longitude = parseFloat(place.lon);

    setTempLocation({ latitude, longitude });
    setSearchQuery(place.display_name);
    setShowResults(false);
    setSearchResults([]);
    Keyboard.dismiss();

    const newLocationData = {
      country: place.address?.country || '',
      city: place.address?.city || '',
      state: place.address?.state || '',
      pincode: place.address?.postcode || '',
    };

    setLocationData(newLocationData);

    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  };

  const handleConfirm = () => {
    if (!tempLocation) {
      Alert.alert('Error', 'Please select a location first.');
      return;
    }

    onConfirm({
      location: tempLocation,
      address: searchQuery,
      locationData: locationData,
    });

    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setShowMapTypeSelector(false);
    onClose();
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => selectPlace(item)}
      activeOpacity={0.7}
    >
      <MapPin color="#6b7280" size={18} />
      <View style={styles.searchResultText}>
        <Text style={styles.resultMainText} numberOfLines={2}>
          {item.display_name}
        </Text>
        {item.address && (
          <Text style={styles.resultSecondaryText} numberOfLines={1}>
            {[item.address.city, item.address.state, item.address.country]
              .filter(Boolean)
              .join(', ')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const MapTypeButton = ({ type, isSelected, onPress }) => (
    <TouchableOpacity
      style={[styles.mapTypeButton, isSelected && styles.mapTypeButtonSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.mapTypeIcon}>{type.icon}</Text>
      <Text style={[styles.mapTypeLabel, isSelected && styles.mapTypeLabelSelected]}>
        {type.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select Location</Text>
          <TouchableOpacity onPress={handleClose}>
            <X color="#000" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchRow}>
            <View style={styles.searchInputContainer}>
              <Search color="#6b7280" size={20} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search anywhere in the world..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={searchPlaces}
                autoCorrect={false}
                autoCapitalize="words"
              />
              {isSearching && <ActivityIndicator size="small" color="#3b82f6" />}
              {searchQuery.length > 0 && !isSearching && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowResults(false);
                  }}
                >
                  <X color="#6b7280" size={18} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={getCurrentLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Crosshair color="#ffffff" size={20} />
              )}
            </TouchableOpacity>
          </View>

          {showResults && searchResults.length > 0 && (
            <View style={styles.searchResultsContainer}>
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item, index) => `${item.place_id}-${index}`}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              />
            </View>
          )}

          {isSearching && searchQuery.length >= 3 && (
            <View style={styles.searchingIndicator}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.searchingText}>Searching...</Text>
            </View>
          )}
        </View>

        {isGettingLocation ? (
          <View style={styles.loadingMapContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Getting your location...</Text>
          </View>
        ) : tempLocation ? (
          <>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: tempLocation.latitude,
                longitude: tempLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              mapType={mapType}
              onPress={handleMapPress}
              showsUserLocation={true}
              showsMyLocationButton={false}
            >
              <Marker
                coordinate={tempLocation}
                title="Selected Location"
                draggable
                onDragEnd={handleMapPress}
              />
            </MapView>

            <TouchableOpacity
              style={styles.mapTypeToggleButton}
              onPress={() => setShowMapTypeSelector(!showMapTypeSelector)}
              activeOpacity={0.9}
            >
              <Layers color="#ffffff" size={20} />
            </TouchableOpacity>

            {showMapTypeSelector && (
              <View style={styles.mapTypeSelectorPanel}>
                <Text style={styles.mapTypePanelTitle}>Map Type</Text>
                <View style={styles.mapTypeGrid}>
                  {MAP_TYPES.map((type) => (
                    <MapTypeButton
                      key={type.id}
                      type={type}
                      isSelected={mapType === type.id}
                      onPress={() => {
                        setMapType(type.id);
                        setShowMapTypeSelector(false);
                      }}
                    />
                  ))}
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={styles.loadingMapContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        )}

        {tempLocation && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              {tempLocation.latitude.toFixed(6)}, {tempLocation.longitude.toFixed(6)}
            </Text>
            <Text style={styles.locationHint}>
              Tap anywhere on map or search to select location
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.confirmButton, !tempLocation && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={!tempLocation}
        >
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  searchSection: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  currentLocationButton: {
    backgroundColor: '#10b981',
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultsContainer: {
    backgroundColor: '#ffffff',
    maxHeight: 300,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
    backgroundColor: '#ffffff',
  },
  searchResultText: {
    flex: 1,
  },
  resultMainText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 18,
  },
  resultSecondaryText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  searchingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  searchingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  map: {
    flex: 1,
  },
  locationInfo: {
    padding: 14,
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  locationHint: {
    fontSize: 12,
    color: '#6b7280',
  },
  confirmButton: {
    backgroundColor: '#10b981',
    margin: 16,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingMapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  mapTypeToggleButton: {
    position: 'absolute',
    top: 170,
    right: 16,
    backgroundColor: '#3b82f6',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  mapTypeSelectorPanel: {
    position: 'absolute',
    top: 190,
    right: 60,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    minWidth: 200,
  },
  mapTypePanelTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  mapTypeGrid: {
    gap: 8,
  },
  mapTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  mapTypeButtonSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  mapTypeIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  mapTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    flex: 1,
  },
  mapTypeLabelSelected: {
    color: '#1e40af',
  },
});

export default LocationPickerModal;