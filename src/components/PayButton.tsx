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
        <div className="bg-[#22C55E] text-[#1A1A1A] rounded-full px-5 py-3.5 text-[15px] font-bold shadow-xl flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Zaplaceno!</span>
        </div>
      </div>
    );
  }

  if (confirm) {
    return (
      <div style={posStyle}>
        <div className="bg-white border border-[#E8E8E8] rounded-2xl px-4 py-3.5 shadow-xl min-w-[230px]">
          <p className="text-[13px] text-[#555] font-medium mb-0.5">Potvrdit platbu</p>
          <p className="text-[22px] font-extrabold text-[#1A1A1A] tabular-nums leading-tight mb-3">
            {total} Kč
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className="flex-1 bg-[#22C55E] text-[#1A1A1A] rounded-xl py-2.5 text-[14px] font-bold active:scale-95 transition-transform"
            >
              Potvrdit
            </button>
            <button
              onClick={() => setConfirm(false)}
              className="flex-1 border border-[#EBEBEB] text-[#888] rounded-xl py-2.5 text-[14px] hover:border-[#C0C0C0] transition-colors"
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
        className={`rounded-full py-[21px] text-[22px] font-bold shadow-lg transition-all whitespace-nowrap ${
          itemCount > 0
            ? 'bg-[#22C55E] text-[#1A1A1A] active:scale-95 px-9'
            : 'bg-[#E8E8E8] text-[#ADADAD] cursor-default px-9'
        }`}
      >
        {itemCount > 0 ? `Zaplatit ${total} Kč` : 'Zaplatit'}
      </button>
    </div>
  );
}
