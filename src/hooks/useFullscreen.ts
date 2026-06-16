import { useState, useEffect, useRef } from 'react';

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
    } catch { /* not available or denied */ }
  };

  const releaseWakeLock = () => {
    wakeLock.current?.release();
    wakeLock.current = null;
  };

  useEffect(() => {
    const onChange = () => {
      const full = !!document.fullscreenElement;
      setIsFullscreen(full);
      if (full) acquireWakeLock();
      else releaseWakeLock();
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggle = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  return { isFullscreen, toggle };
}
