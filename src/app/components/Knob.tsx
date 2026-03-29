import React, { useCallback, useEffect, useRef, useState } from 'react';

interface KnobProps {
  value: number;         // 0 to 1
  onChange: (v: number) => void;
  size?: number;
  label?: string;
  color?: 'silver' | 'brass' | 'dark';
}

export function Knob({ value, onChange, size = 60, label, color = 'silver' }: KnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startValue = useRef(0);

  // Map 0–1 to -140° to +140° (280° total range)
  const angle = -140 + value * 280;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startY.current = e.clientY;
    startValue.current = value;
  }, [value]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startY.current = e.touches[0].clientY;
    startValue.current = value;
  }, [value]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startY.current - e.clientY;
      const deltaValue = deltaY / 200;
      const newValue = Math.min(1, Math.max(0, startValue.current + deltaValue));
      onChange(newValue);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const deltaY = startY.current - e.touches[0].clientY;
      const deltaValue = deltaY / 200;
      const newValue = Math.min(1, Math.max(0, startValue.current + deltaValue));
      onChange(newValue);
    };

    const handleUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, onChange]);

  const gradients: Record<string, string> = {
    silver: 'radial-gradient(circle at 32% 28%, #9A9A9A 0%, #6A6A6A 30%, #2A2A2A 80%)',
    brass:  'radial-gradient(circle at 32% 28%, #C9A227 0%, #8A6C00 30%, #3A2C00 80%)',
    dark:   'radial-gradient(circle at 32% 28%, #5A5A5A 0%, #3A3A3A 30%, #0A0A0A 80%)',
  };

  const innerGradients: Record<string, string> = {
    silver: 'radial-gradient(circle at 38% 32%, #7A7A7A 0%, #1A1A1A 100%)',
    brass:  'radial-gradient(circle at 38% 32%, #AA8800 0%, #2A1A00 100%)',
    dark:   'radial-gradient(circle at 38% 32%, #4A4A4A 0%, #0A0A0A 100%)',
  };

  const indicatorColor: Record<string, string> = {
    silver: 'rgba(255,255,255,0.9)',
    brass:  '#FFD070',
    dark:   'rgba(255,149,0,0.9)',
  };

  const innerSize = size * 0.7;
  const markerDistance = innerSize / 2 - 6;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      {/* Outer ring / base plate */}
      <div
        style={{
          width: size + 16,
          height: size + 16,
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #5A5A5A 0%, #2A2A2A 50%, #3A3A3A 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Knob body */}
        <div
          className="knob-outer"
          style={{
            width: size,
            height: size,
            background: gradients[color],
            position: 'relative',
          }}
        >
          {/* Inner dome */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${angle}deg)`,
              width: innerSize,
              height: innerSize,
              borderRadius: '50%',
              background: innerGradients[color],
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.7), inset 0 -1px 2px rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: 4,
            }}
          >
            {/* Marker dot */}
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: indicatorColor[color],
                boxShadow: `0 0 6px ${indicatorColor[color]}`,
                marginTop: 2,
              }}
            />
          </div>
        </div>
      </div>

      {/* Arc indicator marks */}
      <div style={{ position: 'relative', width: size + 16, height: 12 }}>
        {/* Min mark */}
        <div
          style={{
            position: 'absolute',
            left: 4,
            bottom: 0,
            width: 2,
            height: 6,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 1,
          }}
        />
        {/* Max mark */}
        <div
          style={{
            position: 'absolute',
            right: 4,
            bottom: 0,
            width: 2,
            height: 6,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 1,
          }}
        />
        {/* Center mark */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 0,
            transform: 'translateX(-50%)',
            width: 2,
            height: 4,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 1,
          }}
        />
      </div>

      {label && (
        <div
          className="label-embossed"
          style={{ fontSize: 9, letterSpacing: '0.2em', marginTop: -4 }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
