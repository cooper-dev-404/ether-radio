import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStationsByTagAndCountry } from '../hooks/useStations';
import { usePlayerStore } from '../store/playerStore';
import { StationCard } from '../components/StationCard';
import { CN_STATIONS } from '../../data/cn-stations';
import type { Station } from '../store/playerStore';

// ── International filter constants ─────────────────────────────────────────

const GENRES = [
  { tag: 'pop',        label: 'POP'        },
  { tag: 'rock',       label: 'ROCK'       },
  { tag: 'jazz',       label: 'JAZZ'       },
  { tag: 'classical',  label: 'CLASSICAL'  },
  { tag: 'electronic', label: 'ELECTRONIC' },
  { tag: 'news',       label: 'NEWS'       },
  { tag: 'talk',       label: 'TALK'       },
  { tag: 'hiphop',     label: 'HIP-HOP'   },
  { tag: 'country',    label: 'COUNTRY'    },
  { tag: 'soul',       label: 'SOUL'       },
  { tag: 'blues',      label: 'BLUES'      },
  { tag: 'ambient',    label: 'AMBIENT'    },
];

const COUNTRIES = [
  { code: 'ALL', flag: '🌐', name: 'ALL' },
  { code: 'US',  flag: '🇺🇸', name: 'USA' },
  { code: 'GB',  flag: '🇬🇧', name: 'UK'  },
  { code: 'DE',  flag: '🇩🇪', name: 'DEU' },
  { code: 'FR',  flag: '🇫🇷', name: 'FRA' },
  { code: 'JP',  flag: '🇯🇵', name: 'JPN' },
  { code: 'BR',  flag: '🇧🇷', name: 'BRA' },
  { code: 'AU',  flag: '🇦🇺', name: 'AUS' },
  { code: 'CA',  flag: '🇨🇦', name: 'CAN' },
  { code: 'ES',  flag: '🇪🇸', name: 'ESP' },
  { code: 'IT',  flag: '🇮🇹', name: 'ITA' },
  { code: 'NL',  flag: '🇳🇱', name: 'NLD' },
];

const BAND_LABELS = ['FM', 'AM', 'SW', 'LW', 'DAB'];

// ── Domestic filter constants ───────────────────────────────────────────────

/** Province filter chips. Order matches the requirement spec. */
const CN_PROVINCES = [
  { id: 'ALL', label: '全部',   sublabel: 'ALL',   emoji: '🌐' },
  { id: '全国', label: '全国',  sublabel: 'CN',    emoji: '🇨🇳' },
  { id: '北京', label: '北京',  sublabel: 'BJ',    emoji: '🏙' },
  { id: '上海', label: '上海',  sublabel: 'SH',    emoji: '🌆' },
] as const;

/** CN genre filter chips with Chinese labels and English sub-labels. */
const CN_GENRES = [
  { id: 'ALL',       label: '全部', sublabel: 'ALL'     },
  { id: 'news',      label: '新闻', sublabel: 'NEWS'    },
  { id: 'music',     label: '音乐', sublabel: 'MUSIC'   },
  { id: 'traffic',   label: '交通', sublabel: 'TRAFFIC' },
  { id: 'culture',   label: '文艺', sublabel: 'ARTS'    },
  { id: 'economics', label: '经济', sublabel: 'ECON'    },
  { id: 'sports',    label: '体育', sublabel: 'SPORT'   },
  { id: 'variety',   label: '综合', sublabel: 'MIX'     },
] as const;

type CnGenreId = typeof CN_GENRES[number]['id'];
type CnProvinceId = typeof CN_PROVINCES[number]['id'];

/**
 * Provinces that have explicit chips. Stations NOT matching any of these
 * are grouped under the '其他' (Other) chip. This also includes '全国'
 * national networks when a specific province chip is selected.
 */
const SPECIFIC_PROVINCES = new Set(['全国', '北京', '上海']);

