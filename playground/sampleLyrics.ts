const importedSamples = import.meta.glob('../*.txt', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

const fallbackSample = `[ti:Midnight Signals]
[ar:Codex Ensemble]
[al:Demo Set]
[offset:0]
[00:00.00]The room goes quiet when the meter starts.
[00:06.25]One line rises slowly through the dark.
[00:12.50]Every beat pulls the focus into place.
[00:18.70]The chorus leans forward with a steady pace.
[00:25.10]
[00:27.00]Nothing flashes past before it should.
[00:33.40]Nothing stalls when timing still feels good.
[00:39.80]Hold the center, let the details glow.
[00:46.10]Then reset and watch the next line flow.`;

export const sampleLyrics =
  Object.entries(importedSamples).find(([path]) => path.endsWith('.txt'))?.[1] ?? fallbackSample;
