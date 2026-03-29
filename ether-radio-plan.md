# Ether Radio — 产品规划文档

> 版本：v1.2 | 日期：2026-03-28 | 作者：Claude × 你
> 变更：新增国内/国际电台切换；布局改为桌面端优先自适应设计

---

## 一、产品概述

| 项目 | 内容 |
|------|------|
| 产品名称 | Ether Radio |
| 产品类型 | 在线电台播放器（Web 网页版） |
| 目标平台 | Desktop Web 优先，兼容 Tablet / Mobile |
| 数据来源 | 国际：Radio Browser API（免费，30,000+ 电台）；国内：聚合公开直播流 |
| 核心价值 | 一键切换国内外广播，复古拟物风格，桌面端沉浸体验 |

---

## 二、信息架构

```
App Shell（桌面端三栏布局）
│
├── 左侧边栏 Sidebar（固定，240px）
│   ├── Logo + 应用名
│   ├── 国内 / 国际 切换拨杆 RegionToggle  ← 新增
│   ├── 主导航：首页 / 发现 / 收藏 / 搜索
│   └── 当前播放电台缩略信息（迷你播放区）
│
├── 主内容区 Main（自适应宽度）
│   ├── / 首页 Home
│   │   ├── 精选电台横向滚动卡片 Featured Stations
│   │   └── 最近收听列表 Recently Played
│   ├── /discover 发现 Discover
│   │   ├── 类型标签筛选 Genre Tags
│   │   ├── 国家/地区筛选 Region Filter
│   │   └── 电台卡片网格 Station Grid（响应式 2~4 列）
│   ├── /favorites 收藏 Favorites
│   │   └── 已收藏电台列表（空态插画 + 列表）
│   └── /search 搜索 Search
│       ├── 关键词输入框（防抖 300ms）
│       └── 实时搜索结果列表
│
└── 底部播放器栏 PlayerBar（固定，高度 88px，横跨全宽）
    ├── 左：电台 Logo + 名称 + 类型标签
    ├── 中：播放/暂停 · 上一个 · 下一个 · 音波动画
    └── 右：音量旋钮 · 收藏 · 分享 · 展开全屏

RegionToggle 切换逻辑：
├── 国际模式 → 数据源：Radio Browser API
└── 国内模式 → 数据源：国内直播流静态列表（见第五节）
    （切换时保留当前页面，重新拉取对应数据源）

响应式断点：
├── ≥1280px（Desktop）：左侧边栏 + 主内容区 + 底部播放器
├── 768px~1279px（Tablet）：侧边栏折叠为图标栏（64px）
└── <768px（Mobile）：侧边栏收起，底部 Tab 导航替代
```

---

## 三、核心功能列表

### P0（必须有）
- [ ] 流媒体音频播放（MP3/HLS）
- [ ] 全局播放状态（切页不中断）
- [ ] 底部播放器栏（桌面端常驻）
- [ ] 国内 / 国际电台一键切换（RegionToggle）
- [ ] 按类型浏览电台
- [ ] 关键词搜索电台
- [ ] 收藏电台（本地持久化）
- [ ] 最近收听记录（本地持久化）
- [ ] 桌面端三栏响应式布局

### P1（重要）
- [ ] 按国家/地区筛选电台
- [ ] 电台加载中状态（Spinner）
- [ ] 流加载失败自动重试 / 错误提示
- [ ] Tablet 侧边栏折叠
- [ ] Mobile 底部 Tab 降级

### P2（加分项）
- [ ] 全屏 Now Playing 展开视图
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

### 国际电台：Radio Browser API（无需注册/Key）

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

### 国内电台：本地静态直播流列表（新增）

> 国内主流电台均有公开 HTTP 直播流，无需后端，前端直接拉取即可。
> 建议维护一份 `src/data/cn-stations.js` 静态文件，后续可扩充。

```js
// src/data/cn-stations.js
export const CN_STATIONS = [
  {
    stationuuid: 'cn-ximalaya-1',
    name: '中央人民广播电台 中国之声',
    url: 'http://ngcdn001.cnr.cn/live/zgzs/index.m3u8',
    favicon: '',
    tags: 'news,talk',
    country: 'China', countrycode: 'CN',
    language: 'chinese', bitrate: 48,
  },
  {
    stationuuid: 'cn-ximalaya-2',
    name: '中央人民广播电台 音乐之声',
    url: 'http://ngcdn004.cnr.cn/live/yyzs/index.m3u8',
    favicon: '',
    tags: 'pop,music',
    country: 'China', countrycode: 'CN',
    language: 'chinese', bitrate: 48,
  },
  {
    stationuuid: 'cn-ximalaya-3',
    name: '中央人民广播电台 经济之声',
    url: 'http://ngcdn002.cnr.cn/live/jjzs/index.m3u8',
    favicon: '',
    tags: 'news,economy',
    country: 'China', countrycode: 'CN',
    language: 'chinese', bitrate: 48,
  },
  {
    stationuuid: 'cn-shanghai-1',
    name: '上海东方广播 新闻综合频率',
    url: 'http://live.xmcdn.com/live/318/64.m3u8',
    favicon: '',
    tags: 'news',
    country: 'China', countrycode: 'CN',
    language: 'chinese', bitrate: 48,
  },
  // ... 可继续扩充各省市电台
];
```

