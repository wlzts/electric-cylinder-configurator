import { motion } from 'framer-motion';
import { ArrowRight, Zap, SlidersHorizontal, ShieldCheck, Package, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { cylinderSeries } from '@/data';

export function Home() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1600px] px-4 lg:px-8 py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-2xs uppercase tracking-wider text-muted">
                <Cpu size={12} className="text-accent" />
                Electric Cylinder Configurator
              </div>
              <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight text-ink lg:text-7xl">
                Configure
                <br />
                <span className="text-accent">Your Motion.</span>
              </h1>
              <p className="mt-4 text-lg text-muted">用您的工况，定义属于您的电缸。</p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                Configure the cylinder, transmission, motor, drive and control system around your application — with real-time compatibility and engineering validation.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/smart">
                  <Button variant="secondary" size="lg">
                    <Zap size={16} /> Smart Selection
                    <ArrowRight size={16} />
                  </Button>
                </Link>
                <Link to="/configurator">
                  <Button variant="outline" size="lg">
                    <SlidersHorizontal size={16} /> Build Your Own
                  </Button>
                </Link>
              </div>

              {/* Process steps */}
              <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { n: '01', label: 'Define Requirements' },
                  { n: '02', label: 'Configure System' },
                  { n: '03', label: 'Validate Engineering' },
                  { n: '04', label: 'Build Solution' },
                ].map((s, i) => (
                  <motion.div
                    key={s.n}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="border-l-2 border-line pl-3"
                  >
                    <span className="num text-2xs font-semibold text-accent">{s.n}</span>
                    <p className="mt-0.5 text-xs font-medium text-ink">{s.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Hero visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-card border border-line bg-gradient-to-br from-surface to-bg/60 p-8 shadow-card">
                <HeroCylinderSVG />
                <div className="mt-4 flex items-center justify-between text-2xs text-muted">
                  <span>Live product visualization</span>
                  <span className="rounded bg-accent/10 px-1.5 py-0.5 text-accent-deep">Demo Data</span>
                </div>
              </div>
              {/* Floating spec cards */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-4 top-8 rounded-card border border-line bg-surface p-3 shadow-card-hover"
              >
                <p className="text-2xs uppercase tracking-wider text-muted">Max Thrust</p>
                <p className="num text-xl font-semibold text-ink">15,000 <span className="text-xs text-muted">N</span></p>
              </motion.div>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -right-4 bottom-16 rounded-card border border-line bg-surface p-3 shadow-card-hover"
              >
                <p className="text-2xs uppercase tracking-wider text-muted">Repeatability</p>
                <p className="num text-xl font-semibold text-ink">±0.008 <span className="text-xs text-muted">mm</span></p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Platform preview */}
      <section className="border-t border-line bg-surface/50">
        <div className="mx-auto max-w-[1600px] px-4 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-label">Platforms</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Five cylinder series. One configurator.</h2>
            </div>
            <Link to="/configurator" className="hidden sm:flex items-center gap-1 text-sm font-medium text-accent hover:underline">
              Start configuring <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {cylinderSeries.map((cyl, i) => (
              <motion.div
                key={cyl.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card card-hover p-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold num">{cyl.model}</h3>
                  <span className="rounded-full bg-ink/5 px-2 py-0.5 text-2xs text-muted">{cyl.protection}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted">{cyl.positioning}</p>
                <dl className="mt-4 space-y-1.5 text-xs">
                  <div className="flex justify-between"><dt className="text-muted">Max Thrust</dt><dd className="num font-medium">{cyl.maxThrust.toLocaleString()} N</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Max Payload</dt><dd className="num font-medium">{cyl.maxPayload} kg</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Max Speed</dt><dd className="num font-medium">{cyl.maxSpeed} mm/s</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Max Stroke</dt><dd className="num font-medium">{cyl.maxStroke} mm</dd></div>
                </dl>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-[1600px] px-4 lg:px-8 py-16">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: 'Real-time Compatibility', desc: 'Every selection is validated against the full compatibility matrix. Incompatible options stay visible with clear reasons.' },
              { icon: Cpu, title: 'Engineering Calculation', desc: 'Thrust, torque, RPM, critical speed, safety factor and estimated life — recalculated on every change. Clearly marked as demo model.' },
              { icon: Package, title: 'Complete BOM & Quote', desc: 'Generate a full bill of materials, configuration code, and engineering quote request — ready for backend integration.' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-card border border-line bg-surface p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-white">
                  <f.icon size={18} />
                </div>
                <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line bg-ink text-white">
        <div className="mx-auto max-w-[1600px] px-4 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">Ready to configure your motion system?</h2>
          <p className="mt-3 text-sm text-white/60 max-w-lg mx-auto">
            Start with smart selection based on your application, or build your own configuration step by step.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/smart">
              <Button variant="secondary" size="lg"><Zap size={16} /> Smart Selection</Button>
            </Link>
            <Link to="/configurator">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:border-white/50">
                <SlidersHorizontal size={16} /> Build Your Own
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line bg-bg">
        <div className="mx-auto max-w-[1600px] px-4 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-2xs text-muted">
          <span>Electric Cylinder Configurator — Demo engineering data. Final values subject to verified product specifications.</span>
          <span>Built with React · Vite · Tailwind · Zustand</span>
        </div>
      </footer>
    </div>
  );
}

// Hero cylinder SVG illustration
function HeroCylinderSVG() {
  return (
    <svg viewBox="0 0 500 220" className="w-full" role="img" aria-label="Electric cylinder illustration">
      <defs>
        <linearGradient id="hBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DCDCD8" />
          <stop offset="100%" stopColor="#B8B8B4" />
        </linearGradient>
        <linearGradient id="hMotor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A3A38" />
          <stop offset="100%" stopColor="#181816" />
        </linearGradient>
      </defs>
      {/* Motor */}
      <rect x="370" y="75" width="90" height="70" rx="5" fill="url(#hMotor)" />
      <rect x="362" y="90" width="10" height="40" rx="2" fill="#555" />
      <circle cx="415" cy="110" r="12" fill="#2A2A28" stroke="#444" strokeWidth="1" />
      <line x1="415" y1="98" x2="415" y2="122" stroke="#555" strokeWidth="1" />
      <line x1="403" y1="110" x2="427" y2="110" stroke="#555" strokeWidth="1" />
      {/* Shaft + coupling */}
      <rect x="345" y="104" width="20" height="12" rx="2" fill="#777" />
      <rect x="330" y="102" width="18" height="16" rx="3" fill="#666" />
      {/* Body */}
      <rect x="70" y="80" width="265" height="60" rx="5" fill="url(#hBody)" stroke="#999" strokeWidth="0.5" />
      {/* Grooves */}
      <line x1="80" y1="88" x2="325" y2="88" stroke="#AAA" strokeWidth="0.5" />
      <line x1="80" y1="132" x2="325" y2="132" stroke="#AAA" strokeWidth="0.5" />
      {/* Rails */}
      <line x1="78" y1="95" x2="327" y2="95" stroke="#888" strokeWidth="1.5" />
      <line x1="78" y1="125" x2="327" y2="125" stroke="#888" strokeWidth="1.5" />
      {/* Carriage */}
      <rect x="160" y="70" width="70" height="80" rx="4" fill="#2A2A28" />
      <rect x="165" y="74" width="60" height="5" rx="1" fill="#444" />
      <circle cx="195" cy="110" r="6" fill="#444" />
      {/* Rod */}
      <rect x="25" y="104" width="48" height="12" rx="3" fill="#BBB" stroke="#999" strokeWidth="0.5" />
      <circle cx="22" cy="110" r="8" fill="#999" stroke="#777" strokeWidth="0.5" />
      <circle cx="22" cy="110" r="3" fill="#777" />
      {/* Labels */}
      <text x="195" y="62" textAnchor="middle" fill="#686868" style={{ fontSize: '10px', fontWeight: 500 }}>Carriage</text>
      <text x="415" y="160" textAnchor="middle" fill="#686868" style={{ fontSize: '10px', fontWeight: 500 }}>Servo Motor</text>
      <text x="50" y="135" textAnchor="middle" fill="#686868" style={{ fontSize: '10px', fontWeight: 500 }}>Rod End</text>
    </svg>
  );
}
