import { useState } from 'react';

interface Props {
  total: number;
  itemCount: number;
  onPay: () => void;
  bottomRem?: number;
}

export function PayButton({ total, itemCount, onPay, bottomRem = 1.5 }: Props) {
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const posStyle = {
    position: 'fixed' as const,
    right: '1rem',
    bottom: `max(${bottomRem}rem, calc(${bottomRem}rem + env(safe-area-inset-bottom, 0px)))`,
    zIndex: 40,
  };

  const handleConfirm = () => {
    setDone(true);
    setTimeout(() => {
      setDone(false);
      setConfirm(false);
      onPay();
    }, 900);
  };

  const handleClick = () => {
    if (itemCount === 0) return;
    setConfirm(true);
  };

  if (done) {
    return (
      <div style={posStyle}>
        <div className="bg-[#22C55E] text-[#1A1A1A] rounded-2xl px-5 py-3 text-[15px] font-bold shadow-lg flex items-center gap-2">
          <span className="text-[18px]">✓</span>
          <span>Zaplaceno!</span>
        </div>
      </div>
    );
  }

  if (confirm) {
    return (
      <div style={posStyle}>
        <div className="bg-white border border-[#E8E8E8] rounded-2xl px-4 py-3 shadow-lg min-w-[220px]">
          <p className="text-[13px] text-[#1A1A1A] font-medium mb-1">
            Zaplatit {total} Kč?
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleConfirm}
              className="flex-1 bg-[#22C55E] text-[#1A1A1A] rounded-xl py-2.5 text-[13px] font-bold"
            >
              Potvrdit
            </button>
            <button
              onClick={() => setConfirm(false)}
              className="flex-1 border border-[#E8E8E8] text-[#6B6B6B] rounded-xl py-2.5 text-[13px]"
            >
              Zpět
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={posStyle}>
      <button
        onClick={handleClick}
        className={`rounded-2xl px-6 py-3.5 text-[15px] font-bold shadow-lg transition-all whitespace-nowrap ${
          itemCount > 0
            ? 'bg-[#22C55E] text-[#1A1A1A] active:scale-95'
            : 'bg-[#E8E8E8] text-[#9B9B9B] cursor-default'
        }`}
      >
        Zaplatit
      </button>
    </div>
  );
}
