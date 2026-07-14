import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import SolvenOrb from '@/components/solven/SolvenOrb';
import { EmbedProvider, useEmbed } from '@/context/EmbedContext';
import DoorEmbed from '@/components/DoorEmbed';

function AppContent({ isAdmin }) {
  const location = useLocation();
  const [transitioning, setTransitioning] = useState(false);
  const prevPath = useRef(location.pathname);
  const { activeDoor, closeDoor } = useEmbed();

  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      setTransitioning(true);
      const t = setTimeout(() => setTransitioning(false), 300);
      prevPath.current = location.pathname;
      return () => clearTimeout(t);
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#05050C' }}>
      <Helmet><title>S4 HUB | Command Center</title></Helmet>
      {/* Ambient dual-accent background (Emergent skin) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 s4-grid-pattern opacity-40" />
        <div className="absolute top-0 right-0 w-[520px] h-[520px] rounded-full opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, #6366F1, transparent)', filter: 'blur(90px)' }} />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #22D3EE, transparent)', filter: 'blur(90px)' }} />
      </div>

      <Sidebar isAdmin={isAdmin} />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Topbar isAdmin={isAdmin} />
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className={`flex-1 flex flex-col transition-all duration-300 ${transitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'} ${location.pathname.startsWith('/dashboard/door') ? '' : 'p-5 overflow-y-auto'}`}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Door Embed — sits above main content, below SolvenOrb (z-index 9990 vs 9999) */}
      {activeDoor && <DoorEmbed door={activeDoor} onClose={closeDoor} />}

      {/* SOLVEN Persistent Orb — overlays every page and door iframe */}
      <SolvenOrb />
    </div>
  );
}

export default function AppLayout({ isAdmin = false }) {
  return (
    <EmbedProvider>
      <AppContent isAdmin={isAdmin} />
    </EmbedProvider>
  );
}
