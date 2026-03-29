/**
 * audioEngine.ts — Unified audio playback engine for Ether Radio.
 *
 * Routes between two backends transparently:
 *   • HLS streams  (.m3u8)  → hls.js attached to an <audio> element
 *   • All other streams      → native HTMLAudioElement (direct src)
 *
 * hls.js is loaded via dynamic import the first time an HLS URL is
 * encountered, keeping the initial JS bundle lean.
 *
 * The engine is a pure module-level singleton — no React involved.
 * All state mutations go through the EngineCallbacks that the Zustand
 * store passes in, keeping a clean separation of concerns.
 *
 * In development mode, HTTP stream URLs are proxied through Vite to
 * avoid CORS/CORB restrictions.
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface EngineCallbacks {
  onCanPlay: () => void;
  onPlaying: () => void;
  onWaiting: () => void;
  /** fatal = the error is unrecoverable for this session */
  onError: (fatal: boolean) => void;
  onPause: () => void;
}

// Lazy-cache for the Hls class so we only import() it once
type HlsClass = typeof import('hls.js').default;
let HlsPromise: Promise<HlsClass> | null = null;

async function getHls(): Promise<HlsClass> {
  if (!HlsPromise) {
    HlsPromise = import('hls.js').then(m => m.default);
  }
  return HlsPromise;
}

// ── Singleton state ────────────────────────────────────────────────────────

let audioEl: HTMLAudioElement | null = null;
let hlsInstance: { destroy(): void } | null = null;

// ── Helpers ────────────────────────────────────────────────────────────────

/** True when the URL is an HLS playlist. */
function isHlsUrl(url: string): boolean {
  return /\.m3u8(\?|$)/i.test(url);
}

/**
 * Convert external HTTP URLs to use Vite dev server proxy in development.
 * This bypasses CORS/CORB restrictions for Chinese radio streams.
 */
function proxyUrl(url: string): string {
  if (import.meta.env.DEV) {
    // CNR 系列: http://ngcdnXXX.cnr.cn/live/xxx/index.m3u8
    const cnrMatch = url.match(/http:\/\/(ngcdn\d+)\.cnr\.cn(.*)/)
    if (cnrMatch) {
      return `/proxy/cnr/${cnrMatch[1]}${cnrMatch[2]}`
    }
    // 喜马拉雅直播
    if (url.includes('live.xmcdn.com')) {
      return url.replace('http://live.xmcdn.com', '/proxy/xmcdn')
    }
  }
  return url
}

/**
 * Fully tear down the current audio session:
 *   - pause and blank the <audio> element
 *   - destroy any hls.js instance
 */
function teardown(): void {
  if (hlsInstance) {
    try { hlsInstance.destroy(); } catch { /* ignore */ }
    hlsInstance = null;
  }
  if (audioEl) {
    try {
      audioEl.pause();
      audioEl.src = '';
      audioEl.load();
    } catch { /* ignore */ }
    audioEl = null;
  }
}

/** Attach standard HTMLAudioElement listeners wired to the store callbacks. */
function attachListeners(el: HTMLAudioElement, cbs: EngineCallbacks): void {
  el.addEventListener('canplay',  cbs.onCanPlay);
  el.addEventListener('playing',  cbs.onPlaying);
  el.addEventListener('waiting',  cbs.onWaiting);
  el.addEventListener('stalled',  cbs.onWaiting);
  el.addEventListener('pause',    cbs.onPause);
  el.addEventListener('error',    () => cbs.onError(true));
}

/** Create a fresh <audio> element with shared baseline settings. */
function makeAudioEl(volume: number): HTMLAudioElement {
  const el = new Audio();
  el.volume = Math.max(0, Math.min(1, volume));
  el.preload = 'none';
  // Note: crossOrigin is intentionally omitted — many Chinese stream servers
  // don't send CORS headers, and setting crossOrigin='anonymous' would cause
  // the browser to reject the response entirely.
  return el;
}

// ── HLS playback ───────────────────────────────────────────────────────────

async function playHls(url: string, el: HTMLAudioElement, cbs: EngineCallbacks): Promise<void> {
  const Hls = await getHls();

  if (Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 60,
      // Retry manifest / level loads up to 3× before giving up
      manifestLoadingMaxRetry: 3,
      manifestLoadingRetryDelay: 1500,
      levelLoadingMaxRetry: 3,
      levelLoadingRetryDelay: 1500,
      // Suppress fragment gaps from causing playback stalls
      nudgeMaxRetry: 5,
    });

    hlsInstance = hls;
    hls.loadSource(url);
    hls.attachMedia(el);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      el.play().catch(() => cbs.onError(true));
    });

    hls.on(Hls.Events.ERROR, (_event: unknown, data: { fatal: boolean; type: string }) => {
      if (!data.fatal) return; // Non-fatal: hls.js recovers internally
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        // Try one network recovery before surfacing the error
        hls.startLoad();
      } else {
        cbs.onError(true);
      }
    });
  } else {
    // Safari: HLS is natively supported — just set src directly
    el.src = url;
    el.load();
    el.play().catch(() => cbs.onError(true));
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Start playing a stream URL.
 * Always destroys any previously active session first to prevent overlap.
 *
 * @param url    - Stream URL — plain HTTP/S or .m3u8
 * @param volume - Initial volume [0, 1]
 * @param cbs    - Callbacks wired to the Zustand player store
 */
export function enginePlay(
  url: string,
  volume: number,
  cbs: EngineCallbacks,
): void {
  // Synchronously tear down the old session so audio never overlaps,
  // even before the async HLS load resolves.
  teardown();

  const el = makeAudioEl(volume);
  audioEl = el;
  attachListeners(el, cbs);

  // Apply proxy for development mode
  const streamUrl = proxyUrl(url);

  if (isHlsUrl(streamUrl)) {
    // Async: load hls.js (cached after first call) then start playback.
    // If teardown() is called before this resolves (user switches station
    // rapidly), audioEl will be null and the stale session is silently dropped.
    playHls(streamUrl, el, cbs).catch(() => cbs.onError(true));
  } else {
    // Synchronous plain-stream path
    el.src = streamUrl;
    el.load();
    el.play().catch(() => cbs.onError(true));
  }
}

/** Pause playback without destroying the session. */
export function enginePause(): void {
  if (audioEl) {
    audioEl.pause();
  }
}

/**
 * Resume a paused session.
 * Returns a promise that resolves when playback restarts (or rejects on error).
 */
export function engineResume(): Promise<void> {
  if (!audioEl) return Promise.reject(new Error('No active audio session'));
  return audioEl.play();
}

/** Update volume on the active session. */
export function engineSetVolume(v: number): void {
  if (audioEl) {
    audioEl.volume = Math.max(0, Math.min(1, v));
  }
}

/** Fully destroy the active session (called on HMR dispose / app unmount). */
export function engineDestroy(): void {
  teardown();
  // Reset the Hls lazy cache so HMR starts clean
  HlsPromise = null;
}
