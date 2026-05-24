import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDeck } from '../../hooks/useDeck';
import { useProgress, loadLastSession } from '../../hooks/useProgress';
import ProgressBar from '../../components/ProgressBar';
import { Colors } from '../../constants/colors';
import type { CardStatus } from '../../data/types';

export default function DeckHomeScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const deck = useDeck(deckId);
  const { progress, loaded, reload } = useProgress(deckId);
  const [resumeCardId, setResumeCardId] = useState<number | null>(null);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  useEffect(() => {
    loadLastSession().then((s) => {
      if (s && s.deckId === deckId) setResumeCardId(s.cardId);
    });
  }, [deckId]);

  if (!deck) return null;

  const total = deck.cards.length;
  const done = deck.cards.filter((c) => progress[c.id] === 'done').length;
  const review = deck.cards.filter((c) => progress[c.id] === 'review').length;
  const newCount = total - done - review;

  const startQuiz = (statuses?: CardStatus[]) => {
    const params: Record<string, string> = {};
    if (statuses) params.statuses = statuses.join(',');
    router.push({ pathname: `/${deckId}/quiz-setup`, params });
  };

  const startFilteredQuiz = (status: CardStatus) => {
    router.push({
      pathname: `/${deckId}/quiz`,
      params: { order: 'sequential', articles: '', types: '', statuses: status },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </TouchableOpacity>

        <Text style={styles.sport}>{deck.sport}</Text>
        <Text style={styles.title}>{deck.title}</Text>
        <Text style={styles.edition}>{t('deck.edition')}: {deck.edition}</Text>

        <View style={styles.statsRow}>
          <StatBox
            label={t('status.new')}
            value={newCount}
            color={Colors.statusNew}
            onPress={newCount > 0 ? () => startFilteredQuiz('new') : undefined}
          />
          <StatBox
            label={t('status.review')}
            value={review}
            color={Colors.statusReview}
            onPress={review > 0 ? () => startFilteredQuiz('review') : undefined}
          />
          <StatBox
            label={t('status.done')}
            value={done}
            color={Colors.statusDone}
            onPress={done > 0 ? () => startFilteredQuiz('done') : undefined}
          />
        </View>

        <View style={styles.barRow}>
          <ProgressBar done={done} review={review} total={total} />
          <Text style={styles.barLabel}>{done} / {total} {t('deck.cards')}</Text>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => startQuiz()}>
          <Text style={styles.primaryBtnText}>{t('deck.startQuiz')}</Text>
        </TouchableOpacity>

        {resumeCardId != null && (
          <TouchableOpacity
            style={styles.resumeBtn}
            onPress={() =>
              router.push({
                pathname: `/${deckId}/quiz`,
                params: { order: 'sequential', articles: '', types: '', startCardId: String(resumeCardId) },
              })
            }
          >
            <Text style={styles.resumeBtnText}>▶ {t('deck.resumeSession')}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push(`/${deckId}/overview`)}>
            <Text style={styles.secondaryBtnText}>{t('deck.overview')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push(`/${deckId}/settings`)}>
            <Text style={styles.secondaryBtnText}>{t('deck.settings')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({
  label,
  value,
  color,
  onPress,
}: {
  label: string;
  value: number;
  color: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.statBox, { borderColor: color, backgroundColor: color + '14' }, !onPress && styles.statBoxDisabled]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
      {onPress && <Text style={[styles.statHint, { color }]}>▶</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20 },
  backBtn: { marginBottom: 16 },
  backText: { color: Colors.primary, fontSize: 15 },
  sport: { fontSize: 13, color: Colors.primary, fontWeight: '600', marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, marginBottom: 2 },
  edition: { fontSize: 13, color: Colors.textSecondary, marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: { flex: 1, borderRadius: 12, borderWidth: 1, alignItems: 'center', padding: 12 },
  statBoxDisabled: { opacity: 0.5 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 2 },
  statHint: { fontSize: 10, marginTop: 4, opacity: 0.7 },
  barRow: { marginBottom: 28, gap: 6 },
  barLabel: { fontSize: 12, color: Colors.textSecondary, textAlign: 'right' },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtnText: { color: Colors.textOnPrimary, fontWeight: '700', fontSize: 17 },
  resumeBtn: {
    backgroundColor: Colors.primary + '14',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  resumeBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 15 },
  secondaryActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  secondaryBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryBtnText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 14 },
});
