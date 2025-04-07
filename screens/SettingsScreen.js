import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";

export default function SettingsScreen({ navigation }) {
  return (
    <ImageBackground
      source={require("../assets/background1.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("MyProfile")}>
          <Text style={styles.optionText}>👤 Profile</Text>
        </TouchableOpacity>



        <TouchableOpacity
          style={[styles.card, styles.logoutCard]}
          onPress={() => navigation.replace("Login")}
        >
          <Text style={styles.logoutText}>🚪 Logout</Text>
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
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  container: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#E0B35A",
    marginBottom: 30,
    letterSpacing: 0.5,
  },

  card: {
    backgroundColor: "rgba(25,25,25,0.9)",
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
  },

  optionText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  logoutCard: {
    marginTop: 20,
    backgroundColor: "#E0B35A",
  },

  logoutText: {
    fontSize: 18,
    color: "#1B1B1B",
    fontWeight: "700",
    textAlign: "center",
  },
});
