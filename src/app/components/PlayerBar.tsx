import React from 'react';
import {
  Play, Pause, Loader2, SkipBack, SkipForward,
  Heart, ChevronUp,
} from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { StationLogo } from './StationLogo';
import { VUBars } from './VUMeter';
import { Knob } from './Knob';
import { SignalBars } from './SignalBars';

export function PlayerBar() {
  const {
    currentStation,
    isPlaying,
    isLoading,
    hasError,
    pause,
    resume,
    volume,
    setVolume,
    recentlyPlayed,
    play,
    toggleFavorite,
    isFavorite,
    setShowNowPlaying,
  } = usePlayerStore();

  if (!currentStation) {
    // Idle state — just show the branded bar
    return (
      <div className="layout-player-bar">
        {/* Top chrome accent */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(180,130,40,0.4), transparent)',
          }}
        />
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <div
            className="label-embossed"
            style={{ fontSize: 9, letterSpacing: '0.3em', opacity: 0.4 }}
          >
            ◦ ◦ ◦ AWAITING SIGNAL — SELECT A STATION TO BROADCAST ◦ ◦ ◦
          </div>
        </div>
      </div>
    );
  }

  const isFav = isFavorite(currentStation.stationuuid);
  const genre = currentStation.tags?.split(',')[0]?.toUpperCase() || 'RADIO';

  // Prev / next from recently played
  const currentIdx = recentlyPlayed.findIndex(
    s => s.stationuuid === currentStation.stationuuid,
  );
  const prevStation =
    currentIdx >= 0 && currentIdx < recentlyPlayed.length - 1
      ? recentlyPlayed[currentIdx + 1]
      : null;
  const nextStation = currentIdx > 0 ? recentlyPlayed[currentIdx - 1] : null;

  const handlePlayPause = () => {
    if (isPlaying) pause();
    else resume();
  };

  return (
    <div className="layout-player-bar">
      {/* Top chrome accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: 1,
          background:
            'linear-gradient(90deg, transparent, rgba(200,160,60,0.45), transparent)',
        }}
      />

      {/* ── LEFT ZONE — Station info ── */}
      <div
        style={{
          width: 280,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 20px',
          height: '100%',
          borderRight: '1px solid rgba(60,40,15,0.4)',
        }}
      >
        {/* Station logo circle */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            flexShrink: 0,
            padding: 3,
            background: isPlaying
              ? 'linear-gradient(135deg, #C9A227, #8A6C00, #C9A227)'
              : 'linear-gradient(135deg, #3A2A14, #2A1A0E)',
            boxShadow: isPlaying
              ? '0 0 14px rgba(200,160,0,0.4)'
              : '0 0 4px rgba(0,0,0,0.5)',
            transition: 'box-shadow 400ms ease, background 400ms ease',
          }}
        >
          <div style={{ borderRadius: '50%', overflow: 'hidden' }}>
            <StationLogo
              favicon={currentStation.favicon}
              name={currentStation.name}
              size={38}
              borderRadius={19}
            />
          </div>
        </div>

        {/* VFD display */}
        <div
          className="vfd-display"
          style={{
            flex: 1,
            borderRadius: 6,
            padding: '5px 10px',
            minWidth: 0,
            cursor: 'pointer',
          }}
          onClick={() => setShowNowPlaying(true)}
        >
          <div
            style={{
              fontSize: 14,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              letterSpacing: '0.04em',
            }}
          >
            {currentStation.name.toUpperCase()}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 2,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontFamily: 'Oswald, sans-serif',
                color: 'rgba(255,149,0,0.5)',
                letterSpacing: '0.1em',
                background: 'rgba(90,60,20,0.3)',
                padding: '1px 5px',
                borderRadius: 3,
                border: '1px solid rgba(120,90,40,0.25)',
              }}
            >
              {genre}
            </span>
            {currentStation.bitrate > 0 && (
              <span
                style={{
                  fontSize: 9,
                  fontFamily: 'Share Tech Mono, monospace',
                  color: 'rgba(255,149,0,0.35)',
                  letterSpacing: '0.05em',
                }}
              >
                {currentStation.bitrate}kbps
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── CENTER ZONE — Transport controls + VU ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '0 24px',
        }}
      >
        {/* Signal bars */}
        <SignalBars isPlaying={isPlaying} isLoading={isLoading} bars={4} height={14} />

        {/* Prev button */}
        <button
          className="push-btn push-btn-dark"
          onClick={() => prevStation && play(prevStation)}
          disabled={!prevStation}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: prevStation ? '#A08050' : 'rgba(80,60,25,0.3)',
            cursor: prevStation ? 'pointer' : 'default',
            opacity: prevStation ? 1 : 0.45,
          }}
        >
          <SkipBack size={14} />
        </button>

        {/* Play / Pause — main button */}
        <button
          className={`push-btn push-btn-amber ${isPlaying && !isLoading ? 'pressed' : ''}`}
          onClick={handlePlayPause}
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isLoading ? (
            <Loader2 size={20} color="#5A3000" style={{ animation: 'spin 1s linear infinite' }} />
          ) : isPlaying ? (
            <Pause size={20} color="#5A3000" />
          ) : (
            <Play size={20} color="#5A3000" style={{ marginLeft: 2 }} />
          )}
        </button>

        {/* Next button */}
        <button
          className="push-btn push-btn-dark"
          onClick={() => nextStation && play(nextStation)}
          disabled={!nextStation}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: nextStation ? '#A08050' : 'rgba(80,60,25,0.3)',
            cursor: nextStation ? 'pointer' : 'default',
            opacity: nextStation ? 1 : 0.45,
          }}
        >
          <SkipForward size={14} />
        </button>

        {/* VU bars */}
        <VUBars isPlaying={isPlaying && !isLoading} bars={7} height={24} />

        {/* Error state */}
        {hasError && !isLoading && (
          <span
            style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: 10,
              color: '#FF4444',
              letterSpacing: '0.08em',
            }}
          >
            ⚠ SIGNAL LOST
          </span>
        )}
      </div>

      {/* ── RIGHT ZONE — Volume knob + controls ── */}
      <div
        style={{
          width: 220,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 12,
          padding: '0 20px',
          height: '100%',
          borderLeft: '1px solid rgba(60,40,15,0.4)',
        }}
      >
        {/* Volume label */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Knob
            value={volume}
            onChange={setVolume}
            size={38}
            label="VOL"
            color="silver"
          />
        </div>

        {/* Favorite toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <button
            className={`push-btn ${isFav ? 'push-btn-amber pressed' : 'push-btn-dark'}`}
            onClick={() => toggleFavorite(currentStation)}
            style={{
              width: 36,
              height: 34,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Heart
              size={13}
              fill={isFav ? '#5A3000' : 'none'}
              color={isFav ? '#5A3000' : '#A08050'}
            />
          </button>
          <div className="label-embossed" style={{ fontSize: 6, letterSpacing: '0.15em' }}>
            FAV
          </div>
        </div>

        {/* Expand to NowPlaying */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <button
            className="push-btn push-btn-dark"
            onClick={() => setShowNowPlaying(true)}
            style={{
              width: 36,
              height: 34,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#A08050',
            }}
          >
            <ChevronUp size={14} />
          </button>
          <div className="label-embossed" style={{ fontSize: 6, letterSpacing: '0.15em' }}>
            EXPAND
          </div>
        </div>
      </div>
    </div>
  );
}
