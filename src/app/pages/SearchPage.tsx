import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Search, X, Radio } from 'lucide-react';
import { useSearchStations, useDebounce, useTopStations } from '../hooks/useStations';
import { usePlayerStore } from '../store/playerStore';
import { StationCard } from '../components/StationCard';
import { FrequencyDial } from '../components/FrequencyDial';

export function SearchPage() {
  const [inputValue, setInputValue] = useState('');
  const [freqValue, setFreqValue] = useState(0.3);
  const debouncedQuery = useDebounce(inputValue, 350);
  const { stations, loading, search, query } = useSearchStations();
  const { stations: trendingStations } = useTopStations(8);
  const { region } = usePlayerStore();
  const isDomestic = region === 'domestic';
  const inputRef = useRef<HTMLInputElement>(null);
  const freqAnimRef = useRef<number>(0);
  const freqDir = useRef(1);

  useEffect(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  // Animate frequency needle when searching
  useEffect(() => {
    if (loading) {
      const animate = () => {
        setFreqValue(v => {
          const next = v + freqDir.current * 0.005;
          if (next >= 1 || next <= 0) freqDir.current *= -1;
          return Math.min(1, Math.max(0, next));
        });
        freqAnimRef.current = requestAnimationFrame(animate);
      };
      freqAnimRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(freqAnimRef.current);
      if (!query) setFreqValue(0.3);
      else {
        // Set freq based on query hash
        let hash = 0;
        for (let i = 0; i < query.length; i++) hash = (hash * 31 + query.charCodeAt(i)) & 0xffffffff;
        setFreqValue((Math.abs(hash) % 1000) / 1000);
      }
    }
    return () => cancelAnimationFrame(freqAnimRef.current);
  }, [loading, query]);

  const handleClear = () => {
    setInputValue('');
    inputRef.current?.focus();
  };

  const showTrending = !query && !loading;
  const showResults = !!query;

  return (
    <div style={{ paddingBottom: 16 }}>
      {/* Frequency dial */}
      <div
        style={{
          padding: '14px 16px 10px',
          background: 'linear-gradient(180deg, rgba(10,6,2,0.9) 0%, transparent 100%)',
        }}
      >
        <FrequencyDial
          value={freqValue}
          width={Math.min(568, (typeof window !== 'undefined' ? window.innerWidth : 400) - 32)}
          label="SEARCH BAND MHz"
        />
      </div>

      {/* Search input */}
      <div style={{ padding: '6px 16px 14px' }}>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* Search icon */}
          <div
            style={{
              position: 'absolute',
              left: 12,
              color: '#FF9500',
              opacity: 0.6,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            <Search size={15} />
          </div>

          <input
            ref={inputRef}
            className="search-field"
            type="text"
            placeholder={isDomestic ? '搜索国内电台…' : 'TUNE IN · TYPE TO SEARCH…'}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 40px 10px 38px',
              borderRadius: 8,
              fontSize: 14,
              background: '#050300',
              border: '1px solid #3A2810',
              color: '#FF9500',
              fontFamily: 'Share Tech Mono, monospace',
              letterSpacing: '0.05em',
            }}
          />

          {inputValue && (
            <button
              onClick={handleClear}
              style={{
                position: 'absolute',
                right: 10,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255,149,0,0.5)',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Results header */}
      {showResults && (
        <div
          style={{
            padding: '0 16px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div className="label-brass" style={{ fontSize: 9 }}>
            {isDomestic ? '◈ 搜索结果' : '◈ SCAN RESULTS'}
          </div>
          {!loading && (
            <div
              style={{
                fontFamily: 'Share Tech Mono, monospace',
                fontSize: 11,
                color: 'rgba(180,140,50,0.6)',
                letterSpacing: '0.08em',
              }}
            >
              {stations.length} FREQ FOUND
            </div>
          )}
        </div>
      )}

      {/* Loading spinner */}
      {loading && (
        <div
          style={{
            padding: '32px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '3px solid rgba(80,55,20,0.3)',
              borderTop: '3px solid #FF9500',
              animation: 'spin 1s linear infinite',
            }}
          />
          <div
            style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: 12,
              color: 'rgba(255,149,0,0.5)',
              letterSpacing: '0.15em',
            }}
          >
            SCANNING FREQUENCIES…
          </div>
        </div>
      )}

      {/* Search results */}
      {!loading && showResults && (
        <>
          {stations.length === 0 ? (
            <div
              style={{
                padding: '40px 16px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>📻</div>
              <div
                className="label-brass"
                style={{ fontSize: 12, marginBottom: 8 }}
              >
                NO SIGNAL FOUND
              </div>
              <div
                style={{
                  fontFamily: 'Share Tech Mono, monospace',
                  fontSize: 11,
                  color: 'rgba(160,120,50,0.4)',
                  letterSpacing: '0.05em',
                }}
              >
                Try a different search term
              </div>
            </div>
          ) : (
            <div style={{ padding: '0 16px' }}>
              {/* Station log */}
              <div
                style={{
                  background: 'linear-gradient(180deg, #1A0E06 0%, #120A04 100%)',
                  borderRadius: 10,
                  border: '1px solid rgba(80,55,20,0.4)',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                }}
              >
                {stations.map(station => (
                  <StationCard key={station.stationuuid} station={station} variant="list" />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Trending / default state */}
      {showTrending && !loading && (
        <div style={{ padding: '0 16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
            }}
          >
            <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, transparent, rgba(180,140,40,0.4))' }} />
            <div className="label-brass" style={{ fontSize: 9 }}>
              {isDomestic ? '◈ 推荐电台' : '◈ TOP SIGNALS'}
            </div>
            <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, rgba(180,140,40,0.4), transparent)' }} />
          </div>

          {/* Prompt text */}
          <div
            style={{
              textAlign: 'center',
              padding: '16px 0 20px',
            }}
          >
            <div
              style={{
                fontFamily: 'VT323, monospace',
                fontSize: 32,
                color: 'rgba(255,149,0,0.25)',
                letterSpacing: '0.1em',
                textShadow: '0 0 20px rgba(255,80,0,0.1)',
              }}
            >
              ◦ ◦ ◦ AWAITING INPUT ◦ ◦ ◦
            </div>
          </div>

          {/* Trending stations */}
          <div
            style={{
              background: 'linear-gradient(180deg, #1A0E06 0%, #120A04 100%)',
              borderRadius: 10,
              border: '1px solid rgba(80,55,20,0.4)',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}
          >
            {trendingStations.map(station => (
              <StationCard key={station.stationuuid} station={station} variant="list" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}