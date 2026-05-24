import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/colors';
import type { CardStatus } from '../data/types';

interface Props {
  status: CardStatus;
  size?: 'small' | 'normal';
}

const statusColor: Record<CardStatus, string> = {
  new: Colors.statusNew,
  review: Colors.statusReview,
  done: Colors.statusDone,
};

export default function CardStatusBadge({ status, size = 'normal' }: Props) {
  const { t } = useTranslation();
  const label = t(`status.${status}`);
  const color = statusColor[status];
  const isSmall = size === 'small';

  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color }, isSmall && styles.badgeSmall]}>
      <Text style={[styles.text, { color }, isSmall && styles.textSmall]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 11,
  },
});
