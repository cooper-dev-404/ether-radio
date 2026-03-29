import React, { useEffect, useRef, useState } from 'react';

interface VUMeterProps {
  isPlaying: boolean;
  isLoading?: boolean;
  width?: number;
  height?: number;
  label?: string;
  side?: 'left' | 'right';
}

export function VUMeter({ isPlaying, isLoading, width = 80, height = 60, label = 'VU', side = 'left' }: VUMeterProps) {
  const needleRef = useRef<SVGGElement>(null);
  const animRef = useRef<number>(0);
  const angleRef = useRef(-45);
  const targetRef = useRef(-45);
  const timeRef = useRef(0);

  useEffect(() => {
    let frame: number;

    const animate = (ts: number) => {
      const dt = ts - timeRef.current;
      timeRef.current = ts;

      if (isPlaying && !isLoading) {
        // Random target update every ~150ms
        if (dt > 120 || Math.abs(angleRef.current - targetRef.current) < 2) {
          targetRef.current = -45 + Math.random() * 65; // -45° to +20°
        }
      } else if (isLoading) {
        // Slow sweep when loading
        targetRef.current = -45 + (Math.sin(ts / 800) + 1) * 20;
      } else {
        targetRef.current = -50; // resting position
      }

      // Smooth approach
      const speed = isPlaying ? 0.18 : 0.06;
      angleRef.current += (targetRef.current - angleRef.current) * speed;

      if (needleRef.current) {
        needleRef.current.setAttribute('transform', `rotate(${angleRef.current}, 40, 56)`);
      }

      frame = requestAnimationFrame(animate);
      animRef.current = frame;
    };

    frame = requestAnimationFrame(animate);
    animRef.current = frame;
    return () => cancelAnimationFrame(frame);
  }, [isPlaying, isLoading]);

  // Scale marks
  const scalePct = [0, 20, 40, 60, 80, 100];

  return (
    <div style={{ width, flexShrink: 0 }}>
      {/* Frame */}
      <div
        className="vu-meter-frame"
        style={{
          width,
          height: height + 16,
          borderRadius: 6,
          padding: '4px 4px 2px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {/* Scale background */}
        <div
          className="vu-meter-scale"
          style={{
            width: '100%',
            height,
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 80 60">
            {/* Background */}
            <rect width="80" height="60" fill="#F5F0E0" />

            {/* Color zones */}
            {/* Green zone: -45° to 0° */}
            <path
              d="M 40 56 L 8 28 A 36 36 0 0 1 40 20 Z"
              fill="rgba(0,180,0,0.15)"
            />
            {/* Yellow zone: 0° to +10° */}
            <path
              d="M 40 56 L 40 20 A 36 36 0 0 1 56 25 Z"
              fill="rgba(255,200,0,0.18)"
            />
            {/* Red zone: +10° to +20° */}
            <path
              d="M 40 56 L 56 25 A 36 36 0 0 1 70 32 Z"
              fill="rgba(220,0,0,0.15)"
            />

            {/* Arc scale line */}
            <path
              d="M 8 28 A 36 36 0 0 1 72 28"
              fill="none"
              stroke="#888"
              strokeWidth="0.5"
            />

            {/* Scale ticks */}
            {[...Array(11)].map((_, i) => {
              const angle = -45 + (i * 65) / 10;
              const rad = (angle * Math.PI) / 180;
              const r1 = 33, r2 = i % 2 === 0 ? 27 : 30;
              const x1 = 40 + r1 * Math.sin(rad);
              const y1 = 56 - r1 * Math.cos(rad);
              const x2 = 40 + r2 * Math.sin(rad);
              const y2 = 56 - r2 * Math.cos(rad);
              const isRedZone = i >= 8;
              return (
                <line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={isRedZone ? '#CC2200' : '#555'}
                  strokeWidth="0.8"
                />
              );
            })}

            {/* dB Labels */}
            {[
              { angle: -45, label: '-20' },
              { angle: -20, label: '-10' },
              { angle: 0,   label: '0'   },
              { angle: 10,  label: '+3'  },
              { angle: 20,  label: '+5'  },
            ].map(({ angle, label: lb }) => {
              const rad = (angle * Math.PI) / 180;
              const r = 22;
              const x = 40 + r * Math.sin(rad);
              const y = 56 - r * Math.cos(rad);
              return (
                <text
                  key={lb}
                  x={x} y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="4"
                  fill={angle >= 10 ? '#CC2200' : '#333'}
                  fontFamily="sans-serif"
                >
                  {lb}
                </text>
              );
            })}

            {/* dB label */}
            <text x="40" y="10" textAnchor="middle" fontSize="5" fill="#555" fontFamily="sans-serif" fontWeight="bold">
              dB
            </text>

            {/* Needle pivot base */}
            <circle cx="40" cy="56" r="3.5" fill="#444" />
            <circle cx="40" cy="56" r="1.5" fill="#999" />

            {/* Needle */}
            <g ref={needleRef} transform={`rotate(-45, 40, 56)`}>
              <line
                x1="40" y1="56"
                x2="40" y2="22"
                stroke="#CC1100"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </g>

            {/* Pivot cap */}
            <circle cx="40" cy="56" r="2" fill="#222" />
          </svg>
        </div>

        {/* Label */}
        <div
          className="label-embossed"
          style={{ fontSize: 8, letterSpacing: '0.2em' }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

// Vertical bar-style VU meter (for mini player)
interface VUBarsProps {
  isPlaying: boolean;
  bars?: number;
  height?: number;
}

export function VUBars({ isPlaying, bars = 5, height = 20 }: VUBarsProps) {
  const [levels, setLevels] = useState<number[]>(Array(bars).fill(0.1));

  useEffect(() => {
    if (!isPlaying) {
      setLevels(Array(bars).fill(0.1));
      return;
    }

    const interval = setInterval(() => {
      setLevels(prev => prev.map((_, i) => {
        const base = 0.3 + Math.random() * 0.7;
        // Middle bars tend higher
        const boost = Math.sin((i / (bars - 1)) * Math.PI) * 0.3;
        return Math.min(1, base + boost);
      }));
    }, 120);

    return () => clearInterval(interval);
  }, [isPlaying, bars]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 2,
        height,
      }}
    >
      {levels.map((level, i) => {
        const h = Math.round(level * height);
        const isHot = level > 0.8;
        return (
          <div
            key={i}
            className="wave-bar"
            style={{
              width: 3,
              height: h,
              background: isHot
                ? 'linear-gradient(180deg, #FF3300 0%, #FF6600 100%)'
                : 'linear-gradient(180deg, #FF9500 0%, #FF6000 100%)',
              boxShadow: isHot
                ? '0 0 4px rgba(255,50,0,0.7)'
                : '0 0 4px rgba(255,149,0,0.5)',
              transition: 'height 80ms ease-out',
              borderRadius: '2px 2px 0 0',
            }}
          />
        );
      })}
    </div>
  );
}
