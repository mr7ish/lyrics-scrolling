<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { findActiveLyricIndex } from '../parser/parseLrc';
import type { LyricLine, LyricsScrollerProps } from '../types';

const centerMaskImage = `linear-gradient(
  to bottom,
  transparent 0%,
  rgba(0, 0, 0, 0.95) 12%,
  rgba(0, 0, 0, 1) 24%,
  rgba(0, 0, 0, 1) 76%,
  rgba(0, 0, 0, 0.95) 88%,
  transparent 100%
)`;

const startMaskImage = `linear-gradient(
  to bottom,
  rgba(0, 0, 0, 1) 0%,
  rgba(0, 0, 0, 1) 76%,
  rgba(0, 0, 0, 0.95) 88%,
  transparent 100%
)`;

const props = withDefaults(defineProps<LyricsScrollerProps>(), {
  align: 'center',
  hideEmptyLines: false,
  highlightMode: 'line',
  highlightColor: 'rgba(255, 248, 235, 1)',
  highlightGlowColor: 'rgba(255, 201, 105, 0.16)',
  inactiveOpacity: 0.38,
  karaokeFallbackDurationMs: 2_000,
  karaokeMode: 'width-fill',
  lineHeight: 56,
  placeholder: 'Lyrics will appear here.',
  scrollDurationMs: 320,
  scrollMode: 'smooth',
  visibleLineCount: 7,
});

const displayLines = computed<LyricLine[]>(() =>
  props.hideEmptyLines ? props.lines.filter((line) => !line.isEmpty) : props.lines,
);

const activeIndex = ref(-1);
const lastResolvedIndex = ref(-1);

watch(
  [displayLines, () => props.currentTimeMs],
  ([lines, currentTimeMs]) => {
    const nextIndex = findActiveLyricIndex(lines, currentTimeMs, lastResolvedIndex.value);
    activeIndex.value = nextIndex;
    lastResolvedIndex.value = nextIndex;
  },
  { immediate: true },
);

const viewportHeight = computed(() => props.visibleLineCount * props.lineHeight);

const topPadding = computed(() =>
  props.align === 'center'
    ? Math.max(0, viewportHeight.value / 2 - props.lineHeight / 2)
    : 0,
);

const translateY = computed(() => {
  const resolvedIndex = activeIndex.value < 0 ? 0 : activeIndex.value;
  return -resolvedIndex * props.lineHeight;
});

const activeLine = computed(() => {
  if (activeIndex.value < 0) {
    return null;
  }

  return displayLines.value[activeIndex.value] ?? null;
});

const graphemeSegmenter =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter('zh-CN', { granularity: 'grapheme' })
    : null;

function splitGraphemes(text: string): string[] {
  if (graphemeSegmenter) {
    return Array.from(graphemeSegmenter.segment(text), (segment) => segment.segment);
  }

  return Array.from(text);
}

const lineDurationsMs = computed(() =>
  displayLines.value.map((line, index) => {
    const nextLine = displayLines.value[index + 1];

    if (nextLine && nextLine.timeMs > line.timeMs) {
      return nextLine.timeMs - line.timeMs;
    }

    return Math.max(1, props.karaokeFallbackDurationMs);
  }),
);

const activeFillProgress = computed(() => {
  if (props.highlightMode !== 'karaoke' || !activeLine.value) {
    return 0;
  }

  const durationMs =
    lineDurationsMs.value[activeIndex.value] ?? Math.max(1, props.karaokeFallbackDurationMs);
  const progress = (props.currentTimeMs - activeLine.value.timeMs) / durationMs;

  return Math.min(1, Math.max(0, progress));
});

const activeLineText = computed(() => activeLine.value?.text || '\u00A0');

const activeLineSegments = computed(() => {
  if (props.karaokeMode !== 'char-step' || !activeLine.value) {
    return [];
  }

  return splitGraphemes(activeLineText.value);
});

const activeFillText = computed(() => {
  if (activeFillProgress.value <= 0) {
    return '';
  }

  if (props.karaokeMode === 'width-fill') {
    return activeLineText.value;
  }

  const segments = activeLineSegments.value;
  const filledCount =
    activeFillProgress.value >= 1
      ? segments.length
      : Math.floor(activeFillProgress.value * segments.length);

  if (filledCount <= 0) {
    return '';
  }

  return segments.slice(0, filledCount).join('');
});

