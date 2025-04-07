import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URLS from "./ApiConfig";
import StarRating from 'react-native-star-rating-widget';


export default function HotelDetailsScreen({ route, navigation }) {
  const { hotel } = route.params;
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const parsePriceRange = (priceStr) => {
    if (!priceStr || typeof priceStr !== 'string') return { min: 0, max: 0 };
    const parts = priceStr.split('-').map(p => parseInt(p.trim(), 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { min: parts[0], max: parts[1] };
    }
    return { min: 0, max: 0 };
  };

  const fetchHotelDetails = async (hotelId) => {
    const token = await AsyncStorage.getItem("accessToken");

    try {
      setLoading(true);
      setError(null);

      const url = `${API_URLS.BASE_URL}/hotels/hotels/${hotelId}/`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        console.log("✅ Hotel Details Fetched:", result);
        setApiData(result);
      } else {
        console.error("❌ Fetch Failed:", result);

        let errorMessage = "Please try again";
        if (result.detail) errorMessage = result.detail;
        else if (result.message) errorMessage = result.message;
        else if (typeof result === "object") {
          const firstKey = Object.keys(result)[0];
          if (firstKey) {
            const firstError = result[firstKey];
            errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
          }
        }

        setError(errorMessage);
        Alert.alert("Error", errorMessage);
      }
    } catch (err) {
      console.error("❌ API Failed:", err);
      setError("Failed to load hotel details.");
      Alert.alert("Connection Error", "Could not connect to the server. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hotel?.id) {
      fetchHotelDetails(hotel.id);
    } else {
      setError("Hotel ID not found.");
      setLoading(false);
    }
  }, [hotel]);

  if (loading) {
    return (
      <ImageBackground source={require("../assets/background1.jpg")} style={styles.bg}>
        <View style={styles.overlay} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#F5C77A" />
          <Text style={{ color: "#fff", marginTop: 15 }}>Loading hotel details...</Text>
        </View>
      </ImageBackground>
    );
  }

  if (error) {
    return (
      <ImageBackground source={require("../assets/background1.jpg")} style={styles.bg}>
        <View style={styles.overlay} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#ff6b6b", fontSize: 16 }}>{error}</Text>
        </View>
      </ImageBackground>
    );
  }

  const priceRange = parsePriceRange(apiData?.price_range || hotel?.price_range);
  const displayName = apiData?.name || hotel?.name;
  const displayRating = apiData?.rating || hotel?.rating || 0;
  const displayShortInfo = apiData?.short_info || hotel?.short_info;

  return (
    <ImageBackground
      source={require("../assets/background1.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.name}>{displayName}</Text>
        <StarRating
            rating={parseFloat(displayRating) || 0}
            onChange={() => {}}
            maxStars={5}
            starSize={22}
            color="#FFD166"
            emptyColor="rgba(255,255,255,0.3)"
            enableHalfStar={true}
            disabled={true}
          />
          <Text style={styles.ratingText}>{parseFloat(displayRating) || 0}/5</Text>


        <Text style={styles.price}>
          ${priceRange.min} – ${priceRange.max}
          <Text style={styles.perNight}> / night</Text>
        </Text>

        <Text style={styles.description}>
          {displayShortInfo || "No description available."}
        </Text>

        {apiData?.pictures && apiData.pictures.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Hotel Gallery</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.roomScroll}
            >
              {apiData.pictures.map((pic, index) => (
                <Image
                  key={index}
                  source={{ uri: `${API_URLS.BASE_URL_PIC}/${pic.image}` }}
                  style={styles.roomImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </>
        )}

        {apiData?.room_types && apiData.room_types.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Available Room Types</Text>
            {apiData.room_types.map((room, index) => (
              <View key={index} style={styles.roomTypeCard}>
                <Text style={styles.roomTypeName}>{room.room_type} Room</Text>
                <Text style={styles.roomTypeDetail}>Capacity: {room.people_per_room} people</Text>
                <Text style={styles.roomTypeDetail}>
                  Rooms Available: {room.rooms_available} / {room.total_rooms}
                </Text>
                <Text style={styles.roomTypePrice}>
                  ${parseFloat(room.price)} / night
                </Text>
              </View>
            ))}
          </>
        )}

        <TouchableOpacity
          style={styles.bookButton}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("Booking", { hotel: apiData || hotel })}
        >
          <Text style={styles.bookText}>Book Hotel</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  container: {
    padding: 24,
    paddingTop: 50,
    paddingBottom: 60,
  },
  name: {
    fontSize: 30,
    fontWeight: "800",
    color: "#F5C77A",
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
    marginLeft: 6,
  },
  price: {
    fontSize: 22,
    fontWeight: "600",
    color: "#F9FAFB",
    marginBottom: 20,
  },
  perNight: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  description: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 24,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 14,
    marginTop: 10,
  },
  roomScroll: {
    marginBottom: 30,
  },
  roomImage: {
    width: 260,
    height: 160,
    borderRadius: 5,
    marginRight: 14,
  },
  roomTypeCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  roomTypeName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#F5C77A",
    marginBottom: 6,
  },
  roomTypeDetail: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 4,
  },
  roomTypePrice: {
    fontSize: 17,
    fontWeight: "700",
    color: "#90EE90",
    marginTop: 8,
  },
  bookButton: {
    backgroundColor: "#E0B35A",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 30,
  },
  bookText: {
    color: "#1B1B1B",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
});