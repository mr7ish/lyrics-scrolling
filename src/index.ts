export { default as LyricsScroller } from './lib/components/LyricsScroller.vue';
export { useAudioPlaybackTime } from './lib/composables/useAudioPlaybackTime';
export { findActiveLyricIndex, parseLrc, stringifyLrcTime } from './lib/parser/parseLrc';
export type {
  LrcMetadata,
  LyricLine,
  LyricsScrollerAlign,
  LyricsScrollerHighlightMode,
  LyricsScrollerKaraokeMode,
  LyricsScrollerProps,
  LyricsScrollerScrollMode,
  ParsedLyrics,
} from './lib/types';
export type { UseAudioPlaybackTimeOptions } from './lib/composables/useAudioPlaybackTime';
