import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MyBookingScreen() {
  const [bookings, setBookings] = useState([]);

  const loadBookings = async () => {
    const saved = await AsyncStorage.getItem("USER_BOOKINGS");
    if (saved) {
      setBookings(JSON.parse(saved));
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (id) => {
    const updated = bookings.filter((item) => item.id !== id);
    setBookings(updated);
    await AsyncStorage.setItem("USER_BOOKINGS", JSON.stringify(updated));
  };

  if (bookings.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>No bookings yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.hotel}>{item.hotelName}</Text>

            <Text style={styles.text}>
              Check-in: {new Date(item.checkIn).toDateString()}
            </Text>

            <Text style={styles.text}>
              Check-out: {new Date(item.checkOut).toDateString()}
            </Text>

            <Text style={styles.text}>Rooms: {item.rooms}</Text>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => handleCancel(item.id)}
            >
              <Text style={styles.cancelText}>Cancel Booking</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    padding: 20,
    paddingTop: 60,
  },

  title: {
    fontSize: 26,
    color: "#E0B35A",
    fontWeight: "800",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
  },

  hotel: {
    fontSize: 20,
    color: "#F5C77A",
    fontWeight: "700",
    marginBottom: 8,
  },

  text: {
    color: "#FFFFFF",
    fontSize: 15,
    marginBottom: 4,
  },

  cancelBtn: {
    marginTop: 10,
    backgroundColor: "#FF4D4D",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  cancelText: {
    color: "#fff",
    fontWeight: "600",
  },

  empty: {
    color: "#999",
    fontSize: 18,
    textAlign: "center",
  },
});
