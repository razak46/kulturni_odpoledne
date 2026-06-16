import { useState } from 'react';

interface Props {
  total: number;
  itemCount: number;
  onPay: () => void;
  bottomOffset?: string; // e.g. 'bottom-4' or 'bottom-20'
}

export function PayButton({ total, itemCount, onPay, bottomOffset = 'bottom-6' }: Props) {
  const [confirm, setConfirm] = useState(false);
  const [paid, setPaid] = useState(false);

  if (itemCount === 0) return null;

  const handleConfirm = () => {
    setPaid(true);
    setTimeout(() => {
      setPaid(false);
      setConfirm(false);
      onPay();
    }, 900);
  };

  if (paid) {
    return (
      <div className={`fixed right-4 ${bottomOffset} z-40`}>
        <div className="bg-[#1A1A1A] text-white rounded-2xl px-5 py-3 text-[14px] font-semibold shadow-lg flex items-center gap-2">
          <span className="text-[18px]">✓</span>
          <span>Uhrazeno!</span>
        </div>
      </div>
    );
  }

  if (confirm) {
    return (
      <div className={`fixed right-4 ${bottomOffset} z-40`}>
        <div className="bg-white border border-[#E8E8E8] rounded-2xl px-4 py-3 shadow-lg min-w-[220px]">
          <p className="text-[13px] text-[#1A1A1A] font-medium mb-1">
            Potvrdit platbu {total} Kč?
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleConfirm}
              className="flex-1 bg-[#1A1A1A] text-white rounded-xl py-2 text-[13px] font-semibold"
            >
              Uhradit
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
        onClick={() => setConfirm(true)}
        className="bg-[#1A1A1A] text-white rounded-2xl px-5 py-3 text-[14px] font-semibold shadow-lg active:scale-95 transition-transform whitespace-nowrap"
      >
        Uhradit a Zadat další objednávku
      </button>
    </div>
  );
}
