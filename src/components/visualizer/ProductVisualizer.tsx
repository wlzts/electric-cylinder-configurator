import { useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import type { Configuration } from '@/types';
import { cylinderSeries, motors, ballScrews, timingBelts, gearboxes } from '@/data';
import { useI18n, type TranslationKey } from '@/i18n';
import { cn } from '@/lib/utils';

const Cylinder3DViewer = lazy(() =>
  import('./Cylinder3DViewer').then((m) => ({ default: m.Cylinder3DViewer })),
);

type ViewMode = 'side' | 'transmission' | 'exploded' | '3d';

interface ProductVisualizerProps {
  config: Configuration;
  className?: string;
  showLabels?: boolean;
}

export function ProductVisualizer({ config, className, showLabels = true }: ProductVisualizerProps) {
  const { t } = useI18n();
  const [view, setView] = useState<ViewMode>('side');

  const cyl = cylinderSeries.find((c) => c.id === config.cylinderId);
  const motor = motors.find((m) => m.id === config.motorId);
  const screw = ballScrews.find((s) => s.id === config.screwId);
  const belt = timingBelts.find((b) => b.id === config.beltId);

  // Scale based on cylinder size (0=EC40 … 4=EC120)
  const sizeIndex = cyl ? ['EC40', 'EC60', 'EC80', 'EC100', 'EC120'].indexOf(cyl.id) : 2;
  const bodyH = 240 + sizeIndex * 22;   // vertical body height
  const bodyW = 62;                     // 方缸筒 width (px in SVG units)
  const motorH = 56 + (motor ? Math.min(motor.power / 40, 40) : 16);
  const motorW = 44;
  const hasGearbox = !!config.gearboxId;
  const gb = gearboxes.find((g) => g.id === config.gearboxId);

  const views: { id: ViewMode; label: string }[] = [
    { id: 'side', label: t('view_side') },
    { id: 'transmission', label: t('view_transmission') },
    { id: 'exploded', label: t('view_exploded') },
    { id: '3d', label: t('view_3d') },
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

      <div className="relative flex items-center justify-center overflow-hidden rounded-card border border-line">
        {view === '3d' ? (
          <Suspense fallback={
            <div className="flex h-[400px] w-full items-center justify-center text-xs text-muted">
              {t('common_loading')}...
            </div>
          }>
            <Cylinder3DViewer />
          </Suspense>
        ) : (
        <svg
          viewBox="0 0 300 440"
          className="w-full max-w-sm"
          role="img"
          aria-label="Electric cylinder product visualization"
        >
          <defs>
            {/* Studio gradient background */}
            <radialGradient id="studioBg" cx="50%" cy="35%" r="75%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#EDEDEB" />
              <stop offset="100%" stopColor="#D8D8D5" />
            </radialGradient>
            {/* Brushed aluminium — vertical sheen */}
            <linearGradient id="alu" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#9A9A96" />
              <stop offset="18%" stopColor="#C8C8C4" />
              <stop offset="35%" stopColor="#E8E8E4" />
              <stop offset="50%" stopColor="#F2F2EE" />
              <stop offset="65%" stopColor="#D0D0CC" />
              <stop offset="85%" stopColor="#A8A8A4" />
              <stop offset="100%" stopColor="#888884" />
            </linearGradient>
            {/* Dark end cap */}
            <linearGradient id="darkCap" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2A2A28" />
              <stop offset="100%" stopColor="#111110" />
            </linearGradient>
            {/* Black motor body */}
            <linearGradient id="motorBody" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1A1A19" />
              <stop offset="40%" stopColor="#333331" />
              <stop offset="70%" stopColor="#1E1E1D" />
              <stop offset="100%" stopColor="#0E0E0D" />
            </linearGradient>
            {/* Steel joint (rod end) */}
            <radialGradient id="steelJoint" cx="38%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#F0F0EC" />
              <stop offset="45%" stopColor="#B8B8B4" />
              <stop offset="80%" stopColor="#7A7A76" />
              <stop offset="100%" stopColor="#555552" />
            </radialGradient>
            {/* Platform surface */}
            <linearGradient id="platform" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5F5F2" />
              <stop offset="100%" stopColor="#E2E2DE" />
            </linearGradient>
            {/* Drop shadow */}
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
              <feOffset dx="0" dy="3" result="offsetblur" />
              <feComponentTransfer><feFuncA type="linear" slope="0.28" /></feComponentTransfer>
              <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Studio backdrop */}
          <rect x="0" y="0" width="300" height="440" fill="url(#studioBg)" />
          {/* Side softbox lights (subtle) */}
          <rect x="0" y="60" width="18" height="180" fill="#FFFFFF" opacity="0.55" rx="3" />
          <rect x="282" y="60" width="18" height="180" fill="#FFFFFF" opacity="0.45" rx="3" />
          {/* Top light strip */}
          <rect x="60" y="0" width="180" height="14" fill="#FFFFFF" opacity="0.7" rx="2" />

          {/* Platform */}
          <rect x="20" y="395" width="260" height="18" fill="url(#platform)" rx="2" />
          <rect x="20" y="413" width="260" height="22" fill="#D8D8D4" rx="1" />
          {/* Shadow on platform */}
          <ellipse cx="148" cy="396" rx="60" ry="5" fill="#000" opacity="0.12" />

          {view === 'side' && (
            <VerticalView
              bodyW={bodyW}
              bodyH={bodyH}
              motorW={motorW}
              motorH={motorH}
              config={config}
              showLabels={showLabels}
              t={t}
              hasGearbox={hasGearbox}
              gbRatio={gb?.ratio}
            />
          )}
          {view === 'transmission' && (
            <TransmissionView
              bodyW={bodyW}
              bodyH={bodyH}
              motorW={motorW}
              motorH={motorH}
              config={config}
              screw={screw}
              belt={belt}
            />
          )}
          {view === 'exploded' && (
            <ExplodedView
              bodyW={bodyW}
              motorW={motorW}
              motorH={motorH}
              config={config}
              t={t}
            />
          )}
        </svg>
        )}

        {/* Spec overlay */}
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1.5 text-2xs text-muted">
          {cyl && <span className="rounded bg-ink/5 px-1.5 py-0.5 num">{cyl.model}</span>}
          {screw && <span className="rounded bg-ink/5 px-1.5 py-0.5 num">Ø{screw.diameter} · L{screw.lead}</span>}
          {belt && <span className="rounded bg-ink/5 px-1.5 py-0.5 num">{belt.pitch} · {belt.width}mm</span>}
          {motor && <span className="rounded bg-ink/5 px-1.5 py-0.5 num">{motor.power}W</span>}
          <span className="rounded bg-accent/10 px-1.5 py-0.5 text-accent-deep">{t('common_demo')}</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vertical cylinder — matches the reference product photo
// ---------------------------------------------------------------------------
function VerticalView({
  bodyW,
  bodyH,
  motorW,
  motorH,
  config,
  showLabels,
  t,
  hasGearbox,
  gbRatio,
}: {
  bodyW: number;
  bodyH: number;
  motorW: number;
  motorH: number;
  config: Configuration;
  showLabels: boolean;
  t: (k: TranslationKey) => string;
  hasGearbox: boolean;
  gbRatio?: number;
}) {
  const cx = 135;                      // centre x of the cylinder body
  const bodyX = cx - bodyW / 2;
  const baseY = 388;                   // top of platform
  const bodyBottom = baseY - 34;       // body sits on black base
  const bodyTop = bodyBottom - bodyH;  // top of aluminium extrusion

  const hasBellows = config.accessories.includes('ACC-BELLOWS');
  const hasCover = config.accessories.includes('ACC-COVER');
  // Gearbox sits between motor and body; motor shifts right if gearbox present
  const gbxW = hasGearbox ? 18 : 0;
  const motorX = bodyX + bodyW + 6 + gbxW;
  const motorY = bodyBottom - motorH - 4;
  const gbxX = bodyX + bodyW + 6;
  const gbxY = motorY + motorH * 0.25;
  const gbxH = motorH * 0.5;

  return (
    <g filter="url(#softShadow)">
      {/* ---- Black mounting base (bottom) ---- */}
      <motion.g
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <rect x={cx - 48} y={baseY - 34} width="96" height="22" rx="2" fill="url(#darkCap)" />
        {/* Base side flange */}
        <rect x={cx - 52} y={baseY - 20} width="104" height="10" rx="1" fill="#1A1A19" />
        {/* Mounting bolts on base */}
        <circle cx={cx - 42} cy={baseY - 23} r="3" fill="#444" />
        <circle cx={cx + 42} cy={baseY - 23} r="3" fill="#444" />
        <circle cx={cx - 42} cy={baseY - 23} r="1.5" fill="#111" />
        <circle cx={cx + 42} cy={baseY - 23} r="1.5" fill="#111" />
        {/* Central hole in base front */}
        <circle cx={cx} cy={baseY - 13} r="2.5" fill="#0A0A09" />
      </motion.g>

      {/* ---- Black servo motor on right side ---- */}
      <motion.g
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        {/* Motor box */}
        <rect x={motorX} y={motorY} width={motorW} height={motorH} rx="3" fill="url(#motorBody)" />
        {/* Motor front cap detail */}
        <rect x={motorX + 4} y={motorY + 6} width={motorW - 8} height="6" rx="1" fill="#3A3A38" />
        {/* Connector plug */}
        <rect x={motorX + motorW - 4} y={motorY + 18} width="8" height="14" rx="1" fill="#2A2A28" />
        {/* Gearbox (中大力德) between motor and body */}
        {hasGearbox && (
          <g>
            <rect x={gbxX} y={gbxY} width={gbxW} height={gbxH} rx="1.5" fill="#2A2A28" stroke="#111" strokeWidth="0.5" />
            <text x={gbxX + gbxW / 2} y={gbxY - 4} textAnchor="middle" style={{ fontSize: '7px', fill: '#888' }}>
              {gbRatio}:1
            </text>
          </g>
        )}
        {/* Motor flange to gearbox/body */}
        <rect x={hasGearbox ? gbxX + gbxW - 2 : bodyX + bodyW - 2} y={motorY + motorH * 0.3} width="8" height={motorH * 0.55} rx="1" fill="#2A2A28" />
        {/* Cable coiled beside motor */}
        <path
          d={`M ${motorX + motorW - 2} ${motorY + 32}
              q 8 2 6 12
              q -2 8 4 12
              q 6 6 2 14
              q -4 8 0 14
              q 4 6 0 12`}
          stroke="#0A0A09"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
        {showLabels && (
          <text x={motorX + motorW / 2} y={motorY - 8} textAnchor="middle" className="fill-muted" style={{ fontSize: '9px' }}>
            {hasGearbox ? t('label_motor_gbx') : t('label_motor')}
          </text>
        )}
      </motion.g>

      {/* ---- Aluminium extrusion body ---- */}
      <motion.g
        initial={{ opacity: 0, scaleY: 0.9 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 0.5 }}
        style={{ transformOrigin: `${cx}px ${bodyBottom}px` }}
      >
        {/* 方缸筒: square extrusion body with flat sides */}
        <rect
          x={bodyX}
          y={bodyTop}
          width={bodyW}
          height={bodyH}
          rx="1"
          fill="url(#alu)"
          stroke="#777"
          strokeWidth="0.8"
        />
        {/* Corner bolt holes (square tube特征) */}
        <circle cx={bodyX + 6} cy={bodyTop + 10} r="1.8" fill="#888" />
        <circle cx={bodyX + bodyW - 6} cy={bodyTop + 10} r="1.8" fill="#888" />
        <circle cx={bodyX + 6} cy={bodyBottom - 10} r="1.8" fill="#888" />
        <circle cx={bodyX + bodyW - 6} cy={bodyBottom - 10} r="1.8" fill="#888" />
        {/* Mounting slot on left flat side */}
        <rect x={bodyX + 2} y={bodyTop + bodyH * 0.25} width="3" height={bodyH * 0.3} rx="1" fill="#999" opacity="0.5" />
        {/* Center groove */}
        <line
          x1={cx}
          y1={bodyTop + 8}
          x2={cx}
          y2={bodyBottom - 8}
          stroke="#999"
          strokeWidth="0.8"
          opacity="0.5"
        />
        {/* Top black end cap */}
        <rect x={bodyX - 2} y={bodyTop - 6} width={bodyW + 4} height="10" rx="1.5" fill="url(#darkCap)" />
        {/* Bottom transition to base */}
        <rect x={bodyX - 2} y={bodyBottom - 4} width={bodyW + 4} height="8" rx="1" fill="#1A1A19" />

        {/* Cover bellows on top of rod */}
        {hasCover && (
          <rect x={bodyX + 8} y={bodyTop - 18} width={bodyW - 16} height="14" rx="2" fill="#333" opacity="0.8" />
        )}
        {hasBellows && (
          <g>
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1={cx - 14 + i * 6}
                y1={bodyTop - 16}
                x2={cx - 11 + i * 6}
                y2={bodyTop - 6}
                stroke="#777"
                strokeWidth="1.5"
              />
            ))}
          </g>
        )}

        {/* Rod extending upward */}
        <rect x={cx - 4} y={bodyTop - 28} width="8" height="24" fill="#C8C8C4" stroke="#999" strokeWidth="0.5" />

        {/* ---- Spherical rod end (clevis eye) ---- */}
        <g>
          {/* Rod end body */}
          <circle cx={cx} cy={bodyTop - 38} r="13" fill="url(#steelJoint)" stroke="#666" strokeWidth="0.8" />
          {/* Inner bearing hole */}
          <circle cx={cx} cy={bodyTop - 38} r="6.5" fill="#2A2A28" stroke="#888" strokeWidth="1" />
          <circle cx={cx} cy={bodyTop - 38} r="3" fill="#111" />
          {/* Mounting ears */}
          <rect x={cx - 11} y={bodyTop - 28} width="22" height="6" rx="1" fill="#999" />
        </g>

        {showLabels && (
          <text x={cx} y={bodyTop - 56} textAnchor="middle" className="fill-muted" style={{ fontSize: '9px' }}>
            {t('label_rod_end')}
          </text>
        )}
      </motion.g>
    </g>
  );
}

