import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isStandalone: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
}

export const usePWA = () => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    isStandalone: false,
    installPrompt: null,
  });

  useEffect(() => {
    // Check if running in standalone mode (installed PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');

    // Check if already installed
    const isInstalled = isStandalone || localStorage.getItem('pwa-installed') === 'true';

    setPwaState(prev => ({
      ...prev,
      isStandalone,
      isInstalled
    }));

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('📱 PWA: Install prompt available');
      
      setPwaState(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: e as BeforeInstallPromptEvent
      }));
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('✅ PWA: App installed successfully');
      localStorage.setItem('pwa-installed', 'true');
      
      setPwaState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null
      }));
    };

    // Listen for online/offline events
    const handleOnline = () => {
      console.log('🌐 PWA: Back online');
      setPwaState(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      console.log('📴 PWA: Gone offline');
      setPwaState(prev => ({ ...prev, isOnline: false }));
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Install PWA function
  const installPWA = async (): Promise<boolean> => {
    if (!pwaState.installPrompt) {
      console.log('❌ PWA: No install prompt available');
      return false;
    }

    try {
      console.log('📱 PWA: Showing install prompt');
      await pwaState.installPrompt.prompt();
      
      const choiceResult = await pwaState.installPrompt.userChoice;
      console.log('📱 PWA: User choice:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        setPwaState(prev => ({
          ...prev,
          isInstallable: false,
          installPrompt: null
        }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ PWA: Install failed', error);
      return false;
    }
  };

  // Register service worker
  const registerServiceWorker = async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator)) {
      console.log('❌ PWA: Service Worker not supported');
      return false;
    }

    try {
      console.log('🔧 PWA: Registering Service Worker');
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('✅ PWA: Service Worker registered', registration.scope);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        console.log('🔄 PWA: Service Worker update found');
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🆕 PWA: New content available, please refresh');
              // Could show update notification here
            }
          });
        }
      });

      return true;
    } catch (error) {
      console.error('❌ PWA: Service Worker registration failed', error);
      return false;
    }
  };

  // Get PWA info
  const getPWAInfo = () => {
    return {
      isSupported: 'serviceWorker' in navigator,
      userAgent: navigator.userAgent,
      platform: (navigator as any).platform || 'unknown',
      standalone: pwaState.isStandalone,
      installed: pwaState.isInstalled,
      installable: pwaState.isInstallable,
      online: pwaState.isOnline
    };
  };

  return {
    ...pwaState,
    installPWA,
    registerServiceWorker,
    getPWAInfo
  };
};
