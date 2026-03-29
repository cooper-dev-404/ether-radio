import React from 'react';
import { Heart, Radio } from 'lucide-react';
import type { Station } from '../store/playerStore';
import { usePlayerStore } from '../store/playerStore';
import { StationLogo } from './StationLogo';
import { VUBars } from './VUMeter';

interface StationCardProps {
  station: Station;
  variant?: 'grid' | 'list' | 'featured';
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

function getFirstTag(tags: string) {
  if (!tags) return '';
  return tags.split(',')[0].trim().toUpperCase();
}

export function StationCard({ station, variant = 'grid' }: StationCardProps) {
  const { currentStation, isPlaying, isLoading, play, toggleFavorite, isFavorite } = usePlayerStore();
  const isActive = currentStation?.stationuuid === station.stationuuid;
  const isFav = isFavorite(station.stationuuid);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    play(station);
  };

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(station);
  };

  if (variant === 'list') {
    return (
      <div
        className={`station-card tape-item ${isActive ? 'playing' : ''}`}
        onClick={handlePlay}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 14px',
          borderRadius: 0,
          borderBottom: '1px solid rgba(100,70,30,0.25)',
          borderLeft: isActive ? '3px solid #FF9500' : '3px solid transparent',
          background: isActive
            ? 'linear-gradient(90deg, rgba(90,60,20,0.3), transparent)'
            : 'transparent',
          cursor: 'pointer',
          transition: 'all 100ms ease',
        }}
      >
        <StationLogo favicon={station.favicon} name={station.name} size={40} borderRadius={6} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'Oswald, sans-serif',
              fontSize: 14,
              fontWeight: 500,
              color: isActive ? '#FF9500' : '#E0D0B0',
              letterSpacing: '0.03em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textShadow: isActive ? '0 0 8px rgba(255,149,0,0.4)' : 'none',
            }}
          >
            {truncate(station.name, 32)}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 2,
            }}
          >
            {station.tags && (
              <span
                style={{
                  fontSize: 10,
                  fontFamily: 'Oswald, sans-serif',
                  letterSpacing: '0.1em',
                  color: '#8A6A30',
                  background: 'rgba(90,60,20,0.3)',
                  padding: '1px 6px',
                  borderRadius: 3,
                  border: '1px solid rgba(120,90,40,0.3)',
                }}
              >
                {getFirstTag(station.tags)}
              </span>
            )}
            {station.country && (
              <span style={{ fontSize: 11, color: '#6A5A3A', fontFamily: 'Share Tech Mono, monospace' }}>
                {station.countrycode || station.country.slice(0, 2).toUpperCase()}
              </span>
            )}
            {station.bitrate > 0 && (
              <span style={{ fontSize: 10, color: '#6A5A3A', fontFamily: 'Share Tech Mono, monospace' }}>
                {station.bitrate}kbps
              </span>
            )}
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isActive && (
            <VUBars isPlaying={isPlaying && !isLoading} bars={4} height={18} />
          )}
          <button
            onClick={handleFav}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              color: isFav ? '#FF9500' : 'rgba(160,120,60,0.4)',
              transition: 'color 150ms ease',
            }}
          >
            <Heart size={14} fill={isFav ? '#FF9500' : 'none'} />
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div
        className={`station-card ${isActive ? 'playing' : ''}`}
        onClick={handlePlay}
        style={{
          width: 180,
          flexShrink: 0,
          borderRadius: 12,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          position: 'relative',
          paddingTop: 32,
        }}
      >
        {/* Fav button */}
        <button
          onClick={handleFav}
          style={{
            position: 'absolute',
            top: 8,
            right: 10,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            color: isFav ? '#FF9500' : 'rgba(160,120,60,0.3)',
          }}
        >
          <Heart size={13} fill={isFav ? '#FF9500' : 'none'} />
        </button>

        {/* Logo */}
        <div style={{ position: 'relative', marginTop: 12 }}>
          <StationLogo favicon={station.favicon} name={station.name} size={64} borderRadius={12} />
          {isActive && (
            <div
              style={{
                position: 'absolute',
                inset: -3,
                borderRadius: 15,
                border: '2px solid #FF9500',
                boxShadow: '0 0 12px rgba(255,149,0,0.6), inset 0 0 8px rgba(255,149,0,0.1)',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>

        {/* Station name */}
        <div
          style={{
            fontFamily: 'Oswald, sans-serif',
            fontSize: 13,
            fontWeight: 500,
            color: isActive ? '#FF9500' : '#D0B880',
            letterSpacing: '0.04em',
            textAlign: 'center',
            textShadow: isActive ? '0 0 8px rgba(255,149,0,0.5)' : 'none',
            lineHeight: 1.3,
          }}
        >
          {truncate(station.name, 22)}
        </div>

        {/* Tag */}
        {station.tags && (
          <div
            style={{
              fontSize: 9,
              fontFamily: 'Oswald, sans-serif',
              letterSpacing: '0.12em',
              color: '#7A5A20',
              textTransform: 'uppercase',
            }}
          >
            {getFirstTag(station.tags)}
          </div>
        )}

        {/* VU bars when active */}
        {isActive && (
          <VUBars isPlaying={isPlaying && !isLoading} bars={6} height={16} />
        )}

        {/* Live dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div
            className={isActive && isPlaying ? 'live-dot' : ''}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: isActive && isPlaying ? '#FF6500' : 'rgba(100,60,20,0.5)',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 9,
              fontFamily: 'Share Tech Mono, monospace',
              color: isActive && isPlaying ? '#FF6500' : 'rgba(120,90,40,0.5)',
              letterSpacing: '0.1em',
            }}
          >
            LIVE
          </span>
        </div>
      </div>
    );
  }

  // Default: grid
  return (
    <div
      className={`station-card ${isActive ? 'playing' : ''}`}
      onClick={handlePlay}
      style={{
        borderRadius: 10,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        position: 'relative',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <StationLogo favicon={station.favicon} name={station.name} size={44} borderRadius={8} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'Oswald, sans-serif',
              fontSize: 13,
              fontWeight: 500,
              color: isActive ? '#FF9500' : '#D0B880',
              letterSpacing: '0.03em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textShadow: isActive ? '0 0 8px rgba(255,149,0,0.4)' : 'none',
            }}
          >
            {truncate(station.name, 24)}
          </div>
          <div
            style={{
              fontSize: 9,
              fontFamily: 'Share Tech Mono, monospace',
              color: '#6A5A3A',
              marginTop: 2,
            }}
          >
            {station.countrycode || ''} {station.codec || ''} {station.bitrate ? `${station.bitrate}k` : ''}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {station.tags && (
            <span
              style={{
                fontSize: 9,
                fontFamily: 'Oswald, sans-serif',
                letterSpacing: '0.1em',
                color: '#8A6A30',
                background: 'rgba(90,60,20,0.35)',
                padding: '2px 6px',
                borderRadius: 3,
                border: '1px solid rgba(120,90,40,0.3)',
                textTransform: 'uppercase',
              }}
            >
              {getFirstTag(station.tags)}
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div
              className={isActive && isPlaying ? 'live-dot' : ''}
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: isActive && isPlaying ? '#FF6500' : 'rgba(100,60,20,0.4)',
              }}
            />
            {isActive && isPlaying && (
              <VUBars isPlaying bars={4} height={12} />
            )}
          </div>
        </div>
        <button
          onClick={handleFav}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            color: isFav ? '#FF9500' : 'rgba(160,120,60,0.35)',
            transition: 'color 150ms ease',
          }}
        >
          <Heart size={13} fill={isFav ? '#FF9500' : 'none'} />
        </button>
      </div>
    </div>
  );
}