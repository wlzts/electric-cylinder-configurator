import { Link, useLocation } from 'react-router-dom';
import { Cpu, Menu, X, Languages } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';

export function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, lang, setLang } = useI18n();

  const navItems = [
    { to: '/', label: t('nav_home') },
    { to: '/configurator', label: t('nav_configurator') },
    { to: '/compare', label: t('nav_compare') },
    { to: '/review', label: t('nav_review') },
    { to: '/quote', label: t('nav_quote') },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2" aria-label="Electric Cylinder Configurator home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-white">
            <Cpu size={16} />
          </span>
          <span className="text-sm font-semibold tracking-tight">
            ECC<span className="text-muted font-normal"> · {lang === 'zh' ? '电缸配置器' : 'Configurator'}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  active ? 'bg-ink text-white' : 'text-muted hover:bg-ink/5 hover:text-ink',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          {/* Language toggle */}
          <button
            type="button"
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-ink/5 hover:text-ink"
            aria-label={lang === 'zh' ? 'Switch to English' : '切换到中文'}
          >
            <Languages size={14} />
            <span className="font-semibold">{lang === 'zh' ? 'EN' : '中文'}</span>
          </button>

          <button
            type="button"
            className="md:hidden rounded-lg p-2 text-ink hover:bg-ink/5"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-line bg-surface px-4 py-3 md:hidden" aria-label="Mobile navigation">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-ink/5 hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
