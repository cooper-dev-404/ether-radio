import React, { useState } from 'react';
import { Heart, Radio, Play } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { StationCard } from '../components/StationCard';

const PRESET_SLOTS = 12;

export function FavoritesPage() {
  const { favorites, currentStation, isPlaying, play } = usePlayerStore();
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  // Fill preset slots (up to 12)
  const slots = Array.from({ length: PRESET_SLOTS }, (_, i) => favorites[i] ?? null);

  const handlePresetClick = (i: number) => {
    const station = slots[i];
    if (station) {
      setActiveSlot(i);
      play(station);
    }
  };

  return (
    <div style={{ paddingBottom: 16 }}>
      {/* Preset memory panel header */}
      <div
        style={{
          background: 'linear-gradient(180deg, #1A0E06 0%, #120A04 100%)',
          borderBottom: '1px solid rgba(80,55,20,0.5)',
          padding: '12px 16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 6,
          }}
        >
          <Heart
            size={12}
            color="#FF9500"
            fill="#FF9500"
            style={{ filter: 'drop-shadow(0 0 4px rgba(255,149,0,0.6))' }}
          />
          <div className="label-brass" style={{ fontSize: 10 }}>
            PRESET MEMORY BANK
          </div>
        </div>
        <div className="label-embossed" style={{ fontSize: 7, letterSpacing: '0.2em' }}>
          {favorites.length} / {PRESET_SLOTS} SLOTS PROGRAMMED
        </div>
      </div>

      {/* VFD status display */}
      <div style={{ padding: '12px 16px' }}>
        <div
          className="vfd-display"
          style={{
            borderRadius: 8,
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 14, letterSpacing: '0.08em' }}>
              SAVED PRESETS
            </div>
            <div
              style={{
                fontSize: 12,
                fontFamily: 'Share Tech Mono, monospace',
                color: 'rgba(255,149,0,0.5)',
                marginTop: 2,
              }}
            >
              {favorites.length === 0
                ? 'NO PRESETS STORED'
                : `${favorites.length} STATION${favorites.length !== 1 ? 'S' : ''} STORED`}
            </div>
          </div>
          <div
            style={{
              fontFamily: 'VT323, monospace',
              fontSize: 32,
              color: '#FF9500',
              textShadow: '0 0 8px #FF9500, 0 0 20px rgba(255,100,0,0.4)',
            }}
          >
            {String(favorites.length).padStart(2, '0')}
          </div>
        </div>
      </div>

      {favorites.length === 0 ? (
        /* Empty state */
        <div style={{ padding: '0 16px 16px' }}>
          {/* Preset button grid (empty) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 6,
              marginBottom: 24,
            }}
          >
            {slots.map((_, i) => (
              <div
                key={i}
                className="preset-memory"
                style={{
                  height: 48,
                  borderRadius: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  opacity: 0.5,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'rgba(80,55,20,0.5)',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'VT323, monospace',
                    fontSize: 10,
                    color: 'rgba(120,90,40,0.4)',
                  }}
                >
                  P{i + 1}
                </span>
              </div>
            ))}
          </div>

          {/* Empty state message */}
          <div
            style={{
              textAlign: 'center',
              padding: '28px 16px',
              background: 'linear-gradient(180deg, #1A0E06 0%, #120A04 100%)',
              borderRadius: 12,
              border: '1px solid rgba(80,55,20,0.3)',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            <div
              className="speaker-grille"
              style={{
                width: 80,
                height: 80,
                borderRadius: 12,
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(60,40,15,0.5)',
              }}
            >
              <Heart size={28} color="rgba(160,120,50,0.25)" />
            </div>
            <div className="label-brass" style={{ fontSize: 12, marginBottom: 8 }}>
              NO PRESETS STORED
            </div>
            <div
              style={{
                fontFamily: 'Share Tech Mono, monospace',
                fontSize: 11,
                color: 'rgba(160,120,50,0.4)',
                lineHeight: 1.6,
                letterSpacing: '0.05em',
              }}
            >
              Tap the ♥ icon on any station<br />
              to save it to your memory bank
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '0 16px' }}>
          {/* Preset button grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 6,
              marginBottom: 16,
            }}
          >
            {slots.map((station, i) => {
              const isCurrentlyPlaying =
                station && currentStation?.stationuuid === station.stationuuid;
              const isActive = activeSlot === i && station !== null;

              return (
                <button
                  key={i}
                  className={`preset-memory push-btn ${isActive || isCurrentlyPlaying ? 'pressed' : ''}`}
                  onClick={() => handlePresetClick(i)}
                  disabled={!station}
                  style={{
                    height: 54,
                    borderRadius: 6,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 3,
                    opacity: station ? 1 : 0.35,
                    border:
                      isCurrentlyPlaying
                        ? '1px solid rgba(200,160,0,0.7)'
                        : undefined,
                    boxShadow:
                      isCurrentlyPlaying
                        ? '0 1px 0 #0E0804, inset 0 1px 0 rgba(0,0,0,0.2), 0 0 10px rgba(200,160,0,0.4)'
                        : undefined,
                    cursor: station ? 'pointer' : 'default',
                  }}
                >
                  {station ? (
                    <>
                      <div
                        className={isCurrentlyPlaying && isPlaying ? 'live-dot' : ''}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: isCurrentlyPlaying ? '#FF9500' : '#5A3A10',
                          boxShadow: isCurrentlyPlaying
                            ? '0 0 6px rgba(255,149,0,0.8)'
                            : 'none',
                          transition: 'background 200ms ease',
                        }}
                      />
                      {isCurrentlyPlaying && isPlaying ? (
                        <Play
                          size={8}
                          fill="#FF9500"
                          color="#FF9500"
                          style={{ filter: 'drop-shadow(0 0 3px rgba(255,149,0,0.8))' }}
                        />
                      ) : (
                        <span
                          style={{
                            fontFamily: 'VT323, monospace',
                            fontSize: 10,
                            color: isCurrentlyPlaying
                              ? '#FF9500'
                              : 'rgba(180,140,50,0.6)',
                            letterSpacing: '0.05em',
                          }}
                        >
                          P{i + 1}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: 'rgba(60,40,15,0.5)',
                        }}
                      />
                      <span
                        style={{
                          fontFamily: 'VT323, monospace',
                          fontSize: 10,
                          color: 'rgba(80,60,25,0.4)',
                        }}
                      >
                        P{i + 1}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Hint text */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: 10,
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: 10,
              color: 'rgba(120,90,40,0.4)',
              letterSpacing: '0.08em',
            }}
          >
            TAP A PRESET BUTTON TO TUNE IN
          </div>

          {/* Section separator */}
          <div
            style={{
              height: 1,
              marginBottom: 12,
              background: 'linear-gradient(90deg, transparent, rgba(180,140,40,0.3), transparent)',
            }}
          />

          {/* Saved stations list */}
          <div
            style={{
              background: 'linear-gradient(180deg, #1A0E06 0%, #120A04 100%)',
              borderRadius: 10,
              border: '1px solid rgba(80,55,20,0.4)',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}
          >
            {/* Tape perforations */}
            <div
              style={{
                height: 10,
                background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 10px, rgba(0,0,0,0.6) 10px, rgba(0,0,0,0.6) 11px, transparent 11px, transparent 16px)',
                borderBottom: '1px solid rgba(60,40,15,0.5)',
                opacity: 0.4,
              }}
            />
            {favorites.map((station) => (
              <StationCard key={station.stationuuid} station={station} variant="list" />
            ))}
            <div
              style={{
                height: 10,
                background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 10px, rgba(0,0,0,0.6) 10px, rgba(0,0,0,0.6) 11px, transparent 11px, transparent 16px)',
                borderTop: '1px solid rgba(60,40,15,0.5)',
                opacity: 0.4,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
