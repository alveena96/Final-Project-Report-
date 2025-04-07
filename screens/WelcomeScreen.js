import React, { useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function WelcomeScreen({ navigation }) {
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <ImageBackground
      source={require("../assets/resort.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <StatusBar translucent backgroundColor="transparent" />

      <View style={styles.overlay} />

      <TouchableOpacity
        style={styles.settingsIcon}
        onPress={() => navigation.navigate("Settings")}
      >
        <Ionicons name="settings-outline" size={26} color="#fff" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Find Your Perfect Stay</Text>

        <View style={styles.divider} />

        <Text style={styles.subtitle}>
          Manage your hotels with Voyagr
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("HotelList")}
        >
          <Text style={styles.primaryButtonText}>View Hotel List</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("My Booking")}
        >
          <Text style={styles.secondaryButtonText}>View My Bookings</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  settingsIcon: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 10,
    borderRadius: 50,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#F5C77A",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 6,
  },

  divider: {
    width: 60,
    height: 3,
    backgroundColor: "#F5C77A",
    borderRadius: 2,
    marginVertical: 18,
  },

  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
  },

  primaryButton: {
    backgroundColor: "#DAA520",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 15,
  },

  primaryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.4,
  },

  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#F5C77A",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 14,
  },

  secondaryButtonText: {
    color: "#F5C77A",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
});