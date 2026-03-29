import React, { useEffect, useState } from 'react';
import { X, Play, Pause, Loader2, Heart, Share2, RotateCcw, Moon } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { StationLogo } from './StationLogo';
import { VUMeter } from './VUMeter';
import { Knob } from './Knob';
import { FrequencyDial } from './FrequencyDial';
import { SignalBars } from './SignalBars';
import { motion, AnimatePresence } from 'motion/react';

function getFreqValue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  return ((Math.abs(hash) % 1000) / 1000);
}

function formatCountdown(endTs: number): string {
  const remaining = Math.max(0, Math.ceil((endTs - Date.now()) / 1000));
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const SLEEP_OPTIONS: Array<{ label: string; minutes: number | null }> = [
  { label: 'OFF', minutes: null },
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '60m', minutes: 60 },
];

export function NowPlaying() {
  const {
    currentStation,
    isPlaying,
    isLoading,
    hasError,
    volume,
    showNowPlaying,
    pause,
    resume,
    retry,
    setVolume,
    toggleFavorite,
    isFavorite,
    setShowNowPlaying,
    sleepTimerEnd,
    setSleepTimer,
  } = usePlayerStore();

  const [bass, setBass] = useState(0.5);
  const [countdown, setCountdown] = useState<string | null>(null);

  // Update countdown every second when timer is active
  useEffect(() => {
    if (!sleepTimerEnd) {
      setCountdown(null);
      return;
    }
    setCountdown(formatCountdown(sleepTimerEnd));
    const interval = setInterval(() => {
      setCountdown(formatCountdown(sleepTimerEnd));
    }, 1000);
    return () => clearInterval(interval);
  }, [sleepTimerEnd]);

  const freq = currentStation ? getFreqValue(currentStation.name) : 0.5;
  const isFav = currentStation ? isFavorite(currentStation.stationuuid) : false;
  const displayFreq = (87.5 + freq * 20.5).toFixed(1);

  const handlePlayPause = () => {
    if (isPlaying) pause();
    else resume();
  };

  const handleFav = () => {
    if (!currentStation) return;
    toggleFavorite(currentStation);
  };

  const handleShare = () => {
    if (!currentStation) return;
    if (navigator.share) {
      navigator.share({
        title: currentStation.name,
        text: `Listening to ${currentStation.name} on Ether Radio`,
      });
    } else {
      navigator.clipboard?.writeText(`Listening to ${currentStation.name} on Ether Radio`);
    }
  };

  // Determine which sleep option is active
  const activeSleepMinutes: number | null = sleepTimerEnd
    ? SLEEP_OPTIONS.find(o =>
        o.minutes !== null &&
        Math.abs((sleepTimerEnd - Date.now()) / 60000 - o.minutes) < o.minutes
      )?.minutes ?? null
    : null;

  return (
    <AnimatePresence>
      {showNowPlaying && currentStation && (
        <motion.div
          className="now-playing-overlay radio-scroll"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          {/* Top chrome bar */}
          <div
            style={{
              height: 4,
              background: 'linear-gradient(90deg, #4A3A20, #C9A227, #8A7030, #C9A227, #4A3A20)',
              boxShadow: '0 2px 8px rgba(200,160,0,0.3)',
              flexShrink: 0,
            }}
          />

          {/* Header row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px 10px',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="label-brass" style={{ fontSize: 11 }}>
                ◈ NOW PLAYING
              </div>
              {/* Live indicator */}
              {isPlaying && !isLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div
                    className="live-dot"
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#FF6500',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'Share Tech Mono, monospace',
                      fontSize: 9,
                      color: '#FF6500',
                      letterSpacing: '0.15em',
                    }}
                  >
                    LIVE
                  </span>
                </div>
              )}
            </div>

            {/* Sleep timer + close */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Sleep timer countdown badge */}
              {countdown && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,149,0,0.3)',
                    borderRadius: 6,
                    padding: '3px 8px',
                  }}
                >
                  <Moon size={10} color="#FF9500" style={{ opacity: 0.8, animation: 'sleep-tick 2s ease-in-out infinite' }} />
                  <span
                    style={{
                      fontFamily: 'Share Tech Mono, monospace',
                      fontSize: 11,
                      color: '#FF9500',
                      textShadow: '0 0 6px rgba(255,149,0,0.5)',
                    }}
                  >
                    {countdown}
                  </span>
                </div>
              )}

              <button
                className="push-btn push-btn-dark"
                onClick={() => setShowNowPlaying(false)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#A08050',
                }}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Frequency dial */}
          <div style={{ padding: '0 20px 14px', flexShrink: 0 }}>
            <FrequencyDial value={freq} width={Math.min(560, window.innerWidth - 40)} />
          </div>

          {/* Main content */}
          <div
            style={{
              flex: 1,
              padding: '0 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              maxWidth: 600,
              margin: '0 auto',
              width: '100%',
            }}
          >
            {/* VU meters + station art row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
              {/* Left VU meter */}
              <VUMeter isPlaying={isPlaying} isLoading={isLoading} width={80} height={60} label="L" />

              {/* Station art / screen */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                {/* Amber-glow station art screen */}
                <div
                  style={{
                    position: 'relative',
                    borderRadius: 16,
                    padding: 4,
                    background: isPlaying
                      ? 'linear-gradient(135deg, #C9A227, #8A6C00, #C9A227)'
                      : 'linear-gradient(135deg, #4A3A20, #2A2010, #4A3A20)',
                    boxShadow: isPlaying
                      ? '0 0 20px rgba(200,160,0,0.5), 0 0 40px rgba(200,120,0,0.25)'
                      : '0 0 8px rgba(0,0,0,0.5)',
                    transition: 'box-shadow 500ms ease, background 500ms ease',
                  }}
                >
                  <div
                    style={{
                      borderRadius: 13,
                      overflow: 'hidden',
                      background: '#1A0E06',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <StationLogo
                      favicon={currentStation.favicon}
                      name={currentStation.name}
                      size={110}
                      borderRadius={12}
                    />
                  </div>
                  {/* Scan line overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 4,
                      borderRadius: 12,
                      background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 3px)',
                      pointerEvents: 'none',
                    }}
                  />
                  {/* Loading shimmer */}
                  {isLoading && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 4,
                        borderRadius: 12,
                        background: 'linear-gradient(90deg, transparent, rgba(255,149,0,0.08), transparent)',
                        animation: 'shimmer 1.2s ease-in-out infinite',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                </div>

                {/* Station name on VFD */}
                <div
                  className="vfd-display"
                  style={{
                    width: '100%',
                    borderRadius: 8,
                    padding: '7px 14px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 20, letterSpacing: '0.06em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentStation.name.toUpperCase()}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      marginTop: 3,
                      fontSize: 12,
                      fontFamily: 'Share Tech Mono, monospace',
                      color: 'rgba(255,149,0,0.6)',
                    }}
                  >
                    <span>FM {displayFreq} MHz</span>
                    {currentStation.tags && (
                      <span>· {currentStation.tags.split(',')[0].toUpperCase()}</span>
                    )}
                    {currentStation.country && <span>· {currentStation.country.toUpperCase()}</span>}
                  </div>
                </div>
              </div>

              {/* Right VU meter */}
              <VUMeter isPlaying={isPlaying} isLoading={isLoading} width={80} height={60} label="R" side="right" />
            </div>

            {/* Signal strength + status row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', justifyContent: 'center' }}>
              <SignalBars isPlaying={isPlaying} isLoading={isLoading} bars={6} height={18} />
              {isLoading && (
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 11, color: 'rgba(255,149,0,0.6)', letterSpacing: '0.1em' }}>
                  TUNING…
                </span>
              )}
              {hasError && !isLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 11, color: '#FF4444' }}>
                    ⚠ SIGNAL LOST
                  </span>
                  <button
                    className="push-btn push-btn-dark"
                    onClick={retry}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '4px 10px',
                      borderRadius: 6,
                      color: '#FF9500',
                      fontFamily: 'Oswald, sans-serif',
                      fontSize: 10,
                      letterSpacing: '0.12em',
                    }}
                  >
                    <RotateCcw size={10} />
                    RETRY
                  </button>
                </div>
              )}
              {currentStation.bitrate > 0 && !hasError && !isLoading && (
                <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 10, color: 'rgba(180,140,60,0.5)', letterSpacing: '0.08em' }}>
                  {currentStation.bitrate}kbps
                </span>
              )}
            </div>

            {/* Controls row */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              {/* Left: Volume + Bass knobs */}
              <div style={{ display: 'flex', gap: 10 }}>
                <Knob
                  value={volume}
                  onChange={setVolume}
                  size={48}
                  label="VOL"
                  color="silver"
                />
                <Knob
                  value={bass}
                  onChange={setBass}
                  size={48}
                  label="BASS"
                  color="dark"
                />
              </div>

              {/* Center: Big play button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <button
                  className={`push-btn push-btn-amber ${isPlaying && !isLoading ? 'pressed' : ''}`}
                  onClick={handlePlayPause}
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isLoading ? (
                    <Loader2 size={30} color="#5A3000" style={{ animation: 'spin 1s linear infinite' }} />
                  ) : isPlaying ? (
                    <Pause size={30} color="#5A3000" />
                  ) : (
                    <Play size={30} color="#5A3000" style={{ marginLeft: 4 }} />
                  )}
                </button>
                <div className="label-embossed" style={{ fontSize: 8 }}>
                  {isLoading ? 'TUNING' : isPlaying ? 'ON AIR' : 'STANDBY'}
                </div>
              </div>

              {/* Right: Share + Favorite */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <button
                  className="push-btn push-btn-dark"
                  onClick={handleShare}
                  style={{
                    width: 40,
                    height: 34,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#A08050',
                  }}
                >
                  <Share2 size={14} />
                </button>

                {/* Favorite flip switch */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div
                    className="flip-switch-base"
                    style={{
                      width: 40,
                      height: 60,
                      borderRadius: 8,
                      padding: 4,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: isFav ? 'flex-start' : 'flex-end',
                      cursor: 'pointer',
                    }}
                    onClick={handleFav}
                  >
                    <div
                      className="flip-switch-lever"
                      style={{
                        width: '100%',
                        height: 26,
                        borderRadius: 5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Heart
                        size={12}
                        fill={isFav ? '#FF9500' : 'none'}
                        color={isFav ? '#FF9500' : '#888'}
                        style={{ filter: isFav ? 'drop-shadow(0 0 4px rgba(255,149,0,0.8))' : 'none' }}
                      />
                    </div>
                  </div>
                  <div className="label-embossed" style={{ fontSize: 8 }}>FAV</div>
                </div>
              </div>
            </div>

            {/* Sleep timer row */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              {/* Section label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, transparent, rgba(180,140,40,0.25))' }} />
                <div className="label-embossed" style={{ fontSize: 7, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Moon size={8} style={{ opacity: 0.5 }} />
                  SLEEP TIMER
                </div>
                <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, rgba(180,140,40,0.25), transparent)' }} />
              </div>

              <div style={{ display: 'flex', gap: 6, width: '100%' }}>
                {SLEEP_OPTIONS.map(({ label, minutes }) => {
                  const isActive = minutes === null
                    ? sleepTimerEnd === null
                    : sleepTimerEnd !== null && Math.abs((sleepTimerEnd - Date.now()) / 60000 - minutes) < minutes;
                  return (
                    <button
                      key={label}
                      className={`push-btn ${isActive ? 'push-btn-amber pressed' : 'push-btn-dark'}`}
                      onClick={() => setSleepTimer(minutes)}
                      style={{
                        flex: 1,
                        height: 30,
                        borderRadius: 5,
                        fontFamily: 'Oswald, sans-serif',
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        color: isActive ? '#2A1000' : '#8A6A40',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Perforated speaker grille */}
            <div
              className="speaker-grille"
              style={{
                width: '100%',
                height: 36,
                borderRadius: 8,
                border: '1px solid rgba(60,30,10,0.5)',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6)',
                flexShrink: 0,
              }}
            />
          </div>

          {/* Bottom padding */}
          <div style={{ height: 28, flexShrink: 0 }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
