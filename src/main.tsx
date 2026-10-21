if (import.meta.env.PROD && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then((registration) => {
        // Look for a new app version whenever the app comes back to the foreground
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            registration.update().catch(() => undefined);
          }
        });
      })
      .catch((err) => {
        // Graceful error handling: log warning without breaking application startup
        console.warn('VENUE PWA: Service worker registration note:', err);
      });

    // When a new version takes control, reload once so users never keep running an old bundle
    let reloaded = false;
    let hadController = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController) {
        hadController = true; // first install, nothing stale to replace
        return;
      }
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  });
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA service worker only in production builds to enable installability on mobile
if (import.meta.env.PROD && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch((err) => {
        // Graceful error handling: log warning without breaking application startup
        console.warn('VENUE PWA: Service worker registration note:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

