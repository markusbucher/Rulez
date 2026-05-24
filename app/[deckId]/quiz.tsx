import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDeck } from '../../hooks/useDeck';
import { useProgress, saveLastSession } from '../../hooks/useProgress';
import { useQuizSession } from '../../hooks/useQuizSession';
import type { QuizFilters } from '../../hooks/useQuizSession';
import FlashCard from '../../components/FlashCard';
import MCQuestion from '../../components/MCQuestion';
import ActionButtons from '../../components/ActionButtons';
import { Colors } from '../../constants/colors';
import type { FlashCard as FlashCardType, MCCard, CardStatus } from '../../data/types';

export default function QuizScreen() {
  const { deckId, order, articles, types, statuses, startCardId } =
    useLocalSearchParams<{
      deckId: string;
      order?: string;
      articles?: string;
      types?: string;
      statuses?: string;
      startCardId?: string;
    }>();
  const { t } = useTranslation();
  const router = useRouter();
  const deck = useDeck(deckId);
  const { progress, updateCardStatus, getStatus } = useProgress(deckId);

  const statusFilter = useMemo<CardStatus[]>(
    () => (statuses ? (statuses.split(',').filter(Boolean) as CardStatus[]) : []),
    [statuses]
  );

  // Pre-filter by status before the session builds (status filter is not part of QuizFilters
  // because it needs live progress data)
  const cardPool = useMemo(() => {
    const all = deck?.cards ?? [];
    if (statusFilter.length === 0) return all;
    return all.filter((c) => statusFilter.includes(getStatus(c.id)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck?.cards, statusFilter, progress]); // progress intentionally included: pool is fixed at session start

  const filters = useMemo<QuizFilters>(() => ({
    order: (order as QuizFilters['order']) ?? 'sequential',
    articles: articles ? articles.split(',').filter(Boolean) : [],
    types: types ? types.split(',').filter(Boolean) : [],
  }), [order, articles, types]);

  const sessionCards = useQuizSession(cardPool, filters);

  const getStartIndex = () => {
    if (startCardId) {
      const idx = sessionCards.findIndex((c) => c.id === Number(startCardId));
      return idx >= 0 ? idx : 0;
    }
    return 0;
  };

  const [index, setIndex] = useState(getStartIndex);
  const [answered, setAnswered] = useState(false);
  const [cardKey, setCardKey] = useState(0);

  const card = sessionCards[index];

  const saveAndGo = useCallback(
    async (newIndex: number) => {
      const nextCard = sessionCards[newIndex];
      if (nextCard) {
        await saveLastSession({ deckId, cardId: nextCard.id });
      }
      setAnswered(false);
      setCardKey((k) => k + 1);
      setIndex(newIndex);
    },
    [sessionCards, deckId]
  );

  const handleAccept = useCallback(async () => {
    if (card) await updateCardStatus(card.id, 'done');
    if (index < sessionCards.length - 1) {
      saveAndGo(index + 1);
    } else {
      router.replace(`/${deckId}/overview`);
    }
  }, [card, index, sessionCards.length, updateCardStatus, saveAndGo, router, deckId]);

  const handleAcceptAndOverview = useCallback(async () => {
    if (card) await updateCardStatus(card.id, 'done');
    router.replace(`/${deckId}/overview`);
  }, [card, updateCardStatus, router, deckId]);

  const handleMarkReview = useCallback(async () => {
    if (card) await updateCardStatus(card.id, 'review');
    if (index < sessionCards.length - 1) {
      saveAndGo(index + 1);
    } else {
      router.replace(`/${deckId}/overview`);
    }
  }, [card, index, sessionCards.length, updateCardStatus, saveAndGo, router, deckId]);

  // On the answer screen: un-flip back to the question
  const handleUnflip = useCallback(() => {
    setAnswered(false);
    setCardKey((k) => k + 1);
  }, []);

  // On the question screen: go to the previous card (or exit)
  const handlePreviousCard = useCallback(() => {
    if (index > 0) {
      saveAndGo(index - 1);
    } else {
      router.back();
    }
  }, [index, saveAndGo, router]);

  if (!deck || sessionCards.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.endScreen}>
          <Text style={styles.endTitle}>{t('quiz.noCards')}</Text>
          <TouchableOpacity style={styles.endBtn} onPress={() => router.replace(`/${deckId}`)}>
            <Text style={styles.endBtnText}>{t('common.backToStart')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!card) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.endScreen}>
          <Text style={styles.endTitle}>{t('quiz.sessionDone')}</Text>
          <TouchableOpacity style={styles.endBtn} onPress={() => router.replace(`/${deckId}/overview`)}>
            <Text style={styles.endBtnText}>{t('deck.overview')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.endBtnSecondary} onPress={() => router.replace(`/${deckId}`)}>
            <Text style={styles.endBtnSecondaryText}>{t('common.backToStart')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={answered ? handleUnflip : handlePreviousCard}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backText}>← {t('actions.goBack')}</Text>
        </TouchableOpacity>
        <Text style={styles.counter}>
          {t('quiz.cardOf', { current: index + 1, total: sessionCards.length })}
        </Text>
      </View>

      <View style={styles.cardArea}>
        {card.format === 'flashcard' ? (
          <FlashCard
            key={cardKey}
            card={card as FlashCardType}
            onFlipped={() => setAnswered(true)}
          />
        ) : (
          <MCQuestion
            key={cardKey}
            card={card as MCCard}
            onAnswered={() => setAnswered(true)}
          />
        )}
      </View>

      {answered && (
        <View style={styles.actions}>
          <ActionButtons
            onAccept={handleAccept}
            onAcceptAndOverview={handleAcceptAndOverview}
            onMarkReview={handleMarkReview}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: {},
  backText: { color: Colors.primary, fontSize: 15 },
  counter: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  cardArea: { flex: 1, paddingHorizontal: 16 },
  actions: { padding: 16 },
  endScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  endTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', marginBottom: 8 },
  endBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, alignItems: 'center', width: '100%' },
  endBtnText: { color: Colors.textOnPrimary, fontWeight: '700', fontSize: 16 },
  endBtnSecondary: { borderWidth: 1, borderColor: Colors.border, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, alignItems: 'center', width: '100%' },
  endBtnSecondaryText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 16 },
});
