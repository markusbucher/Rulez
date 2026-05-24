import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProgress } from '../../hooks/useProgress';
import { useLanguage } from '../../hooks/useLanguage';
import { Colors } from '../../constants/colors';
import type { SupportedLanguage } from '../../i18n';

export default function SettingsScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { resetProgress } = useProgress(deckId);
  const { language, changeLanguage } = useLanguage();

  const handleReset = () => {
    Alert.alert(
      t('settings.resetConfirmTitle'),
      t('settings.resetConfirmMessage'),
      [
        { text: t('settings.resetCancel'), style: 'cancel' },
        {
          text: t('settings.resetConfirm'),
          style: 'destructive',
          onPress: async () => {
            await resetProgress();
            Alert.alert('', t('settings.resetDone'));
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('settings.title')}</Text>

        <Section label={t('settings.language')}>
          <View style={styles.segmented}>
            {(['de', 'en'] as SupportedLanguage[]).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[styles.segment, language === lang && styles.segmentActive]}
                onPress={() => changeLanguage(lang)}
              >
                <Text style={[styles.segmentText, language === lang && styles.segmentTextActive]}>
                  {lang === 'de' ? 'Deutsch' : 'English'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        <Section label={t('settings.dangerZone')}>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleReset}>
            <Text style={styles.dangerBtnText}>{t('settings.resetProgress')}</Text>
          </TouchableOpacity>
        </Section>
      </View>
    </SafeAreaView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      {label ? <Text style={styles.sectionLabel}>{label}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20 },
  backBtn: { marginBottom: 16 },
  backText: { color: Colors.primary, fontSize: 15 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  segmented: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  segment: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: Colors.surface },
  segmentActive: { backgroundColor: Colors.primary },
  segmentText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  segmentTextActive: { color: Colors.textOnPrimary },
  dangerBtn: {
    borderWidth: 1,
    borderColor: Colors.wrongRed,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  dangerBtnText: { color: Colors.wrongRed, fontWeight: '700', fontSize: 15 },
});
