import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { supabase } from '@/lib/supabase';
import { LanguageProvider, useLang } from '@/lib/LanguageContext';
import { useAuthStore } from '@/store/authStore';
import AppLayout from '@/components/layout/AppLayout';
import Landing from '@/pages/Landing';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import TheCommand from '@/pages/dashboard/TheCommand';
import TheArena from '@/pages/dashboard/TheArena';
import TheWeb from '@/pages/dashboard/TheWeb';
import TheScore from '@/pages/dashboard/TheScore';
import TheBrain from '@/pages/dashboard/TheBrain';
import TheSignals from '@/pages/dashboard/TheSignals';
import TheVault from '@/pages/dashboard/TheVault';
import BrokerB2B from '@/pages/dashboard/BrokerB2B';
import DoorFrame from '@/pages/dashboard/DoorFrame';
import TheAgent from '@/pages/dashboard/TheAgent';
import TheReferral from '@/pages/dashboard/TheReferral';
import ThePulse from '@/pages/dashboard/ThePulse';
import TheMatrix from '@/pages/dashboard/TheMatrix';
import TheBlueprint from '@/pages/dashboard/TheBlueprint';
import TheNetwork from '@/pages/dashboard/TheNetwork';
import TheProfile from '@/pages/dashboard/TheProfile';
import TheSubscription from '@/pages/dashboard/TheSubscription';
import TheSettings from '@/pages/dashboard/TheSettings';
import TheIntegrations from '@/pages/dashboard/TheIntegrations';
import TheLeaderboard from '@/pages/dashboard/TheLeaderboard';
import TheCommission from '@/pages/dashboard/TheCommission';
import TheAutomation from '@/pages/dashboard/TheAutomation';
import LegalPages from '@/pages/legal/LegalPages';
import { BlogList, BlogPost } from '@/pages/Blog';
import MaintenanceGate from '@/components/MaintenanceGate';

// NOTE: Admin functionality moved to the standalone SOLVEN4 COCKPIT platform
// (C:\Projects\Opiom\Solven4\solven4_cockpit) — HUB is user-facing only.

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#05050C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#6366F1', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
  return user ? children : <Navigate to="/auth/login" replace />;
}

// Doors send unauthenticated visitors here as
// /auth/login?redirect=<door-url> (AccessGate). If the visitor already has
// a live HUB session, they were bounced straight back to /dashboard with
// the redirect silently dropped — this sends them back to the door they
// actually came from instead. Validated against a fixed origin allowlist
// so ?redirect= can't be turned into an open redirect to an arbitrary URL.
const DOOR_ORIGINS = [
  'https://solven4-edge-six.vercel.app',
  'https://solven4-forge-pi.vercel.app',
  'https://solven4-oracle-eight.vercel.app',
  'https://solven4-nexus-self.vercel.app',
];

function safeRedirectTarget(raw) {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return DOOR_ORIGINS.includes(url.origin) ? url.toString() : null;
  } catch {
    return null;
  }
}

// Bridges the current HUB session into a door URL the same way DoorFrame's
// "open in new tab" does — a door landing on its own bare URL has no way to
// see HUB's session (different origin), so without s4_at/s4_rt its
// AccessGate finds nothing, times out, and bounces back here forever.
export async function bridgeRedirectTarget(raw) {
  const target = safeRedirectTarget(raw);
  if (!target) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return target;
    const url = new URL(target);
    url.searchParams.set('s4_at', session.access_token);
    url.searchParams.set('s4_rt', session.refresh_token);
    return url.toString();
  } catch {
    return target;
  }
}

function PublicRoute({ children }) {
  const { user, loading } = useAuthStore();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (loading || !user) return;
    const raw = searchParams.get('redirect');
    if (!safeRedirectTarget(raw)) return;
    bridgeRedirectTarget(raw).then(target => { if (target) window.location.replace(target); });
  }, [loading, user, searchParams]);

  if (loading) return null;
  if (!user) return children;
  if (safeRedirectTarget(searchParams.get('redirect'))) return null;
  return <Navigate to="/dashboard" replace />;
}

function InnerApp() {
  const { setSession, setLoading, fetchProfile } = useAuthStore();
  const { isAr } = useLang();

  useEffect(() => {
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = isAr ? 'ar' : 'en';
  }, [isAr]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <HelmetProvider>
    <MaintenanceGate>
    <BrowserRouter>
      <Toaster
        position="top-right"
        theme="dark"
        richColors
        toastOptions={{
          style: {
            backdropFilter: 'blur(16px) saturate(1.25)',
            WebkitBackdropFilter: 'blur(16px) saturate(1.25)',
            borderRadius: '14px',
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: '13px',
            letterSpacing: '0.01em',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 24px 60px -34px rgba(0,0,0,0.95)',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/auth/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard/command" replace />} />
          <Route path="command"  element={<TheCommand />} />
          <Route path="arena"    element={<TheArena />} />
          <Route path="web"      element={<TheWeb />} />
          <Route path="score"    element={<TheScore />} />
          <Route path="brain"    element={<TheBrain />} />
          <Route path="signals"  element={<TheSignals />} />
          <Route path="vault"    element={<TheVault />} />
          <Route path="referral"  element={<TheReferral />} />
          <Route path="pulse"     element={<ThePulse />} />
          <Route path="matrix"    element={<TheMatrix />} />
          <Route path="blueprint" element={<TheBlueprint />} />
          <Route path="network"      element={<TheNetwork />} />
          <Route path="broker"       element={<BrokerB2B />} />
          <Route path="profile"      element={<TheProfile />} />
          <Route path="subscription" element={<TheSubscription />} />
          <Route path="settings"     element={<TheSettings />} />
          <Route path="integrations" element={<TheIntegrations />} />
          <Route path="leaderboard"  element={<TheLeaderboard />} />
          <Route path="commission"   element={<TheCommission />} />
          <Route path="automation"   element={<TheAutomation />} />
          <Route path="door/:doorId" element={<DoorFrame />} />
          <Route path="agent" element={<TheAgent />} />
        </Route>
        {/* /admin moved to the standalone SOLVEN4 COCKPIT platform */}
        <Route path="/admin/*" element={<Navigate to="/dashboard" replace />} />
        <Route path="/legal/:doc" element={<LegalPages />} />
        <Route path="/legal" element={<LegalPages />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </MaintenanceGate>
    </HelmetProvider>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <InnerApp />
    </LanguageProvider>
  );
}
