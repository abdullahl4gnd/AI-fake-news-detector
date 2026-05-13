import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="detect" />
        <Stack.Screen name="result/[id]" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="change-password" />
        <Stack.Screen name="delete-account" />
      </Stack>
      <StatusBar style="light" />
    </AuthProvider>
  );
}