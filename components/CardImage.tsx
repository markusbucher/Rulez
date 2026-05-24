import React, { useState } from 'react';
import { Image, View, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { resolveImage } from '../data/imageRegistry';
import { Colors } from '../constants/colors';

interface Props {
  images: string[] | undefined;
}

export default function CardImages({ images }: Props) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  const lightboxSource = lightboxSrc ? resolveImage(lightboxSrc) : null;

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.strip,
          images.length === 1 && styles.stripSingle,
        ]}
        style={styles.scrollRow}
      >
        {images.map((src) => {
          const source = resolveImage(src);
          if (!source) return null;
          return (
            <TouchableOpacity
              key={src}
              onPress={() => setLightboxSrc(src)}
              activeOpacity={0.85}
              style={[styles.thumb, images.length === 1 && styles.thumbFull]}
            >
              <Image source={source} style={styles.thumbImage} resizeMode="cover" />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Modal
        visible={!!lightboxSrc}
        transparent
        animationType="fade"
        onRequestClose={() => setLightboxSrc(null)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setLightboxSrc(null)}
        >
          {lightboxSource && (
            <Image source={lightboxSource} style={styles.fullImage} resizeMode="contain" />
          )}
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const THUMB_SIZE = 140;

const styles = StyleSheet.create({
  scrollRow: { marginBottom: 12 },
  strip: { gap: 8 },
  stripSingle: { width: '100%' },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.border,
  },
  thumbFull: {
    width: '100%',
    height: 180,
  },
  thumbImage: { width: '100%', height: '100%' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '95%',
    height: '80%',
  },
});
