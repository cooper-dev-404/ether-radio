import React, { useState } from 'react';
import { getStationInitials } from '../hooks/useStations';

interface StationLogoProps {
  favicon: string;
  name: string;
  size?: number;
  borderRadius?: number;
}

const hues = [15, 30, 45, 200, 250, 280, 320, 0];

function getHue(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return hues[Math.abs(hash) % hues.length];
}

export function StationLogo({ favicon, name, size = 48, borderRadius = 8 }: StationLogoProps) {
  const [error, setError] = useState(false);
  const initials = getStationInitials(name) || '?';
  const hue = getHue(name);

  if (error || !favicon) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, hsl(${hue},60%,25%) 0%, hsl(${hue},40%,15%) 100%)`,
          border: `1px solid hsl(${hue},50%,30%)`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1)`,
          color: `hsl(${hue},80%,75%)`,
          fontFamily: 'Oswald, sans-serif',
          fontSize: size * 0.32,
          fontWeight: 600,
          letterSpacing: '0.05em',
          userSelect: 'none',
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={favicon}
      alt={name}
      onError={() => setError(true)}
      style={{
        width: size,
        height: size,
        borderRadius,
        flexShrink: 0,
        objectFit: 'cover',
        border: '1px solid rgba(100,70,30,0.4)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
        background: `hsl(${hue},40%,15%)`,
      }}
    />
  );
}
