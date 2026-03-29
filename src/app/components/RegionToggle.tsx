import React from 'react';
import { Globe } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';

export function RegionToggle() {
  const { region, setRegion } = usePlayerStore();
  const isIntl = region === 'international';
  const isDom  = region === 'domestic';

  return (
    <div style={{ padding: '10px 12px 12px' }}>
      {/* Engraved label */}
      <div
        className="label-embossed"
        style={{
          fontSize: 7,
          letterSpacing: '0.28em',
          marginBottom: 8,
          textAlign: 'center',
          opacity: 0.8,
        }}
      >
        频段 / BAND
      </div>

      {/* Switch housing — recessed brass tray */}
      <div
        style={{
          background: 'linear-gradient(180deg, #0E0804 0%, #1A0E06 100%)',
          borderRadius: 10,
          border: '1px solid #2A1808',
          boxShadow:
            'inset 0 3px 8px rgba(0,0,0,0.8), inset 0 1px 2px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05)',
          padding: 4,
          display: 'flex',
          gap: 3,
          position: 'relative',
        }}
      >
        {/* Sliding indicator bar behind buttons */}
        <div
          style={{
            position: 'absolute',
            top: 4,
            left: isIntl ? 4 : 'calc(50% + 2px)',
            width: 'calc(50% - 5px)',
            bottom: 4,
            borderRadius: 7,
            background: 'linear-gradient(160deg, #6A4012 0%, #3A2008 100%)',
            boxShadow:
              '0 0 12px rgba(255,149,0,0.18), inset 0 1px 0 rgba(255,200,80,0.1)',
            border: '1px solid rgba(200,140,0,0.3)',
            transition: 'left 200ms cubic-bezier(0.3, 0, 0.2, 1)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* ── 国际 button ── */}
        <button
          onClick={() => setRegion('international')}
          style={{
            flex: 1,
            height: 48,
            borderRadius: 7,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            background: 'transparent',
            position: 'relative',
            zIndex: 1,
            transition: 'all 150ms ease',
          }}
        >
          {/* LED indicator */}
          <div
            style={{
              position: 'absolute',
              top: 5,
              right: 6,
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: isIntl
                ? 'radial-gradient(circle, #FFB800 0%, #FF7800 100%)'
                : 'rgba(60,40,15,0.6)',
              boxShadow: isIntl ? '0 0 5px rgba(255,149,0,0.9)' : 'none',
              transition: 'all 200ms ease',
            }}
          />
          <Globe
            size={13}
            color={isIntl ? '#FF9500' : 'rgba(100,75,35,0.45)'}
            strokeWidth={isIntl ? 2 : 1.5}
            style={{
              filter: isIntl ? 'drop-shadow(0 0 4px rgba(255,149,0,0.7))' : 'none',
              transition: 'all 150ms ease',
            }}
          />
          <span
            style={{
              fontFamily: 'Oswald, sans-serif',
              fontSize: 9,
              letterSpacing: '0.08em',
              color: isIntl ? '#FF9500' : 'rgba(100,75,35,0.5)',
              textShadow: isIntl ? '0 0 8px rgba(255,149,0,0.6)' : 'none',
              transition: 'all 150ms ease',
            }}
          >
            国际
          </span>
        </button>

        {/* Center groove divider */}
        <div
          style={{
            width: 1,
            alignSelf: 'stretch',
            background: 'linear-gradient(180deg, transparent, rgba(80,55,20,0.4), transparent)',
            flexShrink: 0,
            zIndex: 1,
          }}
        />

        {/* ── 国内 button ── */}
        <button
          onClick={() => setRegion('domestic')}
          style={{
            flex: 1,
            height: 48,
            borderRadius: 7,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            background: 'transparent',
            position: 'relative',
            zIndex: 1,
            transition: 'all 150ms ease',
          }}
        >
          {/* LED indicator */}
          <div
            style={{
              position: 'absolute',
              top: 5,
              right: 6,
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: isDom
                ? 'radial-gradient(circle, #FFB800 0%, #FF7800 100%)'
                : 'rgba(60,40,15,0.6)',
              boxShadow: isDom ? '0 0 5px rgba(255,149,0,0.9)' : 'none',
              transition: 'all 200ms ease',
            }}
          />
          <span style={{ fontSize: 15, lineHeight: 1 }}>🇨🇳</span>
          <span
            style={{
              fontFamily: 'Oswald, sans-serif',
              fontSize: 9,
              letterSpacing: '0.08em',
              color: isDom ? '#FF9500' : 'rgba(100,75,35,0.5)',
              textShadow: isDom ? '0 0 8px rgba(255,149,0,0.6)' : 'none',
              transition: 'all 150ms ease',
            }}
          >
            国内
          </span>
        </button>
      </div>

      {/* Status line beneath */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          marginTop: 5,
        }}
      >
        <div
          style={{
            height: 1,
            flex: 1,
            background: 'linear-gradient(90deg, transparent, rgba(140,100,30,0.25))',
          }}
        />
        <span
          className="label-embossed"
          style={{ fontSize: 6, letterSpacing: '0.2em', opacity: 0.6 }}
        >
          {isIntl ? 'INTERNATIONAL' : 'DOMESTIC'}
        </span>
        <div
          style={{
            height: 1,
            flex: 1,
            background: 'linear-gradient(90deg, rgba(140,100,30,0.25), transparent)',
          }}
        />
      </div>
    </div>
  );
}
