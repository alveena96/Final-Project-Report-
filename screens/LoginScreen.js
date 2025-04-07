import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import API_URLS from "./ApiConfig";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter email and password",
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch(`${API_URLS.BASE_URL}/user/login/`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        await AsyncStorage.setItem("accessToken", data.access);
        await AsyncStorage.setItem("user", data.user_name);

        Toast.show({
          type: "success",
          text1: "Login Successful",
          text2: `Welcome, ${data.user_name || email}!`,
        });

        navigation.replace("Welcome", { user: data });
      } else {
        let errorMessage = "Login failed. Please try again.";

        if (data.detail) errorMessage = data.detail;
        else if (data.non_field_errors?.[0]) errorMessage = data.non_field_errors[0];
        else if (data.message) errorMessage = data.message;
        else if (data.username) errorMessage = Array.isArray(data.username) ? data.username[0] : data.username;
        else if (data.password) errorMessage = Array.isArray(data.password) ? data.password[0] : data.password;
        else if (typeof data === "string") errorMessage = data;

        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: errorMessage,
        });
      }
    } catch (error) {
      console.log("API Error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Server not reachable or network error. Please check your connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/login.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay} />

      <View style={styles.container}>
        <Text style={styles.title}>Login to Voyagr</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={email}
            placeholder="Enter Username"
            placeholderTextColor="#999"
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              placeholder="Enter Password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
            />

            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color="#555"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loading && { opacity: 0.7 }]}
          activeOpacity={0.85}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>
      </View>

      <Toast />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 50,
    textAlign: "center",
  },

  form: {
    width: "100%",
    marginBottom: 28,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 14,
    color: "#000",
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 14,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: "#000",
  },

  loginButton: {
    width: "100%",
    backgroundColor: "#E0B35A",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 16,
  },

  loginText: {
    color: "#1B1B1B",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
});