> 注意：国内直播流多为 HLS（.m3u8），Howler.js 需配合 `hls.js` 处理。

### 统一电台对象结构（国内/国际通用）

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
  // 播放状态
  currentStation: null,   // 当前播放电台对象
  isPlaying: false,
  isLoading: false,
  volume: 0.8,
  recentlyPlayed: [],     // 最多保存 20 条，持久化到 localStorage
  favorites: [],          // 持久化到 localStorage

  // 地区切换（新增）
  region: 'international', // 'international' | 'domestic'
  setRegion: (r) => {},    // 切换时重新拉取数据，不中断当前播放

  // 方法
  play: (station) => {},        // 加载并播放（自动判断 MP3 / HLS）
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
├── Layout（三栏桌面布局）
│   ├── <Sidebar />            左侧边栏（240px，Tablet 折叠为 64px，Mobile 隐藏）
│   │   ├── <Logo />
│   │   ├── <RegionToggle />   国内 ↔ 国际 切换拨杆（新增）
│   │   ├── <SideNav />        主导航链接
│   │   └── <SidebarMini />    侧边栏迷你播放信息
│   ├── <MainContent />        主内容区（flex-1，含各页面 Outlet）
│   └── <PlayerBar />          底部播放器栏（88px，全宽固定）
│       ├── 左区：电台信息
│       ├── 中区：播放控制 + WaveAnimation
│       └── 右区：音量 + 收藏 + 展开按钮
│
├── pages/
│   ├── HomePage
│   │   ├── FeaturedSection（横向滚动卡片）
│   │   └── RecentSection（列表）
│   ├── DiscoverPage
│   │   ├── GenreChipList
│   │   ├── RegionFilter（国内模式：省份/城市；国际模式：国家）
│   │   └── StationGrid（CSS Grid，auto-fill，响应式列数）
│   ├── FavoritesPage
│   │   └── StationList（或 EmptyState）
│   └── SearchPage
│       ├── SearchInput（防抖 300ms）
│       └── StationList
│
└── components/
    ├── RegionToggle        国内/国际切换（拨杆样式）     ← 新增
    ├── StationCard         电台卡片（通用）
    ├── StationList         电台列表
    ├── StationGrid         响应式电台网格
    ├── GenreChip           类型筛选标签
    ├── Sidebar             左侧导航栏
    ├── SideNav             导航链接组
    ├── PlayerBar           底部播放器（桌面端）
    ├── BottomNav           底部 Tab（Mobile 降级用）
    ├── NowPlaying          全屏播放器（弹出层）
    ├── LiveDot             绿色跳动圆点
    ├── WaveAnimation       音波动画
    └── EmptyState          空态插画组件
```

---

## 八、Figma Make Prompt

```
Design a web radio player app called "Ether Radio".

## Target Platform
Desktop web app (primary). Design at 1440px wide as the primary canvas.
Include responsive variants: 1024px (tablet, sidebar collapses to icon-only), 375px (mobile, sidebar hidden, bottom tab bar appears).

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

## Desktop Layout (3-column)
- Left sidebar (240px, fixed): Logo, RegionToggle, nav links, mini station info at bottom
- Main content area (flex-1): page content
- Bottom player bar (88px, full-width, fixed): left=station info, center=playback controls + wave, right=volume knob + actions

## Region Toggle Component (NEW)
A prominent physical flip switch or toggle lever in the sidebar, styled as vintage hardware.
- Two states: "国内" (Domestic 🇨🇳) and "国际" (International 🌍)
- Skeuomorphic design: a brass lever switch or a retro band selector button pair
- Active state glows amber; inactive state is dull metal
- Label above: "频段 / BAND"

## Pages (desktop-first)
1. Home – Main radio face. Featured stations in a wide horizontal scroll row. Recently played as a list below.
2. Discover – Frequency band selector aesthetic. Genre chips as physical selector switches across the top. Station cards in a responsive 3–4 column grid.
3. Favorites – Saved presets panel. Stations displayed as labeled preset buttons in a grid.
4. Search – Physical tuning display search bar at top. Results in a 2-column list.

## Bottom Player Bar (desktop)
Styled as the bottom panel of a vintage receiver unit:
- Left section: circular station logo (with warm glow border) + station name on VFD display + genre tag
- Center: play/pause (large physical button), prev/next (smaller buttons), animated VU bars
- Right: rotary volume knob (skeuomorphic), heart favorite toggle, share button, expand-to-fullscreen button

## Responsive Behavior
- 1024px (Tablet): sidebar collapses to 64px icon-only strip; main content expands
- 375px (Mobile): sidebar hidden; bottom tab bar replaces sidebar nav; player bar shrinks to essential controls only

## Color Palette Suggestion (you may evolve this)
Warm: walnut brown, cream, amber, brass gold
Neutral: slate gray, brushed silver
Glow accents: warm amber #F59E0B, orange-red #EA580C for indicator lights

