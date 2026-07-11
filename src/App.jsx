import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { supabase } from '@/lib/supabase';
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
import OperatorHub from '@/pages/admin/OperatorHub';
import UserManager from '@/pages/admin/UserManager';
import GlobalAnalytics from '@/pages/admin/GlobalAnalytics';
import SecurityCenter from '@/pages/admin/SecurityCenter';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#03080F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#6366F1', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
  return user ? children : <Navigate to="/auth/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  const { setSession, setLoading, fetchProfile } = useAuthStore();

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
    <BrowserRouter>
      <Toaster position="top-right" theme="dark" richColors />
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
        <Route path="/admin" element={<ProtectedRoute><AppLayout isAdmin /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/hub" replace />} />
          <Route path="hub"      element={<OperatorHub />} />
          <Route path="users"    element={<UserManager />} />
          <Route path="analytics" element={<GlobalAnalytics />} />
          <Route path="security" element={<SecurityCenter />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </HelmetProvider>
  );
}
