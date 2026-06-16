import { useState, useCallback } from 'react';

const STORAGE_KEY = 'pos_venue_logo';

export function useLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  });

  const uploadLogo = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setLogoUrl(url);
      try { localStorage.setItem(STORAGE_KEY, url); } catch {}
    };
    reader.readAsDataURL(file);
  }, []);

  const removeLogo = useCallback(() => {
    setLogoUrl(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return { logoUrl, uploadLogo, removeLogo };
}
