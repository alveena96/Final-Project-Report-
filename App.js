import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import { StripeProvider } from '@stripe/stripe-react-native'; // ✅ ADD THIS

import SplashScreen from './screens/SplashScreen';
import AuthScreen from './screens/AuthScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import HotelListScreen from './screens/HotelListScreen';
import HotelDetailsScreen from './screens/HotelDetailsScreen';
import BookingScreen from './screens/BookingScreen';
import SettingsScreen from './screens/SettingsScreen';

import MyBooking from './screens/MyBooking';
import MyProfile from './screens/MyProfile';

const Stack = createStackNavigator();

export default function App() {
  return (
    // ✅ WRAP EVERYTHING HERE
    <StripeProvider publishableKey="pk_test_51TPK2rAUM5Z4txQKc7TAzctfxiSXRUOfCmpaTFnuhnO0zf5N2AEem11BgS3xs44mhX8UfteVqfNYFtVxrOi6V1mC00FVpj2Lyx">
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            animationEnabled: true,
            cardStyleInterpolator: ({ current, next, layouts }) => ({
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
              overlayStyle: {
                opacity: next
                  ? next.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.07],
                  })
                  : 0,
              },
            }),
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AuthChoice" component={AuthScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="HotelList" component={HotelListScreen} />
          <Stack.Screen name="HotelDetails" component={HotelDetailsScreen} options={{ title: 'Hotel Details' }} />
          <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Booking Details' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
          <Stack.Screen name="MyProfile" component={MyProfile} options={{ title: 'MyProfile' }} />
          <Stack.Screen name="My Booking" component={MyBooking} options={{ title: 'My Booking' }} />
        </Stack.Navigator>

        <Toast />
      </NavigationContainer>
    </StripeProvider>
  );
}