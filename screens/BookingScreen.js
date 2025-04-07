import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ImageBackground,
  Modal,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import API_URLS from "./ApiConfig";

export default function BookingDetailsScreen({ route, navigation }) {
  const { hotel } = route.params;

  const { createPaymentMethod } = useStripe();

  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date());
  const [rooms, setRooms] = useState(1);
  const [people, setPeople] = useState(2);

  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [showRoomTypeModal, setShowRoomTypeModal] = useState(false);

  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);

  const [cardDetails, setCardDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hotel?.room_types?.length > 0) {
      setSelectedRoomType(hotel.room_types[0]);
    }
  }, [hotel]);

  const formatDate = (date) => date.toISOString().split("T")[0];

  const handleConfirmBooking = async () => {
    const token = await AsyncStorage.getItem("accessToken");

    if (!selectedRoomType) {
      Toast.show({ type: "error", text1: "Please select a room type" });
      return;
    }

    if (checkOut <= checkIn) {
      Toast.show({
        type: "error",
        text1: "Invalid Dates",
        text2: "Check-out must be after check-in",
      });
      return;
    }

    if (!cardDetails?.complete) {
      Alert.alert("Error", "Please enter complete card details");
      return;
    }

    setLoading(true);

    try {
      const { paymentMethod, error } = await createPaymentMethod({
        paymentMethodType: "Card",
      });

      if (error) {
        Alert.alert("Payment Error", error.message);
        setLoading(false);
        return;
      }

      const bookingData = {
        check_in_date: formatDate(checkIn),
        check_out_date: formatDate(checkOut),
        no_of_rooms: rooms,
        no_of_people: people,
        items: [
          {
            room: selectedRoomType.id,
            hotel: hotel.id,
          },
        ],
        billing: {
          payment_method_id: paymentMethod.id,
          total_amount: parseFloat(selectedRoomType.price) * rooms,
        },
      };

      const response = await fetch(`${API_URLS.BASE_URL}/bookings/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Booking Confirmed 🎉",
        });
        navigation.replace("Welcome");
      } else {
        let errorMessage = result.error || "Booking failed";
        Alert.alert("Error", errorMessage);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <ImageBackground
      source={require("../assets/booking.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <Text style={styles.title}>Book {hotel.name}</Text>

            {/* Check-in */}
            <View style={styles.card}>
              <Text style={styles.label}>Check-in Date</Text>
              <TouchableOpacity
                style={styles.dateBox}
                onPress={() => setShowCheckIn(true)}
              >
                <Text style={styles.dateText}>{checkIn.toDateString()}</Text>
              </TouchableOpacity>
            </View>

            {/* Check-out */}
            <View style={styles.card}>
              <Text style={styles.label}>Check-out Date</Text>
              <TouchableOpacity
                style={styles.dateBox}
                onPress={() => setShowCheckOut(true)}
              >
                <Text style={styles.dateText}>{checkOut.toDateString()}</Text>
              </TouchableOpacity>
            </View>

            {/* Room Type */}
            <View style={styles.card}>
              <Text style={styles.label}>Room Type</Text>
              <TouchableOpacity
                style={styles.dateBox}
                onPress={() => setShowRoomTypeModal(true)}
              >
                <Text style={styles.dateText}>
                  {selectedRoomType
                    ? `${selectedRoomType.room_type} ($${selectedRoomType.price})`
                    : "Select Room"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Rooms */}
            <View style={styles.card}>
              <Text style={styles.label}>Rooms</Text>
              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setRooms(Math.max(1, rooms - 1))}
                >
                  <Text style={styles.counterBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{rooms}</Text>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setRooms(rooms + 1)}
                >
                  <Text style={styles.counterBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* People */}
            <View style={styles.card}>
              <Text style={styles.label}>People</Text>
              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setPeople(Math.max(1, people - 1))}
                >
                  <Text style={styles.counterBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{people}</Text>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setPeople(people + 1)}
                >
                  <Text style={styles.counterBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Stripe Card */}
            <View style={styles.card}>
              <Text style={styles.label}>Card Details</Text>
              <CardField
                postalCodeEnabled={false}
                style={{ height: 50 }}
                cardStyle={{
                  backgroundColor: "#2A2A2A",
                  textColor: "#FFFFFF",
                  placeholderColor: "#888888",
                }}
                onCardChange={(card) => setCardDetails(card)}
              />
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirmBooking}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.confirmText}>Confirm Booking</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Room Modal */}
      <Modal visible={showRoomTypeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Room Type</Text>
            <FlatList
              data={hotel.room_types}
              keyExtractor={(i) => i.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.roomTypeItem,
                    selectedRoomType?.id === item.id && styles.selectedItem,
                  ]}
                  onPress={() => {
                    setSelectedRoomType(item);
                    setShowRoomTypeModal(false);
                  }}
                >
                  <Text style={styles.roomTypeItemText}>{item.room_type}</Text>
                  <Text style={styles.roomTypeSubText}>${item.price} / night</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowRoomTypeModal(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Check-in Calendar Modal */}
      <Modal visible={showCheckIn} transparent animationType="fade">
        <View style={styles.calendarOverlay}>
          <View style={styles.calendarBox}>
            <Text style={styles.calendarTitle}>Select Check-in Date</Text>
            <DateTimePicker
              value={checkIn}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              minimumDate={new Date()}
              themeVariant="dark"
              accentColor="#E0B35A"
              onChange={(e, d) => {
                if (Platform.OS === "android") {
                  setShowCheckIn(false);
                  if (d) setCheckIn(d);
                } else {
                  if (e.type === "set" && d) setCheckIn(d);
                }
              }}
              style={styles.calendarPicker}
            />
            <TouchableOpacity
              style={styles.calendarCancel}
              onPress={() => setShowCheckIn(false)}
            >
              <Text style={styles.calendarCancelText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showCheckOut} transparent animationType="fade">
        <View style={styles.calendarOverlay}>
          <View style={styles.calendarBox}>
            <Text style={styles.calendarTitle}>Select Check-out Date</Text>
            <DateTimePicker
              value={checkOut}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              minimumDate={checkIn}
              themeVariant="dark"
              accentColor="#E0B35A"
              onChange={(e, d) => {
                if (Platform.OS === "android") {
                  setShowCheckOut(false);
                  if (d) setCheckOut(d);
                } else {
                  if (e.type === "set" && d) setCheckOut(d);
                }
              }}
              style={styles.calendarPicker}
            />
            <TouchableOpacity
              style={styles.calendarCancel}
              onPress={() => setShowCheckOut(false)}
            >
              <Text style={styles.calendarCancelText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  scrollContainer: { flexGrow: 1, paddingBottom: 20 },
  container: { padding: 24, paddingTop: 70 },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#E0B35A",
    marginBottom: 28,
  },

  card: {
    backgroundColor: "rgba(25,25,25,0.92)",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },

  label: {
    color: "#F5F5F5",
    fontSize: 15,
    marginBottom: 10,
    fontWeight: "600",
  },

  dateBox: {
    backgroundColor: "#2A2A2A",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#444",
  },
  dateText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  counterBtn: {
    backgroundColor: "#E0B35A",
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  counterBtnText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1B1B1B",
    lineHeight: 28,
  },
  counterValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },

  confirmBtn: {
    backgroundColor: "#E0B35A",
    paddingVertical: 18,
    borderRadius: 22,
    alignItems: "center",
    marginTop: 20,
  },
  confirmText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1B1B1B",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1F1F1F",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#E0B35A",
    textAlign: "center",
    marginBottom: 20,
  },
  roomTypeItem: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  selectedItem: {
    backgroundColor: "rgba(224,179,90,0.3)",
    borderWidth: 1,
    borderColor: "#E0B35A",
  },
  roomTypeItemText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFF",
  },
  roomTypeSubText: {
    fontSize: 13,
    color: "#AAA",
    marginTop: 4,
  },
  closeButton: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "#333",
    borderRadius: 14,
    alignItems: "center",
  },
  closeButtonText: {

    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  calendarOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  calendarBox: {
    backgroundColor: "#1C1C1E",
    borderRadius: 24,
    padding: 16,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E0B35A",
    marginBottom: 12,
  },
  calendarPicker: {
    width: "100%",
    backgroundColor: "transparent",
  },
  calendarCancel: {
    marginTop: 14,
    backgroundColor: "#E0B35A",
    paddingVertical: 13,
    paddingHorizontal: 40,
    borderRadius: 14,
    alignItems: "center",
    width: "100%",
  },
  calendarCancelText: {
    color: "#1B1B1B",
    fontSize: 16,
    fontWeight: "700",
  },
});