// ---------------------------------------------------------------------------
function TransmissionView({
  bodyW,
  bodyH,
  motorW,
  motorH,
  config,
  screw,
  belt,
}: {
  bodyW: number;
  bodyH: number;
  motorW: number;
  motorH: number;
  config: Configuration;
  screw?: ReturnType<typeof ballScrews.find>;
  belt?: ReturnType<typeof timingBelts.find>;
}) {
  const cx = 135;
  const bodyX = cx - bodyW / 2;
  const baseY = 388;
  const bodyBottom = baseY - 34;
  const bodyTop = bodyBottom - bodyH;
  const motorX = bodyX + bodyW + 6;
  const motorY = bodyBottom - motorH - 4;

  return (
    <g>
      {/* Ghost body outline */}
      <rect x={bodyX} y={bodyTop} width={bodyW} height={bodyH} rx="2" fill="none" stroke="#BBB" strokeWidth="1" strokeDasharray="4,3" />
      {/* Rod end */}
      <circle cx={cx} cy={bodyTop - 38} r="13" fill="none" stroke="#999" strokeWidth="1.5" />
      <circle cx={cx} cy={bodyTop - 38} r="6.5" fill="none" stroke="#999" strokeWidth="1" />
      <rect x={cx - 4} y={bodyTop - 28} width="8" height="24" fill="none" stroke="#999" strokeWidth="1" />
      {/* Base */}
      <rect x={cx - 48} y={baseY - 34} width="96" height="22" rx="2" fill="#1A1A19" opacity="0.6" />
      {/* Motor */}
      <rect x={motorX} y={motorY} width={motorW} height={motorH} rx="3" fill="url(#motorBody)" opacity="0.7" />

      {config.transmission === 'timing_belt' ? (
        <g>
          {/* Vertical belt path inside body */}
          <rect x={cx - 8} y={bodyTop + 12} width="16" height={bodyH - 24} fill="#2A2A28" opacity="0.85" />
          {/* Pulleys top & bottom */}
          <circle cx={cx} cy={bodyTop + 18} r="11" fill="#444" stroke="#222" strokeWidth="1" />
          <circle cx={cx} cy={bodyBottom - 18} r="11" fill="#444" stroke="#222" strokeWidth="1" />
          <circle cx={cx} cy={bodyTop + 18} r="4" fill="#222" />
          <circle cx={cx} cy={bodyBottom - 18} r="4" fill="#222" />
          {/* Belt teeth indicators */}
          {[...Array(18)].map((_, i) => (
            <line key={i} x1={cx - 8} y1={bodyTop + 34 + i * ((bodyH - 60) / 18)} x2={cx + 8} y2={bodyTop + 34 + i * ((bodyH - 60) / 18)} stroke="#444" strokeWidth="1" />
          ))}
          <text x={cx + 55} y={bodyTop + bodyH / 2} className="fill-muted" style={{ fontSize: '9px' }}>
            {belt ? `${belt.series} ${belt.pitch}` : 'Timing Belt'}
          </text>
        </g>
      ) : (
        <g>
          {/* Ball screw vertical shaft */}
          <rect x={cx - 3} y={bodyTop + 12} width="6" height={bodyH - 24} fill="url(#alu)" stroke="#888" strokeWidth="0.5" />
          {/* Screw threads */}
          {[...Array(Math.floor((bodyH - 24) / (screw?.lead ?? 10) * 2))].map((_, i) => (
            <line
              key={i}
              x1={cx - 3}
              y1={bodyTop + 14 + i * ((screw?.lead ?? 10) / 2)}
              x2={cx + 3}
              y2={bodyTop + 17 + i * ((screw?.lead ?? 10) / 2)}
              stroke="#888"
              strokeWidth="0.7"
            />
          ))}
          {/* Ball nut */}
          <rect x={cx - 10} y={bodyTop + bodyH * 0.3} width="20" height="26" rx="3" fill="#2A2A28" stroke="#111" strokeWidth="0.5" />
          <circle cx={cx} cy={bodyTop + bodyH * 0.3 + 13} r="5" fill="#555" />
          <text x={cx + 55} y={bodyTop + bodyH * 0.35} className="fill-muted" style={{ fontSize: '9px' }}>
            {screw ? `Ø${screw.diameter} · L${screw.lead}` : 'Ball Screw'}
          </text>
        </g>
      )}
    </g>
  );
}

