import { useState, useEffect } from 'react';

const STEPS = [0.8, 0.9, 1, 1.1, 1.25, 1.4, 1.6];
const DEFAULT_IDX = 2; // 1.0
const KEY = 'pos_font_scale_idx';

export function useFontScale() {
  const [idx, setIdx] = useState(() => {
    const saved = localStorage.getItem(KEY);
    return saved !== null ? Number(saved) : DEFAULT_IDX;
  });

  useEffect(() => {
    localStorage.setItem(KEY, String(idx));
    document.documentElement.style.fontSize = `${STEPS[idx] * 16}px`;
  }, [idx]);

  const zoomIn  = () => setIdx(i => Math.min(i + 1, STEPS.length - 1));
  const zoomOut = () => setIdx(i => Math.max(i - 1, 0));

  return { zoomIn, zoomOut, canZoomIn: idx < STEPS.length - 1, canZoomOut: idx > 0 };
}
