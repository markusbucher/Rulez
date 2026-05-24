import '../i18n';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';
import { STORAGE_KEYS } from '../data/types';
import { Colors } from '../constants/colors';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.appLanguage).then((stored) => {
      if (stored === 'en' || stored === 'de') {
        i18n.changeLanguage(stored);
      }
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  const nav = (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.textPrimary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[deckId]" options={{ headerShown: false }} />
    </Stack>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webShell}>
        <StatusBar style="dark" />
        <View style={styles.webContainer}>{nav}</View>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      {nav}
    </>
  );
}

const styles = StyleSheet.create({
  webShell: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  webContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    backgroundColor: Colors.background,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
});
