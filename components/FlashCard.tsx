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
import type { FlashCard as FlashCardType } from '../data/types';

interface Props {
  card: FlashCardType;
  onFlipped?: () => void;
}

export default function FlashCard({ card, onFlipped }: Props) {
  const { t } = useTranslation();
  const [flipped, setFlipped] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (flipped) return;
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

  if (!flipped) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={styles.wrapper}>
        <Animated.View style={[styles.card, styles.front, { opacity }]}>
          <View style={styles.meta}>
            <View style={styles.articleInfo}>
              {card.articleTitle && <Text style={styles.articleTitle}>{card.articleTitle}</Text>}
              <Text style={styles.metaText}>Art. {card.article}</Text>
            </View>
            <Text style={styles.metaText}>{card.type}</Text>
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
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View style={[styles.wrapper, styles.card, styles.back, { opacity }]}>
      <View style={styles.meta}>
        <View style={styles.articleInfo}>
          {card.articleTitle && <Text style={styles.articleTitle}>{card.articleTitle}</Text>}
          <Text style={styles.metaText}>Art. {card.article}</Text>
        </View>
        <Text style={[styles.metaText, { color: Colors.primary }]}>{t('quiz.ruling')}</Text>
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
  articleInfo: {
    flex: 1,
  },
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
