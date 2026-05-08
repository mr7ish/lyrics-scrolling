import { describe, expect, it } from 'vitest';
import { findActiveLyricIndex, parseLrc, stringifyLrcTime } from './parseLrc';

describe('parseLrc', () => {
  it('extracts metadata and timed lines', () => {
    const parsed = parseLrc(`[ti:Demo Song]
[ar:Codex]
[00:00.00]Intro
[00:15.50]Verse`);

    expect(parsed.metadata).toEqual({
      artist: 'Codex',
      title: 'Demo Song',
    });
    expect(parsed.lines).toEqual([
      expect.objectContaining({
        text: 'Intro',
        timeMs: 0,
      }),
      expect.objectContaining({
        text: 'Verse',
        timeMs: 15_500,
      }),
    ]);
  });

  it('supports multiple timestamps on one lyric line', () => {
    const parsed = parseLrc('[00:10.00][00:20.25]Echo');

    expect(parsed.lines.map((line) => line.timeMs)).toEqual([10_000, 20_250]);
    expect(parsed.lines.every((line) => line.text === 'Echo')).toBe(true);
  });

  it('applies offset metadata to lyric timings', () => {
    const parsed = parseLrc(`[offset:120]
[00:05.00]Ahead`);

    expect(parsed.metadata.offset).toBe(120);
    expect(parsed.lines[0]?.timeMs).toBe(5_120);
  });
});

describe('findActiveLyricIndex', () => {
  const lines = parseLrc(`[00:01.00]One
[00:02.00]Two
[00:03.00]Three`).lines;

  it('returns -1 before the first line', () => {
    expect(findActiveLyricIndex(lines, 500)).toBe(-1);
  });

  it('resolves the current active line by time', () => {
    expect(findActiveLyricIndex(lines, 2_500)).toBe(1);
  });

  it('uses a previous index hint safely during sequential playback', () => {
    const hinted = findActiveLyricIndex(lines, 3_100, 1);
    expect(hinted).toBe(2);
  });
});

describe('stringifyLrcTime', () => {
  it('formats millisecond timestamps as LRC time tags', () => {
    expect(stringifyLrcTime(90_345)).toBe('[01:30.345]');
  });
});
