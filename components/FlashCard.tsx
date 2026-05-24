import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/colors';
import CardImages from './CardImage';
import CardStatusBadge from './CardStatusBadge';
import type { FlashCard as FlashCardType } from '../data/types';
import type { CardStatus } from '../data/types';

// A tap is: finger moved < TAP_SLOP pixels AND touch lasted < TAP_MS ms
const TAP_SLOP = 8;
const TAP_MS   = 250;

interface Props {
  card: FlashCardType;
  status?: CardStatus;
  onFlipped?: () => void;
  onTapBack?: () => void;
}

export default function FlashCard({ card, status = 'new', onFlipped, onTapBack }: Props) {
  const { t } = useTranslation();
  const [flipped, setFlipped] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);

  const flip = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setFlipped(true);
      onFlipped?.();
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleTouchStart = (e: any) => {
    touchStart.current = {
      x: e.nativeEvent.pageX,
      y: e.nativeEvent.pageY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e: any) => {
    if (!touchStart.current || flipped) return;
    const dx = Math.abs(e.nativeEvent.pageX - touchStart.current.x);
    const dy = Math.abs(e.nativeEvent.pageY - touchStart.current.y);
    const dt = Date.now() - touchStart.current.time;
    touchStart.current = null;
    if (dx < TAP_SLOP && dy < TAP_SLOP && dt < TAP_MS) {
      flip();
    }
  };

  if (!flipped) {
    return (
      <Animated.View
        style={[styles.wrapper, styles.card, styles.front, { opacity }]}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <View style={styles.meta}>
          <View style={styles.articleInfo}>
            {card.articleTitle && <Text style={styles.articleTitle}>{card.articleTitle}</Text>}
            <Text style={styles.metaText}>Art. {card.article}</Text>
          </View>
          <View style={styles.metaRight}>
            <CardStatusBadge status={status} size="small" />
            <Text style={styles.metaText}>{card.type}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <CardImages images={card.imageFront} />
          <Text style={styles.frontText}>{card.front}</Text>
        </ScrollView>

        <Text style={styles.hint}>{t('quiz.tapToFlip')}</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[styles.wrapper, styles.card, styles.back, { opacity }]}
      onTouchStart={handleTouchStart}
      onTouchEnd={(e) => {
        if (!touchStart.current) return;
        const dx = Math.abs(e.nativeEvent.pageX - touchStart.current.x);
        const dy = Math.abs(e.nativeEvent.pageY - touchStart.current.y);
        const dt = Date.now() - touchStart.current.time;
        touchStart.current = null;
        if (dx < TAP_SLOP && dy < TAP_SLOP && dt < TAP_MS) {
          onTapBack?.();
        }
      }}
    >
      <View style={styles.meta}>
        <View style={styles.articleInfo}>
          {card.articleTitle && <Text style={styles.articleTitle}>{card.articleTitle}</Text>}
          <Text style={styles.metaText}>Art. {card.article}</Text>
        </View>
        <View style={styles.metaRight}>
          <CardStatusBadge status={status} size="small" />
          <Text style={[styles.metaText, { color: Colors.primary }]}>{t('quiz.ruling')}</Text>
        </View>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <CardImages images={card.imageBack} />
        <Text style={styles.backText}>{card.back}</Text>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  front: { backgroundColor: Colors.cardFront },
  back: { backgroundColor: Colors.cardBack },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  articleInfo: { flex: 1 },
  metaRight: { alignItems: 'flex-end', gap: 4 },
  articleTitle: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 8 },
  frontText: { fontSize: 16, lineHeight: 24, color: Colors.textPrimary },
  backText: { fontSize: 15, lineHeight: 23, color: Colors.textPrimary },
  hint: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 12,
  },
});
