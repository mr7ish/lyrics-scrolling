<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  LyricsScroller,
  findActiveLyricIndex,
  parseLrc,
  useAudioPlaybackTime,
  type LyricsScrollerAlign,
  type LyricsScrollerHighlightMode,
  type LyricsScrollerKaraokeMode,
  type LyricsScrollerScrollMode,
} from '../src';
import demoAudioSource from '../Taylor Swift - Lover - Lover.flac';
import { sampleLyrics } from './sampleLyrics';

const parsedLyrics = parseLrc(sampleLyrics);
const alignMode = ref<LyricsScrollerAlign>('center');
const highlightMode = ref<LyricsScrollerHighlightMode>('karaoke');
const karaokeMode = ref<LyricsScrollerKaraokeMode>('width-fill');
const karaokeFallbackDurationMs = ref(2200);
const highlightColor = ref('#fff8eb');
const highlightGlowColor = ref('#ffc969');
const scrollMode = ref<LyricsScrollerScrollMode>('smooth');
const audioFileName = 'Taylor Swift - Lover - Lover.flac';
const audioElement = ref<HTMLAudioElement | null>(null);

const totalDurationMs = computed(() => {
  const lastLine = parsedLyrics.lines.at(-1);
  return lastLine ? lastLine.timeMs + karaokeFallbackDurationMs.value + 2_000 : 60_000;
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

const activeLineIndex = computed(() =>
  findActiveLyricIndex(parsedLyrics.lines, playbackTimeMs.value),
);

const activeLine = computed(() => parsedLyrics.lines[activeLineIndex.value] ?? null);

const formattedTime = computed(() => {
  const totalSeconds = Math.floor(playbackTimeMs.value / 1_000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

function setAlignMode(mode: LyricsScrollerAlign): void {
  alignMode.value = mode;
}

function setHighlightMode(mode: LyricsScrollerHighlightMode): void {
  highlightMode.value = mode;
}

function setKaraokeMode(mode: LyricsScrollerKaraokeMode): void {
  karaokeMode.value = mode;
}

function setScrollMode(mode: LyricsScrollerScrollMode): void {
  scrollMode.value = mode;
}

function handleTimelineInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  seekToTimeMs(Number(input.value));
}
</script>

<template>
  <main class="demo-shell">
    <section class="demo-layout">
      <div class="demo-copy">
        <h1>Lyrics that stay readable while the music moves.</h1>

        <div class="demo-metadata">
          <span>{{ parsedLyrics.metadata.title ?? 'Untitled Track' }}</span>
          <span>{{ parsedLyrics.metadata.artist ?? 'Unknown Artist' }}</span>
          <span>{{ parsedLyrics.lines.length }} timed lines</span>
          <span>{{ audioFileName }}</span>
        </div>

        <div class="demo-audio">
          <audio
            ref="audioElement"
            class="demo-audio__player"
            :src="demoAudioSource"
            preload="metadata"
            controls
          />
        </div>

        <div class="demo-controls">
          <button type="button" class="demo-button demo-button--primary" @click="togglePlayback">
            {{ isPlaying ? 'Pause' : 'Play' }}
          </button>
          <button type="button" class="demo-button" @click="restartPlayback">Reset</button>
          <div class="demo-time">{{ formattedTime }}</div>
        </div>

        <label class="demo-slider">
          <span>Timeline</span>
          <input
            :value="playbackTimeMs"
            type="range"
            min="0"
            :max="timelineMaxMs"
            step="10"
            @input="handleTimelineInput"
          />
        </label>

        <div class="demo-mode-grid">
          <div class="demo-mode-group">
            <span class="demo-mode-group__label">Alignment</span>
            <div class="demo-segmented">
              <button
                type="button"
                class="demo-segmented__button"
                :class="{ 'demo-segmented__button--active': alignMode === 'center' }"
                @click="setAlignMode('center')"
              >
                Center
              </button>
              <button
                type="button"
                class="demo-segmented__button"
                :class="{ 'demo-segmented__button--active': alignMode === 'start' }"
                @click="setAlignMode('start')"
              >
                Top
              </button>
            </div>
          </div>

          <div class="demo-mode-group">
            <span class="demo-mode-group__label">Highlight</span>
            <div class="demo-segmented">
              <button
                type="button"
                class="demo-segmented__button"
                :class="{ 'demo-segmented__button--active': highlightMode === 'karaoke' }"
                @click="setHighlightMode('karaoke')"
              >
                Karaoke
              </button>
              <button
                type="button"
                class="demo-segmented__button"
                :class="{ 'demo-segmented__button--active': highlightMode === 'line' }"
                @click="setHighlightMode('line')"
              >
                Line
              </button>
            </div>
          </div>

          <div class="demo-mode-group">
            <span class="demo-mode-group__label">Karaoke mode</span>
            <div class="demo-segmented">
              <button
                type="button"
                class="demo-segmented__button"
                :class="{ 'demo-segmented__button--active': karaokeMode === 'width-fill' }"
                @click="setKaraokeMode('width-fill')"
              >
                Width
              </button>
              <button
                type="button"
                class="demo-segmented__button"
                :class="{ 'demo-segmented__button--active': karaokeMode === 'char-step' }"
                @click="setKaraokeMode('char-step')"
              >
                Char
              </button>
            </div>
          </div>

          <div class="demo-mode-group">
            <span class="demo-mode-group__label">Scroll mode</span>
            <div class="demo-segmented">
              <button
                type="button"
                class="demo-segmented__button"
                :class="{ 'demo-segmented__button--active': scrollMode === 'smooth' }"
                @click="setScrollMode('smooth')"
              >
                Smooth
              </button>
              <button
                type="button"
                class="demo-segmented__button"
                :class="{ 'demo-segmented__button--active': scrollMode === 'step' }"
                @click="setScrollMode('step')"
              >
                Step
              </button>
            </div>
          </div>

          <label class="demo-mode-group">
            <span class="demo-mode-group__label">Highlight color</span>
            <input v-model="highlightColor" class="demo-color-input" type="color" />
          </label>

          <label class="demo-mode-group">
            <span class="demo-mode-group__label">Glow color</span>
            <input v-model="highlightGlowColor" class="demo-color-input" type="color" />
          </label>

          <label class="demo-mode-group">
            <span class="demo-mode-group__label">Last line fill (ms)</span>
            <input
              v-model.number="karaokeFallbackDurationMs"
              class="demo-number-input"
              type="number"
              min="200"
              step="100"
            />
          </label>
        </div>
      </div>

      <div class="demo-preview">
        <article class="demo-card demo-card--current">
          <p class="demo-card__label">Current line</p>
          <h2>{{ activeLine?.text || 'Waiting for the first timestamp...' }}</h2>
        </article>

        <div class="demo-panel">
          <LyricsScroller
            :lines="parsedLyrics.lines"
            :current-time-ms="playbackTimeMs"
            :align="alignMode"
            :highlight-mode="highlightMode"
            :karaoke-mode="karaokeMode"
            :karaoke-fallback-duration-ms="karaokeFallbackDurationMs"
            :highlight-color="highlightColor"
            :highlight-glow-color="highlightGlowColor"
            :scroll-mode="scrollMode"
          />
        </div>
      </div>
    </section>
  </main>
</template>
