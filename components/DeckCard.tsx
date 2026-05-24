import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/colors';
import ProgressBar from './ProgressBar';
import type { Deck, AppProgress } from '../data/types';

interface Props {
  deck: Deck;
  progress: AppProgress;
  onPress: () => void;
}

export default function DeckCard({ deck, progress, onPress }: Props) {
  const { t } = useTranslation();
  const deckProgress = progress[deck.id] ?? {};
  const total = deck.cards.length;
  const done = deck.cards.filter((c) => deckProgress[c.id] === 'done').length;
  const review = deck.cards.filter((c) => deckProgress[c.id] === 'review').length;
  const newCount = total - done - review;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.sport}>{deck.sport}</Text>
      <Text style={styles.title}>{deck.title}</Text>
      <Text style={styles.edition}>{t('deck.edition')}: {deck.edition}</Text>

      <View style={styles.stats}>
        <StatPill label={t('status.new')} count={newCount} color={Colors.statusNew} />
        <StatPill label={t('status.review')} count={review} color={Colors.statusReview} />
        <StatPill label={t('status.done')} count={done} color={Colors.statusDone} />
      </View>

      <View style={styles.barWrapper}>
        <ProgressBar done={done} review={review} total={total} />
        <Text style={styles.barLabel}>{done} / {total} {t('deck.cards')}</Text>
      </View>
    </TouchableOpacity>
  );
}

function StatPill({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <View style={[styles.pill, { borderColor: color, backgroundColor: color + '18' }]}>
      <Text style={[styles.pillCount, { color }]}>{count}</Text>
      <Text style={[styles.pillLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginBottom: 16,
  },
  sport: { fontSize: 13, color: Colors.primary, fontWeight: '600', marginBottom: 4 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  edition: { fontSize: 13, color: Colors.textSecondary, marginBottom: 14 },
  stats: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillCount: { fontSize: 14, fontWeight: '700' },
  pillLabel: { fontSize: 12 },
  barWrapper: { gap: 6 },
  barLabel: { fontSize: 12, color: Colors.textSecondary, textAlign: 'right' },
});
