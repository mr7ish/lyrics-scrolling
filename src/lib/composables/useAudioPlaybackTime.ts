import {
  computed,
  onBeforeUnmount,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue';

export type UseAudioPlaybackTimeOptions = {
  audioElement: Readonly<Ref<HTMLAudioElement | null>>;
  fallbackMaxTimeMs: MaybeRefOrGetter<number>;
};

export function useAudioPlaybackTime(options: UseAudioPlaybackTimeOptions) {
  const audioDurationMs = ref(0);
  const animationFrameId = ref<number>();
  const isPlaying = ref(false);
  const playbackTimeMs = ref(0);

  const timelineMaxMs = computed(() => {
    const fallbackMaxTimeMs = Math.max(0, Math.round(toValue(options.fallbackMaxTimeMs)));
    return audioDurationMs.value > 0 ? audioDurationMs.value : fallbackMaxTimeMs;
  });

  function getAudioElement(): HTMLAudioElement | null {
    return options.audioElement.value;
  }

  function clampTimeMs(nextTimeMs: number): number {
    return Math.min(Math.max(0, Math.round(nextTimeMs)), timelineMaxMs.value);
  }

  function updatePlaybackTime(nextTimeMs: number): void {
    const resolvedTimeMs = clampTimeMs(nextTimeMs);

    if (resolvedTimeMs !== playbackTimeMs.value) {
      playbackTimeMs.value = resolvedTimeMs;
    }
  }

  function cancelPlaybackSync(): void {
    if (animationFrameId.value !== undefined) {
      window.cancelAnimationFrame(animationFrameId.value);
      animationFrameId.value = undefined;
    }
  }

  function syncPlaybackTime(): void {
    updatePlaybackTime((getAudioElement()?.currentTime ?? 0) * 1_000);
  }

  function schedulePlaybackSync(): void {
    if (!getAudioElement()) {
      return;
    }

    cancelPlaybackSync();

    const tick = (): void => {
      syncPlaybackTime();

      const element = getAudioElement();

      if (!element || element.paused || element.ended) {
        animationFrameId.value = undefined;
        return;
      }

      animationFrameId.value = window.requestAnimationFrame(tick);
    };

    animationFrameId.value = window.requestAnimationFrame(tick);
  }

  function seekToTimeMs(nextTimeMs: number): void {
    const resolvedTimeMs = clampTimeMs(nextTimeMs);
    updatePlaybackTime(resolvedTimeMs);

    const element = getAudioElement();

    if (!element) {
      return;
    }

    const nextTimeSeconds = resolvedTimeMs / 1_000;

    if (Math.abs(element.currentTime - nextTimeSeconds) > 0.001) {
      element.currentTime = nextTimeSeconds;
    }
  }

  function togglePlayback(): void {
    const element = getAudioElement();

    if (!element) {
      return;
    }

    if (element.paused) {
      void element.play().catch(() => {
        isPlaying.value = false;
        syncPlaybackTime();
        cancelPlaybackSync();
      });
      return;
    }

    element.pause();
  }

  function restartPlayback(): void {
    const element = getAudioElement();

    if (!element) {
      isPlaying.value = false;
      updatePlaybackTime(0);
      cancelPlaybackSync();
      return;
    }

    isPlaying.value = false;
    element.pause();
    seekToTimeMs(0);
    cancelPlaybackSync();
  }

  function handleAudioLoadedMetadata(): void {
    const durationSeconds = getAudioElement()?.duration ?? 0;
    audioDurationMs.value = Number.isFinite(durationSeconds) ? Math.round(durationSeconds * 1_000) : 0;
    syncPlaybackTime();
  }

  function handleAudioTimeUpdate(): void {
    syncPlaybackTime();
  }

  function handleAudioPlay(): void {
    isPlaying.value = true;
    schedulePlaybackSync();
  }

  function handleAudioPause(): void {
    isPlaying.value = false;
    syncPlaybackTime();
    cancelPlaybackSync();
  }

  function handleAudioEnded(): void {
    isPlaying.value = false;
    updatePlaybackTime(timelineMaxMs.value);
    cancelPlaybackSync();
  }

  function handleAudioSeeking(): void {
    syncPlaybackTime();
  }

  function addAudioEventListeners(element: HTMLAudioElement): void {
    element.addEventListener('loadedmetadata', handleAudioLoadedMetadata);
    element.addEventListener('seeking', handleAudioSeeking);
    element.addEventListener('seeked', handleAudioSeeking);
    element.addEventListener('timeupdate', handleAudioTimeUpdate);
    element.addEventListener('play', handleAudioPlay);
    element.addEventListener('pause', handleAudioPause);
    element.addEventListener('ended', handleAudioEnded);
  }

  function removeAudioEventListeners(element: HTMLAudioElement): void {
    element.removeEventListener('loadedmetadata', handleAudioLoadedMetadata);
    element.removeEventListener('seeking', handleAudioSeeking);
    element.removeEventListener('seeked', handleAudioSeeking);
    element.removeEventListener('timeupdate', handleAudioTimeUpdate);
    element.removeEventListener('play', handleAudioPlay);
    element.removeEventListener('pause', handleAudioPause);
    element.removeEventListener('ended', handleAudioEnded);
  }

  watch(options.audioElement, (nextElement, previousElement) => {
    if (previousElement) {
      removeAudioEventListeners(previousElement);
    }

    if (!nextElement) {
      isPlaying.value = false;
      audioDurationMs.value = 0;
      cancelPlaybackSync();
      return;
    }

    addAudioEventListeners(nextElement);

    const durationSeconds = nextElement.duration ?? 0;
    audioDurationMs.value = Number.isFinite(durationSeconds) ? Math.round(durationSeconds * 1_000) : 0;
    isPlaying.value = !nextElement.paused && !nextElement.ended;
    syncPlaybackTime();

    if (isPlaying.value) {
      schedulePlaybackSync();
    }
  });

  watch(timelineMaxMs, (nextTimeMs) => {
    if (playbackTimeMs.value > nextTimeMs) {
      seekToTimeMs(nextTimeMs);
    }
  });

  onBeforeUnmount(() => {
    cancelPlaybackSync();

    const element = getAudioElement();

    if (element) {
      removeAudioEventListeners(element);
    }
  });

  return {
    isPlaying,
    playbackTimeMs,
    restartPlayback,
    seekToTimeMs,
    timelineMaxMs,
    togglePlayback,
  };
}
