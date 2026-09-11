import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Configuration } from '@/types';
import { cylinderSeries, motors, ballScrews, timingBelts } from '@/data';
import { cn } from '@/lib/utils';

type ViewMode = 'side' | 'transmission' | 'exploded';

interface ProductVisualizerProps {
  config: Configuration;
  className?: string;
  showLabels?: boolean;
}

export function ProductVisualizer({ config, className, showLabels = true }: ProductVisualizerProps) {
  const [view, setView] = useState<ViewMode>('side');

  const cyl = cylinderSeries.find((c) => c.id === config.cylinderId);
  const motor = motors.find((m) => m.id === config.motorId);
  const screw = ballScrews.find((s) => s.id === config.screwId);
  const belt = timingBelts.find((b) => b.id === config.beltId);

  // Scale factor based on cylinder size
  const sizeIndex = cyl ? ['EC40', 'EC60', 'EC80', 'EC100', 'EC120'].indexOf(cyl.id) : 2;
  const bodyHeight = 40 + sizeIndex * 8;
  const bodyWidth = 260 + sizeIndex * 20;
  const motorSize = 28 + (motor ? Math.min(motor.power / 100, 30) : 10);

  const views: { id: ViewMode; label: string }[] = [
    { id: 'side', label: 'Side View' },
    { id: 'transmission', label: 'Transmission' },
    { id: 'exploded', label: 'Exploded' },
  ];

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="mb-3 flex items-center gap-1">
        {views.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setView(v.id)}
            className={cn(
              'rounded-md px-2.5 py-1 text-2xs font-medium transition-colors',
              view === v.id ? 'bg-ink text-white' : 'text-muted hover:bg-ink/5',
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="relative flex items-center justify-center rounded-card border border-line bg-gradient-to-b from-surface to-bg/50 p-6">
        <svg
          viewBox="0 0 420 200"
          className="w-full max-w-xl"
          role="img"
          aria-label="Electric cylinder product visualization"
        >
          <defs>
            <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D8D8D4" />
              <stop offset="50%" stopColor="#C4C4C0" />
              <stop offset="100%" stopColor="#B0B0AC" />
            </linearGradient>
            <linearGradient id="motorGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3A3A38" />
              <stop offset="100%" stopColor="#1A1A18" />
            </linearGradient>
            <linearGradient id="screwGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#888" />
              <stop offset="50%" stopColor="#CCC" />
              <stop offset="100%" stopColor="#888" />
            </linearGradient>
          </defs>

          {view === 'side' && (
            <SideView
              bodyWidth={bodyWidth}
              bodyHeight={bodyHeight}
              motorSize={motorSize}
              config={config}
              showLabels={showLabels}
            />
          )}
          {view === 'transmission' && (
            <TransmissionView
              bodyWidth={bodyWidth}
              bodyHeight={bodyHeight}
              motorSize={motorSize}
              config={config}
              screw={screw}
              belt={belt}
            />
          )}
          {view === 'exploded' && (
            <ExplodedView
              bodyWidth={bodyWidth}
              bodyHeight={bodyHeight}
              motorSize={motorSize}
              config={config}
            />
          )}
        </svg>

        {/* Spec overlay */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 text-2xs text-muted">
          {cyl && <span className="rounded bg-ink/5 px-1.5 py-0.5 num">{cyl.model}</span>}
          {screw && <span className="rounded bg-ink/5 px-1.5 py-0.5 num">Ø{screw.diameter} · L{screw.lead}</span>}
          {belt && <span className="rounded bg-ink/5 px-1.5 py-0.5 num">{belt.pitch} · {belt.width}mm</span>}
          {motor && <span className="rounded bg-ink/5 px-1.5 py-0.5 num">{motor.power}W</span>}
          <span className="rounded bg-accent/10 px-1.5 py-0.5 text-accent-deep">Demo</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
function SideView({
  bodyWidth,
  bodyHeight,
  motorSize,
  config,
  showLabels,
}: {
  bodyWidth: number;
  bodyHeight: number;
  motorSize: number;
  config: Configuration;
  showLabels: boolean;
}) {
  const cx = 210;
  const cy = 100;
  const bodyX = cx - bodyWidth / 2;
  const bodyY = cy - bodyHeight / 2;
  const motorX = bodyX + bodyWidth + 8;
  const hasBellows = config.accessories.includes('ACC-BELLOWS');
  const hasCover = config.accessories.includes('ACC-COVER');

  return (
    <g>
      {/* Motor */}
      <motion.g
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <rect
          x={motorX}
          y={cy - motorSize / 2}
          width={motorSize * 1.4}
          height={motorSize}
          rx="3"
          fill="url(#motorGrad)"
        />
        <rect x={motorX - 4} y={cy - motorSize / 3} width="6" height={motorSize * 0.66} rx="1" fill="#555" />
        {/* Shaft */}
        <rect x={motorX - 10} y={cy - 2} width="8" height="4" fill="#999" />
        {showLabels && (
          <text x={motorX + motorSize * 0.7} y={cy + motorSize / 2 + 14} textAnchor="middle" className="fill-muted" style={{ fontSize: '9px' }}>
            Motor
          </text>
        )}
      </motion.g>

      {/* Coupling */}
      <rect x={bodyX + bodyWidth - 6} y={cy - 5} width="12" height="10" rx="2" fill="#777" />

      {/* Body / extrusion */}
      <motion.rect
        initial={{ opacity: 0, scaleX: 0.9 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.4 }}
        x={bodyX}
        y={bodyY}
        width={bodyWidth}
        height={bodyHeight}
        rx="4"
        fill="url(#bodyGrad)"
        stroke="#999"
        strokeWidth="0.5"
      />
      {/* Extrusion grooves */}
      <line x1={bodyX + 10} y1={bodyY + 4} x2={bodyX + bodyWidth - 10} y2={bodyY + 4} stroke="#AAA" strokeWidth="0.5" />
      <line x1={bodyX + 10} y1={bodyY + bodyHeight - 4} x2={bodyX + bodyWidth - 10} y2={bodyY + bodyHeight - 4} stroke="#AAA" strokeWidth="0.5" />

      {/* Carriage / slider */}
      <motion.rect
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        x={bodyX + bodyWidth * 0.3}
        y={bodyY - 6}
        width={bodyWidth * 0.25}
        height={bodyHeight + 12}
        rx="3"
        fill="#2A2A28"
      />
      <rect x={bodyX + bodyWidth * 0.3 + 4} y={bodyY - 3} width={bodyWidth * 0.25 - 8} height="3" rx="1" fill="#444" />

      {/* Front rod / piston */}
      <rect x={bodyX - 30} y={cy - 4} width="34" height="8" rx="2" fill="#BBB" stroke="#999" strokeWidth="0.5" />
      <circle cx={bodyX - 32} cy={cy} r="5" fill="#999" stroke="#777" strokeWidth="0.5" />

      {/* Bellows */}
      {hasBellows && (
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`M ${bodyX - 28 + i * 5} ${cy - 7} L ${bodyX - 25 + i * 5} ${cy + 7}`}
              stroke="#888"
              strokeWidth="1.5"
              fill="none"
            />
          ))}
        </g>
      )}

      {/* Protective cover */}
      {hasCover && (
        <rect x={bodyX + 4} y={bodyY - 10} width={bodyWidth - 8} height="6" rx="2" fill="#555" opacity="0.7" />
      )}

      {/* Rails indicator */}
      <line x1={bodyX + 6} y1={bodyY + 8} x2={bodyX + bodyWidth - 6} y2={bodyY + 8} stroke="#888" strokeWidth="1" />
      <line x1={bodyX + 6} y1={bodyY + bodyHeight - 8} x2={bodyX + bodyWidth - 6} y2={bodyY + bodyHeight - 8} stroke="#888" strokeWidth="1" />

      {showLabels && (
        <>
          <text x={bodyX + bodyWidth * 0.42} y={bodyY - 12} textAnchor="middle" className="fill-muted" style={{ fontSize: '9px' }}>
            Carriage
          </text>
          <text x={bodyX - 15} y={cy + 20} textAnchor="middle" className="fill-muted" style={{ fontSize: '9px' }}>
            Rod
          </text>
        </>
      )}
    </g>
  );
}

