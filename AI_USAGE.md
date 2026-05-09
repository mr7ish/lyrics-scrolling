# lyrics-scrolling AI 使用指引

本文件用于指导 AI 编码工具在生成代码时正确使用 `lyrics-scrolling`。请优先遵守这里的规则，不要臆造不存在的 API。

## 库定位

`lyrics-scrolling` 是一个基于 Vue 3 + TypeScript 的歌词滚动组件库，当前提供三类能力：

1. `LyricsScroller` 组件：负责歌词列表渲染、滚动、当前行高亮、karaoke 填充效果。
2. `parseLrc`：把 LRC 文本解析成结构化歌词数据。
3. `findActiveLyricIndex` / `stringifyLrcTime`：辅助做时间同步和时间格式化。

它不是一个完整播放器，不负责：

- 创建或封装 `audio` / `video` 播放器。
- 拉取歌词接口。
- 双语歌词自动配对。
- 虚拟列表。
- 主题系统。

如果需求涉及这些能力，AI 应该在业务层自行实现，再把结果接给本库。

## 生成代码时必须遵守的规则

1. 使用前必须引入样式：

```ts
import 'lyrics-scrolling/style.css';
```

2. 渲染组件时，`lines` 必须传 `LyricLine[]`，不要传原始 LRC 字符串，也不要传整个 `ParsedLyrics` 对象。
3. `currentTimeMs` 的单位是毫秒，不是秒。如果时间来自 `audio.currentTime`，必须乘以 `1000`。
4. 推荐先用 `parseLrc(lrcText)` 解析，再把 `parsedLyrics.lines` 传给组件。
5. 模板中应使用 kebab-case 属性名，例如 `current-time-ms`、`highlight-mode`、`scroll-mode`。
6. 不要臆造未公开的 props 或事件，例如 `theme`、`lyrics`、`onLineChange`、`translations`、`audioSrc`。
7. 如果只需要显示滚动歌词，优先直接使用组件，不要重复实现滚动、高亮和 active line 计算逻辑。
8. 如果没有歌词，使用 `placeholder` 指定占位文案。

## 公开 API

```ts
import {
  LyricsScroller,
  parseLrc,
  findActiveLyricIndex,
  stringifyLrcTime,
  type ParsedLyrics,
  type LyricLine,
  type LyricsScrollerProps,
  type LyricsScrollerAlign,
  type LyricsScrollerHighlightMode,
  type LyricsScrollerKaraokeMode,
  type LyricsScrollerScrollMode,
} from 'lyrics-scrolling';
```

### `parseLrc(source: string): ParsedLyrics`

返回：

```ts
interface ParsedLyrics {
  metadata: LrcMetadata;
  lines: LyricLine[];
}
```

```ts
interface LyricLine {
  id: string;
  index: number;
  timeMs: number;
  text: string;
  isEmpty: boolean;
  originalTimeTag: string;
}
```

解析行为：

- 支持元信息标签：`[ti:]`、`[ar:]`、`[al:]`、`[by:]`、`[offset:]`。
- 支持一行多个时间标签，如 `[00:10.00][00:20.25]Echo`。
- 保留带时间戳的空行，并标记为 `isEmpty: true`。
- 会把 `offset` 应用到最终 `timeMs`。
- 最终结果按 `timeMs` 升序排序。
- 无法识别为时间行或元信息的普通文本行会被忽略。

### `findActiveLyricIndex(lines, currentTimeMs, lastKnownIndex?)`

适合在业务层同步“当前歌词索引”。组件内部已经使用它；只有在你业务逻辑也需要当前行时才额外调用。

### `stringifyLrcTime(timeMs)`

把毫秒转换为 LRC 时间标签，例如 `90345 -> [01:30.345]`。

## `LyricsScroller` 组件属性

