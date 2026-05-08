export interface LrcMetadata {
  title?: string;
  artist?: string;
  album?: string;
  by?: string;
  offset?: number;
  [key: string]: string | number | undefined;
}

export interface LyricLine {
  id: string;
  index: number;
  timeMs: number;
  text: string;
  isEmpty: boolean;
  originalTimeTag: string;
}

export interface ParsedLyrics {
  metadata: LrcMetadata;
  lines: LyricLine[];
}

export type LyricsScrollerAlign = 'center' | 'start';
export type LyricsScrollerScrollMode = 'smooth' | 'step';
export type LyricsScrollerHighlightMode = 'line' | 'karaoke';
export type LyricsScrollerKaraokeMode = 'width-fill' | 'char-step';

export interface LyricsScrollerProps {
  lines: LyricLine[];
  currentTimeMs: number;
  align?: LyricsScrollerAlign;
  highlightMode?: LyricsScrollerHighlightMode;
  karaokeMode?: LyricsScrollerKaraokeMode;
  karaokeFallbackDurationMs?: number;
  highlightColor?: string;
  highlightGlowColor?: string;
  scrollMode?: LyricsScrollerScrollMode;
  visibleLineCount?: number;
  lineHeight?: number;
  inactiveOpacity?: number;
  scrollDurationMs?: number;
  hideEmptyLines?: boolean;
  placeholder?: string;
}
