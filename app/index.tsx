import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DECKS } from '../data/decks';
import { STORAGE_KEYS } from '../data/types';
import type { AppProgress } from '../data/types';
import DeckCard from '../components/DeckCard';
import { Colors } from '../constants/colors';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [progress, setProgress] = useState<AppProgress>({});

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.progress).then((raw) => {
      if (raw) setProgress(JSON.parse(raw));
    });
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('home.title')}</Text>
        <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        <Text style={styles.selectLabel}>{t('home.selectDeck')}</Text>
        {DECKS.map((deck) => (
          <DeckCard
            key={deck.id}
            deck={deck}
            progress={progress}
            onPress={() => router.push(`/${deck.id}`)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  title: { fontSize: 32, fontWeight: '800', color: Colors.primary },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  list: { padding: 20, paddingTop: 12 },
  selectLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },
});
