import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppProgress, CardStatus, LastSession } from '../data/types';
import { STORAGE_KEYS } from '../data/types';

export function useProgress(deckId: string) {
  const [progress, setProgress] = useState<Record<number, CardStatus>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.progress).then((raw) => {
      if (raw) {
        const all: AppProgress = JSON.parse(raw);
        setProgress(all[deckId] ?? {});
      }
      setLoaded(true);
    });
  }, [deckId]);

  const updateCardStatus = useCallback(
    async (cardId: number, status: CardStatus) => {
      setProgress((prev) => {
        const next = { ...prev, [cardId]: status };
        AsyncStorage.getItem(STORAGE_KEYS.progress).then((raw) => {
          const all: AppProgress = raw ? JSON.parse(raw) : {};
          all[deckId] = { ...all[deckId], [cardId]: status };
          AsyncStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(all));
        });
        return next;
      });
    },
    [deckId]
  );

  const resetProgress = useCallback(async () => {
    setProgress({});
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.progress);
    const all: AppProgress = raw ? JSON.parse(raw) : {};
    all[deckId] = {};
    await AsyncStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(all));
  }, [deckId]);

  const getStatus = useCallback(
    (cardId: number): CardStatus => progress[cardId] ?? 'new',
    [progress]
  );

  return { progress, loaded, updateCardStatus, resetProgress, getStatus };
}

export async function saveLastSession(session: LastSession): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.lastSession, JSON.stringify(session));
}

export async function loadLastSession(): Promise<LastSession | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.lastSession);
  return raw ? JSON.parse(raw) : null;
}