## Deliverables
Export all components with auto-layout and variants (default / active / pressed / disabled).
Include responsive frames for 1440px, 1024px, and 375px.
Include a design token file with all colors, radii, and spacing values.
Use consistent 8px spacing grid.
```

---

## 十、Trae Prompt

```
Build a web radio player app called "Ether Radio" using React + Vite + Tailwind CSS.

## Target Layout
Desktop web app (primary). Three-column layout:
- Left sidebar: 240px fixed, collapsible to 64px icon-only on tablet (<1280px), hidden on mobile (<768px)
- Main content: flex-1, scrollable
- Bottom player bar: 88px fixed, full-width

Responsive breakpoints:
- ≥1280px: full sidebar + main + player bar
- 768–1279px: sidebar collapses to 64px icon strip
- <768px: sidebar hidden, bottom tab nav visible, player bar minimal

## Data Sources

### International (Radio Browser API, no key needed):
- Top stations: GET https://de1.api.radio-browser.info/json/stations/topvote?limit=30&hidebroken=true
- By genre: GET https://de1.api.radio-browser.info/json/stations/bytag/{tag}?limit=20&hidebroken=true
- Search: GET https://de1.api.radio-browser.info/json/stations/byname/{name}?limit=20&hidebroken=true

### Domestic (static list in src/data/cn-stations.js):
Import and use CN_STATIONS array directly. No API call needed.
Filter by tags for genre, slice for featured.

## Tech Stack
- React 18 + Vite 5
- Tailwind CSS (with custom tokens from design)
- Howler.js + hls.js (MP3 and HLS .m3u8 stream support)
- Zustand v4 (global player + region state)
- React Router v6
- lucide-react (icons)

## Routes
- / → Home
- /discover → Discover
- /favorites → Favorites
- /search → Search

## Global State (Zustand — store/playerStore.js)
{
  currentStation: null,
  isPlaying: false,
  isLoading: false,
  volume: 0.8,
  recentlyPlayed: [],     // max 20, persist localStorage
  favorites: [],          // persist localStorage
  region: 'international', // 'international' | 'domestic'
  setRegion(r) {},         // switch region, does NOT stop current playback
  play(station) {},        // auto-detect MP3 vs HLS by url extension
  pause() {},
  setVolume(v) {},
  toggleFavorite(station) {},
}

## Key Components

### <Sidebar>
- Full (≥1280px): 240px, shows logo, RegionToggle, nav links, mini station name at bottom
- Collapsed (768–1279px): 64px, icons only, tooltip on hover
- Hidden (<768px)

### <RegionToggle>
- Skeuomorphic flip-switch or lever styled component
- Two states: '国内' (domestic) and '国际' (international)
- On toggle: call store.setRegion(), refetch current page data
- Persists to localStorage

### <PlayerBar>
- Fixed bottom, full width, 88px height
- Left: station logo (40px circle) + name (VFD-style font) + genre tag
- Center: Prev / Play/Pause / Next buttons + <WaveAnimation> (shows when isPlaying)
- Right: volume slider or knob + favorite icon + expand icon

### <StationGrid>
- CSS Grid: repeat(auto-fill, minmax(220px, 1fr))
- 4 cols at 1440px, 3 cols at 1024px, 2 cols at 768px, 1 col mobile

### <StationCard>
- Logo, name, genre tag, country, pulsing live dot, click to play

### <BottomNav> (mobile only, hidden ≥768px)
- 4 tabs: Home / Discover / Favorites / Search

### <WaveAnimation>
- CSS animated bars, only when isPlaying

## Audio (Howler.js + hls.js)
- If station.url ends in .m3u8: use hls.js to get stream URL, pass to Howler
- Otherwise: pass url directly to Howler
- On load: isLoading = true
- On play: isLoading = false, isPlaying = true
- On error: show toast notification, isLoading = false

## Notes
- All international API calls in hooks/useStations.js
- Domestic stations served from src/data/cn-stations.js
- useStations hook reads region from store and returns correct data source
- Debounce search 300ms
- Station logo <img> with initials fallback on error
- No backend required
```

---

## 十一、开发里程碑

| 阶段 | 任务 | 工具 |
|------|------|------|
| D1 | 用本文档生成 Figma 设计稿（1440px + 1024px + 375px 三套断点） | Figma Make |
| D2 | 导出 Figma Design Token → 配置 tailwind.config.js | Figma + Trae |
| D3 | 搭建项目脚手架：三栏布局 + Zustand store + 路由 | Trae |
| D4 | 实现 RegionToggle + 双数据源（国内/国际）切换逻辑 | Trae |
| D5 | 实现 Home / Discover 页 + API 对接 | Trae |
| D6 | 实现 PlayerBar（底部播放器）+ Howler.js + hls.js | Trae |
| D7 | 实现 Search / Favorites + 本地持久化 | Trae |
| D8 | 响应式适配（Tablet 侧边栏折叠 + Mobile 降级）| Trae |
| D9 | 错误处理 + 细节打磨 + 部署（Vercel / Netlify） | — |

---

*文档由 Claude 生成 · Ether Radio · 2026-03-28*