/** Match a station to the selected province chip. */
function matchesProvince(s: Station, selectedProvince: CnProvinceId): boolean {
  if (selectedProvince === 'ALL') return true;
  return s.province === selectedProvince;
}

/**
 * Per-genre matching functions against English station tags and name strings.
 * These avoid touching the raw tag strings so they work without updating cn-stations.ts.
 */
const CN_GENRE_MATCHERS: Record<CnGenreId, (s: Station) => boolean> = {
  ALL: () => true,
  news:      s => splitTags(s).includes('news'),
  music:     s => splitTags(s).some(t => ['pop','music','classical','jazz','soul','blues','folk','ambient','electronic'].includes(t)),
  traffic:   s => s.name.includes('交通'),
  culture:   s => splitTags(s).some(t => ['folk','classical','ambient'].includes(t)),
  economics: s => s.name.includes('经济') || s.name.toLowerCase().includes('economy'),
  sports:    s => splitTags(s).includes('sport'),
  variety:   s => splitTags(s).includes('talk'),
};

function splitTags(s: Station): string[] {
  return s.tags.split(',').map(t => t.trim().toLowerCase());
}

// ── Skeleton ────────────────────────────────────────────────────────────────

function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="station-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 82,
            borderRadius: 10,
            background: 'rgba(60,40,15,0.4)',
            animation: 'shimmer 1.5s ease infinite',
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Shared animation preset ─────────────────────────────────────────────────

const GRID_VARIANTS = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -5, transition: { duration: 0.12 } },
};

// ── Component ──────────────────────────────────────────────────────────────

