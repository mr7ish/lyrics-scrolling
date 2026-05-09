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

## 📝 LRC Parsing Behavior

- Supports metadata tags like `[ti:]`, `[ar:]`, `[al:]`, `[by:]`, and `[offset:]`.
- Supports repeated timestamps on a single lyric line.
- Preserves empty timed lines so pauses can still participate in timing.
- Applies the LRC `offset` value to parsed timestamps.
