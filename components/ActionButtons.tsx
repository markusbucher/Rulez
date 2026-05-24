import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/colors';

interface Props {
  onAccept: () => void;
  onAcceptAndOverview: () => void;
  onMarkReview: () => void;
}

export default function ActionButtons({ onAccept, onAcceptAndOverview, onMarkReview }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.btn, styles.primary]} onPress={onAccept}>
        <Text style={styles.primaryText}>{t('actions.accept')}</Text>
      </TouchableOpacity>
      <View style={styles.row}>
        <TouchableOpacity style={[styles.btn, styles.rowBtn, styles.review]} onPress={onMarkReview}>
          <Text style={styles.reviewText}>{t('actions.markReview')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.rowBtn, styles.secondary]} onPress={onAcceptAndOverview}>
          <Text style={styles.secondaryText}>{t('actions.acceptAndOverview')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10, paddingTop: 16 },
  row: { flexDirection: 'row', gap: 10 },
  // Base button — no flex: 1 so height is driven by padding alone
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Applied only to buttons inside a row so they split width equally
  rowBtn: { flex: 1 },
  primary: { backgroundColor: Colors.primary },
  primaryText: { color: Colors.textOnPrimary, fontWeight: '700', fontSize: 16 },
  secondary: { backgroundColor: Colors.primary + '18', borderWidth: 1, borderColor: Colors.primary },
  secondaryText: { color: Colors.primary, fontWeight: '600', fontSize: 13 },
  review: { backgroundColor: Colors.statusReview + '22', borderWidth: 1, borderColor: Colors.statusReview },
  reviewText: { color: Colors.statusReview, fontWeight: '600', fontSize: 14 },
});
