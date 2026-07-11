import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import './index.css';
import App from './App.jsx';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
  enabled: import.meta.env.MODE === 'production',
  beforeSend(event) {
    // Scrub AI content and payment details before sending to Sentry
    if (event.extra?.response) delete event.extra.response;
    if (event.extra?.body)     delete event.extra.body;
    if (event.user?.email)     event.user.email = '[redacted]';
    return event;
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
