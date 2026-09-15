import { motion } from 'framer-motion';
import { ArrowRight, Zap, SlidersHorizontal, ShieldCheck, Package, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { cylinderSeries } from '@/data';
import { useI18n } from '@/i18n';

export function Home() {
  const { t, lang } = useI18n();

  const features = [
    {
      icon: ShieldCheck,
      titleZh: '实时兼容性校验',
      titleEn: 'Real-time Compatibility',
      descZh: '每个选项都经过完整兼容性矩阵验证。不兼容选项保持可见并说明原因。',
      descEn: 'Every selection is validated against the full compatibility matrix. Incompatible options stay visible with clear reasons.',
    },
    {
      icon: Cpu,
      titleZh: '工程计算引擎',
      titleEn: 'Engineering Calculation',
      descZh: '推力、扭矩、转速、临界转速、安全系数与预估寿命 —— 每次变更实时重算。',
      descEn: 'Thrust, torque, RPM, critical speed, safety factor and estimated life — recalculated on every change.',
    },
    {
      icon: Package,
      titleZh: '完整 BOM 与询价',
      titleEn: 'Complete BOM & Quote',
      descZh: '自动生成物料清单、配置编号与工程询价请求 —— 可直接对接后端。',
      descEn: 'Generate a full bill of materials, configuration code, and engineering quote request — ready for backend integration.',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1600px] px-4 lg:px-8 py-12 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-2xs tracking-wider text-muted">
                <Cpu size={12} className="text-accent" />
                {t('hero_badge')}
              </div>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-ink lg:text-6xl">
                {t('hero_title_line1')}
                <br />
                <span className="text-accent">{t('hero_title_line2')}</span>
              </h1>
              <p className="mt-4 text-base text-muted lg:text-lg">
                {lang === 'zh' ? '用您的工况，定义属于您的电缸。' : 'Configure Your Motion.'}
              </p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                {t('hero_subtitle')}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/smart">
                  <Button variant="secondary" size="lg">
                    <Zap size={16} /> {t('hero_smart_cta')}
                    <ArrowRight size={16} />
                  </Button>
                </Link>
                <Link to="/configurator">
                  <Button variant="outline" size="lg">
                    <SlidersHorizontal size={16} /> {t('hero_build_cta')}
                  </Button>
                </Link>
              </div>

              {/* Process steps */}
              <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { n: '01', label: t('step1_title') },
                  { n: '02', label: t('step2_title') },
                  { n: '03', label: t('step3_title') },
                  { n: '04', label: t('step4_title') },
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

            {/* Hero visual — vertical cylinder matching reference photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative flex justify-center"
            >
              <div className="relative overflow-hidden rounded-card border border-line bg-gradient-to-b from-[#FFFFFF] to-[#E8E8E5] p-6 shadow-card">
                <HeroCylinderSVG />
                <div className="mt-4 flex items-center justify-between text-2xs text-muted">
                  <span>{t('hero_visual_label')}</span>
                  <span className="rounded bg-accent/10 px-1.5 py-0.5 text-accent-deep">{t('common_demo')}</span>
                </div>
              </div>
              {/* Floating spec cards */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-2 top-8 rounded-card border border-line bg-surface p-3 shadow-card-hover lg:-left-4"
              >
                <p className="text-2xs uppercase tracking-wider text-muted">{lang === 'zh' ? '最大推力' : 'Max Thrust'}</p>
                <p className="num text-xl font-semibold text-ink">15,000 <span className="text-xs text-muted">N</span></p>
              </motion.div>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -right-2 bottom-16 rounded-card border border-line bg-surface p-3 shadow-card-hover lg:-right-4"
              >
                <p className="text-2xs uppercase tracking-wider text-muted">{lang === 'zh' ? '重复定位精度' : 'Repeatability'}</p>
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
              <p className="section-label">{lang === 'zh' ? '电缸平台' : 'Platforms'}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight lg:text-3xl">
                {lang === 'zh' ? '五大电缸系列 · 一套选型系统' : 'Five cylinder series. One configurator.'}
              </h2>
            </div>
            <Link to="/configurator" className="hidden sm:flex items-center gap-1 text-sm font-medium text-accent hover:underline">
              {lang === 'zh' ? '开始配置' : 'Start configuring'} <ArrowRight size={14} />
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
                  <div className="flex justify-between"><dt className="text-muted">{lang === 'zh' ? '最大推力' : 'Max Thrust'}</dt><dd className="num font-medium">{cyl.maxThrust.toLocaleString()} N</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">{lang === 'zh' ? '最大负载' : 'Max Payload'}</dt><dd className="num font-medium">{cyl.maxPayload} kg</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">{lang === 'zh' ? '最大速度' : 'Max Speed'}</dt><dd className="num font-medium">{cyl.maxSpeed} mm/s</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">{lang === 'zh' ? '最大行程' : 'Max Stroke'}</dt><dd className="num font-medium">{cyl.maxStroke} mm</dd></div>
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
            {features.map((f, i) => (
              <motion.div
                key={f.titleEn}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-card border border-line bg-surface p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-white">
                  <f.icon size={18} />
                </div>
                <h3 className="mt-4 text-base font-semibold">{lang === 'zh' ? f.titleZh : f.titleEn}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{lang === 'zh' ? f.descZh : f.descEn}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line bg-ink text-white">
        <div className="mx-auto max-w-[1600px] px-4 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-semibold tracking-tight lg:text-4xl">
            {lang === 'zh' ? '准备好配置您的运动系统了吗？' : 'Ready to configure your motion system?'}
          </h2>
          <p className="mt-3 text-sm text-white/60 max-w-lg mx-auto">
            {lang === 'zh'
              ? '从工况智能选型开始，或逐步自由配置您的方案。'
              : 'Start with smart selection based on your application, or build your own configuration step by step.'}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/smart">
              <Button variant="secondary" size="lg"><Zap size={16} /> {t('hero_smart_cta')}</Button>
            </Link>
            <Link to="/configurator">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:border-white/50">
                <SlidersHorizontal size={16} /> {t('hero_build_cta')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line bg-bg">
        <div className="mx-auto max-w-[1600px] px-4 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-2xs text-muted">
          <span>{t('common_demo_notice')}</span>
          <span>React · Vite · Tailwind · Zustand</span>
        </div>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hero cylinder SVG — vertical, matching the reference product photo
// ---------------------------------------------------------------------------
function HeroCylinderSVG() {
  return (
    <svg viewBox="0 0 340 460" className="w-full max-w-sm mx-auto" role="img" aria-label="Electric cylinder illustration">
      <defs>
        {/* Studio background */}
        <radialGradient id="heroBg" cx="50%" cy="35%" r="80%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#EDEDEB" />
          <stop offset="100%" stopColor="#D4D4D0" />
        </radialGradient>
        {/* Brushed aluminium vertical sheen */}
        <linearGradient id="heroAlu" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#969692" />
          <stop offset="18%" stopColor="#C8C8C4" />
          <stop offset="35%" stopColor="#EAEAE6" />
          <stop offset="50%" stopColor="#F4F4F0" />
          <stop offset="65%" stopColor="#CECECA" />
          <stop offset="85%" stopColor="#A4A4A0" />
          <stop offset="100%" stopColor="#82827E" />
        </linearGradient>
        <linearGradient id="heroDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A2A28" />
          <stop offset="100%" stopColor="#10100F" />
        </linearGradient>
        <linearGradient id="heroMotor" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#181817" />
          <stop offset="40%" stopColor="#343432" />
          <stop offset="70%" stopColor="#1C1C1B" />
          <stop offset="100%" stopColor="#0C0C0B" />
        </linearGradient>
        <radialGradient id="heroJoint" cx="38%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#F2F2EE" />
          <stop offset="45%" stopColor="#B8B8B4" />
          <stop offset="80%" stopColor="#787874" />
          <stop offset="100%" stopColor="#52524F" />
        </radialGradient>
        <linearGradient id="heroPlatform" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5F5F2" />
          <stop offset="100%" stopColor="#E0E0DC" />
        </linearGradient>
        <filter id="heroShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
          <feOffset dx="0" dy="3" result="o" />
          <feComponentTransfer><feFuncA type="linear" slope="0.25" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Studio backdrop */}
      <rect width="340" height="460" fill="url(#heroBg)" />
      {/* Side softbox lights */}
      <rect x="4" y="70" width="20" height="190" fill="#FFFFFF" opacity="0.5" rx="3" />
      <rect x="316" y="70" width="20" height="190" fill="#FFFFFF" opacity="0.4" rx="3" />
      {/* Top light strip */}
      <rect x="70" y="0" width="200" height="16" fill="#FFFFFF" opacity="0.65" rx="2" />

      {/* Platform */}
      <rect x="30" y="410" width="280" height="20" fill="url(#heroPlatform)" rx="2" />
      <rect x="30" y="430" width="280" height="30" fill="#D2D2CE" rx="1" />
      <ellipse cx="165" cy="412" rx="70" ry="5" fill="#000" opacity="0.12" />

      <g filter="url(#heroShadow)">
        {/* --- Black mounting base --- */}
        <rect x="110" y="376" width="110" height="24" rx="2" fill="url(#heroDark)" />
        <rect x="106" y="390" width="118" height="10" rx="1" fill="#181817" />
        <circle cx="120" cy="383" r="3" fill="#444" />
        <circle cx="210" cy="383" r="3" fill="#444" />
        <circle cx="165" cy="393" r="2.5" fill="#0A0A09" />

        {/* --- Servo motor on right --- */}
        <rect x="222" y="290" width="52" height="72" rx="4" fill="url(#heroMotor)" />
        <rect x="226" y="297" width="44" height="7" rx="1" fill="#383836" />
        <rect x="268" y="312" width="9" height="16" rx="1" fill="#282827" />
        {/* Motor flange to body */}
        <rect x="216" y="308" width="8" height="38" rx="1" fill="#282827" />
        {/* Coiled cable */}
        <path
          d="M 276 326 q 10 2 7 14 q -3 10 5 16 q 8 8 3 18 q -5 10 0 18 q 5 8 0 16"
          stroke="#080807"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />

        {/* --- Aluminium extrusion body --- */}
        <rect x="140" y="100" width="50" height="276" rx="2" fill="url(#heroAlu)" stroke="#888" strokeWidth="0.5" />
        {/* Vertical grooves */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={140 + 50 * f} y1="108" x2={140 + 50 * f} y2="368" stroke="#999" strokeWidth="0.6" opacity="0.55" />
        ))}
        {/* Top end cap */}
        <rect x="138" y="94" width="54" height="10" rx="1.5" fill="url(#heroDark)" />
        {/* Bottom transition */}
        <rect x="138" y="372" width="54" height="8" rx="1" fill="#181817" />

        {/* Rod */}
        <rect x="161" y="76" width="8" height="20" fill="#C8C8C4" stroke="#999" strokeWidth="0.5" />

        {/* Spherical rod end (clevis eye) */}
        <circle cx="165" cy="66" r="14" fill="url(#heroJoint)" stroke="#666" strokeWidth="0.8" />
        <circle cx="165" cy="66" r="7" fill="#282827" stroke="#888" strokeWidth="1" />
        <circle cx="165" cy="66" r="3.2" fill="#10100F" />
        <rect x="154" y="76" width="22" height="6" rx="1" fill="#999" />
      </g>
    </svg>
  );
}