下表属性名使用 TypeScript 风格；在 Vue 模板中请改写为 kebab-case。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `lines` | `LyricLine[]` | 必填 | 已解析歌词行 |
| `currentTimeMs` | `number` | 必填 | 当前播放时间，单位毫秒 |
| `align` | `'center' \| 'start'` | `'center'` | 当前行居中或靠上显示 |
| `highlightMode` | `'line' \| 'karaoke'` | `'line'` | 整行高亮或 karaoke 填充 |
| `karaokeMode` | `'width-fill' \| 'char-step'` | `'width-fill'` | karaoke 填充方式 |
| `karaokeFallbackDurationMs` | `number` | `2000` | 当前行没有可用下一时间戳时的回退时长 |
| `highlightColor` | `string` | `rgba(255, 248, 235, 1)` | 高亮颜色 |
| `highlightGlowColor` | `string` | `rgba(255, 201, 105, 0.16)` | 高亮辉光颜色 |
| `scrollMode` | `'smooth' \| 'step'` | `'smooth'` | 平滑滚动或逐行跳转 |
| `visibleLineCount` | `number` | `7` | 可视歌词行数 |
| `lineHeight` | `number` | `56` | 每行高度，单位像素 |
| `inactiveOpacity` | `number` | `0.38` | 非激活行透明度 |
| `scrollDurationMs` | `number` | `320` | 平滑滚动时长 |
| `hideEmptyLines` | `boolean` | `false` | 是否隐藏空白歌词行 |
| `placeholder` | `string` | `'Lyrics will appear here.'` | 空状态文案 |

## 组件插槽

组件提供默认插槽，可自定义每一行的渲染。插槽参数如下：

```ts
{
  line: LyricLine;
  fillProgress: number;
  fillText: string;
  index: number;
  isActive: boolean;
  isPast: boolean;
  isUpcoming: boolean;
}
```

适用场景：

- 自定义当前行样式。
- 在 karaoke 模式下根据 `fillProgress` 做扩展 UI。
- 增加额外图标、标记或辅助信息。

## 推荐生成模式

如果 AI 需要为业务页面接入歌词滚动，优先生成下面这种结构：

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';
import { LyricsScroller, parseLrc } from 'lyrics-scrolling';
import 'lyrics-scrolling/style.css';

const currentTimeMs = ref(0);

const lrcText = `[ti:Demo Song]
[ar:Codex]
[00:00.00]First line
[00:05.20]Second line`;

const parsedLyrics = computed(() => parseLrc(lrcText));
const lyricLines = computed(() => parsedLyrics.value.lines);
</script>

<template>
  <LyricsScroller
    :lines="lyricLines"
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

如果时间来自原生音频元素，推荐这样同步：

```ts
const audio = ref<HTMLAudioElement | null>(null);
const currentTimeMs = ref(0);

function syncCurrentTime(): void {
  currentTimeMs.value = Math.floor((audio.value?.currentTime ?? 0) * 1000);
}
```

## AI 常见错误

不要生成下面这些错误用法：

- 忘记引入 `lyrics-scrolling/style.css`。
- 把 `currentTime` 的秒值直接传给 `currentTimeMs`。
- 直接把原始 LRC 字符串传给 `lines`。
- 使用不存在的 props，比如 `lyrics`、`activeIndex`、`theme`、`lineClassName`。
- 假设组件会自动创建播放器或自动拉取歌词。
- 在没有自定义需求时重写一套自己的滚动逻辑。

## 适合 AI 直接遵循的简版指令

当你在项目中使用 `lyrics-scrolling` 生成代码时，请遵守以下约束：

1. 面向 Vue 3 组件编写代码。
2. 总是引入 `lyrics-scrolling/style.css`。
3. 用 `parseLrc` 把 LRC 字符串转成 `parsedLyrics.lines` 后再传给 `LyricsScroller`。
4. `currentTimeMs` 永远使用毫秒。
5. 只使用本文档列出的 props 和导出项。
6. 若业务需要当前歌词索引，可额外使用 `findActiveLyricIndex`。
7. 若需要自定义每行 UI，使用默认插槽，不要修改库内部实现。
