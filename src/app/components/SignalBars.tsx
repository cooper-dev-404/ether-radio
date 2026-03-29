import React, { useEffect, useState } from 'react';

interface SignalBarsProps {
  isPlaying: boolean;
  isLoading: boolean;
  bars?: number;
  height?: number;
}

export function SignalBars({ isPlaying, isLoading, bars = 5, height = 16 }: SignalBarsProps) {
  const [strength, setStrength] = useState(3);

  useEffect(() => {
    if (!isPlaying) {
      setStrength(0);
      return;
    }
    if (isLoading) {
      setStrength(1);
      return;
    }
    // Simulate signal fluctuation
    const interval = setInterval(() => {
      setStrength(3 + Math.floor(Math.random() * 3)); // 3-5 bars
    }, 2000);
    setStrength(4);
    return () => clearInterval(interval);
  }, [isPlaying, isLoading]);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
      {Array.from({ length: bars }).map((_, i) => {
        const barHeight = 4 + (i / (bars - 1)) * (height - 4);
        const isActive = i < strength;
        const isHot = isActive && i >= bars - 2;
        return (
          <div
            key={i}
            className="signal-bar"
            style={{
              width: 3,
              height: barHeight,
              background: isActive
                ? isHot
                  ? 'linear-gradient(180deg, #FF9500, #FF6500)'
                  : 'linear-gradient(180deg, #C07800, #8A5000)'
                : 'rgba(60,40,10,0.5)',
              boxShadow: isActive
                ? isHot
                  ? '0 0 4px rgba(255,149,0,0.6)'
                  : '0 0 2px rgba(180,100,0,0.3)'
                : 'none',
              opacity: isActive ? 1 : 0.3,
            }}
          />
        );
      })}
    </div>
  );
}
