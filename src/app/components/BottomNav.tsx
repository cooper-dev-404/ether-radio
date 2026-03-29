import React from 'react';
import { NavLink, useLocation } from 'react-router';
import { Home, Compass, Heart, Search } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/',         label: 'HOME',     Icon: Home    },
  { path: '/discover', label: 'DISCOVER', Icon: Compass },
  { path: '/favorites',label: 'FAVS',     Icon: Heart   },
  { path: '/search',   label: 'SEARCH',   Icon: Search  },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #2A1A0E 0%, #1A0C06 100%)',
        borderTop: '1px solid #3A2510',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        display: 'flex',
        alignItems: 'stretch',
        position: 'relative',
      }}
    >
      {/* Top chrome line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(180,140,40,0.3), transparent)',
        }}
      />

      {NAV_ITEMS.map(({ path, label, Icon }) => {
        const isActive = path === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(path);

        return (
          <NavLink
            key={path}
            to={path}
            style={{ flex: 1, display: 'flex', textDecoration: 'none' }}
          >
            {({ isActive: navIsActive }) => {
              const active = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
              return (
                <div
                  className={`nav-btn ${active ? 'active' : ''}`}
                  style={{
                    flex: 1,
                    paddingTop: 10,
                    paddingBottom: 10,
                  }}
                >
                  {/* Button face */}
                  <div
                    style={{
                      width: 44,
                      height: 36,
                      borderRadius: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 3,
                      background: active
                        ? 'linear-gradient(160deg, #4A3010 0%, #2E1C08 100%)'
                        : 'linear-gradient(160deg, #2E1E0C 0%, #1E1208 100%)',
                      boxShadow: active
                        ? 'inset 0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(200,140,0,0.15)'
                        : '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
                      border: active ? '1px solid rgba(180,120,0,0.3)' : '1px solid rgba(60,40,15,0.5)',
                      transition: 'all 100ms ease',
                    }}
                  >
                    <Icon
                      size={16}
                      strokeWidth={active ? 2 : 1.5}
                      color={active ? '#FF9500' : 'rgba(160,120,60,0.5)'}
                      style={{
                        filter: active ? 'drop-shadow(0 0 4px rgba(255,149,0,0.6))' : 'none',
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'Oswald, sans-serif',
                        fontSize: 7,
                        letterSpacing: '0.15em',
                        color: active ? '#FF9500' : 'rgba(120,90,40,0.6)',
                        textShadow: active ? '0 0 6px rgba(255,149,0,0.5)' : 'none',
                      }}
                    >
                      {label}
                    </span>
                  </div>
                </div>
              );
            }}
          </NavLink>
        );
      })}
    </div>
  );
}
