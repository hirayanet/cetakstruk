import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      console.log('🔧 PWA: Registering Service Worker...');
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('✅ PWA: Service Worker registered successfully', registration.scope);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        console.log('🔄 PWA: Service Worker update found');
        const newWorker = registration.installing;

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🆕 PWA: New content available');
              // Could show update notification here
            }
          });
        }
      });

      // Listen for messages from Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, version } = event.data;

        if (type === 'SW_UPDATE_AVAILABLE') {
          console.log('🆕 PWA: Update available:', version);
          // Show update notification (optional)
        }

        if (type === 'SW_UPDATE_ACTIVATED') {
          console.log('✅ PWA: Update activated:', version);
          // App is now using new version
        }
      });

    } catch (error) {
      console.error('❌ PWA: Service Worker registration failed:', error);
    }
  });
} else {
  console.log('❌ PWA: Service Worker not supported in this browser');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
