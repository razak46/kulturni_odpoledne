import { useState, useRef, useEffect } from 'react';

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wakeLock = useRef<any>(null);

  const acquireWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        wakeLock.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch { /* not supported or denied */ }
  };

  const releaseWakeLock = () => {
    wakeLock.current?.release();
    wakeLock.current = null;
  };

  // Prevent body scroll when active — stops iOS Safari from showing/hiding
  // the address bar on scroll, which would disrupt the fullscreen appearance.
  useEffect(() => {
    document.documentElement.style.overflow = isFullscreen ? 'hidden' : '';
  }, [isFullscreen]);

  const toggle = async () => {
    if (!isFullscreen) {
      // Best-effort browser fullscreen (works on desktop; iOS ignores it)
      try { await document.documentElement.requestFullscreen(); } catch { /* ok */ }
      await acquireWakeLock();
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement) {
        try { await document.exitFullscreen(); } catch { /* ok */ }
      }
      releaseWakeLock();
      setIsFullscreen(false);
    }
  };

  // Re-acquire wake lock if it gets released externally (e.g. tab switch)
  useEffect(() => {
    if (!isFullscreen) return;
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !wakeLock.current) {
        acquireWakeLock();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [isFullscreen]);

  return { isFullscreen, toggle };
}
