import type { LrcMetadata, LyricLine, ParsedLyrics } from '../types';

const TIME_TAG_PATTERN = /\[(\d{2,}):(\d{2})(?:\.(\d{1,3}))?\]/g;
const METADATA_PATTERN = /^\[([a-zA-Z][\w-]*):(.*)]$/;
type KnownMetadataKey = 'album' | 'artist' | 'by' | 'offset' | 'title';

const metadataAliases = {
  al: 'album',
  ar: 'artist',
  by: 'by',
  offset: 'offset',
  ti: 'title',
} as const satisfies Partial<Record<string, KnownMetadataKey>>;

function fractionToMilliseconds(fraction: string | undefined): number {
  if (!fraction) {
    return 0;
  }

  if (fraction.length === 1) {
    return Number(fraction) * 100;
  }

  if (fraction.length === 2) {
    return Number(fraction) * 10;
  }

  return Number(fraction.slice(0, 3));
}

function parseMetadataValue(key: string, rawValue: string): string | number {
  if (key === 'offset') {
    const parsed = Number(rawValue.trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return rawValue.trim();
}

function parseTimeTag(match: RegExpMatchArray): { label: string; timeMs: number } {
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  const milliseconds = fractionToMilliseconds(match[3]);

  return {
    label: match[0],
    timeMs: minutes * 60_000 + seconds * 1_000 + milliseconds,
  };
}

export function stringifyLrcTime(timeMs: number): string {
  const safeTime = Math.max(0, Math.floor(timeMs));
  const minutes = Math.floor(safeTime / 60_000);
  const seconds = Math.floor((safeTime % 60_000) / 1_000);
  const milliseconds = safeTime % 1_000;

  return `[${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(
    milliseconds,
  ).padStart(3, '0')}]`;
}

export function parseLrc(source: string): ParsedLyrics {
  const metadata: LrcMetadata = {};
  const rawLines = source.split(/\r?\n/);
  const parsedLines: LyricLine[] = [];

  for (const rawLine of rawLines) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      continue;
    }

    const timeMatches = [...line.matchAll(TIME_TAG_PATTERN)];

    if (timeMatches.length > 0) {
      const text = line.replace(TIME_TAG_PATTERN, '').trim();

      for (const timeMatch of timeMatches) {
        const { label, timeMs } = parseTimeTag(timeMatch);

        parsedLines.push({
          id: `${timeMs}-${parsedLines.length}`,
          index: parsedLines.length,
          timeMs,
          text,
          isEmpty: text.length === 0,
          originalTimeTag: label,
        });
      }

      continue;
    }

    const metadataMatch = line.match(METADATA_PATTERN);

    if (!metadataMatch) {
      continue;
    }

    const [, rawKey, rawValue] = metadataMatch;
    const loweredKey = rawKey.toLowerCase();
    const normalizedKey =
      loweredKey in metadataAliases
        ? metadataAliases[loweredKey as keyof typeof metadataAliases]
        : rawKey;
    metadata[normalizedKey] = parseMetadataValue(normalizedKey, rawValue);
  }

  const offset = typeof metadata.offset === 'number' ? metadata.offset : 0;

  const lines = parsedLines
    .map((line, index) => ({
      ...line,
      id: `${line.timeMs + offset}-${index}`,
      index,
      timeMs: Math.max(0, line.timeMs + offset),
    }))
    .sort((left, right) => {
      if (left.timeMs !== right.timeMs) {
        return left.timeMs - right.timeMs;
      }

      return left.index - right.index;
    })
    .map((line, index) => ({
      ...line,
      index,
    }));

  return {
    metadata,
    lines,
  };
}

export function findActiveLyricIndex(
  lines: readonly Pick<LyricLine, 'timeMs'>[],
  currentTimeMs: number,
  lastKnownIndex = -1,
): number {
  if (lines.length === 0 || !Number.isFinite(currentTimeMs)) {
    return -1;
  }

  if (lastKnownIndex >= 0 && lastKnownIndex < lines.length) {
    const currentLine = lines[lastKnownIndex];
    const nextLine = lines[lastKnownIndex + 1];

    if (
      currentLine.timeMs <= currentTimeMs &&
      (!nextLine || currentTimeMs < nextLine.timeMs)
    ) {
      return lastKnownIndex;
    }

    const nextAfterNextLine = lines[lastKnownIndex + 2];

    if (
      nextLine &&
      nextLine.timeMs <= currentTimeMs &&
      (!nextAfterNextLine || currentTimeMs < nextAfterNextLine.timeMs)
    ) {
      return lastKnownIndex + 1;
    }

    const previousLine = lines[lastKnownIndex - 1];

    if (
      previousLine &&
      previousLine.timeMs <= currentTimeMs &&
      currentTimeMs < currentLine.timeMs
    ) {
      return lastKnownIndex - 1;
    }
  }

  if (currentTimeMs < lines[0].timeMs) {
    return -1;
  }

  let low = 0;
  let high = lines.length - 1;
  let resolvedIndex = -1;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const candidate = lines[middle];

    if (candidate.timeMs <= currentTimeMs) {
      resolvedIndex = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return resolvedIndex;
}
