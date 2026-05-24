import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/colors';

interface Props {
  onAccept: () => void;
  onAcceptAndOverview: () => void;
  onMarkReview: () => void;
  flashAccept?: boolean; // pulse the accept button (triggered by card tap)
}

export default function ActionButtons({ onAccept, onAcceptAndOverview, onMarkReview, flashAccept }: Props) {
  const { t } = useTranslation();
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!flashAccept) return;
    // Quick press-and-release animation
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1,    duration: 80, useNativeDriver: true }),
    ]).start();
  }, [flashAccept]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity style={[styles.btn, styles.primary]} onPress={onAccept}>
          <Text style={styles.primaryText}>{t('actions.accept')}</Text>
        </TouchableOpacity>
      </Animated.View>
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
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBtn: { flex: 1 },
  primary: { backgroundColor: Colors.primary },
  primaryText: { color: Colors.textOnPrimary, fontWeight: '700', fontSize: 16 },
  secondary: { backgroundColor: Colors.primary + '18', borderWidth: 1, borderColor: Colors.primary },
  secondaryText: { color: Colors.primary, fontWeight: '600', fontSize: 13 },
  review: { backgroundColor: Colors.statusReview + '22', borderWidth: 1, borderColor: Colors.statusReview },
  reviewText: { color: Colors.statusReview, fontWeight: '600', fontSize: 14 },
});
