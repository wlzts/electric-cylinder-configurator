import { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Home } from '@/pages/Home';
import { SmartSelection } from '@/pages/SmartSelection';
import { Configurator } from '@/features/configurator/Configurator';
import { Compare } from '@/pages/Compare';
import { Review } from '@/pages/Review';
import { Quote } from '@/pages/Quote';
import { decodeConfigFromShare } from '@/lib/share';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function ShareLinkHandler() {
  const location = useLocation();
  const setConfiguration = useConfiguratorStore((s) => s.setConfiguration);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cfg = params.get('cfg');
    if (cfg) {
      const decoded = decodeConfigFromShare(cfg);
      if (decoded) {
        setConfiguration(decoded);
      }
    }
  }, [location.search, setConfiguration]);

  return null;
}

function AppContent() {
  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <ScrollToTop />
      <ShareLinkHandler />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/smart" element={<SmartSelection />} />
        <Route path="/configurator" element={<Configurator />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/review" element={<Review />} />
        <Route path="/quote" element={<Quote />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
