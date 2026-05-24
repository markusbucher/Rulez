import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import CardImages from './CardImage';
import type { MCCard } from '../data/types';

interface Props {
  card: MCCard;
  shuffleOptions?: boolean;
  onAnswered?: () => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MCQuestion({ card, shuffleOptions = false, onAnswered }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const options = useMemo(
    () => (shuffleOptions ? shuffleArray(card.options) : card.options),
    [card.options, shuffleOptions]
  );

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    onAnswered?.();
  };

  const getOptionStyle = (option: string) => {
    if (!selected) return styles.option;
    if (option === card.correctAnswer) return [styles.option, styles.correct];
    if (option === selected) return [styles.option, styles.wrong];
    return [styles.option, styles.dimmed];
  };

  const getOptionTextStyle = (option: string) => {
    if (!selected) return styles.optionText;
    if (option === card.correctAnswer) return [styles.optionText, styles.correctText];
    if (option === selected) return [styles.optionText, styles.wrongText];
    return [styles.optionText, styles.dimmedText];
  };

  return (
    <View style={styles.container}>
      <View style={styles.meta}>
        <View style={styles.articleInfo}>
          {card.articleTitle && <Text style={styles.articleTitle}>{card.articleTitle}</Text>}
          <Text style={styles.metaText}>Art. {card.article}</Text>
        </View>
        <Text style={styles.metaText}>{card.type}</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <CardImages images={card.imageFront} />
        <Text style={styles.question}>{card.question}</Text>
        <View style={styles.options}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={getOptionStyle(option)}
              onPress={() => handleSelect(option)}
              activeOpacity={selected ? 1 : 0.7}
            >
              <Text style={getOptionTextStyle(option)}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 8 },
  question: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textPrimary,
    marginBottom: 20,
    fontWeight: '500',
  },
  articleInfo: { flex: 1 },
  articleTitle: { fontSize: 11, color: Colors.primary, fontWeight: '600', marginBottom: 2 },
  options: { gap: 10 },
  option: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 14,
    backgroundColor: Colors.background,
  },
  correct: {
    borderColor: Colors.correctGreen,
    backgroundColor: Colors.correctGreen + '18',
  },
  wrong: {
    borderColor: Colors.wrongRed,
    backgroundColor: Colors.wrongRed + '18',
  },
  dimmed: {
    borderColor: Colors.border,
    opacity: 0.5,
  },
  optionText: { fontSize: 15, color: Colors.textPrimary },
  correctText: { color: Colors.correctGreen, fontWeight: '600' },
  wrongText: { color: Colors.wrongRed, fontWeight: '600' },
  dimmedText: { color: Colors.textSecondary },
});