export function DiscoverPage() {
  // ── International filter state
  const [selectedGenre,   setSelectedGenre]   = React.useState(GENRES[0].tag);
  const [selectedBand,    setSelectedBand]     = React.useState('FM');
  const [selectedCountry, setSelectedCountry] = React.useState('ALL');

  // ── Domestic filter state
  const [selectedProvince, setSelectedProvince] = React.useState<CnProvinceId>('ALL');
  const [selectedCnGenre,  setSelectedCnGenre]  = React.useState<CnGenreId>('ALL');

  const { region } = usePlayerStore();
  const isDomestic = region === 'domestic';

  // ── International stations (hook must be called unconditionally)
  const { stations: intlStations, loading: intlLoading } = useStationsByTagAndCountry(
    isDomestic ? 'pop' : selectedGenre,
    isDomestic ? 'ALL' : selectedCountry,
    30,
  );

  // ── Domestic station filtering (synchronous, client-side)
  const domesticStations = useMemo(() => {
    if (!isDomestic) return [];
    return CN_STATIONS
      .filter(s => {
        const pOk = matchesProvince(s, selectedProvince);
        const gOk = CN_GENRE_MATCHERS[selectedCnGenre](s);
        return pOk && gOk;
      })
      .sort((a, b) => b.votes - a.votes);
  }, [isDomestic, selectedProvince, selectedCnGenre]);

  // ── Unified display values
  const stations = isDomestic ? domesticStations : intlStations;
  const loading  = isDomestic ? false : intlLoading;

  // filterKey drives AnimatePresence — changes on any filter mutation
  const filterKey = isDomestic
    ? `d:${selectedProvince}:${selectedCnGenre}`
    : `i:${selectedGenre}:${selectedCountry}`;

  // ���─ Active label for the station-count row
  const activeLabel = isDomestic
    ? `◈ ${CN_PROVINCES.find(p => p.id === selectedProvince)?.label ?? '全部'} · ${CN_GENRES.find(g => g.id === selectedCnGenre)?.label ?? '全部'}`
    : `◈ ${GENRES.find(g => g.tag === selectedGenre)?.label ?? ''} ${selectedCountry !== 'ALL' ? `· ${COUNTRIES.find(c => c.code === selectedCountry)?.flag ?? ''}` : ''} STATIONS`;

  return (
    <div style={{ paddingBottom: 16 }}>

      {/* ═══════════════════════════════════════════════════════════
          DOMESTIC FILTERS — two-level province + genre
          ═══════════════════════════════════════════════════════════ */}
      {isDomestic && (
        <>
          {/* ── Level 1: Province/Region ── */}
          <div
            style={{
              background: 'linear-gradient(180deg, #1A0E06 0%, #120A04 100%)',
              borderBottom: '1px solid rgba(80,55,20,0.45)',
              padding: '12px 16px',
            }}
          >
            {/* Row header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 14,
                  borderRadius: 2,
                  background: 'linear-gradient(180deg, #FF9500, #FF5500)',
                  boxShadow: '0 0 6px rgba(255,100,0,0.7)',
                  flexShrink: 0,
                }}
              />
              <div
                className="label-embossed"
                style={{ fontSize: 8, letterSpacing: '0.28em' }}
              >
                地区 REGION
              </div>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: 'linear-gradient(90deg, rgba(180,140,40,0.3), transparent)',
                }}
              />
              {selectedProvince !== 'ALL' && (
                <button
                  onClick={() => setSelectedProvince('ALL')}
                  style={{
                    fontFamily: 'Share Tech Mono, monospace',
                    fontSize: 9,
                    color: 'rgba(255,149,0,0.5)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    letterSpacing: '0.08em',
                    padding: 0,
                  }}
                >
                  ✕ 清除
                </button>
              )}
            </div>

            {/* Scrollable province chips */}
            <div
              style={{
                display: 'flex',
                gap: 7,
                overflowX: 'auto',
                paddingBottom: 4,
                scrollbarWidth: 'none',
              }}
            >
              {CN_PROVINCES.map(({ id, label, sublabel, emoji }) => {
                const isActive = selectedProvince === id;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedProvince(id as CnProvinceId)}
                    style={{
                      flexShrink: 0,
                      height: 38,
                      padding: '0 12px',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      background: isActive
                        ? 'linear-gradient(180deg, #C8860A 0%, #8A5A00 100%)'
                        : 'linear-gradient(180deg, rgba(50,32,10,0.9) 0%, rgba(30,18,4,0.9) 100%)',
                      border: isActive
                        ? '1px solid #FFB800'
                        : '1px solid rgba(80,55,20,0.5)',
                      boxShadow: isActive
                        ? '0 2px 10px rgba(255,149,0,0.35), inset 0 1px 0 rgba(255,220,100,0.2)'
                        : '0 1px 3px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
                      transform: isActive ? 'translateY(1px)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: 14, lineHeight: 1 }}>{emoji}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      <span
                        style={{
                          fontFamily: '"Noto Sans SC", sans-serif',
                          fontSize: 12,
                          color: isActive ? '#2A1000' : '#C89A50',
                          lineHeight: 1.1,
                          letterSpacing: '0.04em',
                          textShadow: isActive ? 'none' : '0 1px 2px rgba(0,0,0,0.8)',
                        }}
                      >
                        {label}
                      </span>
                      <span
                        style={{
                          fontFamily: 'Oswald, sans-serif',
                          fontSize: 7.5,
                          color: isActive ? 'rgba(42,16,0,0.7)' : 'rgba(140,100,45,0.6)',
                          letterSpacing: '0.14em',
                          lineHeight: 1,
                        }}
                      >
                        {sublabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Level 2: Genre ── */}
          <div
            style={{
              padding: '11px 16px',
              borderBottom: '1px solid rgba(80,55,20,0.25)',
              background: 'linear-gradient(180deg, rgba(18,10,4,0.8) 0%, transparent 100%)',
            }}
          >
            {/* Row header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 14,
                  borderRadius: 2,
                  background: 'linear-gradient(180deg, #FFD060, #C89020)',
                  boxShadow: '0 0 5px rgba(255,200,50,0.5)',
                  flexShrink: 0,
                }}
              />
              <div
                className="label-embossed"
                style={{ fontSize: 8, letterSpacing: '0.28em' }}
              >
                类型 TYPE
              </div>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: 'linear-gradient(90deg, rgba(180,140,40,0.3), transparent)',
                }}
              />
              {selectedCnGenre !== 'ALL' && (
                <button
                  onClick={() => setSelectedCnGenre('ALL')}
                  style={{
                    fontFamily: 'Share Tech Mono, monospace',
                    fontSize: 9,
                    color: 'rgba(255,149,0,0.5)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    letterSpacing: '0.08em',
                    padding: 0,
                  }}
                >
                  ✕ 清除
                </button>
              )}
            </div>

            {/* Wrapping genre chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {CN_GENRES.map(({ id, label, sublabel }) => {
                const isActive = selectedCnGenre === id;
                return (
                  <button
                    key={id}
                    className={`genre-switch ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedCnGenre(id as CnGenreId)}
                    style={{
                      padding: '5px 11px',
                      borderRadius: 4,
                      fontFamily: 'Oswald, sans-serif',
                      fontSize: 10,
                      letterSpacing: '0.12em',
                      color: isActive ? '#FFD070' : '#8A6A40',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    {/* LED dot */}
                    <div
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: isActive ? '#FF9500' : 'rgba(100,70,30,0.5)',
                        boxShadow: isActive ? '0 0 6px rgba(255,149,0,0.8)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    />
                    {/* Chinese label */}
                    <span
                      style={{
                        fontFamily: '"Noto Sans SC", sans-serif',
                        fontSize: 11,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {label}
                    </span>
                    {/* English sublabel */}
                    <span
                      style={{
                        fontFamily: 'Oswald, sans-serif',
                        fontSize: 8,
                        letterSpacing: '0.1em',
                        opacity: 0.55,
                      }}
                    >
                      {sublabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
          INTERNATIONAL FILTERS — band + genre + country (unchanged)
          ═══════════════════════════════════════════════════════════ */}
      {!isDomestic && (
        <>
          {/* Band selector */}
          <div
            style={{
              background: 'linear-gradient(180deg, #1A0E06 0%, #120A04 100%)',
              borderBottom: '1px solid rgba(80,55,20,0.5)',
              padding: '12px 16px',
            }}
          >
            <div className="label-embossed" style={{ fontSize: 8, marginBottom: 8, letterSpacing: '0.25em' }}>
              FREQUENCY BAND
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {BAND_LABELS.map(band => (
                <button
                  key={band}
                  className={`push-btn ${selectedBand === band ? 'push-btn-amber pressed' : 'push-btn-dark'}`}
                  onClick={() => setSelectedBand(band)}
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 6,
                    fontFamily: 'Oswald, sans-serif',
                    fontSize: 11,
                    letterSpacing: '0.12em',
                    color: selectedBand === band ? '#2A1000' : '#8A6A30',
                  }}
                >
                  {band}
                </button>
              ))}
            </div>
          </div>

          {/* Genre selector */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(80,55,20,0.25)',
            }}
          >
            <div className="label-embossed" style={{ fontSize: 8, marginBottom: 10, letterSpacing: '0.25em' }}>
              PROGRAM SELECTOR
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {GENRES.map(({ tag, label }) => (
                <button
                  key={tag}
                  className={`genre-switch ${selectedGenre === tag ? 'active' : ''}`}
                  onClick={() => setSelectedGenre(tag)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 4,
                    fontFamily: 'Oswald, sans-serif',
                    fontSize: 10,
                    letterSpacing: '0.15em',
                    color: selectedGenre === tag ? '#FFD070' : '#8A6A40',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: selectedGenre === tag ? '#FF9500' : 'rgba(100,70,30,0.5)',
                      boxShadow: selectedGenre === tag ? '0 0 6px rgba(255,149,0,0.7)' : 'none',
                      flexShrink: 0,
                    }}
                  />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Country filter */}
          <div
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid rgba(80,55,20,0.2)',
              background: 'linear-gradient(180deg, rgba(15,8,2,0.6) 0%, transparent 100%)',
            }}
          >
            <div className="label-embossed" style={{ fontSize: 8, marginBottom: 8, letterSpacing: '0.25em' }}>
              REGION FILTER
            </div>
            <div
              style={{
                display: 'flex',
                gap: 6,
                overflowX: 'auto',
                paddingBottom: 4,
                scrollbarWidth: 'none',
              }}
            >
              {COUNTRIES.map(({ code, flag, name }) => {
                const isActive = selectedCountry === code;
                return (
                  <button
                    key={code}
                    className={`push-btn ${isActive ? 'push-btn-amber pressed' : 'push-btn-dark'}`}
                    onClick={() => setSelectedCountry(code)}
                    style={{
                      flexShrink: 0,
                      height: 34,
                      padding: '0 10px',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <span style={{ fontSize: 13, lineHeight: 1 }}>{flag}</span>
                    <span
                      style={{
                        fontFamily: 'Oswald, sans-serif',
                        fontSize: 9,
                        letterSpacing: '0.12em',
                        color: isActive ? '#2A1000' : '#8A6A40',
                      }}
                    >
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
          Station count header (both modes)
          ═══════════════════════════════════════════════════════════ */}
      <div
        style={{
          padding: '10px 16px 6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div className="label-brass" style={{ fontSize: 9 }}>
          {activeLabel}
        </div>
        <AnimatePresence mode="wait">
          {!loading && (
            <motion.div
              key={`count-${filterKey}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                fontFamily: 'Share Tech Mono, monospace',
                fontSize: 11,
                color: 'rgba(180,140,50,0.6)',
                letterSpacing: '0.08em',
              }}
            >
              {stations.length} {isDomestic ? '电台' : 'RESULTS'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          Station grid — animated on filter change
          ═══════════════════════════════════════════════════════════ */}
      <div style={{ padding: '4px 16px' }}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" {...GRID_VARIANTS}>
              <GridSkeleton count={8} />
            </motion.div>
          ) : stations.length === 0 ? (
            <motion.div
              key="empty"
              {...GRID_VARIANTS}
              style={{ textAlign: 'center', padding: '48px 16px' }}
            >
              <div style={{ fontSize: 42, marginBottom: 14 }}>📻</div>
              <div
                className="label-brass"
                style={{ fontSize: 12, marginBottom: 8 }}
              >
                {isDomestic ? '该频段暂无信号' : 'NO SIGNAL ON THIS BAND'}
              </div>
              <div
                style={{
                  fontFamily: 'Share Tech Mono, monospace',
                  fontSize: 11,
                  color: 'rgba(160,120,50,0.4)',
                  letterSpacing: '0.05em',
                  marginBottom: 20,
                }}
              >
                {isDomestic ? '请尝试其他地区或类型' : 'Try a different genre or region'}
              </div>
              {(isDomestic ? (selectedProvince !== 'ALL' || selectedCnGenre !== 'ALL') : selectedCountry !== 'ALL') && (
                <button
                  className="push-btn push-btn-dark"
                  onClick={() => {
                    if (isDomestic) {
                      setSelectedProvince('ALL');
                      setSelectedCnGenre('ALL');
                    } else {
                      setSelectedCountry('ALL');
                    }
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    fontFamily: 'Oswald, sans-serif',
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    color: '#8A6A40',
                  }}
                >
                  {isDomestic ? '清除全部筛选' : 'CLEAR FILTERS'}
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div key={filterKey} {...GRID_VARIANTS}>
              <div className="station-grid">
                {stations.map(station => (
                  <StationCard
                    key={station.stationuuid}
                    station={station}
                    variant="grid"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
