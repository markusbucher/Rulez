import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDeck } from '../../hooks/useDeck';
import { useProgress } from '../../hooks/useProgress';
import ArticleGroup from '../../components/ArticleGroup';
import { Colors } from '../../constants/colors';

export default function OverviewScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const deck = useDeck(deckId);
  const { getStatus, loaded } = useProgress(deckId);

  const grouped = useMemo(() => {
    if (!deck) return [];
    const map = new Map<string, typeof deck.cards>();
    for (const card of deck.cards) {
      if (!map.has(card.article)) map.set(card.article, []);
      map.get(card.article)!.push(card);
    }
    return [...map.entries()];
  }, [deck]);

  if (!deck || !loaded) return null;

  const handleCardPress = (cardId: number) => {
    router.push({
      pathname: `/${deckId}/quiz`,
      params: { order: 'sequential', articles: '', types: '', startCardId: String(cardId) },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace(`/${deckId}`)}>
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('overview.title')}</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {grouped.map(([article, cards]) => (
          <ArticleGroup
            key={article}
            article={article}
            articleTitle={cards[0]?.articleTitle}
            cards={cards}
            getStatus={getStatus}
            onCardPress={handleCardPress}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backText: { color: Colors.primary, fontSize: 15 },
  title: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  list: { padding: 16 },
});
