import { useState } from 'react';

interface Props {
  total: number;
  itemCount: number;
  onPay: () => void;
  bottomOffset?: string;
}

export function PayButton({ total, itemCount, onPay, bottomOffset = 'bottom-6' }: Props) {
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);

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
      <div className={`fixed right-4 ${bottomOffset} z-40`}>
        <div className="bg-[#1A1A1A] text-white rounded-2xl px-5 py-3 text-[14px] font-semibold shadow-lg flex items-center gap-2">
          <span className="text-[18px]">✓</span>
          <span>Hotovo!</span>
        </div>
      </div>
    );
  }

  if (confirm) {
    return (
      <div className={`fixed right-4 ${bottomOffset} z-40`}>
        <div className="bg-white border border-[#E8E8E8] rounded-2xl px-4 py-3 shadow-lg min-w-[220px]">
          <p className="text-[13px] text-[#1A1A1A] font-medium mb-1">
            Dokončit objednávku {total} Kč?
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleConfirm}
              className="flex-1 bg-[#1A1A1A] text-white rounded-xl py-2 text-[13px] font-semibold"
            >
              Dokončit
            </button>
            <button
              onClick={() => setConfirm(false)}
              className="flex-1 border border-[#E8E8E8] text-[#6B6B6B] rounded-xl py-2 text-[13px]"
            >
              Zpět
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed right-4 ${bottomOffset} z-40`}>
      <button
        onClick={handleClick}
        className={`rounded-2xl px-5 py-3 text-[14px] font-semibold shadow-lg transition-all whitespace-nowrap ${
          itemCount > 0
            ? 'bg-[#1A1A1A] text-white active:scale-95'
            : 'bg-[#E8E8E8] text-[#9B9B9B] cursor-default'
        }`}
      >
        Dokončit a Zadat další
      </button>
    </div>
  );
}
