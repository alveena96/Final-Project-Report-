import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  ActivityIndicator,
  InteractionManager,
} from "react-native";
import Toast from "react-native-toast-message";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import API_URLS from "./ApiConfig";
export default function SignUpScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [location, setLocation] = useState(null);

  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleGetLocation = async () => {
    if (gettingLocation) return;

    try {
      setGettingLocation(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission Denied",
          text2: "Location permission required",
        });
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = [loc.coords.latitude, loc.coords.longitude];
      setLocation(coords);

      Toast.show({
        type: "success",
        text1: "Location Added",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Location Error",
      });
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSignUp = async () => {
    if (!username || !email || !password || !location) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Weak Password",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URLS.BASE_URL}/user/signup/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
            location,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Toast.show({
          type: "error",
          text1: "Signup Failed",
          text2:
            data?.message ||
            data?.detail ||
            "Server Error",
        });
        return;
      }

      Toast.show({
        type: "success",
        text1: "Signup Successful",
      });

      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => {
          navigation.replace("Welcome");
        }, 200);
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Network Error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/create.jpg")}
      style={styles.bg}
    >
      <View style={styles.overlay} />

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Create Account</Text>

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#777"
            value={username}
            onChangeText={setUsername}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#777"
            value={email}
            onChangeText={setEmail}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#777"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color="#555"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.locationBtn,
              gettingLocation && { opacity: 0.6 },
            ]}
            onPress={handleGetLocation}
            disabled={gettingLocation}
          >
            <Text style={styles.locationText}>
              {gettingLocation
                ? "Getting Location..."
                : location
                  ? "Location Added ✅"
                  : "Get Current Location"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Creating..." : "Continue"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  container: {
    flexGrow: 1,
    padding: 25,
    justifyContent: "center",
  },

  title: {
    fontSize: 28,
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "bold",
  },

  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 16,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 14,
  },

  locationBtn: {
    backgroundColor: "#007BFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
  },

  locationText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },

  button: {
    backgroundColor: "#FF6A00",
    padding: 16,
    borderRadius: 12,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});