import { useState, useEffect, useCallback } from 'react';

const CACHE_KEY = 'pos_venue_logo_cache';
const MAX_DIMENSION = 256;

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/webp', 0.85));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function useLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    try { return localStorage.getItem(CACHE_KEY); } catch { return null; }
  });

  // Fetch from server on mount; update cache
  useEffect(() => {
    fetch('/api/settings/logo', { credentials: 'include' })
      .then(r => {
        if (r.ok) return r.json();
        if (r.status === 404) {
          // Server has no logo — clear stale cache
          setLogoUrl(null);
          try { localStorage.removeItem(CACHE_KEY); } catch {}
        }
        return null;
      })
      .then(data => {
        if (data?.data) {
          setLogoUrl(data.data);
          try { localStorage.setItem(CACHE_KEY, data.data); } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const uploadLogo = useCallback(async (file: File) => {
    try {
      const data = await compressImage(file);
      // Optimistic update
      setLogoUrl(data);
      try { localStorage.setItem(CACHE_KEY, data); } catch {}
      // Persist to server
      const r = await fetch('/api/settings/logo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ data }),
      });
      if (!r.ok) console.error('Logo save failed:', await r.text());
    } catch (e) {
      console.error('Logo upload error:', e);
    }
  }, []);

  const removeLogo = useCallback(async () => {
    setLogoUrl(null);
    try { localStorage.removeItem(CACHE_KEY); } catch {}
    try {
      await fetch('/api/settings/logo', { method: 'DELETE', credentials: 'include' });
    } catch {}
  }, []);

  return { logoUrl, uploadLogo, removeLogo };
}
