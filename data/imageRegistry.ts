// Map local image filenames to their require() calls.
// Add an entry here whenever you add a new image to assets/images/.
// Remote https:// URLs do not need to be registered — they're used directly.
const localImages: Record<string, number> = {
  // example:
  // 'court-diagram.png': require('../assets/images/court-diagram.png'),
};

export type ImageSource = { uri: string } | number | null;

export function resolveImage(src: string | undefined): ImageSource {
  if (!src) return null;
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return { uri: src };
  }
  return localImages[src] ?? null;
}
