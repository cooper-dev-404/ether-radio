# Ether Radio — 产品规划文档

> 版本：v1.0 | 日期：2026-03-28 | 作者：Claude × 你

---

## 一、产品概述

| 项目 | 内容 |
|------|------|
| 产品名称 | Ether Radio |
| 产品类型 | 在线电台播放器（Web 网页版） |
| 目标平台 | Desktop & Mobile Web |
| 数据来源 | Radio Browser API（免费，无需 Key，30,000+ 全球电台） |
| 核心价值 | 零门槛收听全球广播，干净、快速、好看 |

---

## 二、信息架构

```
App Shell
├── 底部导航栏（持久）
├── 迷你播放器（持久悬浮，位于导航栏上方）
│
├── / 首页 Home
│   ├── 精选电台横向滚动卡片 Featured Stations
│   └── 最近收听列表 Recently Played
│
├── /discover 发现 Discover
│   ├── 类型标签筛选 Genre Tags
│   ├── 国家筛选 Country Filter
│   └── 电台卡片网格 Station Grid
│
├── /favorites 收藏 Favorites
│   └── 已收藏电台列表（空态插画 + 列表）
│
├── /search 搜索 Search
│   ├── 关键词输入框（防抖 300ms）
│   └── 实时搜索结果列表
│
└── Now Playing 全屏播放器（从迷你播放器点击展开）
    ├── 模糊电台封面背景
    ├── 电台名称 + 类型标签
    ├── 音波动画可视化
    └── 播放/暂停 · 音量 · 收藏 · 分享
```

---

## 三、核心功能列表

### P0（必须有）
- [ ] 流媒体音频播放（MP3/HLS）
- [ ] 全局播放状态（切页不中断）
- [ ] 迷你播放器 + 全屏播放器
- [ ] 按类型浏览电台
- [ ] 关键词搜索电台
- [ ] 收藏电台（本地持久化）
- [ ] 最近收听记录（本地持久化）

### P1（重要）
- [ ] 按国家筛选电台
- [ ] 电台加载中状态（Spinner）
- [ ] 流加载失败自动重试 / 错误提示
- [ ] 响应式布局（移动端适配）

### P2（加分项）
- [ ] 深色 / 浅色主题切换
- [ ] 键盘快捷键（空格暂停、方向键音量）
- [ ] PWA 支持（离线缓存收藏列表）
- [ ] 分享电台链接

---

## 四、技术栈

| 层级 | 选型 | 版本建议 | 理由 |
|------|------|----------|------|
| 框架 | React + Vite | React 18 / Vite 5 | 生态最成熟，Trae 支持最好 |
| 样式 | Tailwind CSS | v3 | 与 Figma 变量对应方便，暗色模式友好 |
| 音频 | Howler.js | v2 | 处理 MP3/HLS 流，跨浏览器兼容 |
| 路由 | React Router | v6 | 标准选型 |
| 状态管理 | Zustand | v4 | 轻量，全局播放状态共享 |
| 本地持久化 | localStorage | — | 存收藏 + 最近收听，无需后端 |
| 图标 | lucide-react | latest | 轻量 SVG 图标 |
| HTTP | fetch / axios | — | API 请求 |

---

## 五、数据接口

### Radio Browser API（无需注册/Key）

```
Base URL: https://de1.api.radio-browser.info/json

# 获取热门电台（首页精选）
GET /stations/topvote?limit=30&hidebroken=true

# 按类型获取电台（发现页）
GET /stations/bytag/{tag}?limit=20&hidebroken=true
# 常用 tag: pop, jazz, news, classical, rock, electronic, talk, sports

# 关键词搜索
GET /stations/byname/{name}?limit=20&hidebroken=true

# 按国家获取
GET /stations/bycountry/{country}?limit=20&hidebroken=true
```

### 电台对象结构

```json
{
  "stationuuid": "uuid-string",
  "name": "Radio Station Name",
  "url": "https://stream.example.com/stream.mp3",
  "favicon": "https://example.com/logo.png",
  "tags": "pop,top40",
  "country": "Japan",
  "countrycode": "JP",
  "language": "japanese",
  "votes": 1234,
  "codec": "MP3",
  "bitrate": 128
}
```

---

## 六、全局状态设计（Zustand）

```js
// store/playerStore.js
{
  // 状态
  currentStation: null,   // 当前播放电台对象
  isPlaying: false,
  isLoading: false,
  volume: 0.8,
  recentlyPlayed: [],     // 最多保存 20 条，持久化到 localStorage
  favorites: [],          // 持久化到 localStorage

  // 方法
  play: (station) => {},        // 加载并播放
  pause: () => {},
  resume: () => {},
  setVolume: (v) => {},
  toggleFavorite: (station) => {},
  addToRecent: (station) => {},
}
```

---

## 七、组件树

```
App
├── Layout
│   ├── <Outlet />（页面内容区）
│   ├── <MiniPlayer />（条件渲染，有 currentStation 时显示）
│   └── <BottomNav />
│
├── pages/
│   ├── HomePage
│   │   ├── FeaturedSection（横向滚动）
│   │   └── RecentSection（列表）
│   ├── DiscoverPage
│   │   ├── GenreChipList
│   │   ├── CountryFilter
│   │   └── StationGrid
│   ├── FavoritesPage
│   │   └── StationList（或 EmptyState）
│   └── SearchPage
│       ├── SearchInput（防抖）
│       └── StationList
│
└── components/
    ├── StationCard         电台卡片（通用）
    ├── StationList         电台列表
    ├── StationGrid         电台网格
    ├── GenreChip           类型筛选标签
    ├── MiniPlayer          迷你播放器
    ├── NowPlaying          全屏播放器（Sheet 组件）
    ├── BottomNav           底部导航
    ├── LiveDot             绿色跳动圆点
    ├── WaveAnimation       音波动画
    └── EmptyState          空态插画组件
```

