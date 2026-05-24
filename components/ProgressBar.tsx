import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  done: number;
  review: number;
  total: number;
}

export default function ProgressBar({ done, review, total }: Props) {
  if (total === 0) return null;
  const donePct = (done / total) * 100;
  const reviewPct = (review / total) * 100;

  return (
    <View style={styles.track}>
      <View style={[styles.segment, { width: `${donePct}%`, backgroundColor: Colors.statusDone }]} />
      <View style={[styles.segment, { width: `${reviewPct}%`, backgroundColor: Colors.statusReview }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  segment: {
    height: '100%',
  },
});
