import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
} from "react-native";

export default function AuthScreen({ navigation }) {
  return (
    <ImageBackground
      source={require("../assets/login.png")} 
      style={styles.bg}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      
      <View style={styles.overlay} />

      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Voyagr</Text>

        <Text style={styles.subtitle}>
          Discover premium stays crafted for comfort
        </Text>

        <TouchableOpacity
          style={styles.loginButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Signup")}
        >
          <Text style={styles.signupText}>Create an Account</Text>
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
    backgroundColor: "rgba(0,0,0,0.55)", 
  },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
    letterSpacing: 0.6,
  },

  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginBottom: 52,
    lineHeight: 22,
  },

  loginButton: {
    width: "100%",
    backgroundColor: "#E0B35A",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },

  loginText: {
    color: "#1B1B1B",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.6,
  },

  signupButton: {
    width: "100%",
    borderWidth: 1.6,
    borderColor: "#E0B35A",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },

  signupText: {
    color: "#E0B35A",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
