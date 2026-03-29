import React, { useMemo } from 'react';
import { Radio, Clock } from 'lucide-react';
import { useTopStations } from '../hooks/useStations';
import { usePlayerStore } from '../store/playerStore';
import { StationCard } from '../components/StationCard';
import { FrequencyDial } from '../components/FrequencyDial';

function LoadingSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 56,
            borderRadius: 4,
            background: 'linear-gradient(90deg, rgba(60,40,15,0.3) 0%, rgba(80,55,20,0.2) 50%, rgba(60,40,15,0.3) 100%)',
            animation: 'shimmer 1.5s ease infinite',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
}

export function HomePage() {
  const { stations, loading } = useTopStations(30);
  const { recentlyPlayed, currentStation, region } = usePlayerStore();
  const isDomestic = region === 'domestic';

  // Simulated frequency value based on current station
  const freqValue = useMemo(() => {
    if (!currentStation) return 0.42;
    let hash = 0;
    for (let i = 0; i < currentStation.name.length; i++) {
      hash = (hash * 31 + currentStation.name.charCodeAt(i)) & 0xffffffff;
    }
    return (Math.abs(hash) % 1000) / 1000;
  }, [currentStation]);

  const featuredStations = stations.slice(0, 8);
  const gridStations = stations.slice(8, 26);

  return (
    <div style={{ paddingBottom: 16 }}>
      {/* Frequency dial header */}
      <div
        style={{
          padding: '16px 16px 12px',
          background: 'linear-gradient(180deg, rgba(30,15,5,0.8) 0%, transparent 100%)',
        }}
      >
        <FrequencyDial
          value={freqValue}
          width={Math.min(1100, (typeof window !== 'undefined' ? window.innerWidth : 900) - 280 - 32)}
        />
      </div>

      {/* Section: Featured Presets */}
      <div style={{ padding: '0 16px 20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
          }}
        >
          {/* Brass section label */}
          <div
            style={{
              height: 1,
              flex: 1,
              background: 'linear-gradient(90deg, transparent, rgba(180,140,40,0.4))',
            }}
          />
          <div className="label-brass" style={{ fontSize: 10 }}>
            {isDomestic ? '◈ 精选频道' : '◈ FEATURED PRESETS'}
          </div>
          <div
            style={{
              height: 1,
              flex: 1,
              background: 'linear-gradient(90deg, rgba(180,140,40,0.4), transparent)',
            }}
          />
        </div>

        {/* Horizontal scroll featured */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            paddingBottom: 8,
            scrollbarWidth: 'none',
          }}
        >
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 180,
                    height: 200,
                    flexShrink: 0,
                    borderRadius: 12,
                    background: 'rgba(60,40,15,0.4)',
                    animation: 'shimmer 1.5s ease infinite',
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))
            : featuredStations.map((station, idx) => {
                // Manually assign CH numbers for preset buttons
                const chNum = String(idx + 1).padStart(2, '0');
                return (
                  <div key={station.stationuuid} style={{ position: 'relative', flexShrink: 0 }}>
                    {/* Preset number button above card */}
                    <div
                      className="preset-btn"
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 10,
                        zIndex: 2,
                        borderRadius: 4,
                        padding: '2px 6px',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'VT323, monospace',
                          fontSize: 14,
                          color: '#C9A227',
                          textShadow: '0 0 6px rgba(200,160,0,0.5)',
                        }}
                      >
                        CH·{chNum}
                      </span>
                    </div>
                    <StationCard station={station} variant="featured" />
                  </div>
                );
              })}
        </div>
      </div>

      {/* Section divider */}
      <div
        style={{
          height: 1,
          margin: '0 16px 16px',
          background: 'linear-gradient(90deg, transparent, rgba(100,70,30,0.4), transparent)',
        }}
      />

      {/* Section: Station Grid */}
      <div style={{ padding: '0 16px 20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              height: 1,
              flex: 1,
              background: 'linear-gradient(90deg, transparent, rgba(180,140,40,0.4))',
            }}
          />
          <div className="label-brass" style={{ fontSize: 10 }}>
            {isDomestic ? '◈ 国内电台' : '◈ TOP STATIONS'}
          </div>
          <div
            style={{
              height: 1,
              flex: 1,
              background: 'linear-gradient(90deg, rgba(180,140,40,0.4), transparent)',
            }}
          />
        </div>

        <div className="station-grid">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: 80,
                    borderRadius: 10,
                    background: 'rgba(60,40,15,0.4)',
                    animation: 'shimmer 1.5s ease infinite',
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))
            : gridStations.map(station => (
                <StationCard key={station.stationuuid} station={station} variant="grid" />
              ))}
        </div>
      </div>

      {/* Section divider */}
      <div
        style={{
          height: 1,
          margin: '0 16px 16px',
          background: 'linear-gradient(90deg, transparent, rgba(100,70,30,0.4), transparent)',
        }}
      />

      {/* Section: Recently Played tape roll */}
      {recentlyPlayed.length > 0 && (
        <div style={{ padding: '0 16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                height: 1,
                flex: 1,
                background: 'linear-gradient(90deg, transparent, rgba(180,140,40,0.4))',
              }}
            />
            <div className="label-brass" style={{ fontSize: 10 }}>
              ◈ RECENTLY PLAYED
            </div>
            <div
              style={{
                height: 1,
                flex: 1,
                background: 'linear-gradient(90deg, rgba(180,140,40,0.4), transparent)',
              }}
            />
          </div>

          {/* Paper tape style list */}
          <div
            style={{
              background: 'linear-gradient(180deg, #1A0E06 0%, #120A04 100%)',
              borderRadius: 8,
              border: '1px solid rgba(80,55,20,0.4)',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}
          >
            {/* Tape perforations top */}
            <div
              style={{
                height: 10,
                background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 10px, rgba(0,0,0,0.6) 10px, rgba(0,0,0,0.6) 11px, transparent 11px, transparent 16px)',
                borderBottom: '1px solid rgba(60,40,15,0.5)',
                opacity: 0.4,
              }}
            />

            {recentlyPlayed.slice(0, 10).map((station, i) => (
              <StationCard key={`${station.stationuuid}-${i}`} station={station} variant="list" />
            ))}

            {/* Tape perforations bottom */}
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

      {/* Bottom padding for player */}
      <div style={{ height: 8 }} />
    </div>
  );
}