// ---------------------------------------------------------------------------
function TransmissionView({
  bodyWidth,
  bodyHeight,
  motorSize,
  config,
  screw,
  belt,
}: {
  bodyWidth: number;
  bodyHeight: number;
  motorSize: number;
  config: Configuration;
  screw?: ReturnType<typeof ballScrews.find>;
  belt?: ReturnType<typeof timingBelts.find>;
}) {
  const cx = 210;
  const cy = 100;
  const bodyX = cx - bodyWidth / 2;
  const bodyY = cy - bodyHeight / 2;
  const motorX = bodyX + bodyWidth + 8;

  return (
    <g>
      {/* Motor */}
      <rect x={motorX} y={cy - motorSize / 2} width={motorSize * 1.4} height={motorSize} rx="3" fill="url(#motorGrad)" />
      <rect x={motorX - 4} y={cy - motorSize / 3} width="6" height={motorSize * 0.66} rx="1" fill="#555" />

      {/* Body outline (transparent) */}
      <rect x={bodyX} y={bodyY} width={bodyWidth} height={bodyHeight} rx="4" fill="none" stroke="#BBB" strokeWidth="1" strokeDasharray="4,3" />

      {config.transmission === 'timing_belt' ? (
        // Timing belt drive
        <g>
          {/* Drive pulley (motor side) */}
          <circle cx={bodyX + bodyWidth - 20} cy={cy} r="16" fill="#444" stroke="#222" strokeWidth="1" />
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={bodyX + bodyWidth - 20 + Math.cos(angle) * 13}
                y1={cy + Math.sin(angle) * 13}
                x2={bodyX + bodyWidth - 20 + Math.cos(angle) * 17}
                y2={cy + Math.sin(angle) * 17}
                stroke="#333"
                strokeWidth="2"
              />
            );
          })}
          {/* Idler pulley */}
          <circle cx={bodyX + 25} cy={cy} r="12" fill="#555" stroke="#333" strokeWidth="1" />
          {/* Belt */}
          <rect x={bodyX + 13} y={cy - 17} width={bodyWidth - 46} height="4" rx="2" fill="#2A2A28" />
          <rect x={bodyX + 13} y={cy + 13} width={bodyWidth - 46} height="4" rx="2" fill="#2A2A28" />
          {/* Belt teeth */}
          {[...Array(Math.floor((bodyWidth - 46) / 8))].map((_, i) => (
            <g key={i}>
              <rect x={bodyX + 15 + i * 8} y={cy - 17} width="3" height="2" fill="#444" />
              <rect x={bodyX + 15 + i * 8} y={cy + 15} width="3" height="2" fill="#444" />
            </g>
          ))}
          <text x={bodyX + bodyWidth / 2} y={cy - 24} textAnchor="middle" className="fill-muted" style={{ fontSize: '9px' }}>
            {belt ? `${belt.series} ${belt.pitch}` : 'Timing Belt'}
          </text>
        </g>
      ) : (
        // Ball screw drive
        <g>
          {/* Screw shaft */}
          <rect x={bodyX + 15} y={cy - 4} width={bodyWidth - 45} height="8" rx="2" fill="url(#screwGrad)" stroke="#888" strokeWidth="0.5" />
          {/* Screw threads */}
          {[...Array(Math.floor((bodyWidth - 45) / (screw?.lead ?? 10) * 2))].map((_, i) => (
            <line
              key={i}
              x1={bodyX + 17 + i * ((screw?.lead ?? 10) / 2)}
              y1={cy - 4}
              x2={bodyX + 17 + i * ((screw?.lead ?? 10) / 2) + 3}
              y2={cy + 4}
              stroke="#777"
              strokeWidth="0.8"
            />
          ))}
          {/* Ball nut */}
          <rect x={bodyX + bodyWidth * 0.35} y={cy - 10} width="24" height="20" rx="3" fill="#3A3A38" stroke="#222" strokeWidth="0.5" />
          <circle cx={bodyX + bodyWidth * 0.35 + 12} cy={cy} r="5" fill="#555" />
          {/* Coupling */}
          <rect x={bodyX + bodyWidth - 28} y={cy - 6} width="14" height="12" rx="2" fill="#666" />
          <text x={bodyX + bodyWidth / 2} y={cy - 18} textAnchor="middle" className="fill-muted" style={{ fontSize: '9px' }}>
            {screw ? `Ø${screw.diameter} · Lead ${screw.lead}mm` : 'Ball Screw'}
          </text>
          <text x={bodyX + bodyWidth * 0.35 + 12} y={cy + 24} textAnchor="middle" className="fill-muted" style={{ fontSize: '8px' }}>
            Ball Nut
          </text>
        </g>
      )}
    </g>
  );
}

