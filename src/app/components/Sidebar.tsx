import React from 'react';
import { NavLink, useLocation } from 'react-router';
import { Home, Compass, Heart, Search, Radio } from 'lucide-react';
import { RegionToggle } from './RegionToggle';
import { usePlayerStore } from '../store/playerStore';
import { StationLogo } from './StationLogo';

const NAV_ITEMS = [
  { path: '/',          label: 'HOME',     Icon: Home    },
  { path: '/discover',  label: 'DISCOVER', Icon: Compass },
  { path: '/favorites', label: 'FAVS',     Icon: Heart   },
  { path: '/search',    label: 'SEARCH',   Icon: Search  },
];

export function Sidebar() {
  const location = useLocation();
  const { currentStation, isPlaying } = usePlayerStore();

  return (
    <div className="layout-sidebar">
      {/* ── Logo / brand area ── */}
      <div
        style={{
          padding: '14px 12px 10px',
          borderBottom: '1px solid rgba(60,40,15,0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          flexShrink: 0,
          background: 'linear-gradient(180deg, #1A0E06 0%, transparent 100%)',
        }}
      >
        {/* Indicator cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
          <div className="indicator-amber" style={{ width: 7, height: 7, borderRadius: '50%' }} />
          <div className="indicator-amber" style={{ width: 5, height: 5, borderRadius: '50%', opacity: 0.55 }} />
          <div className="indicator-green" style={{ width: 5, height: 5, borderRadius: '50%', opacity: 0.6 }} />
          <div
            className={isPlaying ? 'indicator-red live-dot' : 'indicator-red'}
            style={{ width: 7, height: 7, borderRadius: '50%', opacity: isPlaying ? 1 : 0.35 }}
          />
        </div>

        {/* Brand text — hidden when sidebar is collapsed */}
        <div className="sidebar-brand-text" style={{ textAlign: 'center' }}>
          <div className="label-brass" style={{ fontSize: 15, letterSpacing: '0.28em' }}>
            ◈ ETHER ◈
          </div>
          <div className="label-brass" style={{ fontSize: 15, letterSpacing: '0.28em', marginTop: 1 }}>
            RADIO
          </div>
          <div
            className="label-embossed"
            style={{ fontSize: 6, letterSpacing: '0.22em', marginTop: 3, opacity: 0.7 }}
          >
            WORLDWIDE BROADCAST
          </div>
        </div>

        {/* Collapsed icon — shown only when sidebar is narrow */}
        <div className="sidebar-logo-icon">
          <Radio size={16} color="#C9A227" style={{ filter: 'drop-shadow(0 0 4px rgba(200,160,0,0.5))' }} />
        </div>
      </div>

      {/* Brass separator under logo */}
      <div
        style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, #8A6C00 20%, #C9A227 50%, #8A6C00 80%, transparent)',
          flexShrink: 0,
          opacity: 0.5,
        }}
      />

      {/* ── Region Toggle — hidden when collapsed ── */}
      <div className="sidebar-region-toggle" style={{ flexShrink: 0 }}>
        <RegionToggle />
        <div
          style={{
            height: 1,
            margin: '0 12px',
            background: 'linear-gradient(90deg, transparent, rgba(120,85,30,0.3), transparent)',
          }}
        />
      </div>

      {/* ── Navigation links ── */}
      <nav
        style={{
          flex: 1,
          padding: '8px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {NAV_ITEMS.map(({ path, label, Icon }) => {
          const active =
            path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(path);

          return (
            <NavLink key={path} to={path} style={{ textDecoration: 'none' }}>
              <div
                className="sidebar-nav-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 14px',
                  margin: '0 8px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: active
                    ? 'linear-gradient(160deg, #4A3010 0%, #2E1C08 100%)'
                    : 'transparent',
                  boxShadow: active
                    ? 'inset 0 2px 4px rgba(0,0,0,0.4), 0 0 8px rgba(200,140,0,0.08)'
                    : 'none',
                  border: active
                    ? '1px solid rgba(180,120,0,0.22)'
                    : '1px solid transparent',
                  transition: 'all 120ms ease',
                }}
              >
                <Icon
                  size={15}
                  strokeWidth={active ? 2 : 1.5}
                  color={active ? '#FF9500' : 'rgba(130,98,45,0.55)'}
                  style={{
                    filter: active ? 'drop-shadow(0 0 4px rgba(255,149,0,0.5))' : 'none',
                    flexShrink: 0,
                  }}
                />

                {/* Label — hidden when collapsed */}
                <span
                  className="sidebar-label"
                  style={{
                    fontFamily: 'Oswald, sans-serif',
                    fontSize: 11,
                    letterSpacing: '0.2em',
                    color: active ? '#FF9500' : 'rgba(130,98,45,0.55)',
                    textShadow: active ? '0 0 6px rgba(255,149,0,0.4)' : 'none',
                    flex: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </span>

                {/* Active dot — also hidden when collapsed */}
                {active && (
                  <div className="sidebar-label">
                    <div
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: '#FF9500',
                        boxShadow: '0 0 6px rgba(255,149,0,0.8)',
                      }}
                    />
                  </div>
                )}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Brass separator above station info */}
      <div
        style={{
          height: 1,
          margin: '0 12px',
          background: 'linear-gradient(90deg, transparent, rgba(120,85,30,0.3), transparent)',
          flexShrink: 0,
        }}
      />

      {/* ── Mini station info at bottom ── */}
      {currentStation ? (
        <div
          className="sidebar-bottom-info"
          style={{
            padding: '8px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
            background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.25))',
          }}
        >
          <div style={{ flexShrink: 0 }}>
            <StationLogo
              favicon={currentStation.favicon}
              name={currentStation.name}
              size={26}
              borderRadius={5}
            />
          </div>
          <div className="sidebar-label" style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'VT323, monospace',
                fontSize: 12,
                color: 'rgba(255,149,0,0.85)',
                textShadow: '0 0 6px rgba(255,100,0,0.4)',
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
                fontFamily: 'Oswald, sans-serif',
                fontSize: 7,
                letterSpacing: '0.14em',
                color: 'rgba(130,98,45,0.55)',
                marginTop: 1,
              }}
            >
              {currentStation.tags?.split(',')[0]?.toUpperCase() || 'LIVE RADIO'}
            </div>
          </div>
          {/* Live dot */}
          {isPlaying && (
            <div
              className="live-dot"
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#FF6500',
                flexShrink: 0,
              }}
            />
          )}
        </div>
      ) : (
        <div
          style={{
            padding: '8px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <div
            className="sidebar-label"
            style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: 8,
              letterSpacing: '0.12em',
              color: 'rgba(90,65,25,0.4)',
            }}
          >
            NO STATION TUNED
          </div>
        </div>
      )}

      {/* Bottom wood accent strip */}
      <div
        style={{
          height: 5,
          background:
            'linear-gradient(90deg, #1A0E06, #2A1A0E 25%, #3A2510 50%, #2A1A0E 75%, #1A0E06)',
          flexShrink: 0,
        }}
      />
    </div>
  );
}
