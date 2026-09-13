import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, RefreshCw } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroidBanner, setShowAndroidBanner] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Hook from vite-plugin-pwa to handle automatic or on-demand updates
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      if (registration) {
        // Check for updates periodically every hour
        setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.warn('PWA registration error:', error);
    }
  });

  useEffect(() => {
    // 1. Detect if running in standalone mode (already installed)
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) return;

    // 2. Check dismissal storage (7 days cooldown)
    const dismissedAt = localStorage.getItem('iasis_pwa_install_dismissed');
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // 3. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // 4. Android & Desktop Chrome installation trigger
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowAndroidBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If iOS and not standalone, show guide after 4 seconds of smooth page browsing
    let iosTimer: ReturnType<typeof setTimeout> | undefined;
    if (isAppleDevice && !isStandaloneMode) {
      iosTimer = setTimeout(() => {
        setShowIOSGuide(true);
      }, 4000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowAndroidBanner(false);
      }
    } catch (err) {
      console.warn('Installation prompt error:', err);
    } finally {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('iasis_pwa_install_dismissed', Date.now().toString());
    setShowAndroidBanner(false);
    setShowIOSGuide(false);
  };

  return (
    <>
      {/* 1. Update Available Floating Toast */}
      {needRefresh && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between gap-3 p-3.5 bg-slate-900/95 dark:bg-slate-800/95 text-white rounded-2xl shadow-xl shadow-black/20 border border-slate-700/60 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div>
                <p className="text-xs font-semibold">Nova versão disponível</p>
                <p className="text-[11px] text-slate-300">Atualize para acessar as melhorias mais recentes.</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateServiceWorker(true)}
                className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-colors active:scale-95"
              >
                Atualizar
              </button>
              <button
                onClick={() => setNeedRefresh(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Android & Chrome Install Banner */}
      {showAndroidBanner && !isStandalone && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src="/favicon.svg"
                alt="Iasis Agenda Logo"
                className="w-10 h-10 rounded-xl shadow-sm bg-slate-950 p-1"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Instalar Iasis Agenda</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Acesso rápido e sem barras do navegador</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Instalar
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
                aria-label="Dispensar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. iOS Safari Add to Home Screen Helper Banner */}
      {showIOSGuide && !isStandalone && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-rose-500/20 dark:border-rose-500/30">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <img
                  src="/favicon.svg"
                  alt="Iasis Agenda"
                  className="w-8 h-8 rounded-lg bg-slate-950 p-0.5"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Instalar no iPhone</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Abra como app em tela cheia</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                <Share className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>1. Toque no botão de <strong>Compartilhar</strong> no Safari</span>
              </div>
              <div className="flex items-center gap-2">
                <PlusSquare className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>2. Role e escolha <strong>"Adicionar à Tela de Início"</strong></span>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                onClick={handleDismiss}
                className="px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
