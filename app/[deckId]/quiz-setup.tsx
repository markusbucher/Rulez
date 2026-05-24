import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDeck } from '../../hooks/useDeck';
import { Colors } from '../../constants/colors';
import type { QuizOrder } from '../../hooks/useQuizSession';

interface TopArticle {
  id: string;        // e.g. "3"
  title: string;     // e.g. "Technische Ausrüstung"
  cardCount: number;
}

export default function QuizSetupScreen() {
  const { deckId, startCardId } = useLocalSearchParams<{ deckId: string; startCardId?: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const deck = useDeck(deckId);

  const [order, setOrder] = useState<QuizOrder>('sequential');
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Build top-level article list (first segment before the dot)
  const topArticles = useMemo<TopArticle[]>(() => {
    if (!deck) return [];
    const map = new Map<string, { title: string; count: number }>();
    for (const card of deck.cards) {
      const top = card.article.split('.')[0];
      const existing = map.get(top);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(top, { title: card.articleTitle ?? '', count: 1 });
      }
    }
    // Sort numerically by article number
    return [...map.entries()]
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([id, { title, count }]) => ({ id, title, cardCount: count }));
  }, [deck]);

  const types = useMemo(
    () => [...new Set(deck?.cards.map((c) => c.type) ?? [])],
    [deck]
  );

  if (!deck) return null;

  const filteredCount = deck.cards.filter((c) => {
    const top = c.article.split('.')[0];
    const articleOk =
      selectedArticles.length === 0 || selectedArticles.includes(top);
    const typeOk = selectedTypes.length === 0 || selectedTypes.includes(c.type);
    return articleOk && typeOk;
  }).length;

  const toggleArticle = (id: string) => {
    setSelectedArticles((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const startQuiz = () => {
    const params: Record<string, string> = {
      order,
      articles: selectedArticles.join(','),
      types: selectedTypes.join(','),
    };
    if (startCardId) params.startCardId = startCardId;
    router.push({ pathname: `/${deckId}/quiz`, params });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('quizSetup.title')}</Text>

        {/* Order */}
        <Section label={t('quizSetup.order')}>
          <View style={styles.segmented}>
            {(['sequential', 'random'] as QuizOrder[]).map((o) => (
              <TouchableOpacity
                key={o}
                style={[styles.segment, order === o && styles.segmentActive]}
                onPress={() => setOrder(o)}
              >
                <Text style={[styles.segmentText, order === o && styles.segmentTextActive]}>
                  {t(`quizSetup.${o}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* Article filter — top-level articles with titles */}
        <Section label={t('quizSetup.filterArticle')}>
          <TouchableOpacity
            style={[styles.allRow, selectedArticles.length === 0 && styles.allRowActive]}
            onPress={() => setSelectedArticles([])}
          >
            <Text style={[styles.allRowText, selectedArticles.length === 0 && styles.allRowTextActive]}>
              {t('quizSetup.allArticles')}
            </Text>
            {selectedArticles.length === 0 && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>

          {topArticles.map((a) => {
            const active = selectedArticles.includes(a.id);
            return (
              <TouchableOpacity
                key={a.id}
                style={[styles.articleRow, active && styles.articleRowActive]}
                onPress={() => toggleArticle(a.id)}
              >
                <View style={styles.articleRowLeft}>
                  <Text style={[styles.articleNum, active && styles.articleNumActive]}>
                    Art. {a.id}
                  </Text>
                  <Text
                    style={[styles.articleTitle, active && styles.articleTitleActive]}
                    numberOfLines={1}
                  >
                    {a.title}
                  </Text>
                </View>
                <Text style={[styles.articleCount, active && styles.articleCountActive]}>
                  {a.cardCount}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Section>

        {/* Type filter */}
        <Section label={t('quizSetup.filterType')}>
          <TouchableOpacity style={styles.allBtn} onPress={() => setSelectedTypes([])}>
            <Text style={[styles.allBtnText, selectedTypes.length === 0 && styles.allBtnActive]}>
              {t('quizSetup.allTypes')}
            </Text>
          </TouchableOpacity>
          <View style={styles.chipWrap}>
            {types.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, selectedTypes.includes(type) && styles.chipActive]}
                onPress={() => toggleType(type)}
              >
                <Text style={[styles.chipText, selectedTypes.includes(type) && styles.chipTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        <Text style={styles.countLabel}>
          {t('quizSetup.cardsSelected', { count: filteredCount })}
        </Text>

        <TouchableOpacity
          style={[styles.startBtn, filteredCount === 0 && styles.startBtnDisabled]}
          onPress={filteredCount > 0 ? startQuiz : undefined}
        >
          <Text style={styles.startBtnText}>{t('quizSetup.start')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20 },
  backBtn: { marginBottom: 16 },
  backText: { color: Colors.primary, fontSize: 15 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: 20 },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 13, fontWeight: '600', color: Colors.textSecondary,
    marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5,
  },

  // Order segmented control
  segmented: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  segment: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: Colors.surface },
  segmentActive: { backgroundColor: Colors.primary },
  segmentText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  segmentTextActive: { color: Colors.textOnPrimary },

  // "All articles" row
  allRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface, marginBottom: 8,
  },
  allRowActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  allRowText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  allRowTextActive: { color: Colors.primary, fontWeight: '700' },
  checkmark: { color: Colors.primary, fontWeight: '700', fontSize: 15 },

  // Individual article rows
  articleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 11, paddingHorizontal: 14,
    borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface, marginBottom: 6,
  },
  articleRowActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  articleRowLeft: { flex: 1, marginRight: 8 },
  articleNum: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginBottom: 1 },
  articleNumActive: { color: Colors.primary },
  articleTitle: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  articleTitleActive: { color: Colors.primary },
  articleCount: {
    fontSize: 12, color: Colors.textSecondary,
    backgroundColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2, overflow: 'hidden',
  },
  articleCountActive: { backgroundColor: Colors.primary + '20', color: Colors.primary },

  // Type chips
  allBtn: { marginBottom: 10 },
  allBtnText: { fontSize: 14, color: Colors.textSecondary },
  allBtnActive: { color: Colors.primary, fontWeight: '700' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, backgroundColor: Colors.surface,
  },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '14' },
  chipText: { fontSize: 13, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary, fontWeight: '600' },

  // Footer
  countLabel: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginBottom: 16 },
  startBtn: { backgroundColor: Colors.primary, borderRadius: 14, padding: 16, alignItems: 'center' },
  startBtnDisabled: { opacity: 0.4 },
  startBtnText: { color: Colors.textOnPrimary, fontWeight: '700', fontSize: 17 },
});