const activeFillStyle = computed<Record<string, string>>(() => {
  if (props.karaokeMode === 'char-step') {
    return {
      width: 'auto',
    };
  }

  return {
    width: `${activeFillProgress.value * 100}%`,
  };
});

const hasActiveFill = computed(() => activeFillText.value.length > 0);

const viewportStyle = computed(() => ({
  '--lyrics-inactive-opacity': String(props.inactiveOpacity),
  '--lyrics-highlight-color': props.highlightColor,
  '--lyrics-highlight-glow-color': props.highlightGlowColor,
  '--lyrics-line-height': `${props.lineHeight}px`,
  '--lyrics-transition-duration':
    props.scrollMode === 'smooth' ? `${props.scrollDurationMs}ms` : '0ms',
  height: `${viewportHeight.value}px`,
  WebkitMaskImage: props.align === 'center' ? centerMaskImage : startMaskImage,
  maskImage: props.align === 'center' ? centerMaskImage : startMaskImage,
}));

const trackStyle = computed(() => ({
  paddingTop: `${topPadding.value}px`,
  paddingBottom: `${topPadding.value}px`,
  transform: `translate3d(0, ${translateY.value}px, 0)`,
}));
</script>

<template>
  <section class="lyrics-scroller" :style="viewportStyle" aria-live="polite">
    <div v-if="displayLines.length === 0" class="lyrics-scroller__placeholder">
      {{ placeholder }}
    </div>

    <ol v-else class="lyrics-scroller__track" :style="trackStyle">
      <li
        v-for="(line, index) in displayLines"
        :key="line.id"
        class="lyrics-scroller__line"
        :class="{
          'lyrics-scroller__line--active': index === activeIndex,
          'lyrics-scroller__line--karaoke-active':
            props.highlightMode === 'karaoke' && index === activeIndex,
          'lyrics-scroller__line--past': index < activeIndex,
        }"
      >
        <slot
          :line="line"
          :fill-progress="index === activeIndex ? activeFillProgress : 0"
          :fill-text="index === activeIndex ? activeFillText : ''"
          :index="index"
          :is-active="index === activeIndex"
          :is-past="index < activeIndex"
          :is-upcoming="index > activeIndex"
        >
          <span class="lyrics-scroller__text">
            <span class="lyrics-scroller__text-base">{{ line.text || '\u00A0' }}</span>
            <span
              v-if="props.highlightMode === 'karaoke' && index === activeIndex && hasActiveFill"
              class="lyrics-scroller__text-fill"
              :style="activeFillStyle"
              aria-hidden="true"
            >
              {{ activeFillText }}
            </span>
          </span>
        </slot>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.lyrics-scroller {
  position: relative;
  overflow: hidden;
  width: 100%;
}

.lyrics-scroller__placeholder {
  display: grid;
  place-items: center;
  height: 100%;
  color: rgba(240, 234, 222, 0.7);
  font-size: 0.95rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.lyrics-scroller__track {
  margin: 0;
  padding-left: 0;
  list-style: none;
  transition: transform var(--lyrics-transition-duration) cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.lyrics-scroller__line {
  display: flex;
  align-items: center;
  height: var(--lyrics-line-height);
  color: rgba(244, 238, 227, var(--lyrics-inactive-opacity));
  font-size: clamp(1rem, 1.5vw, 1.125rem);
  letter-spacing: 0.02em;
  line-height: 1.4;
  transition:
    color 180ms ease,
    opacity 180ms ease,
    transform 180ms ease;
  transform-origin: left center;
}

.lyrics-scroller__text {
  position: relative;
  display: inline-block;
  max-width: 100%;
}

.lyrics-scroller__text-base,
.lyrics-scroller__text-fill {
  display: block;
  overflow: hidden;
  white-space: nowrap;
}

.lyrics-scroller__text-fill {
  position: absolute;
  inset: 0 auto 0 0;
  width: 0;
  color: var(--lyrics-highlight-color);
  pointer-events: none;
  text-shadow: 0 0 24px var(--lyrics-highlight-glow-color);
}

.lyrics-scroller__line--past {
  color: rgba(244, 238, 227, 0.56);
}

.lyrics-scroller__line--active {
  color: var(--lyrics-highlight-color);
  font-weight: 700;
  transform: scale(1.1);
  text-shadow: 0 0 24px var(--lyrics-highlight-glow-color);
}

.lyrics-scroller__line--karaoke-active {
  color: rgba(244, 238, 227, var(--lyrics-inactive-opacity));
  text-shadow: none;
}
</style>
