import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Alert,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URLS from './ApiConfig';

const MyBooking = ({ navigation }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [cancelLoading, setCancelLoading] = useState(false);

    const fetchMyBookings = async () => {
        const token = await AsyncStorage.getItem("accessToken");

        if (!token) {
            Alert.alert("Login Required", "Please login to view your bookings", [
                { text: "Login", onPress: () => navigation.navigate("Login") }
            ]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_URLS.BASE_URL}/bookings/my/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (response.ok) {
                setBookings(result);
            } else if (response.status === 401) {
                Alert.alert("Session Expired", "Please login again", [
                    { text: "Login", onPress: () => navigation.navigate("Login") }
                ]);
            } else {
                let errorMessage = "Failed to load bookings";
                if (result.detail) errorMessage = result.detail;
                else if (result.message) errorMessage = result.message;
                Alert.alert("Error", errorMessage);
                setBookings([]);
            }
        } catch (error) {
            Alert.alert("Connection Error", "Could not connect to the server. Please check your network.");
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const openCancelModal = (bookingId) => {
        setSelectedBookingId(bookingId);
        setCancelModalVisible(true);
    };

    const handleCancelBooking = async () => {
        const token = await AsyncStorage.getItem("accessToken");
        setCancelLoading(true);

        try {
            const response = await fetch(`${API_URLS.BASE_URL}/bookings/cancle/${selectedBookingId}/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (response.ok) {
                setCancelModalVisible(false);
                setSelectedBookingId(null);
                // Remove cancelled booking from list
                setBookings((prev) => prev.filter((b) => b.id !== selectedBookingId));
                Alert.alert("Cancelled", "Your booking has been cancelled successfully.");
            } else {
                let errorMessage = result.detail || result.message || result.error || "Failed to cancel booking";
                Alert.alert("Error", errorMessage);
            }
        } catch (error) {
            Alert.alert("Connection Error", "Could not connect to the server. Please try again.");
        } finally {
            setCancelLoading(false);
        }
    };

    useEffect(() => {
        fetchMyBookings();
    }, []);

    return (
        <ImageBackground
            source={require("../assets/background1.jpg")}
            style={styles.bg}
            resizeMode="cover"
        >
            <StatusBar translucent backgroundColor="transparent" />
            <View style={styles.overlay} />

            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#F5C77A" />
                        <Text style={styles.loadingText}>Loading your bookings...</Text>
                    </View>
                ) : bookings.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={80} color="#F5C77A" />
                        <Text style={styles.emptyTitle}>No Bookings Yet</Text>
                        <Text style={styles.emptySubtitle}>
                            You haven't made any bookings yet.{'\n'}Start exploring hotels!
                        </Text>
                        <TouchableOpacity
                            style={styles.exploreButton}
                            onPress={() => navigation.navigate('HotelList')}
                        >
                            <Text style={styles.exploreButtonText}>Browse Hotels</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    bookings.map((booking) => {
                        const item = booking.items?.[0] || {};
                        return (
                            <View key={booking.id} style={styles.bookingCard}>
                                <Text style={styles.hotelName}>{item.hotel || "Hotel"}</Text>

                                <View style={styles.infoRow}>
                                    <Ionicons name="calendar" size={18} color="#F5C77A" />
                                    <Text style={styles.infoText}>
                                        {booking.check_in_date} → {booking.check_out_date}
                                    </Text>
                                </View>

                                <View style={styles.infoRow}>
                                    <Ionicons name="bed" size={18} color="#F5C77A" />
                                    <Text style={styles.infoText}>
                                        {item.room || "Room"} • {booking.no_of_rooms} Room(s)
                                    </Text>
                                </View>

                                <View style={styles.infoRow}>
                                    <Ionicons name="people" size={18} color="#F5C77A" />
                                    <Text style={styles.infoText}>
                                        {booking.no_of_people} People
                                    </Text>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.priceRow}>
                                    <Text style={styles.priceLabel}>Total Amount</Text>
                                    <Text style={styles.price}>
                                        ${booking.billing?.total_amount || "0"}
                                    </Text>
                                </View>

                                <Text style={styles.dateText}>
                                    Booked on: {new Date(booking.created_at).toLocaleDateString()}
                                </Text>

                                {/* Cancel Button */}
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => openCancelModal(booking.id)}
                                >
                                    <Ionicons name="close-circle-outline" size={18} color="#fff" />
                                    <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })
                )}
            </ScrollView>
            <Modal
                visible={cancelModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setCancelModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalIconWrap}>
                            <Ionicons name="warning-outline" size={44} color="#E0B35A" />
                        </View>

                        <Text style={styles.modalTitle}>Cancel Booking?</Text>
                        <Text style={styles.modalSubtitle}>
                            Are you sure you want to cancel this booking? This action cannot be undone.
                        </Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalKeepBtn}
                                onPress={() => setCancelModalVisible(false)}
                                disabled={cancelLoading}
                            >
                                <Text style={styles.modalKeepText}>Keep It</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.modalConfirmBtn}
                                onPress={handleCancelBooking}
                                disabled={cancelLoading}
                            >
                                {cancelLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.modalConfirmText}>Yes, Cancel</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    bg: { flex: 1 },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    container: {
        padding: 20,
        paddingBottom: 40,
        paddingTop: 60,
    },
    bookingCard: {
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderRadius: 18,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    hotelName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#F9FAFB',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.9)',
        marginLeft: 10,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginVertical: 14,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    priceLabel: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.7)',
    },
    price: {
        fontSize: 20,
        fontWeight: '700',
        color: '#90EE90',
    },
    dateText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 8,
    },

    // Cancel Button
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(220, 53, 69, 0.85)',
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 16,
        gap: 8,
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },

    loadingText: {
        color: '#fff',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#F5C77A',
        marginTop: 20,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        lineHeight: 22,
    },
    exploreButton: {
        backgroundColor: '#DAA520',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 14,
        marginTop: 30,
    },
    exploreButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

    // Confirm Cancel Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    modalBox: {
        backgroundColor: '#1C1C1E',
        borderRadius: 24,
        padding: 28,
        width: '100%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    modalIconWrap: {
        backgroundColor: 'rgba(224,179,90,0.15)',
        borderRadius: 50,
        padding: 16,
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#F9FAFB',
        marginBottom: 10,
    },
    modalSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalKeepBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    modalKeepText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    modalConfirmBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        backgroundColor: '#DC3545',
    },
    modalConfirmText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default MyBooking;