// ---------------------------------------------------------------------------
function ExplodedView({
  bodyWidth,
  bodyHeight,
  motorSize,
  config,
}: {
  bodyWidth: number;
  bodyHeight: number;
  motorSize: number;
  config: Configuration;
}) {
  const cy = 100;
  const spacing = 70;
  const startX = 60;

  return (
    <g>
      {/* Rod end */}
      <motion.g initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
        <circle cx={startX} cy={cy} r="8" fill="#999" stroke="#777" strokeWidth="0.5" />
        <rect x={startX + 6} y={cy - 3} width="20" height="6" rx="1" fill="#BBB" />
        <text x={startX} y={cy + 24} textAnchor="middle" className="fill-muted" style={{ fontSize: '8px' }}>Rod End</text>
      </motion.g>

      {/* Carriage */}
      <motion.g initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
        <rect x={startX + spacing} y={cy - bodyHeight / 2 - 4} width={bodyWidth * 0.22} height={bodyHeight + 8} rx="3" fill="#2A2A28" />
        <text x={startX + spacing + bodyWidth * 0.11} y={cy + bodyHeight / 2 + 18} textAnchor="middle" className="fill-muted" style={{ fontSize: '8px' }}>Carriage</text>
      </motion.g>

      {/* Body */}
      <motion.g initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
        <rect x={startX + spacing * 2} y={cy - bodyHeight / 2} width={bodyWidth * 0.5} height={bodyHeight} rx="4" fill="url(#bodyGrad)" stroke="#999" strokeWidth="0.5" />
        <text x={startX + spacing * 2 + bodyWidth * 0.25} y={cy + bodyHeight / 2 + 18} textAnchor="middle" className="fill-muted" style={{ fontSize: '8px' }}>Body</text>
      </motion.g>

      {/* Screw / Belt */}
      <motion.g initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
        {config.transmission === 'timing_belt' ? (
          <rect x={startX + spacing * 3} y={cy - 3} width={bodyWidth * 0.3} height="6" rx="2" fill="#2A2A28" />
        ) : (
          <rect x={startX + spacing * 3} y={cy - 3} width={bodyWidth * 0.3} height="6" rx="2" fill="url(#screwGrad)" />
        )}
        <text x={startX + spacing * 3 + bodyWidth * 0.15} y={cy + 18} textAnchor="middle" className="fill-muted" style={{ fontSize: '8px' }}>
          {config.transmission === 'timing_belt' ? 'Belt' : 'Screw'}
        </text>
      </motion.g>

      {/* Coupling */}
      <motion.g initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
        <rect x={startX + spacing * 4} y={cy - 6} width="14" height="12" rx="2" fill="#666" />
        <text x={startX + spacing * 4 + 7} y={cy + 22} textAnchor="middle" className="fill-muted" style={{ fontSize: '8px' }}>Coupling</text>
      </motion.g>

      {/* Motor */}
      <motion.g initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
        <rect x={startX + spacing * 4.5} y={cy - motorSize / 2} width={motorSize * 1.3} height={motorSize} rx="3" fill="url(#motorGrad)" />
        <text x={startX + spacing * 4.5 + motorSize * 0.65} y={cy + motorSize / 2 + 18} textAnchor="middle" className="fill-muted" style={{ fontSize: '8px' }}>Motor</text>
      </motion.g>
    </g>
  );
}
