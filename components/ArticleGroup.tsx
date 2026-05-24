import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/colors';
import CardStatusBadge from './CardStatusBadge';
import type { Card, CardStatus } from '../data/types';

interface Props {
  article: string;
  articleTitle?: string;
  cards: Card[];
  getStatus: (cardId: number) => CardStatus;
  onCardPress: (cardId: number) => void;
}

export default function ArticleGroup({ article, articleTitle, cards, getStatus, onCardPress }: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const done = cards.filter((c) => getStatus(c.id) === 'done').length;

  return (
    <View style={styles.group}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded((v) => !v)}>
        <View style={styles.headerLeft}>
          {articleTitle && <Text style={styles.articleTitle}>{articleTitle}</Text>}
          <Text style={styles.article}>Art. {article}</Text>
          <Text style={styles.progress}>
            {t('overview.doneOf', { done, total: cards.length })}
          </Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.cardList}>
          {cards.map((card) => {
            const status = getStatus(card.id);
            return (
              <TouchableOpacity
                key={card.id}
                style={styles.cardRow}
                onPress={() => onCardPress(card.id)}
              >
                <View style={styles.cardInfo}>
                  <Text style={styles.cardType}>{card.type}</Text>
                  <Text style={styles.cardFront} numberOfLines={2}>{card.front}</Text>
                </View>
                <CardStatusBadge status={status} size="small" />
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    justifyContent: 'space-between',
  },
  headerLeft: { flex: 1 },
  articleTitle: { fontSize: 11, color: Colors.primary, fontWeight: '600', marginBottom: 2 },
  article: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  progress: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: 12, color: Colors.textSecondary, marginLeft: 8 },
  cardList: { borderTopWidth: 1, borderTopColor: Colors.border },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  cardInfo: { flex: 1 },
  cardType: { fontSize: 11, color: Colors.textSecondary, marginBottom: 2 },
  cardFront: { fontSize: 13, color: Colors.textPrimary },
});
