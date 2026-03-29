import React, { useMemo } from 'react';

interface FrequencyDialProps {
  value: number;     // 0 to 1 representing position on dial
  minFreq?: number;
  maxFreq?: number;
  label?: string;
  width?: number;
}

export function FrequencyDial({
  value,
  minFreq = 87.5,
  maxFreq = 108.0,
  label = 'FM MHz',
  width = 320,
}: FrequencyDialProps) {
  const height = 56;
  const paddingX = 24;
  const trackWidth = width - paddingX * 2;

  // Generate frequency marks
  const marks = useMemo(() => {
    const result: { freq: number; x: number; isMajor: boolean }[] = [];
    for (let f = Math.ceil(minFreq); f <= maxFreq; f += 0.5) {
      const pct = (f - minFreq) / (maxFreq - minFreq);
      const x = paddingX + pct * trackWidth;
      const isMajor = Number.isInteger(f);
      result.push({ freq: f, x, isMajor });
    }
    return result;
  }, [minFreq, maxFreq, trackWidth]);

  const needleX = paddingX + value * trackWidth;
  const currentFreq = minFreq + value * (maxFreq - minFreq);

  return (
    <div
      className="freq-scale"
      style={{
        width,
        height,
        borderRadius: 6,
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <svg width={width} height={height} style={{ display: 'block' }}>
        {/* Scale background gradient */}
        <defs>
          <linearGradient id="scaleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.06)" />
            <stop offset="50%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.06)" />
          </linearGradient>
        </defs>
        <rect width={width} height={height} fill="url(#scaleGrad)" />

        {/* Band label */}
        <text
          x={paddingX}
          y={14}
          fontSize="7"
          fontFamily="Oswald, sans-serif"
          fontWeight="400"
          letterSpacing="2"
          fill="#8A7060"
          textAnchor="start"
        >
          {label}
        </text>

        {/* Tick marks */}
        {marks.map(({ freq, x, isMajor }) => (
          <g key={freq}>
            <line
              x1={x} y1={isMajor ? 18 : 22}
              x2={x} y2={isMajor ? 32 : 28}
              stroke={isMajor ? '#5A4030' : '#9A7050'}
              strokeWidth={isMajor ? 1.5 : 0.8}
            />
            {isMajor && (
              <text
                x={x}
                y={42}
                fontSize="7.5"
                fontFamily="Oswald, sans-serif"
                fontWeight="300"
                fill="#3A2A18"
                textAnchor="middle"
              >
                {freq}
              </text>
            )}
          </g>
        ))}

        {/* Glowing needle */}
        <defs>
          <filter id="needleGlow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <line
          x1={needleX} y1={14}
          x2={needleX} y2={48}
          stroke="#CC1100"
          strokeWidth={2}
          filter="url(#needleGlow)"
        />
        {/* Needle top arrow */}
        <polygon
          points={`${needleX-4},14 ${needleX+4},14 ${needleX},20`}
          fill="#CC1100"
          filter="url(#needleGlow)"
        />

        {/* Current frequency readout box */}
        <rect
          x={needleX - 22}
          y={48}
          width={44}
          height={6}
          rx={2}
          fill="rgba(200,0,0,0.1)"
          stroke="rgba(200,0,0,0.3)"
          strokeWidth="0.5"
        />
        <text
          x={needleX}
          y={53}
          fontSize="5"
          fontFamily="Share Tech Mono, monospace"
          fill="#CC1100"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {currentFreq.toFixed(1)}
        </text>
      </svg>
    </div>
  );
}