// ---------------------------------------------------------------------------
function ExplodedView({
  bodyW,
  motorW,
  motorH,
  config,
  t,
}: {
  bodyW: number;
  motorW: number;
  motorH: number;
  config: Configuration;
  t: (k: TranslationKey) => string;
}) {
  const cx = 135;
  const parts = [
    { key: 'rod_end', y: 30, label: t('label_rod_end'), el: (
      <g>
        <circle cx={cx} cy={30} r="12" fill="url(#steelJoint)" stroke="#666" strokeWidth="0.8" />
        <circle cx={cx} cy={30} r="5" fill="#2A2A28" />
      </g>
    )},
    { key: 'rod', y: 80, label: t('label_rod'), el: (
      <rect x={cx - 4} y={70} width="8" height="20" fill="#C8C8C4" stroke="#999" strokeWidth="0.5" />
    )},
    { key: 'body', y: 180, label: t('label_body'), el: (
      <rect x={cx - bodyW / 2} y={105} width={bodyW} height={150} rx="2" fill="url(#alu)" stroke="#888" strokeWidth="0.5" />
    )},
    { key: 'transmission', y: 270, label: config.transmission === 'timing_belt' ? t('label_belt') : t('label_screw'), el: (
      config.transmission === 'timing_belt'
        ? <rect x={cx - 8} y={255} width="16" height="30" fill="#2A2A28" />
        : <rect x={cx - 3} y={255} width="6" height="30" fill="url(#alu)" />
    )},
    { key: 'base', y: 320, label: 'Base', el: (
      <rect x={cx - 40} y={310} width="80" height="18" rx="2" fill="#1A1A19" />
    )},
  ];

  return (
    <g>
      {parts.map((p, i) => (
        <motion.g
          key={p.key}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.12, duration: 0.4 }}
        >
          {p.el}
          <text x={cx + 55} y={p.y + 4} className="fill-muted" style={{ fontSize: '9px' }}>
            {p.label}
          </text>
        </motion.g>
      ))}
      {/* Motor on the right, exploded horizontally */}
      <motion.g
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <rect x={220} y={240} width={motorW} height={motorH} rx="3" fill="url(#motorBody)" />
        <text x={220 + motorW / 2} y={230} textAnchor="middle" className="fill-muted" style={{ fontSize: '9px' }}>
          {t('label_motor')}
        </text>
      </motion.g>
    </g>
  );
}