---

## 八、Figma Make Prompt

```
Design a web radio player app called "Ether Radio".

## Visual Style — Retro Skeuomorphic
The entire app should look and feel like a physical vintage radio/hi-fi device from the 1960s–70s, brought to life on screen. Think warm walnut wood panels, brushed aluminum knobs, cream bakelite dials, amber VU meters, and glowing vacuum tube indicators. Every surface should have material depth — real shadows, embossed labels, worn textures. Users should feel like they are touching actual hardware.

Design references: vintage Braun radios, classic Dieter Rams hi-fi systems, retro Grundig tube radios.

Key skeuomorphic elements to include:
- Tactile knobs for volume and tuning (rendered with radial gradients + highlight, as if lit from above)
- Physical toggle switches and push buttons with pressed/unpressed states
- Analog-style frequency dial / tuning band with a needle indicator
- Amber/orange backlit LCD or VFD-style display for station name and frequency
- VU meter with animated needle for audio level visualization
- Perforated speaker grille texture on card backgrounds
- Wood grain or brushed metal surface textures on containers
- Embossed / debossed labels with subtle letterpress effect
- Worn chrome or brass accents on borders and separators

## Pages (same structure, new skin)
1. Home – Styled as the main radio face. Featured stations shown as large tuning presets (numbered buttons). Recently played as a paper tape roll list.
2. Discover – Looks like a frequency band selector. Genre tags are physical selector switches. Station cards have a vintage radio receiver aesthetic.
3. Favorites – A "saved presets" panel, styled like the preset memory buttons on a classic car radio.
4. Search – A tuning dial + search field styled as a physical frequency display. Results appear as a scrollable station log.

## Persistent Elements
- Mini player: a slim hardware strip at the bottom — glowing station name on VFD display, physical play/pause button, signal strength bars
- Bottom nav: styled as a row of tactile hardware buttons with engraved icons

## Now Playing (full screen)
Render as an open vintage radio face. Large circular tuning dial center stage. Station art shown in a rounded-rect "screen" with amber glow border. VU meters flanking both sides. Volume knob bottom-left, favorite toggle as a physical flip switch bottom-right.

## Color Palette Suggestion (you may evolve this)
Warm: walnut brown, cream, amber, brass gold
Neutral: slate gray, brushed silver
Glow accents: warm amber #F59E0B, orange-red #EA580C for indicator lights

## Deliverables
Export all components with auto-layout and variants (default / active / pressed / disabled).
Include a design token file with all colors, radii, and spacing values.
Use consistent 8px spacing grid.
```

---

## 十、Trae Prompt

```
Build a web radio player app called "Ether Radio" using React + Vite + Tailwind CSS.

## Data Source
Use the Radio Browser API (no API key needed):
- Top stations (home): GET https://de1.api.radio-browser.info/json/stations/topvote?limit=30&hidebroken=true
- By genre (discover): GET https://de1.api.radio-browser.info/json/stations/bytag/{tag}?limit=20&hidebroken=true
- Search: GET https://de1.api.radio-browser.info/json/stations/byname/{name}?limit=20&hidebroken=true

## Tech Stack
- React 18 + Vite 5
- Tailwind CSS (dark mode: class strategy)
- Howler.js (stream audio)
- Zustand (global player state)
- React Router v6
- lucide-react (icons)

## Routes
- / → Home page
- /discover → Discover page
- /favorites → Favorites page
- /search → Search page

## Global Player State (Zustand)
Create store/playerStore.js:
{
  currentStation: null,
  isPlaying: false,
  isLoading: false,
  volume: 0.8,
  recentlyPlayed: [],   // persist to localStorage, max 20 items
  favorites: [],        // persist to localStorage
  play(station) {},
  pause() {},
  setVolume(v) {},
  toggleFavorite(station) {},
}

## Components
- <BottomNav> – 4 tabs with lucide-react icons, active state with indigo accent
- <MiniPlayer> – Fixed bar above BottomNav, shows when currentStation != null, click to open NowPlaying sheet
- <NowPlaying> – Full-screen bottom sheet (slide-up), blurred bg, controls
- <StationCard> – round logo, name, genre tag, country, pulsing live dot, click to play
- <GenreChip> – pill button for genre filter
- <WaveAnimation> – CSS animated bars, shows when isPlaying

## Audio (Howler.js)
- Stream station.url
- Handle loading state → set isLoading: true
- On error: show toast, set isLoading: false
- Destroy previous Howl before creating new one

## Tailwind Config
Extend with custom colors:
- bg-base: #0F1117
- bg-card: #1C1F2E
- bg-elevated: #252836
- accent: #6366F1

## Notes
- Debounce search input 300ms
- Station logo <img> with fallback div on error (show station initials)
- All API calls in custom hooks (hooks/useStations.js)
- No backend required
```

---

## 十一、开发里程碑

| 阶段 | 任务 | 工具 |
|------|------|------|
| D1 | 用本文档生成 Figma 设计稿 | Figma Make |
| D2 | 导出 Figma Design Token（颜色/字体/间距）→ 配置 tailwind.config.js | Figma |
| D3 | 用 Trae Prompt 搭建项目脚手架 + 核心状态 | Trae |
| D4 | 实现 Home / Discover 页 + API 对接 | Trae |
| D5 | 实现播放器（MiniPlayer + NowPlaying）+ Howler.js | Trae |
| D6 | 实现 Search / Favorites + 本地持久化 | Trae |
| D7 | 响应式适配 + 错误处理 + 细节打磨 | Trae |
| D8 | 部署（Vercel / Netlify 一键） | — |

---

*文档由 Claude 生成 · Ether Radio · 2026-03-28*
