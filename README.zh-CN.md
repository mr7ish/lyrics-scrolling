# lyrics-scrolling 🎵

🌐 [English](./README.md)

一个基于 Vue 3 + TypeScript 的 LRC 歌词滚动组件库。

如果要让 AI 工具基于本库生成或集成代码，请参考 [AI 使用指引](./AI_USAGE.md)。

## 📦 安装

`vue` 是 `peer dependency`，需要在使用方项目中一并安装。

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

## 🚀 使用方式

同时引入组件 API 和样式文件：

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

## 🎛 显示模式

- `align="center"`：当前歌词垂直居中显示。
- `align="start"`：当前歌词靠近容器顶部显示。
- `highlight-mode="line"`：使用整行高亮效果。
- `highlight-mode="karaoke"`：仅对当前激活行做 karaoke 填充高亮。
- `karaoke-mode="width-fill"`：按宽度连续填充，允许单个字被部分填亮。
- `karaoke-mode="char-step"`：按字符离散推进高亮，使用 grapheme 分段。
- `scroll-mode="smooth"`：按 `scrollDurationMs` 做平滑滚动。
- `scroll-mode="step"`：逐行直接跳转，不做过渡动画。

## 🧩 组件属性

- `lines`：解析后的歌词行数组。
- `currentTimeMs`：当前播放时间，单位毫秒。
- `align`：`'center' | 'start'`。
- `highlightMode`：`'line' | 'karaoke'`。
- `karaokeMode`：`'width-fill' | 'char-step'`。
- `karaokeFallbackDurationMs`：当前行没有可用下一时间戳时的回退时长，最后一行同样使用这个值。
- `highlightColor`：整行高亮或 karaoke 填充时的高亮颜色。
- `highlightGlowColor`：整行高亮或 karaoke 填充时的辉光颜色。
- `scrollMode`：`'smooth' | 'step'`。
- `visibleLineCount`：可视区域内显示的歌词行数。
- `lineHeight`：每行歌词的行高，单位像素。
- `inactiveOpacity`：非激活歌词的透明度。
- `scrollDurationMs`：平滑滚动模式下的位移动画时长。
- `hideEmptyLines`：是否隐藏带时间戳的空白歌词行。
- `placeholder`：无歌词时的占位文案。

## 📝 LRC 解析行为

- 支持 `[ti:]`、`[ar:]`、`[al:]`、`[by:]`、`[offset:]` 等元信息标签。
- 支持同一行多个时间标签。
- 保留带时间戳的空白歌词行，方便参与时间同步。
- 会把 LRC 中的 `offset` 应用到最终解析结果中。
