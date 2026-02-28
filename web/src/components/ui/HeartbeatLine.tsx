import React from 'react';

interface HeartbeatLineProps {
  width?: string | number;
  height?: number;
  color?: string;
  className?: string;
}

export function HeartbeatLine({
  width = '100%',
  height = 60,
  color = '#60A5FA',
  className,
}: HeartbeatLineProps) {
  // ECG-style heartbeat path
  const path =
    'M0,30 L30,30 L35,30 L40,28 L45,32 L50,30 L55,30 L60,30 L65,10 L70,50 L75,5 L80,45 L85,30 L90,30 L95,28 L100,32 L105,30 L140,30 L145,30 L150,28 L155,32 L160,30 L165,30 L170,30 L175,10 L180,50 L185,5 L190,45 L195,30 L200,30 L205,28 L210,32 L215,30 L250,30 L255,30 L260,28 L265,32 L270,30 L275,30 L280,30 L285,10 L290,50 L295,5 L300,45 L305,30 L310,30 L315,28 L320,32 L325,30 L360,30';

  return (
    <div className={className} style={{ width, overflow: 'hidden' }}>
      <svg
        viewBox="0 0 360 60"
        fill="none"
        preserveAspectRatio="none"
        style={{ width: '100%', height }}
      >
        <defs>
          <filter id="heartbeat-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Glow layer */}
        <path
          d={path}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.3"
          filter="url(#heartbeat-glow)"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="720"
            to="0"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-dasharray"
            values="0 720;360 360;720 0"
            dur="3s"
            repeatCount="indefinite"
          />
        </path>
        {/* Main line */}
        <path
          d={path}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="720"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="720"
            to="0"
            dur="3s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
}
