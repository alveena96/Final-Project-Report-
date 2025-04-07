import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URLS from './ApiConfig';

import StarRating from 'react-native-star-rating-widget';


export default function HotelListScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [apiError, setApiError] = useState(null);

  const fetchNearbyHotels = async (lat, lng) => {
    const token = await AsyncStorage.getItem("accessToken");

    if (!token) {
      setApiError("Please login again");
      Alert.alert("Authentication Error", "Session expired. Please login again.");
      return;
    }

    try {
      setApiError(null);
      console.log('📡 API Request with:', { lat, lng });

      const response = await fetch(`${API_URLS.BASE_URL}/hotels/hotels-nearby/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ lat, lng }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        console.log('✅ API Response:', data);
        setHotels(data);
      } else {
        let errorMessage = "Failed to fetch nearby hotels";

        if (data.detail) errorMessage = data.detail;
        else if (data.message) errorMessage = data.message;
        else if (data.non_field_errors?.[0]) errorMessage = data.non_field_errors[0];
        else if (data.error) errorMessage = data.error;

        if (response.status === 401) errorMessage = "Session expired. Please login again.";
        else if (response.status === 403) errorMessage = "You don't have permission to access this.";
        else if (response.status === 404) errorMessage = "No hotels found nearby.";

        console.error('❌ API Error:', { status: response.status, data });
        setApiError(errorMessage);
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('❌ Network/API Error:', error);
      const networkErrorMsg = "Unable to connect to server. Please check your internet connection.";
      setApiError(networkErrorMsg);
      Alert.alert('Connection Error', networkErrorMsg);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      setLocationError(null);
      setApiError(null);

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setLocationError('Location services are OFF. Enable GPS (High Accuracy).');
        setLoading(false);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied.');
        setLoading(false);
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 15000,
      });

      const { latitude, longitude } = locationData.coords;
      setCurrentLocation({ latitude, longitude });
      console.log('📍 Location:', latitude, longitude);

      await fetchNearbyHotels(latitude, longitude);
    } catch (error) {
      console.error('Location Error:', error);
      setLocationError('Failed to get location. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const filteredHotels = hotels.filter((hotel) =>
    hotel.name?.toLowerCase().includes(query.toLowerCase()) ||
    hotel.short_info?.toLowerCase().includes(query.toLowerCase()) ||
    hotel.price_range?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <ImageBackground
      source={require('../assets/background1.jpg')}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <View style={styles.container}>
        <Text style={styles.heading}>Nearby Hotels</Text>

        {loading && (
          <Text style={styles.statusText}>📍 Getting location & loading hotels...</Text>
        )}

        {currentLocation && (
          <Text style={styles.locationSuccess}>
            📍 {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
          </Text>
        )}

        {locationError && (
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.errorText}>{locationError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={getCurrentLocation}>
              <Text style={styles.retryText}>🔄 Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {apiError && <Text style={styles.errorText}>{apiError}</Text>}

        <TextInput
          placeholder="Search hotel name"
          placeholderTextColor="rgba(255,255,255,0.6)"
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
        />

        {filteredHotels.length === 0 && !loading && (
          <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>
            No hotels found
          </Text>
        )}

        <FlatList
          data={filteredHotels}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('HotelDetails', { hotel: item })}
            >
              <Text style={styles.hotelName}>{item.name}</Text>

             <StarRating
                rating={parseFloat(item.rating) || 0}
                onChange={() => {}}
                maxStars={5}
                starSize={18}
                color="#FFD166"
                emptyColor="rgba(255,255,255,0.3)"
                enableHalfStar={true}
                disabled={true}
              />
              <Text style={styles.ratingText}>{parseFloat(item.rating) || 0}/5</Text>

              <Text style={styles.price}>
                {item.price_range}
                <Text style={styles.perNight}> / night</Text>
              </Text>

              {item.short_info && (
                <Text style={styles.shortInfo}>{item.short_info}</Text>
              )}

              <Text style={styles.tapHint}>Tap to view details</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#F5E2C8',
  },
  searchInput: {
    height: 48,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  hotelName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 6,
  },

  ratingText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    marginLeft: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F5C77A',
  },
  perNight: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  shortInfo: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    marginBottom: 6,
  },
  tapHint: {
    marginTop: 8,
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
  },
  statusText: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
  },
  locationSuccess: {
    color: '#90EE90',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 13,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 13,
  },
  retryButton: {
    backgroundColor: '#FFD166',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'center',
  },
  retryText: {
    color: '#000',
    fontWeight: '600',
  },
});