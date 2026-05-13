# lyrics-scrolling 🎵

🌐 [简体中文](./README.zh-CN.md)

A Vue 3 + TypeScript lyrics scrolling component library for LRC-style lyrics.

For AI-assisted code generation and integration guidance, see [AI Usage Guide](./AI_USAGE.md).

## 📦 Install

`vue` is a peer dependency and should be installed in the consuming project.

### npm

```bash
npm install lyrics-scrolling
```

### pnpm

```bash
pnpm add lyrics-scrolling
```

### bun

```bash
bun add lyrics-scrolling
```

## 🚀 Usage

Import both the component API and the published stylesheet:

```ts
import 'lyrics-scrolling/style.css';
```

### Basic Component Usage

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';
import { LyricsScroller, parseLrc } from 'lyrics-scrolling';

const currentTimeMs = ref(0);

const parsedLyrics = parseLrc(`[ti:Demo Song]
[ar:Codex]
[00:00.00]First line
[00:05.20]Second line`);

const lines = computed(() => parsedLyrics.lines);
</script>

<template>
  <LyricsScroller
    :lines="lines"
    :current-time-ms="currentTimeMs"
    align="center"
    highlight-mode="karaoke"
    karaoke-mode="width-fill"
    :karaoke-fallback-duration-ms="2200"
    highlight-color="#fff8eb"
    highlight-glow-color="rgba(255, 201, 105, 0.16)"
    scroll-mode="smooth"
  />
</template>
```

### Sync With Native Audio

`useAudioPlaybackTime` is a library-level composable that keeps `playbackTimeMs` in sync with an existing `HTMLAudioElement`. It listens to audio events, uses `requestAnimationFrame` while playback is active, and exposes helpers for play, pause, restart, and seeking.

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  LyricsScroller,
  parseLrc,
  useAudioPlaybackTime,
} from 'lyrics-scrolling';
import 'lyrics-scrolling/style.css';

const audioElement = ref<HTMLAudioElement | null>(null);

const parsedLyrics = parseLrc(`[ti:Demo Song]
[ar:Codex]
[00:00.00]First line
[00:05.20]Second line`);

const totalDurationMs = computed(() => {
  const lastLine = parsedLyrics.lines.at(-1);
  return lastLine ? lastLine.timeMs + 2200 : 60_000;
});

const {
  isPlaying,
  playbackTimeMs,
  restartPlayback,
  seekToTimeMs,
  timelineMaxMs,
  togglePlayback,
} = useAudioPlaybackTime({
  audioElement,
  fallbackMaxTimeMs: totalDurationMs,
});

function handleTimelineInput(event: Event): void {
  seekToTimeMs(Number((event.target as HTMLInputElement).value));
}
</script>

<template>
  <audio ref="audioElement" controls preload="metadata" />

  <button type="button" @click="togglePlayback">
    {{ isPlaying ? 'Pause' : 'Play' }}
  </button>
  <button type="button" @click="restartPlayback">Reset</button>

  <input
    :value="playbackTimeMs"
    type="range"
    min="0"
    :max="timelineMaxMs"
    step="10"
    @input="handleTimelineInput"
  />

  <LyricsScroller
    :lines="parsedLyrics.lines"
    :current-time-ms="playbackTimeMs"
    highlight-mode="karaoke"
    karaoke-mode="width-fill"
  />
</template>
```

## 🎛 Display Modes

- `align="center"` keeps the active lyric vertically centered.
- `align="start"` pins the active lyric near the top of the viewport.
- `highlight-mode="line"` uses the original full-line active highlight.
- `highlight-mode="karaoke"` only fills the current active line based on the current line's elapsed time.
- `karaoke-mode="width-fill"` continuously clips the active line from left to right and can partially fill a glyph.
- `karaoke-mode="char-step"` highlights the active line character by character using grapheme segmentation.
- `scroll-mode="smooth"` animates track movement with `scrollDurationMs`.
- `scroll-mode="step"` jumps directly to the next active line with no transition.

## 🧩 Component Props

- `lines`: parsed lyric line array.
- `currentTimeMs`: current playback time in milliseconds.
- `align`: `'center' | 'start'`.
- `highlightMode`: `'line' | 'karaoke'`.
- `karaokeMode`: `'width-fill' | 'char-step'`.
- `karaokeFallbackDurationMs`: fallback duration used when the current line has no valid next timestamp, including the last line.
- `highlightColor`: active highlight color for line mode and karaoke fill.
- `highlightGlowColor`: glow color for active line and karaoke fill.
- `scrollMode`: `'smooth' | 'step'`.
- `visibleLineCount`: number of visible lyric rows.
- `lineHeight`: row height in pixels.
- `inactiveOpacity`: opacity for non-active lines.
- `scrollDurationMs`: transform transition duration in smooth mode.
- `hideEmptyLines`: whether timed blank lines should be hidden.
- `placeholder`: empty-state copy.

## Composable API

### `useAudioPlaybackTime(options)`

Options:

- `audioElement`: `Ref<HTMLAudioElement | null>`. A ref to an existing native audio element.
- `fallbackMaxTimeMs`: `number | Ref<number> | (() => number)`. Used as the slider upper bound until audio metadata is available.

Returns:

- `isPlaying`: whether the audio element is currently playing.
- `playbackTimeMs`: current synced playback time in milliseconds.
- `timelineMaxMs`: resolved upper bound for seeking and sliders.
- `togglePlayback()`: plays or pauses the bound audio element.
- `restartPlayback()`: pauses and seeks back to `0`.
- `seekToTimeMs(timeMs)`: seeks the bound audio element and syncs reactive time.

## 📝 LRC Parsing Behavior

- Supports metadata tags like `[ti:]`, `[ar:]`, `[al:]`, `[by:]`, and `[offset:]`.
- Supports repeated timestamps on a single lyric line.
- Preserves empty timed lines so pauses can still participate in timing.
- Applies the LRC `offset` value to parsed timestamps.
