import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URLS from './ApiConfig';

const MyProfile = ({ navigation }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(null);

    const fetchProfile = async () => {
        const token = await AsyncStorage.getItem('accessToken');

        if (!token) {
            setApiError('Please login again');
            Alert.alert('Authentication Error', 'Session expired. Please login again.');
            setLoading(false);
            return;
        }

        try {
            setApiError(null);
            setLoading(true);

            const response = await fetch(`${API_URLS.BASE_URL}/user/profile/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                console.log('✅ Profile:', data);
                setProfile(data);
            } else {
                let errorMessage = 'Failed to fetch profile';

                if (data.detail) errorMessage = data.detail;
                else if (data.message) errorMessage = data.message;
                else if (data.error) errorMessage = data.error;

                if (response.status === 401) errorMessage = 'Session expired. Please login again.';
                else if (response.status === 403) errorMessage = "You don't have permission.";
                else if (response.status === 404) errorMessage = 'Profile not found.';

                console.error('❌ API Error:', { status: response.status, data });
                setApiError(errorMessage);
                Alert.alert('Error', errorMessage);
            }
        } catch (error) {
            console.error('❌ Network Error:', error);
            const msg = 'Unable to connect to server. Please check your internet connection.';
            setApiError(msg);
            Alert.alert('Connection Error', msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-PK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <ImageBackground
            source={require('../assets/background1.jpg')}
            style={styles.bg}
            resizeMode="cover"
        >
            <View style={styles.overlay} />

            <View style={styles.container}>
                <Text style={styles.heading}>My Profile</Text>

                {loading && (
                    <View style={styles.centerBox}>
                        <ActivityIndicator size="large" color="#FFD166" />
                        <Text style={styles.statusText}>Loading profile...</Text>
                    </View>
                )}

                {apiError && !loading && (
                    <View style={styles.centerBox}>
                        <Text style={styles.errorText}>{apiError}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
                            <Text style={styles.retryText}>🔄 Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {profile && !loading && (
                    <View style={styles.card}>
                        <View style={styles.avatarContainer}>
                            {profile.picture ? (
                                <Image source={{ uri: profile.picture }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarInitial}>
                                        {profile.username?.charAt(0).toUpperCase() || '?'}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <Text style={styles.username}>{profile.username || 'N/A'}</Text>

                        {profile.is_staff && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>⭐ Staff</Text>
                            </View>
                        )}

                        <View style={styles.divider} />

                        <InfoRow label="📧 Email" value={profile.email || 'N/A'} />
                        <InfoRow label="📱 Mobile" value={profile.mobile_number || 'Not added'} />
                        <InfoRow
                            label="✅ Status"
                            value={profile.is_active ? 'Active' : 'Inactive'}
                            valueColor={profile.is_active ? '#90EE90' : '#ff6b6b'}
                        />
                        <InfoRow label="🗓️ Joined" value={formatDate(profile.created_at)} />
                        <InfoRow label="🆔 User ID" value={`#${profile.id}`} />
                    </View>
                )}
            </View>
        </ImageBackground>
    );
};

const InfoRow = ({ label, value, valueColor }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
    </View>
);

export default MyProfile;

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
        marginBottom: 30,
        color: '#F5E2C8',
    },
    centerBox: {
        alignItems: 'center',
        marginTop: 40,
    },
    statusText: {
        color: '#fff',
        textAlign: 'center',
        marginTop: 12,
        fontSize: 14,
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
        marginTop: 8,
    },
    retryText: {
        color: '#000',
        fontWeight: '600',
    },
    card: {
        backgroundColor: 'rgba(0,0,0,0.45)',
        borderRadius: 18,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 14,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 2,
        borderColor: '#FFD166',
    },
    avatarPlaceholder: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(255,209,102,0.25)',
        borderWidth: 2,
        borderColor: '#FFD166',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontSize: 36,
        fontWeight: '700',
        color: '#FFD166',
    },
    username: {
        fontSize: 22,
        fontWeight: '700',
        color: '#F9FAFB',
        textAlign: 'center',
        marginBottom: 8,
    },
    badge: {
        alignSelf: 'center',
        backgroundColor: 'rgba(255,209,102,0.2)',
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FFD166',
        marginBottom: 6,
    },
    badgeText: {
        color: '#FFD166',
        fontSize: 13,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginVertical: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    infoLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.65)',
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        color: '#F9FAFB',
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
});