import React, { useState } from 'react';
import { Play, Pause, Loader2, ChevronUp } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { StationLogo } from './StationLogo';
import { SignalBars } from './SignalBars';
import { VUBars } from './VUMeter';

export function MiniPlayer() {
  const {
    currentStation,
    isPlaying,
    isLoading,
    pause,
    resume,
    setShowNowPlaying,
  } = usePlayerStore();

  if (!currentStation) return null;

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) pause();
    else resume();
  };

  return (
    <div
      style={{
        position: 'relative',
        background: 'linear-gradient(180deg, #3A2810 0%, #1E1006 100%)',
        borderTop: '1px solid #5A3A18',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={() => setShowNowPlaying(true)}
    >
      {/* Chrome accent line at top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(200,160,60,0.4), transparent)',
        }}
      />

      {/* Station logo */}
      <StationLogo
        favicon={currentStation.favicon}
        name={currentStation.name}
        size={36}
        borderRadius={6}
      />

      {/* VFD Display */}
      <div
        className="vfd-display"
        style={{
          flex: 1,
          borderRadius: 4,
          padding: '4px 10px',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        {/* Scrolling station name */}
        <div
          style={{
            fontSize: 16,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            letterSpacing: '0.05em',
          }}
        >
          {currentStation.name.toUpperCase()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 1 }}>
          <span
            style={{
              fontSize: 11,
              fontFamily: 'Share Tech Mono, monospace',
              color: 'rgba(255,149,0,0.6)',
              letterSpacing: '0.08em',
            }}
          >
            {currentStation.tags?.split(',')[0]?.toUpperCase() || 'RADIO'}
          </span>
          {currentStation.bitrate > 0 && (
            <span
              style={{
                fontSize: 10,
                fontFamily: 'Share Tech Mono, monospace',
                color: 'rgba(255,149,0,0.4)',
                letterSpacing: '0.05em',
              }}
            >
              {currentStation.bitrate}kbps
            </span>
          )}
        </div>
      </div>

      {/* VU bars */}
      <VUBars isPlaying={isPlaying && !isLoading} bars={5} height={22} />

      {/* Signal bars */}
      <SignalBars isPlaying={isPlaying} isLoading={isLoading} bars={4} height={14} />

      {/* Play / Pause button */}
      <button
        className="push-btn push-btn-dark"
        onClick={handlePlayPause}
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isLoading ? '#FF9500' : '#D0B880',
          flexShrink: 0,
        }}
      >
        {isLoading ? (
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
        ) : isPlaying ? (
          <Pause size={18} />
        ) : (
          <Play size={18} style={{ marginLeft: 2 }} />
        )}
      </button>

      {/* Expand chevron */}
      <div style={{ color: 'rgba(160,120,50,0.5)', flexShrink: 0 }}>
        <ChevronUp size={16} />
      </div>
    </div>
  );
}