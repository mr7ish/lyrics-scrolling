# lyrics-scrolling AI 提示词模板

本文件提供一组可直接复制的提示词模板，用于指导 AI 在项目中正确接入 `lyrics-scrolling`。

使用原则：

1. 先让 AI 阅读 `AI_USAGE.md`。
2. 再给出你的业务目标、技术栈和限制条件。
3. 明确要求 AI 不要臆造不存在的 API。

## 模板 1：基础接入

适合场景：在 Vue 3 + TypeScript 页面中接入歌词滚动组件。

```text
请先阅读项目根目录的 AI_USAGE.md，并严格按照其中的规则使用 lyrics-scrolling。

现在请你在一个 Vue 3 + TypeScript 页面中接入 lyrics-scrolling，完成一个基础歌词滚动区域。

要求：
1. 引入 lyrics-scrolling/style.css
2. 使用 parseLrc 解析 LRC 字符串
3. 传给 LyricsScroller 的必须是 parsedLyrics.lines
4. currentTimeMs 必须使用毫秒
5. 不要使用 AI_USAGE.md 中未列出的 props、事件或导出项
6. 如果没有歌词，设置合适的 placeholder

请直接输出可运行代码，而不是只讲思路。
```

## 模板 2：和 audio 元素联动

适合场景：页面中已有原生音频播放器，需要驱动歌词高亮和滚动。

```text
请先阅读项目根目录的 AI_USAGE.md，并严格按照其中的规则使用 lyrics-scrolling。

请基于 Vue 3 + TypeScript，帮我把 lyrics-scrolling 和原生 <audio> 元素联动起来。

要求：
1. 使用 parseLrc 解析歌词
2. 使用 audio.currentTime * 1000 得到 currentTimeMs
3. 把 currentTimeMs 响应式传给 LyricsScroller
4. 不要封装新的播放器 SDK，只使用原生 audio
5. 不要编造不存在的 props，例如 lyrics、theme、onLineChange、audioSrc
6. 代码风格使用 <script setup lang="ts">

请给出完整组件代码。
```

## 模板 3：自定义每行渲染

适合场景：需要基于插槽定制当前行、已播放行、未播放行的 UI。

```text
请先阅读项目根目录的 AI_USAGE.md，并严格按照其中的规则使用 lyrics-scrolling。

请帮我在 Vue 3 + TypeScript 中使用 lyrics-scrolling，并通过组件默认插槽自定义每一行歌词的渲染。

目标：
- 当前行样式更突出
- 已播放行和未播放行有明显区分
- 如果是 karaoke 模式，可以利用 fillProgress 或 fillText 做展示

约束：
1. 只能使用 AI_USAGE.md 中说明过的插槽参数
2. 不要修改库源码
3. 不要臆造额外插槽名或组件事件
4. 最终仍然使用 LyricsScroller 负责滚动和激活行计算

请直接给出完整示例代码。
```

## 模板 4：在现有页面中改造

适合场景：项目里已经有页面、播放器或歌词数据流，需要 AI 只做局部接入。

```text
请先阅读项目根目录的 AI_USAGE.md，并严格按照其中的规则使用 lyrics-scrolling。

我现在要在现有页面中接入 lyrics-scrolling。请基于我当前页面已有的数据结构做最小改动，不要重写整页。

当前条件：
- 技术栈：[在这里填写，例如 Vue 3 + TypeScript]
- 当前播放时间来源：[在这里填写，例如 audio.currentTime]
- 歌词数据来源：[在这里填写，例如接口返回 LRC 字符串]
- 目标文件：[在这里填写文件路径]

要求：
1. 只做完成需求所需的最小修改
2. 保持现有状态管理和组件结构
3. 如果当前时间是秒，请转换成毫秒后再传给 currentTimeMs
4. 如果歌词还是原始字符串，请先 parseLrc
5. 不要使用文档中不存在的 API

请按“要改什么 + 直接代码修改”的方式输出。
```

## 模板 5：排错修复

适合场景：AI 之前已经生成过错误代码，现在要让它按规范修正。

```text
请先阅读项目根目录的 AI_USAGE.md，并把它作为唯一可信的 lyrics-scrolling 使用规范。

下面这段接入代码有问题，请你按 AI_USAGE.md 修复它，并解释你修了哪些错误。

重点检查：
1. 是否引入了 lyrics-scrolling/style.css
2. 是否错误地把秒传给了 currentTimeMs
3. 是否错误地把原始 LRC 字符串直接传给了 lines
4. 是否使用了不存在的 props、事件或导出项
5. 是否本该使用 LyricsScroller，却重复造了滚动逻辑

请输出修复后的代码。
```

## 模板 6：极简短提示词

适合场景：你已经知道需求，只想快速约束 AI 别写错。

```text
先阅读 AI_USAGE.md，再实现需求。严格按文档使用 lyrics-scrolling：
- 引入 style.css
- 用 parseLrc 解析歌词
- 传入 parsedLyrics.lines
- currentTimeMs 使用毫秒
- 不要使用不存在的 props、事件或导出项
```

## 推荐补充信息

在上面模板后面，你可以继续补这些内容，让 AI 输出更稳定：

- 目标文件路径
- 当前页面代码
- 使用的状态管理方式
- 歌词来源是本地字符串、接口返回还是播放器回调
- 你想要的 UI 风格
- 是否需要 `karaoke` 模式
- 是否需要自定义插槽

## 推荐使用方式

最稳妥的做法是把提示词分成两段：

第一段先立规则：

```text
先阅读 AI_USAGE.md，并把它当作使用 lyrics-scrolling 的唯一规范。
如果我的需求和 AI_USAGE.md 冲突，以 AI_USAGE.md 为准。
不要臆造任何未公开 API。
```

第二段再写业务需求：

```text
现在请在 [文件路径] 中实现 [你的需求]。
当前歌词来源是 [你的来源]。
当前播放时间来源是 [你的来源]。
我需要的效果是 [你的效果]。
```
