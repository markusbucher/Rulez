import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDeck } from '../../hooks/useDeck';
import { Colors } from '../../constants/colors';
import type { QuizOrder } from '../../hooks/useQuizSession';

export default function QuizSetupScreen() {
  const { deckId, startCardId } = useLocalSearchParams<{ deckId: string; startCardId?: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const deck = useDeck(deckId);

  const [order, setOrder] = useState<QuizOrder>('sequential');
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const articles = useMemo(
    () => [...new Set(deck?.cards.map((c) => c.article) ?? [])],
    [deck]
  );
  const types = useMemo(
    () => [...new Set(deck?.cards.map((c) => c.type) ?? [])],
    [deck]
  );

  if (!deck) return null;

  const filteredCount = deck.cards.filter((c) => {
    const articleOk = selectedArticles.length === 0 || selectedArticles.includes(c.article);
    const typeOk = selectedTypes.length === 0 || selectedTypes.includes(c.type);
    return articleOk && typeOk;
  }).length;

  const toggle = (arr: string[], setArr: (v: string[]) => void, value: string) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
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

        {/* Article filter */}
        <Section label={t('quizSetup.filterArticle')}>
          <TouchableOpacity style={styles.allBtn} onPress={() => setSelectedArticles([])}>
            <Text style={[styles.allBtnText, selectedArticles.length === 0 && styles.allBtnActive]}>
              {t('quizSetup.allArticles')}
            </Text>
          </TouchableOpacity>
          <View style={styles.chipWrap}>
            {articles.map((a) => (
              <TouchableOpacity
                key={a}
                style={[styles.chip, selectedArticles.includes(a) && styles.chipActive]}
                onPress={() => toggle(selectedArticles, setSelectedArticles, a)}
              >
                <Text style={[styles.chipText, selectedArticles.includes(a) && styles.chipTextActive]}>
                  {a}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
                onPress={() => toggle(selectedTypes, setSelectedTypes, type)}
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
  sectionLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  segmented: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  segment: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: Colors.surface },
  segmentActive: { backgroundColor: Colors.primary },
  segmentText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  segmentTextActive: { color: Colors.textOnPrimary },
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
  countLabel: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginBottom: 16 },
  startBtn: { backgroundColor: Colors.primary, borderRadius: 14, padding: 16, alignItems: 'center' },
  startBtnDisabled: { opacity: 0.4 },
  startBtnText: { color: Colors.textOnPrimary, fontWeight: '700', fontSize: 17 },
});
