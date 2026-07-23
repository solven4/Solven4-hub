import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Reads platform_config.door_flags (set from the Cockpit → Door Control).
// If this door is flagged maintenance/disabled, shows a maintenance screen.
// FAIL-OPEN: any error or missing config → renders the app normally.
const DOOR = 'HUB';

export default function MaintenanceGate({ children }) {
  const [state, setState] = useState('ok'); // ok | maintenance | disabled

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await supabase
          .from('platform_config').select('value').eq('key', 'door_flags').maybeSingle();
        const f = data?.value?.[DOOR];
        if (!alive || !f) return;
        if (f.maintenance === true) setState('maintenance');
        else if (f.enabled === false) setState('disabled');
      } catch { /* fail-open */ }
    })();
    return () => { alive = false; };
  }, []);

  if (state === 'ok') return children;

  return (
    <div style={{
      minHeight: '100vh', background: '#1A1B1E', color: '#E2E8F0',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: 24, gap: 14,
    }}>
      <div style={{ fontFamily: "'Satoshi', sans-serif", fontSize: 11, letterSpacing: '0.3em', color: '#6366F1' }}>
        SOLVEN4 · {DOOR}
      </div>
      <div style={{ fontSize: 44 }}>{state === 'disabled' ? '🔒' : '🛠️'}</div>
      <h1 style={{ fontSize: 24, fontWeight: 500, margin: 0, color: '#fff' }}>
        {state === 'disabled' ? 'Temporarily Unavailable' : 'Under Maintenance'}
      </h1>
      <p style={{ color: '#94A3B8', fontSize: 14, maxWidth: 420, lineHeight: 1.6 }}>
        {state === 'disabled'
          ? 'This door is currently offline. Please check back shortly.'
          : 'We are performing scheduled maintenance to improve your experience. We will be back very soon.'}
      </p>
    </div>
  );
}
