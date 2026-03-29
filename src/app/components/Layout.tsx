import React, { useEffect, useRef } from 'react';
import { Outlet } from 'react-router';
import { BottomNav } from './BottomNav';
import { MiniPlayer } from './MiniPlayer';
import { NowPlaying } from './NowPlaying';
import { Sidebar } from './Sidebar';
import { PlayerBar } from './PlayerBar';
import { usePlayerStore } from '../store/playerStore';
import { toast } from 'sonner';

export function Layout() {
  const {
    currentStation,
    isPlaying,
    pause,
    resume,
    volume,
    setVolume,
    showNowPlaying,
    setShowNowPlaying,
    sleepTimerEnd,
    setSleepTimer,
  } = usePlayerStore();

  // ── Track prev station for toast ──
  const prevStationId = useRef<string | null>(null);
  useEffect(() => {
    if (currentStation && currentStation.stationuuid !== prevStationId.current) {
      prevStationId.current = currentStation.stationuuid;
      const tag = currentStation.tags?.split(',')[0]?.toUpperCase() || 'LIVE RADIO';
      toast(`📻 ${currentStation.name}`, {
        description: tag,
        duration: 2800,
      });
    }
  }, [currentStation]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (currentStation) {
            isPlaying ? pause() : resume();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.05));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.05));
          break;
        case 'Escape':
          if (showNowPlaying) setShowNowPlaying(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStation, isPlaying, pause, resume, volume, setVolume, showNowPlaying, setShowNowPlaying]);

  // ── Sleep timer watcher ──
  useEffect(() => {
    if (!sleepTimerEnd) return;

    const interval = setInterval(() => {
      if (Date.now() >= sleepTimerEnd) {
        pause();
        setSleepTimer(null);
        toast('💤 Sleep timer — playback stopped', { duration: 3000 });
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerEnd, pause, setSleepTimer]);

  return (
    <div className="layout-root wood-grain-dark">

      {/* ── LEFT SIDEBAR — hidden on mobile ── */}
      <Sidebar />

      {/* ── MAIN PANEL ── */}
      <div className="layout-main">

        {/* Mobile-only top header bar */}
        <div
          className="layout-mobile-header"
          style={{
            background: 'linear-gradient(180deg, #2A1A0E 0%, #1E1008 100%)',
            borderBottom: '1px solid #3A2510',
            padding: '10px 16px 9px',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
          }}
        >
          {/* Left indicator cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="indicator-amber" style={{ width: 8, height: 8, borderRadius: '50%' }} />
            <div className="indicator-amber" style={{ width: 5, height: 5, borderRadius: '50%', opacity: 0.55 }} />
          </div>

          {/* Brand */}
          <div style={{ textAlign: 'center' }}>
            <div className="label-brass" style={{ fontSize: 16, letterSpacing: '0.32em' }}>
              ◈ ETHER RADIO ◈
            </div>
            <div className="label-embossed" style={{ fontSize: 6, letterSpacing: '0.28em', marginTop: 1 }}>
              WORLDWIDE BROADCAST RECEIVER
            </div>
          </div>

          {/* Right indicator cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div className="indicator-green" style={{ width: 5, height: 5, borderRadius: '50%', opacity: 0.65 }} />
            <div
              className={isPlaying ? 'indicator-red live-dot' : 'indicator-red'}
              style={{ width: 8, height: 8, borderRadius: '50%', opacity: isPlaying ? 1 : 0.35 }}
            />
          </div>
        </div>

        {/* Brass separator under mobile header */}
        <div
          className="layout-mobile-header"
          style={{
            height: 2,
            background: 'linear-gradient(90deg, #2A1A0E, #C9A227 20%, #8A6C00 50%, #C9A227 80%, #2A1A0E)',
            flexShrink: 0,
          }}
        />

        {/* ── Page content ── */}
        <div className="layout-content radio-scroll">
          <Outlet />
        </div>

        {/* ── Desktop/Tablet Player Bar ── */}
        <PlayerBar />

        {/* ── Mobile Mini Player ── */}
        <div className="layout-mini-player">
          <MiniPlayer />
        </div>

        {/* ── Mobile Bottom Nav ── */}
        <div className="layout-mobile-nav">
          <BottomNav />
        </div>
      </div>

      {/* ── Now Playing overlay (covers full layout-root) ── */}
      <NowPlaying />
    </div>
  );
}